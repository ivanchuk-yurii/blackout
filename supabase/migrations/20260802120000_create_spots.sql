create table public.spots (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  google_maps_id text not null,
  name text not null,
  image text,
  lat numeric(8, 6) not null check (lat between -90 and 90),
  lon numeric(9, 6) not null check (lon between -180 and 180),
  created_at timestamptz not null default now()
);

create policy "user manages hangout spots" on public.spots for all to authenticated using (
  private.is_hangout_active (hangout_id)
  and private.is_hangout_participant (hangout_id)
);
