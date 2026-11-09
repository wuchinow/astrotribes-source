-- 0008: a member's Chinese zodiac animal. Members learn only the animal, never a birth date; only
-- for members they may already see; never their own through this door. The users and their birth
-- dates are synthetic.
begin;
select plan(11);

select ok(not (select prosecdef from pg_proc where oid = 'public.member_animals(uuid[])'::regprocedure),
  'the door in public is security invoker');
select ok((select prosecdef from pg_proc where oid = 'private.member_animals(uuid[])'::regprocedure),
  'the work behind it is security definer');
select ok(not has_function_privilege('anon', 'public.member_animals(uuid[])', 'EXECUTE'), 'anon cannot call it');
select ok(not has_function_privilege('service_role', 'public.member_animals(uuid[])', 'EXECUTE'),
  'the secret key cannot call it');
select ok(has_function_privilege('authenticated', 'public.member_animals(uuid[])', 'EXECUTE'), 'members may call it');
select is(
  (select array_agg(a order by a) from unnest(
    (select proargnames from pg_proc where oid = 'public.member_animals(uuid[])'::regprocedure)) as a),
  array['animal', 'member', 'others'],
  'it returns who and the animal: never a date');

-- B: born before 1966's Lunar New Year (January 21), so the Snake of 1965, not the Horse.
-- C: like B, but private.
-- D: born on 1984's Lunar New Year (February 2), so the Rat of 1984.
select tests.new_user('a', '{"display_name": "A"}');
select tests.new_user('b', '{"display_name": "B"}');
select tests.new_user('c', '{"display_name": "C"}');
select tests.new_user('d', '{"display_name": "D"}');
update public.profiles set visibility = 'everyone' where id in (tests.id('a'), tests.id('b'), tests.id('d'));
insert into public.birth_data (user_id, birth_date, birth_time, time_known, place_label, latitude, longitude, timezone)
values
  (tests.id('a'), date '1975-07-01', null, false, 'Synthetic place', 0, 0, 'Etc/UTC'),
  (tests.id('b'), date '1966-01-15', null, false, 'Synthetic place', 0, 0, 'Etc/UTC'),
  (tests.id('c'), date '1966-01-15', null, false, 'Synthetic place', 0, 0, 'Etc/UTC'),
  (tests.id('d'), date '1984-02-02', null, false, 'Synthetic place', 0, 0, 'Etc/UTC');

create temporary table seen on commit drop as select * from public.member_animals(array[]::uuid[]) limit 0;
grant all on seen to authenticated;

select tests.be('a');
insert into seen select * from public.member_animals(array[tests.id('a'), tests.id('b'), tests.id('c'), tests.id('d')]);
reset role;

select is((select animal from seen where member = tests.id('b')), 'Snake', 'a birth before Lunar New Year belongs to the year before');
select is((select animal from seen where member = tests.id('d')), 'Rat', 'a birth on Lunar New Year belongs to the new year');
select is((select count(*) from seen where member = tests.id('c')), 0::bigint, 'nothing about a member who keeps their chart private');
select is((select count(*) from seen where member = tests.id('a')), 0::bigint, 'never yourself');

select tests.be_anon();
select throws_ok('select * from public.member_animals(array[]::uuid[])', '42501', null,
  'a visitor with no session is refused');
reset role;

select * from finish();
rollback;
