create table public.sos_alerts (
  hangout_id uuid not null references public.hangouts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  lat public.lat,
  lon public.lon,
  updated_at timestamptz not null default now(),
  primary key (hangout_id, user_id)
);

create policy "participant reads hangout sos alerts" on public.sos_alerts for
select
  to authenticated using (private.is_hangout_participant (hangout_id));

create policy "user manages own sos alert" on public.sos_alerts for all to authenticated using (
  (
    (
      select
        auth.uid ()
    ) = user_id
  )
  and private.is_hangout_participant (hangout_id)
);

alter table public.sos_alerts replica identity full;

alter publication supabase_realtime
add table public.sos_alerts;
