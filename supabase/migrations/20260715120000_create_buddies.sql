create table public.buddy_requests (
  user_id uuid not null references auth.users (id) on delete cascade,
  buddy_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, buddy_id),
  check (user_id <> buddy_id)
);

create table public.buddies (
  user_id uuid not null references auth.users (id) on delete cascade,
  buddy_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, buddy_id),
  check (user_id <> buddy_id)
);

create table public.buddy_shares (
  id uuid not null references auth.users (id) on delete cascade,
  token varchar not null,
  expires_at timestamptz not null,
  primary key (id, token)
);

create policy "user reads own buddy requests" on public.buddy_requests for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
    or (
      select
        auth.uid ()
    ) = buddy_id
  );

create policy "user sends buddy request" on public.buddy_requests for insert to authenticated
with
  check (
    (
      (
        select
          auth.uid ()
      ) = user_id
    )
    and not exists (
      select
        1
      from
        public.buddies b
      where
        (
          b.user_id = buddy_requests.user_id
          and b.buddy_id = buddy_requests.buddy_id
        )
        or (
          b.user_id = buddy_requests.buddy_id
          and b.buddy_id = buddy_requests.user_id
        )
    )
  );

create policy "requester cancels buddy request" on public.buddy_requests for delete to authenticated using (
  (
    select
      auth.uid ()
  ) = user_id
  or (
    select
      auth.uid ()
  ) = buddy_id
);

create policy "user reads own buddies" on public.buddies for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
    or (
      select
        auth.uid ()
    ) = buddy_id
  );

create policy "user accepts buddy request" on public.buddies for insert to authenticated
with
  check (
    (
      (
        select
          auth.uid ()
      ) = buddy_id
    )
    and exists (
      select
        1
      from
        public.buddy_requests r
      where
        (
          r.user_id = buddies.user_id
          and r.buddy_id = buddies.buddy_id
        )
    )
  );

create policy "user accepts buddy share" on public.buddies for insert to authenticated
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
        public.buddy_shares s
      where
        s.id = buddies.buddy_id
    )
  );

create policy "user removes own buddy" on public.buddies for delete to authenticated using (
  (
    select
      auth.uid ()
  ) = user_id
  or (
    select
      auth.uid ()
  ) = buddy_id
);

create policy "user manages own buddy shares" on public.buddy_shares for all to authenticated using (
  (
    select
      auth.uid ()
  ) = id
);

create policy "read buddy share by token" on public.buddy_shares for
select
  to authenticated using (
    token = (
      select
        current_setting('request.headers', true)
    )::json ->> 'x-share-token'
    and expires_at > now()
  );

create or replace function private.is_buddy (buddy_id uuid) returns boolean language sql stable security definer
set
  search_path = public as $$
  select exists (
    select 1
    from public.buddies b
    where (b.user_id = auth.uid () and b.buddy_id = is_buddy.buddy_id)
       or (b.user_id = is_buddy.buddy_id and b.buddy_id = auth.uid ())
  );
$$;

create view public.my_buddies
with
  (security_invoker = on) as
select
  case
    when b.user_id = auth.uid () then b.buddy_id
    else b.user_id
  end as id
from
  public.buddies b
where
  b.user_id = auth.uid ()
  or b.buddy_id = auth.uid ();

create or replace function private.remove_buddy_request () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
  delete from public.buddy_requests r
  where (r.user_id = new.user_id and r.buddy_id = new.buddy_id)
     or (r.user_id = new.buddy_id and r.buddy_id = new.user_id);
  return new;
end;
$$;

create trigger remove_buddy_request_on_insert
after insert on public.buddies for each row
execute function private.remove_buddy_request ();

select
  cron.schedule (
    'clear-expired-buddy-shares',
    '0 0 * * *',
    $$delete from public.buddy_shares where expires_at < now()$$
  );
