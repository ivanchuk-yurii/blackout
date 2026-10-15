create or replace view public.hangouts_feed
with
  (security_invoker = on) as
with
  visible as (
    select
      auth.uid () as id
    union
    select
      id
    from
      public.my_buddy_ids
  ),
  visible_hangouts as (
    select
      p.hangout_id
    from
      public.hangout_participant_ids p
    where
      p.user_id in (
        select
          id
        from
          visible
      )
  )
select
  h.*,
  s.name as spot_name,
  s.image as spot_image
from
  public.hangouts h
  left join lateral (
    select
      s.name,
      s.image
    from
      public.spots s
    where
      s.hangout_id = h.id
    order by
      s.created_at desc
    limit
      1
  ) s on true
where
  h.id in (
    select
      hangout_id
    from
      visible_hangouts
  );

create or replace view public.hangout_leaderboard
with
  (security_invoker = on) as
select
  hd.hangout_id,
  u.id,
  u.name,
  u.avatar,
  count(*)::int as count,
  sum(hd.volume)::int as volume,
  sum(hd.volume * d.abv / 1000)::float8 as units
from
  public.hangout_drinks hd
  join public.drinks d on d.id = hd.drink_id
  join public.users u on u.id = hd.user_id
group by
  hd.hangout_id,
  u.id;
