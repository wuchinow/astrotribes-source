-- 0002 (2c): one change of birth details an hour (S11), the database's own clock, and the
-- alternate sign on a placement (U12), readable like the sign and never a degree.
begin;
select plan(14);

select tests.new_user('member');
select tests.new_user('other');

-- A first save: the member's own insert, stamped by the database whatever the request says.
select tests.be('member');
select lives_ok(
  $$insert into public.birth_data (user_id, birth_date, birth_time, time_known, place_label, latitude, longitude, timezone, updated_at)
    values (tests.id('member'), date '1960-01-01' + floor(random() * 16800)::int, null, false, 'Synthetic', 0, 0, 'Etc/UTC', now() - interval '1 day')$$,
  'a member saves their birth details');
select is((select updated_at from public.birth_data where user_id = tests.id('member')), now(),
  'the insert is stamped with the database''s clock, not the request''s');

-- A change within the hour is refused, with a fixed message and no value from the row.
select throws_ok(
  $$update public.birth_data set place_label = 'Elsewhere' where user_id = tests.id('member')$$,
  'P0001', 'birth_data_too_soon', 'a second change within the hour is refused');
select throws_ok(
  $$update public.birth_data set updated_at = now() - interval '1 day' where user_id = tests.id('member')$$,
  'P0001', 'birth_data_too_soon', 'a member cannot backdate the clock to get round it');

-- After an hour it goes through, and the clock moves.
reset role;
select tests.backdate_birth_data('member');
select tests.be('member');
select lives_ok(
  $$update public.birth_data set place_label = 'Elsewhere' where user_id = tests.id('member')$$,
  'a change after the hour goes through');
select is((select updated_at from public.birth_data where user_id = tests.id('member')), now(),
  'the change restarts the hour');
select throws_ok(
  $$update public.birth_data set place_label = 'Again' where user_id = tests.id('member')$$,
  'P0001', 'birth_data_too_soon', 'and the next change waits another hour');

-- created_at stays the first save's.
reset role;
select tests.backdate_birth_data('member');
select tests.be('member');
update public.birth_data set created_at = now() - interval '10 years' where user_id = tests.id('member');
select is((select created_at from public.birth_data where user_id = tests.id('member')), now(),
  'a member cannot rewrite when they first saved');

-- The alternate sign: written by the server, read by members like the sign, never equal to it.
reset role;
set local role service_role;
select lives_ok(
  $$insert into public.placements (user_id, body, sign, sign_alternate, house, degree, minute, retrograde, engine_version)
    values (tests.id('member'), 'moon', 'leo', 'virgo', null, 29, 59, false, 'test-engine@0')$$,
  'the server stores a picked sign with its alternate');
select throws_ok(
  $$insert into public.placements (user_id, body, sign, sign_alternate, house, degree, minute, retrograde, engine_version)
    values (tests.id('member'), 'sun', 'leo', 'leo', null, 0, 0, false, 'test-engine@0')$$,
  '23514', null, 'an alternate equal to the sign is refused');
select throws_ok(
  $$insert into public.placements (user_id, body, sign, sign_alternate, house, degree, minute, retrograde, engine_version)
    values (tests.id('member'), 'sun', 'leo', 'ophiuchus', null, 0, 0, false, 'test-engine@0')$$,
  '23514', null, 'an alternate that is not a sign is refused');
reset role;

select tests.be('member');
select is((select sign_alternate from public.placements where user_id = tests.id('member') and body = 'moon'),
  'virgo', 'the owner reads their alternate sign');
select throws_ok(
  $$update public.placements set sign_alternate = null where user_id = tests.id('member')$$,
  '42501', null, 'a member cannot write their own alternate');

select tests.be('other');
select is((select count(*) from public.placements where user_id = tests.id('member')), 0::bigint,
  'a second member sees no placement of a private member, alternate included');

select * from finish();
rollback;
