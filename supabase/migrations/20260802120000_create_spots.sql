create domain public.lat as numeric(8, 6) check (value between -90 and 90);

create domain public.lon as numeric(9, 6) check (value between -180 and 180);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  google_maps_id text not null,
  name text not null,
  image text,
  lat public.lat not null,
  lon public.lon not null,
  created_at timestamptz not null default now()
);

create view public.user_spot_ids
with
  (security_invoker = on) as
select
  s.google_maps_id,
  p.user_id
from
  public.spots s
  join public.hangout_participant_ids p on p.hangout_id = s.hangout_id;

create view public.unique_spot_ids
with
  (security_invoker = on) as
select
  usi.user_id,
  usi.google_maps_id,
  count(*)::int as count
from
  public.user_spot_ids usi
group by
  usi.user_id,
  usi.google_maps_id;

create policy "participant reads hangout spots" on public.spots for
select
  to authenticated using (true);

create policy "creator manages hangout spots" on public.spots for all to authenticated using (
  private.is_hangout_active (hangout_id)
  and private.is_hangout_creator (hangout_id)
);
