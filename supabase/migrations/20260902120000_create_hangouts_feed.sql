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
  h.creator_id in (
    select
      id
    from
      visible
  )
  or h.id in (
    select
      m.hangout_id
    from
      public.hangout_members m
    where
      m.user_id in (
        select
          id
        from
          visible
      )
  );
