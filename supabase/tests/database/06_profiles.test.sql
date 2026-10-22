-- Profiles: a member changes their own display name and visibility, and nothing else.
begin;
select plan(13);

select tests.new_user('first');
select tests.new_user('second');
update public.profiles set visibility = 'everyone' where id in (tests.id('first'), tests.id('second'));

select tests.be('first');
select lives_ok(
  $$update public.profiles set display_name = 'Synthetic One' where id = tests.id('first')$$,
  'a member sets their own display name');
select is((select display_name from public.profiles where id = tests.id('first')), 'Synthetic One',
  'and it took');
select throws_ok(
  $$update public.profiles set is_demo = false where id = tests.id('first')$$,
  '42501', null, 'a member cannot change is_demo');
select throws_ok(
  $$update public.profiles set id = gen_random_uuid() where id = tests.id('first')$$,
  '42501', null, 'a member cannot change their profile id');
select throws_ok(
  $$update public.profiles set visibility = 'public' where id = tests.id('first')$$,
  '23514', null, 'a visibility outside the list is refused');
select throws_ok(
  $$update public.profiles set display_name = repeat('a', 41) where id = tests.id('first')$$,
  '23514', null, 'a display name over 40 characters is refused');
select throws_ok(
  $$update public.profiles set display_name = '' where id = tests.id('first')$$,
  '23514', null, 'an empty display name is refused');
select throws_ok(
  $$insert into public.profiles (id) values (gen_random_uuid())$$,
  '42501', null, 'a member cannot insert a profile');
select throws_ok(
  $$delete from public.profiles where id = tests.id('first')$$,
  '42501', null, 'a member cannot delete a profile; the account deletion does it');

select tests.be('second');
select is((select count(*) from public.profiles where id = tests.id('first')), 1::bigint,
  'the second member can see the first profile (everyone)');
select lives_ok(
  $$update public.profiles set display_name = 'Overwritten' where id = tests.id('first')$$,
  'the second member''s update of it matches nothing');
select lives_ok(
  $$update public.profiles set visibility = 'private' where id = tests.id('first')$$,
  'nor can they change its visibility');

reset role;
select is(
  (select display_name || ' / ' || visibility from public.profiles where id = tests.id('first')),
  'Synthetic One / everyone', 'the first profile is untouched');

select * from finish();
rollback;
