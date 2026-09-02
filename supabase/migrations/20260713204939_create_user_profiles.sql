create type public.gender as enum('male', 'female');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar text,
  status text
);

create table public.user_profiles (
  id uuid primary key references public.users (id) on delete cascade,
  gender public.gender not null,
  birth_date date not null,
  weight smallint not null check (weight between 20 and 300),
  height smallint not null check (height between 50 and 250)
);

insert into
  storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
values
  (
    'user-avatars',
    'user-avatars',
    true,
    1024 * 1024, -- 1 MiB
    array['image/png', 'image/jpeg', 'image/webp']
  )
on conflict (id) do nothing;

create policy "user reads user" on public.users for
select
  to authenticated using (true);

create policy "user updates own user" on public.users
for update
  to authenticated using (
    (
      select
        auth.uid ()
    ) = id
  );

create policy "user manages own profile" on public.user_profiles for all to authenticated using (
  (
    select
      auth.uid ()
  ) = id
);

create function private.avatar_user_id (object_name text) returns uuid language sql immutable
set
  search_path = '' as $$
  select (storage.foldername (object_name))[1]::uuid;
$$;

create policy "user manages own avatar" on storage.objects for all to authenticated using (
  bucket_id = 'user-avatars'
  and private.avatar_user_id (name) = (
    select
      auth.uid ()
  )
);

create function private.sync_user () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
insert into public.users (id, name, avatar)
values (
   new.id,
   new.raw_user_meta_data ->> 'name',
   new.raw_user_meta_data ->> 'avatar_url'
);
return new;
end;
$$;

create trigger sync_user
after insert on auth.users for each row
execute function private.sync_user ();

create function private.sync_user_name () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
update public.users
set name = new.raw_user_meta_data ->> 'name'
where id = new.id
  and name is null;
return new;
end;
$$;

create trigger sync_user_name
after update on auth.users for each row when (
  old.raw_user_meta_data ->> 'name' is distinct from new.raw_user_meta_data ->> 'name'
)
execute function private.sync_user_name ();
