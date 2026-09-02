create type public.notification_types as enum(
  'buddy_request',
  'hangout_request',
  'hangout_invite',
  'hangout_ended'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type public.notification_types not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  deleted_at timestamptz
);

create policy "user reads own notifications" on public.notifications for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  );

create policy "user marks own notification read" on public.notifications
for update
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  );

create or replace function private.invoke_edge_function (function_name text, payload jsonb) returns void language plpgsql security definer
set
  search_path = public as $$
begin
perform
  net.http_post (
    url := (
      select
        s.decrypted_secret
      from
        vault.decrypted_secrets s
      where
        s.name = 'edge_functions_url'
    ) || '/' || function_name,
    headers := jsonb_build_object (
      'Content-Type',
      'application/json',
      'apiKey',
      (
        select
          s.decrypted_secret
        from
          vault.decrypted_secrets s
        where
          s.name = 'edge_functions_key'
      )
    ),
    body := payload,
    timeout_milliseconds := 5000
  );
exception
  when others then
    raise log 'edge function % invocation failed: %', function_name, sqlerrm;
end;
$$;

create or replace function private.send_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
perform
  private.invoke_edge_function ('notify', to_jsonb (new));
return new;
end;
$$;

create trigger send_notification_on_insert
after insert on public.notifications for each row
execute function private.send_notification ();

create or replace function private.create_buddy_request_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
insert into public.notifications (user_id, type, metadata)
values (
  new.buddy_id,
  'buddy_request',
  jsonb_build_object(
    'user_id', new.user_id,
    'user_name', (
      select
        u.raw_user_meta_data ->> 'name'
      from
        auth.users u
      where
        u.id = new.user_id
    )
  )
);
return new;
end;
$$;

create trigger create_buddy_request_notification_on_insert
after insert on public.buddy_requests for each row
execute function private.create_buddy_request_notification ();

create or replace function private.remove_buddy_request_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
update public.notifications n
set deleted_at = now()
where n.user_id = old.buddy_id
  and n.type = 'buddy_request'
  and n.metadata ->> 'user_id' = old.user_id::text
  and n.deleted_at is null;
return old;
end;
$$;

create trigger remove_buddy_request_notification_on_delete
after delete on public.buddy_requests for each row
execute function private.remove_buddy_request_notification ();

create or replace function private.create_hangout_request_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
insert into public.notifications (user_id, type, metadata)
select
  h.creator_id,
  'hangout_request',
  jsonb_build_object(
    'hangout_id', new.hangout_id,
    'user_id', new.user_id,
    'user_name', (
      select
        u.raw_user_meta_data ->> 'name'
      from
        auth.users u
      where
        u.id = new.user_id
    )
  )
from public.hangouts h
where h.id = new.hangout_id;
return new;
end;
$$;

create trigger create_hangout_request_notification_on_insert
after insert on public.hangout_requests for each row
execute function private.create_hangout_request_notification ();

create or replace function private.remove_hangout_request_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
update public.notifications n
set deleted_at = now()
where n.type = 'hangout_request'
  and n.metadata ->> 'hangout_id' = old.hangout_id::text
  and n.metadata ->> 'user_id' = old.user_id::text
  and n.deleted_at is null;
return old;
end;
$$;

create trigger remove_hangout_request_notification_on_delete
after delete on public.hangout_requests for each row
execute function private.remove_hangout_request_notification ();

create or replace function private.create_hangout_invite_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
insert into public.notifications (user_id, type, metadata)
select
  new.user_id,
  'hangout_invite',
  jsonb_build_object(
    'hangout_id', new.hangout_id,
    'user_id', h.creator_id,
    'user_name', (
      select
        u.raw_user_meta_data ->> 'name'
      from
        auth.users u
      where
        u.id = h.creator_id
    )
  )
from public.hangouts h
where h.id = new.hangout_id;
return new;
end;
$$;

create trigger create_hangout_invite_notification_on_insert
after insert on public.hangout_invites for each row
execute function private.create_hangout_invite_notification ();

create or replace function private.remove_hangout_invite_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
update public.notifications n
set deleted_at = now()
where n.user_id = old.user_id
  and n.type = 'hangout_invite'
  and n.metadata ->> 'hangout_id' = old.hangout_id::text
  and n.deleted_at is null;
return old;
end;
$$;

create trigger remove_hangout_invite_notification_on_delete
after delete on public.hangout_invites for each row
execute function private.remove_hangout_invite_notification ();

create or replace function private.create_hangout_ended_notification () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
insert into public.notifications (user_id, type, metadata)
select
  p.user_id,
  'hangout_ended',
  jsonb_build_object(
    'hangout_id', new.id,
    'hangout_name', new.name
  )
from (
  select m.user_id
  from public.hangout_members m
  where m.hangout_id = new.id
) p;
return new;
end;
$$;

create trigger create_hangout_ended_notification_on_update
after update on public.hangouts for each row when (
  old.ended_at is null
  and new.ended_at is not null
)
execute function private.create_hangout_ended_notification ();

select
  cron.schedule (
    'end-hangouts-daily',
    '0 * * * *',
    $$
    with ended as (
      update public.hangouts h
      set ended_at = now()
      where h.ended_at is null
        and extract(hour from now() at time zone h.timezone) = 7
      returning h.id, h.name, h.creator_id
    )
    insert into public.notifications (user_id, type, metadata)
    select
      e.creator_id,
      'hangout_ended',
      jsonb_build_object('hangout_id', e.id, 'hangout_name', e.name)
        from ended e
    $$
  );

select
  cron.schedule (
    'clear-notifications',
    '0 0 * * *',
    $$
    delete from public.notifications
    where deleted_at < now() - interval '3 days'
      or read_at < now() - interval '1 week'
    $$
  );
