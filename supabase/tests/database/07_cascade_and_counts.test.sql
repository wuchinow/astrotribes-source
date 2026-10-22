-- Invariant 7: deleting a user deletes everything. And the counts match the rows.
begin;
select plan(15);

select tests.new_user('leaving');
select tests.new_user('staying');
select tests.new_user('quiet');   -- private, and still counted
select tests.give_birth_data('leaving');
select tests.give_birth_data('staying');
select tests.give_chart('leaving', 'leo');
select tests.give_chart('staying', 'leo');
select tests.give_chart('quiet', 'virgo');
update public.profiles set visibility = 'everyone' where id in (tests.id('leaving'), tests.id('staying'));

create temp table counts_before as
  select body, sign, count(*) as members
  from public.placements where body in ('sun', 'moon', 'rising') group by body, sign;
grant select on counts_before to authenticated;

select tests.be('staying');
select results_eq(
  'select body, sign, members from public.member_counts order by body, sign',
  'select body, sign, members from counts_before order by body, sign',
  'the counts equal a group-by over placements');
select is(
  (select members from public.member_counts where body = 'sun' and sign = 'virgo'),
  (select members from counts_before where body = 'sun' and sign = 'virgo'),
  'a private member is counted');
select is((select count(*) from public.placements where user_id = tests.id('quiet')), 0::bigint,
  'and their rows stay hidden');
select is(
  (select count(*) from public.member_counts where body not in ('sun', 'moon', 'rising')),
  0::bigint, 'only the Sun, the Moon, and the rising sign are counted');
reset role;

select set_config('tests.leo_before',
  (select members::text from counts_before where body = 'sun' and sign = 'leo'), true);

-- The auth server deletes the user, as its own role. (A plain statement: that role cannot reach
-- pgTAP, and an error here stops the file.)
set local role supabase_auth_admin;
delete from auth.users where id = tests.id('leaving');
reset role;
select pass('supabase_auth_admin deletes the user');

select is((select count(*) from auth.users where id = tests.id('leaving')), 0::bigint, 'the user is gone');
select is((select count(*) from public.profiles where id = tests.id('leaving')), 0::bigint, 'their profile is gone');
select is((select count(*) from public.birth_data where user_id = tests.id('leaving')), 0::bigint, 'their birth data is gone');
select is((select count(*) from public.placements where user_id = tests.id('leaving')), 0::bigint, 'their placements are gone');

select is((select count(*) from public.profiles where id = tests.id('staying')), 1::bigint, 'another member''s profile stays');
select is((select count(*) from public.birth_data where user_id = tests.id('staying')), 1::bigint, 'and their birth data');
select is((select count(*) from public.placements where user_id = tests.id('staying')), 15::bigint, 'and their placements');

select tests.be('staying');
select is(
  (select members from public.member_counts where body = 'sun' and sign = 'leo'),
  current_setting('tests.leo_before')::bigint - 1,
  'the count for that Sun sign drops by one');
select is((select count(*) from public.placements where user_id = tests.id('leaving')), 0::bigint,
  'a member who could see those rows now finds none');
reset role;

-- A profile cannot outlive its user, and nothing can hang off a missing profile.
select throws_ok(
  $$insert into public.placements (user_id, body, sign, degree, minute, engine_version)
    values (gen_random_uuid(), 'sun', 'leo', 1, 1, 'test-engine@0')$$,
  '23503', null, 'a placement needs a profile');

select * from finish();
rollback;
