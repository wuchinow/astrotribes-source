-- 0008: a member's Chinese zodiac animal on their profile (4s, Nov 9, David: "show it"). Your chart
-- already shows the member's own animal, worked out in the app from their own birth date (3y). Other
-- members cannot read anyone's birth date (invariant 2), so this works the animal out here and
-- returns only that: one of twelve words, never the date, the year, or the element. It covers only
-- members the viewer may already see (private.can_view_member), like close_matches (0005). David
-- accepted on Nov 9 that the animal, beside the generation's signs, narrows a birth year. Nothing is
-- written, no grant on a table is widened, and the secret key gains nothing. Once applied this file
-- is never edited; a fix is a new migration.
--
-- The Lunar New Year dates (MMDD, 1900 to 2100) are lib/chinese-zodiac.ts's, copied here so the two
-- agree; tests/schema.test.ts holds them equal. 1984 began a cycle with the Rat.

-- 1. The work. Security definer so it can read birth dates, which no API role can for anyone else.
create function private.member_animals(others uuid[])
returns table (member uuid, animal text)
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
  born as (
    select b.user_id, b.birth_date, extract(year from b.birth_date)::int as y
    from public.birth_data b
    where b.user_id in (select id from visible)
  ),
  chinese as (
    select
      user_id,
      case
        when to_char(birth_date, 'MMDD') < (array[
    '0131', '0219', '0208', '0129', '0216', '0204', '0125', '0213', '0202', '0122',
    '0210', '0130', '0218', '0206', '0126', '0214', '0203', '0123', '0211', '0201',
    '0220', '0208', '0128', '0216', '0205', '0124', '0213', '0202', '0123', '0210',
    '0130', '0217', '0206', '0126', '0214', '0204', '0124', '0211', '0131', '0219',
    '0208', '0127', '0215', '0205', '0125', '0213', '0202', '0122', '0210', '0129',
    '0217', '0206', '0127', '0214', '0203', '0124', '0212', '0131', '0218', '0208',
    '0128', '0215', '0205', '0125', '0213', '0202', '0121', '0209', '0130', '0217',
    '0206', '0127', '0215', '0203', '0123', '0211', '0131', '0218', '0207', '0128',
    '0216', '0205', '0125', '0213', '0202', '0220', '0209', '0129', '0217', '0206',
    '0127', '0215', '0204', '0123', '0210', '0131', '0219', '0207', '0128', '0216',
    '0205', '0124', '0212', '0201', '0122', '0209', '0129', '0218', '0207', '0126',
    '0214', '0203', '0123', '0210', '0131', '0219', '0208', '0128', '0216', '0205',
    '0125', '0212', '0201', '0122', '0210', '0129', '0217', '0206', '0126', '0213',
    '0203', '0123', '0211', '0131', '0219', '0208', '0128', '0215', '0204', '0124',
    '0212', '0201', '0122', '0210', '0130', '0217', '0206', '0126', '0214', '0202',
    '0123', '0211', '0201', '0219', '0208', '0128', '0215', '0204', '0124', '0212',
    '0202', '0121', '0209', '0129', '0217', '0205', '0126', '0214', '0203', '0123',
    '0211', '0131', '0219', '0207', '0127', '0215', '0205', '0124', '0212', '0202',
    '0122', '0209', '0129', '0217', '0206', '0126', '0214', '0203', '0124', '0210',
    '0130', '0218', '0207', '0127', '0215', '0205', '0125', '0212', '0201', '0121',
    '0209'
  ])[y - 1899] then y - 1
        else y
      end as cy
    from born
    where y between 1900 and 2100
  )
  select
    user_id,
    (array['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'])
      [((cy - 1984) % 12 + 12) % 12 + 1]
  from chinese
  where cy >= 1900;
$$;
revoke all on function private.member_animals(uuid[]) from public, anon, authenticated, service_role;
grant execute on function private.member_animals(uuid[]) to authenticated;

-- 2. The door the Data API serves, as in 0005: security invoker with a standard SQL body, so a member
--    needs only the execute grant. Visitors and the secret key cannot call it.
create function public.member_animals(others uuid[])
returns table (member uuid, animal text)
language sql
stable
security invoker
set search_path = ''
begin atomic
  select a.member, a.animal from private.member_animals(others) as a;
end;
revoke all on function public.member_animals(uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.member_animals(uuid[]) to authenticated;
