create table public.hangouts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  creator_id uuid not null references auth.users (id) on delete cascade,
  timezone text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.hangout_members (
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (hangout_id, user_id)
);

create table public.hangout_requests (
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (hangout_id, user_id)
);

create table public.hangout_invites (
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (hangout_id, user_id)
);

create table public.hangout_shares (
  id uuid not null references public.hangouts (id) on delete cascade,
  token varchar not null,
  expires_at timestamptz not null,
  primary key (id, token)
);

create function private.is_hangout_active (hangout_id uuid) returns boolean language sql stable security definer
set
  search_path = public as $$
select exists (
    select 1
    from public.hangouts h
    where h.id = is_hangout_active.hangout_id
      and h.ended_at is null
);
$$;

create function private.is_hangout_creator (hangout_id uuid) returns boolean language sql stable security definer
set
  search_path = public as $$
  select exists (
    select 1
    from public.hangouts h
    where h.id = is_hangout_creator.hangout_id
      and h.creator_id = auth.uid ()
  );
$$;

create function private.is_hangout_member (hangout_id uuid, user_id uuid) returns boolean language sql stable security definer
set
  search_path = public as $$
  select exists (
      select 1
      from public.hangout_members m
      where m.hangout_id = is_hangout_member.hangout_id
        and m.user_id = is_hangout_member.user_id
    );
$$;

create function private.is_hangout_participant (hangout_id uuid) returns boolean language sql stable security definer
set
  search_path = public as $$
select private.is_hangout_creator (is_hangout_participant.hangout_id)
           or private.is_hangout_member(is_hangout_participant.hangout_id, auth.uid ());
$$;

create view public.my_hangouts as
with
  visible as (
    select
      auth.uid () as id
    union
    select
      id
    from
      public.my_buddies
  )
select
  h.*
from
  public.hangouts h
where
  h.creator_id in (
    select
      id
    from
      visible
  )
union
select
  h.*
from
  public.hangouts h
where
  h.id in (
    select
      m.hangout_id
    from
      public.hangout_members m
    where
      m.user_id in (
        select
          id
        from
          visible
      )
  );

create policy "user reads hangout" on public.hangouts for
select
  to authenticated using (true);

create policy "creator manages own hangout" on public.hangouts for all to authenticated using (
  (
    select
      auth.uid ()
  ) = creator_id
);

create policy "user reads hangout members" on public.hangout_members for
select
  to authenticated using (private.is_hangout_participant (hangout_id));

create policy "creator accepts hangout request" on public.hangout_members for insert to authenticated
with
  check (
    (private.is_hangout_creator (hangout_id))
    and exists (
      select
        1
      from
        public.hangout_requests r
      where
        (
          r.hangout_id = hangout_members.hangout_id
          and r.user_id = hangout_members.user_id
        )
    )
  );

create policy "user accepts hangout invite" on public.hangout_members for insert to authenticated
with
  check (
    (
      (
        select
          auth.uid ()
      ) = user_id
    )
    and exists (
      select
        1
      from
        public.hangout_invites i
      where
        (
          i.hangout_id = hangout_members.hangout_id
          and i.user_id = hangout_members.user_id
        )
    )
  );

create policy "user accepts hangout share" on public.hangout_members for insert to authenticated
with
  check (
    (
      (
        select
          auth.uid ()
      ) = user_id
    )
    and exists (
      select
        1
      from
        public.hangout_shares s
      where
        s.id = hangout_members.hangout_id
    )
  );

create policy "member leaves hangout" on public.hangout_members for delete to authenticated using (
  (
    select
      auth.uid ()
  ) = user_id
);

create policy "creator removes hangout member" on public.hangout_members for delete to authenticated using (private.is_hangout_creator (hangout_id));

create policy "user reads own hangout requests" on public.hangout_requests for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  );

create policy "creator reads hangout requests" on public.hangout_requests for
select
  to authenticated using (private.is_hangout_creator (hangout_id));

create policy "user requests to join hangout" on public.hangout_requests for insert to authenticated
with
  check (
    private.is_hangout_active (hangout_id)
    and (
      (
        select
          auth.uid ()
      ) = user_id
    )
    and not private.is_hangout_member (hangout_id, user_id)
    and exists (
      select
        1
      from
        public.hangouts h
      where
        h.id = hangout_requests.hangout_id
        and private.is_buddy (h.creator_id)
    )
  );

create policy "user cancels own hangout requests" on public.hangout_requests for delete to authenticated using (
  (
    select
      auth.uid ()
  ) = user_id
);

create policy "creator cancels hangout requests" on public.hangout_requests for delete to authenticated using (private.is_hangout_creator (hangout_id));

create policy "user reads own hangout invites" on public.hangout_invites for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  );

create policy "creator reads hangout invites" on public.hangout_invites for
select
  to authenticated using (private.is_hangout_creator (hangout_id));

create policy "creator invites buddy to hangout" on public.hangout_invites for insert to authenticated
with
  check (
    private.is_hangout_active (hangout_id)
    and private.is_hangout_creator (hangout_id)
    and not private.is_hangout_member (hangout_id, user_id)
    and private.is_buddy (user_id)
  );

create policy "user cancels own hangout invites" on public.hangout_invites for delete to authenticated using (
  (
    select
      auth.uid ()
  ) = user_id
);

create policy "creator cancels hangout invites" on public.hangout_invites for delete to authenticated using (private.is_hangout_creator (hangout_id));

create policy "creator manages own hangout shares" on public.hangout_shares for all to authenticated using (
  private.is_hangout_active (id)
  and private.is_hangout_creator (id)
);

create policy "read hangout share by token" on public.hangout_shares for
select
  to authenticated using (
    token = (
      select
        current_setting('request.headers', true)
    )::json ->> 'x-share-token'
    and expires_at > now()
  );

create or replace function private.normalize_hangout_timezone () returns trigger language plpgsql
set
  search_path = public as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then
    new.timezone := 'UTC';
end if;
return new;
end;
$$;

create trigger normalize_hangout_timezone_on_write
before insert or update of timezone on public.hangouts for each row
execute function private.normalize_hangout_timezone ();

create or replace function private.clear_ended_hangout () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
delete from public.hangout_requests where hangout_id = new.id;
delete from public.hangout_invites where hangout_id = new.id;
delete from public.hangout_shares where id = new.id;
return new;
end;
$$;

create trigger clear_ended_hangout_on_update
after update on public.hangouts for each row when (
  old.ended_at is null
  and new.ended_at is not null
)
execute function private.clear_ended_hangout ();

create or replace function private.remove_hangout_pending () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
delete from public.hangout_requests r
where (r.hangout_id = new.hangout_id and r.user_id = new.user_id);
delete from public.hangout_invites i
where (i.hangout_id = new.hangout_id and i.user_id = new.user_id);
return new;
end;
$$;

create trigger remove_hangout_pending_on_insert
after insert on public.hangout_members for each row
execute function private.remove_hangout_pending ();

select
  cron.schedule (
    'clear-expired-hangout-shares',
    '0 0 * * *',
    $$delete from public.hangout_shares where expires_at < now()$$
  );

select
  cron.schedule (
    'end-hangouts-daily',
    '0 * * * *',
    $$
    update public.hangouts h
    set ended_at = now()
    where h.ended_at is null
      and extract(hour from now() at time zone h.timezone) = 7
    $$
  );
