create type public.achievement_triggers as enum(
  'drink_logged',
  'custom_drink_created',
  'spot_added',
  'photo_uploaded',
  'hangout_joined',
  'hangout_ended',
  'buddy_added',
  'profile_shared'
);

create table public.achievements (
  key text primary key,
  category text not null,
  "group" text,
  trigger public.achievement_triggers not null
);

create table public.user_achievements (
  key text not null references public.achievements (key) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (key, user_id)
);

create policy "user reads achievements" on public.achievements for
select
  to authenticated using (true);

create policy "user reads user achievements" on public.user_achievements for
select
  to authenticated using (true);

create or replace function private.check_user_achievements () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
perform
  private.invoke_edge_function (
    'award',
    jsonb_build_object(
      'trigger',
      tg_argv[0]::public.achievement_triggers,
      'user_id',
      to_jsonb (new) ->> coalesce(tg_argv[1], 'user_id'),
      'metadata',
      to_jsonb (new)
    )
  );
return new;
end;
$$;

create trigger check_drink_logged_achievements_on_insert
after insert on public.hangout_drinks for each row
execute function private.check_user_achievements ('drink_logged');

create trigger check_custom_drink_created_achievements_on_insert
after insert on public.drinks for each row when (new.user_id is not null)
execute function private.check_user_achievements ('custom_drink_created');

create or replace function private.check_hangout_achievements () returns trigger language plpgsql security definer
set
  search_path = public as $$
declare
  current_hangout_id uuid;
  participant_id uuid;
begin
if tg_table_name = 'hangouts' then
  current_hangout_id := new.id;
else
  current_hangout_id := new.hangout_id;
end if;

for participant_id in
  select p.user_id
  from public.hangout_participant_ids p
  where p.hangout_id = current_hangout_id
loop
  perform
    private.invoke_edge_function (
      'award',
      jsonb_build_object(
        'trigger',
        tg_argv[0]::public.achievement_triggers,
        'user_id',
        participant_id,
        'metadata',
        to_jsonb (new)
      )
    );
end loop;

return null;
end;
$$;

create trigger check_spot_added_achievements_on_insert
after insert on public.spots for each row
execute function private.check_hangout_achievements ('spot_added');

create or replace function private.check_photo_achievements () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
perform
  private.invoke_edge_function (
    'award',
    jsonb_build_object(
      'trigger',
      tg_argv[0]::public.achievement_triggers,
      'user_id',
      new.owner_id::uuid,
      'metadata',
      to_jsonb (new) || jsonb_build_object('hangout_id', private.hangout_photo_id (new.name))
    )
  );
return null;
end;
$$;

create trigger check_photo_uploaded_achievements_on_insert
after insert on storage.objects for each row when (
  new.bucket_id = 'hangout-photos'
  and new.owner_id is not null
)
execute function private.check_photo_achievements ('photo_uploaded');

create or replace function private.check_participant_achievements () returns trigger language plpgsql security definer
set
  search_path = public as $$
declare
  hangout public.hangouts;
  participant_id uuid;
begin
if tg_table_name = 'hangouts' then
  hangout := new;
  participant_id := new.creator_id;
else
  select * into hangout
  from public.hangouts h
  where h.id = new.hangout_id;

  participant_id := new.user_id;
end if;

perform
  private.invoke_edge_function (
    'award',
    jsonb_build_object(
      'trigger',
      tg_argv[0]::public.achievement_triggers,
      'user_id',
      participant_id,
      'metadata',
      to_jsonb (hangout)
    )
  );
return null;
end;
$$;

create trigger check_hangout_joined_achievements_on_insert
after insert on public.hangouts for each row
execute function private.check_participant_achievements ('hangout_joined');

create trigger check_hangout_joined_achievements_on_insert
after insert on public.hangout_members for each row
execute function private.check_participant_achievements ('hangout_joined');

create trigger check_hangout_ended_achievements_on_update
after update on public.hangouts for each row when (
  old.ended_at is null
  and new.ended_at is not null
)
execute function private.check_hangout_achievements ('hangout_ended');

create or replace function private.check_buddy_achievements () returns trigger language plpgsql security definer
set
  search_path = public as $$
declare
buddy_user_id uuid;
begin
foreach buddy_user_id in array array[new.user_id, new.buddy_id]
loop
  perform
    private.invoke_edge_function (
      'award',
      jsonb_build_object(
        'trigger',
        tg_argv[0]::public.achievement_triggers,
        'user_id',
        buddy_user_id,
        'metadata',
        to_jsonb (new)
      )
    );
end loop;

return null;
end;
$$;

create trigger check_buddy_added_achievements_on_insert
after insert on public.buddies for each row
execute function private.check_buddy_achievements ('buddy_added');

create trigger check_profile_shared_achievements_on_insert
after insert on public.buddy_shares for each row
execute function private.check_user_achievements ('profile_shared', 'id');
