-- Bar photos table
create table if not exists public.bar_photos (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid references public.bars(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  storage_path text not null,
  created_at timestamptz default now() not null
);

alter table public.bar_photos enable row level security;
grant all on public.bar_photos to anon;
create policy "public read/write" on public.bar_photos for all to anon using (true) with check (true);
alter publication supabase_realtime add table public.bar_photos;

-- Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('bar-photos', 'bar-photos', true)
on conflict (id) do nothing;

create policy "public read" on storage.objects
  for select using (bucket_id = 'bar-photos');

create policy "anon upload" on storage.objects
  for insert with check (bucket_id = 'bar-photos');

create policy "anon delete" on storage.objects
  for delete using (bucket_id = 'bar-photos');
