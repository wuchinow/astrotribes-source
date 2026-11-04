-- 0005: close matches (3q, Nov 4, David: "build step two"), step 2 of connection points. Which of
-- your placements sit within a few degrees of another member's, for the members the viewer may
-- already see. Members never read a degree (0001's column grant), so this is worked out here, and
-- only the names of the placements and the kind of match come back: never a degree, a minute, or
-- the size of the gap. The points are the app's (lib/connection-points.ts). Nothing is written,
-- no grant on a table is widened, and the secret key gains nothing. Once applied this file is
-- never edited; a fix is a new migration.
--
-- The kinds, from Dawa's "List of connections" (Sep 28) with the plan's calls:
--   close     a personal placement of yours within 3 degrees of one of theirs (Sun, Moon, Rising,
--             Mercury, Venus, Mars, Jupiter, Saturn; the outer planets are close for most people
--             born within a year or two)
--   rising    your Sun or Moon within 2 degrees of their Rising, or your Rising of their Sun or Moon
--             (counted here instead of as close)
--   node      your Sun or Moon within 2 degrees of their North or South Node, or the other way
--   newMoon   both of you born within 4 degrees of a new moon
--   fullMoon  both of you born within 4 degrees of a full moon
-- A Moon with no birth time could be anywhere in a 13 degree day, so a chart without a Rising row
-- lends its Moon to none of these. A placement whose sign the member picked on a day it changed
-- (sign_alternate set, 0002) holds an edge degree, not a real one, so it is left out too.

-- 1. The work. Security definer so it can read degrees, which no API role can. The viewer is the
--    session's id; each other member counts only if private.can_view_member says the viewer may
--    see them, so it says nothing about anyone a member could not already open. No session: no rows.
create function private.close_matches(others uuid[])
returns table (member uuid, mine text, theirs text, kind text)
language sql
stable
security definer
set search_path = ''
as $$
  with
  viewer as (
    select (select auth.uid()) as id
  ),
  visible as (
    select distinct o as id
    from unnest(others) as o, viewer
    where viewer.id is not null
      and o is not null
      and o <> viewer.id
      and private.can_view_member(o)
  ),
  -- Ecliptic longitude in degrees, from the sign's place in the zodiac, the degree, and the minute.
  points as (
    select
      p.user_id,
      p.body,
      (array_position(array['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio',
                            'sagittarius', 'capricorn', 'aquarius', 'pisces'], p.sign) - 1) * 30
        + p.degree + p.minute / 60.0 as lon
    from public.placements p
    where (p.user_id = (select id from viewer) or p.user_id in (select id from visible))
      and p.sign_alternate is null
      and (p.body <> 'moon' or exists (
            select 1 from public.placements r where r.user_id = p.user_id and r.body = 'rising'))
  ),
  mine as (
    select body, lon from points where user_id = (select id from viewer)
  ),
  theirs as (
    select user_id, body, lon from points where user_id in (select id from visible)
  ),
  pairs as (
    select
      t.user_id as member,
      m.body as mine,
      t.body as theirs,
      least(abs(m.lon - t.lon), 360 - abs(m.lon - t.lon)) as gap
    from mine m
    cross join theirs t
  ),
  lights as (
    select * from pairs
    where (mine in ('sun', 'moon') and theirs = 'rising') or (mine = 'rising' and theirs in ('sun', 'moon'))
  ),
  phase as (
    select
      user_id,
      least(abs(s.lon - m.lon), 360 - abs(s.lon - m.lon)) as gap
    from points s
    join points m using (user_id)
    where s.body = 'sun' and m.body = 'moon'
  )
  select member, mine, theirs, 'rising' from lights where gap <= 2
  union all
  select member, mine, theirs, 'close' from pairs
  where mine in ('sun', 'moon', 'rising', 'mercury', 'venus', 'mars', 'jupiter', 'saturn')
    and theirs in ('sun', 'moon', 'rising', 'mercury', 'venus', 'mars', 'jupiter', 'saturn')
    and gap <= 3
    and not ((mine in ('sun', 'moon') and theirs = 'rising' or mine = 'rising' and theirs in ('sun', 'moon'))
             and gap <= 2)
  union all
  select member, mine, theirs, 'node' from pairs
  where ((mine in ('sun', 'moon') and theirs in ('northNode', 'southNode'))
      or (mine in ('northNode', 'southNode') and theirs in ('sun', 'moon')))
    and gap <= 2
  union all
  select t.user_id, 'moon', 'moon', case when me.gap <= 4 then 'newMoon' else 'fullMoon' end
  from phase t
  cross join (select gap from phase where user_id = (select id from viewer)) me
  where t.user_id in (select id from visible)
    and ((me.gap <= 4 and t.gap <= 4) or (me.gap >= 176 and t.gap >= 176));
$$;
revoke all on function private.close_matches(uuid[]) from public, anon, authenticated, service_role;
grant execute on function private.close_matches(uuid[]) to authenticated;

-- 2. The door the Data API serves, as in 0003 and 0004: security invoker with a standard SQL body,
--    parsed once here, so a member needs only the execute grant. Visitors and the secret key cannot
--    call it.
create function public.close_matches(others uuid[])
returns table (member uuid, mine text, theirs text, kind text)
language sql
stable
security invoker
set search_path = ''
begin atomic
  select c.member, c.mine, c.theirs, c.kind from private.close_matches(others) as c;
end;
revoke all on function public.close_matches(uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.close_matches(uuid[]) to authenticated;
