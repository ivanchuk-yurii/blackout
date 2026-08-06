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
    'hangout-photos',
    'hangout-photos',
    false,
    50 * 1024 * 1024, -- 50 MiB
    array['image/png', 'image/jpeg', 'image/webp']
  )
on conflict (id) do nothing;

create function private.hangout_photo_id (object_name text) returns uuid language sql immutable
set
  search_path = '' as $$
  select (storage.foldername (object_name))[1]::uuid;
$$;

create policy "participant reads hangout photo" on storage.objects for
select
  to authenticated using (
    bucket_id = 'hangout-photos'
    and private.is_hangout_participant (private.hangout_photo_id (name))
  );

create policy "participant uploads hangout photo" on storage.objects for insert to authenticated
with
  check (
    bucket_id = 'hangout-photos'
    and private.is_hangout_active (private.hangout_photo_id (name))
    and private.is_hangout_participant (private.hangout_photo_id (name))
  );

create policy "participant deletes hangout photo" on storage.objects for delete to authenticated using (
  bucket_id = 'hangout-photos'
  and private.is_hangout_participant (private.hangout_photo_id (name))
);
