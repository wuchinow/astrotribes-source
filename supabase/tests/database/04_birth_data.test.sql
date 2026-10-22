-- Invariant 2: birth_data is readable and writable by its owner only.
begin;
select plan(15);

select tests.new_user('first');
select tests.new_user('second');
select tests.give_birth_data('first');
-- Both share everything they can, so only birth_data's own policies stand between them.
update public.profiles set visibility = 'everyone' where id in (tests.id('first'), tests.id('second'));
select set_config('tests.first_place',
  (select place_label from public.birth_data where user_id = tests.id('first')), true);

-- The owner.
select tests.be('first');
select is((select count(*) from public.birth_data), 1::bigint, 'the owner reads their own row');
select lives_ok(
  $$update public.birth_data set place_label = 'Another synthetic place' where user_id = tests.id('first')$$,
  'the owner updates their own row');
select is((select place_label from public.birth_data where user_id = tests.id('first')),
  'Another synthetic place', 'the owner''s update took');
select throws_ok(
  $$delete from public.birth_data where user_id = tests.id('first')$$,
  '42501', null, 'no one deletes birth_data through the API; it goes with the account');

-- A second member.
select tests.be('second');
select is((select count(*) from public.birth_data), 0::bigint,
  'a second member reads no birth_data at all');
select is((select count(*) from public.birth_data where user_id = tests.id('first')), 0::bigint,
  'a second member cannot read the first member''s row by id');
select lives_ok(
  $$update public.birth_data set place_label = 'Overwritten' where user_id = tests.id('first')$$,
  'a second member''s update of the first member''s row matches nothing');
select throws_ok(
  $$insert into public.birth_data (user_id, birth_date, birth_time, time_known, place_label, latitude, longitude, timezone)
    values (tests.id('first'), date '1990-01-01', null, false, 'Synthetic', 0, 0, 'Etc/UTC')$$,
  '42501', null, 'a second member cannot insert a row under the first member''s id');
select lives_ok(
  $$insert into public.birth_data (user_id, birth_date, birth_time, time_known, place_label, latitude, longitude, timezone)
    values (tests.id('second'), date '1960-01-01' + floor(random() * 16800)::int, null, false, 'Synthetic', 0, 0, 'Etc/UTC')$$,
  'a second member inserts their own row, with no birth time');
-- Past 0002's one change an hour, so the policy is what refuses the next update.
reset role;
select tests.backdate_birth_data('second');
select tests.be('second');
select throws_ok(
  $$update public.birth_data set user_id = tests.id('first') where user_id = tests.id('second')$$,
  '42501', null, 'a second member cannot hand their row to the first member''s id');

reset role;
select is((select place_label from public.birth_data where user_id = tests.id('first')),
  'Another synthetic place', 'the first member''s row is untouched');
select is((select count(*) from public.birth_data where user_id = tests.id('second')), 1::bigint,
  'the second member still has exactly their own row');

-- Unknown time (open decision 11): no time when the flag is false, and the reverse.
select tests.backdate_birth_data('first');
select throws_ok(
  $$update public.birth_data set birth_time = '12:00' where user_id = tests.id('second')$$,
  '23514', null, 'a time without time_known is refused');
select throws_ok(
  $$update public.birth_data set birth_time = null where user_id = tests.id('first')$$,
  '23514', null, 'time_known without a time is refused');

-- The secret key has no path to birth_data.
set local role service_role;
select throws_ok('select * from public.birth_data', '42501', null,
  'service_role cannot read birth_data');
reset role;

select * from finish();
rollback;
