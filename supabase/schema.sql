-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Users (identity only, no auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now() not null
);

-- Night outs
create table if not exists public.night_outs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  creator_id uuid references public.users(id) not null,
  status text not null default 'active' check (status in ('active', 'finished')),
  created_at timestamptz default now() not null,
  finished_at timestamptz
);

-- Participants (junction table)
create table if not exists public.night_out_participants (
  id uuid primary key default gen_random_uuid(),
  night_out_id uuid references public.night_outs(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  joined_at timestamptz default now() not null,
  unique(night_out_id, user_id)
);

-- Bars (sequential per night out)
create table if not exists public.bars (
  id uuid primary key default gen_random_uuid(),
  night_out_id uuid references public.night_outs(id) on delete cascade not null,
  name text not null,
  added_by uuid references public.users(id) not null,
  status text not null default 'active' check (status in ('active', 'finished')),
  created_at timestamptz default now() not null,
  finished_at timestamptz
);

-- Drinks
create table if not exists public.drinks (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid references public.bars(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  drink_type text not null check (drink_type in ('beer', 'wine', 'shot', 'cocktail', 'custom')),
  name text not null,
  volume_ml integer not null check (volume_ml > 0),
  abv_percent float not null check (abv_percent >= 0 and abv_percent <= 100),
  price decimal(10,2) check (price >= 0),
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.night_outs enable row level security;
alter table public.night_out_participants enable row level security;
alter table public.bars enable row level security;
alter table public.drinks enable row level security;

-- Grant table-level access to anon role (required in addition to RLS policies)
grant all on public.users to anon;
grant all on public.night_outs to anon;
grant all on public.night_out_participants to anon;
grant all on public.bars to anon;
grant all on public.drinks to anon;

-- Open policies (no auth — identity managed client-side via localStorage UUID)
create policy "public read/write" on public.users for all to anon using (true) with check (true);
create policy "public read/write" on public.night_outs for all to anon using (true) with check (true);
create policy "public read/write" on public.night_out_participants for all to anon using (true) with check (true);
create policy "public read/write" on public.bars for all to anon using (true) with check (true);
create policy "public read/write" on public.drinks for all to anon using (true) with check (true);

-- Enable Realtime for bars and participants
alter publication supabase_realtime add table public.bars;
alter publication supabase_realtime add table public.night_out_participants;
alter publication supabase_realtime add table public.night_outs;
