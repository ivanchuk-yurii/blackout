create type public.gender as enum('male', 'female');

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  gender public.gender not null,
  birth_date date not null,
  weight smallint not null check (weight between 20 and 300),
  height smallint not null check (height between 50 and 250)
);

create policy "user manages own profile" on public.user_profiles for all to authenticated using (
  (
    select
      auth.uid ()
  ) = id
);
