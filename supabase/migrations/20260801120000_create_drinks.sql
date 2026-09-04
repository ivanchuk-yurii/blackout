create type public.drink_categories as enum('beer', 'cider', 'wine', 'cocktail', 'spirit');

create table public.drinks (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  category public.drink_categories not null,
  abv numeric(4, 1) not null check (abv between 0 and 100),
  calories smallint check (calories between 0 and 1000),
  volume smallint check (volume between 0 and 10000),
  user_id uuid references public.users (id) on delete cascade
);

create table public.hangout_drinks (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  drink_id uuid not null references public.drinks (id) on delete cascade,
  volume smallint not null check (volume between 0 and 10000),
  created_at timestamptz not null default now()
);

create view public.favorite_drink_ids
with
  (security_invoker = on) as
select
  hd.drink_id as id,
  count(*)::int as count
from
  public.hangout_drinks hd
where
  hd.user_id = (
    select
      auth.uid ()
  )
group by
  hd.drink_id
order by
  count desc;

create policy "user reads drinks" on public.drinks for
select
  to authenticated using (true);

create policy "user manages own drinks" on public.drinks for all to authenticated using (
  (
    select
      auth.uid ()
  ) = user_id
);

create policy "participant reads hangout drinks" on public.hangout_drinks for
select
  to authenticated using (
    not private.is_hangout_active (hangout_id)
    and (
      private.is_hangout_participant (hangout_id)
      or user_id in (
        select
          id
        from
          public.my_buddy_ids
      )
    )
  );

create policy "user manages own hangout drinks" on public.hangout_drinks for all to authenticated using (
  private.is_hangout_active (hangout_id)
  and (
    (
      select
        auth.uid ()
    ) = user_id
  )
  and private.is_hangout_participant (hangout_id)
);
