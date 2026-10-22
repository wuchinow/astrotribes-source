-- A visitor with no session reads nothing and writes nothing, with rows present to find.
begin;
select plan(14);

select tests.new_user('owner');
select tests.give_birth_data('owner');
select tests.give_chart('owner', 'leo');
update public.profiles set visibility = 'everyone' where id = tests.id('owner');

select tests.be_anon();

select throws_ok('select * from public.profiles', '42501', null, 'anon cannot select profiles');
select throws_ok('select id from public.profiles', '42501', null, 'anon cannot select one profile column');
select throws_ok('select * from public.birth_data', '42501', null, 'anon cannot select birth_data');
select throws_ok('select birth_date from public.birth_data', '42501', null, 'anon cannot select a birth date');
select throws_ok('select * from public.placements', '42501', null, 'anon cannot select placements');
select throws_ok('select sign from public.placements', '42501', null, 'anon cannot select a sign');
select throws_ok('select * from public.member_counts', '42501', null, 'anon cannot read the counts');

select throws_ok(
  $$insert into public.profiles (id) values (gen_random_uuid())$$,
  '42501', null, 'anon cannot insert a profile');
select throws_ok(
  $$update public.profiles set visibility = 'everyone'$$,
  '42501', null, 'anon cannot update profiles');
select throws_ok('delete from public.profiles', '42501', null, 'anon cannot delete profiles');
select throws_ok(
  $$update public.birth_data set place_label = 'x'$$,
  '42501', null, 'anon cannot update birth_data');
select throws_ok('delete from public.birth_data', '42501', null, 'anon cannot delete birth_data');
select throws_ok('delete from public.placements', '42501', null, 'anon cannot delete placements');
select throws_ok(
  $$select private.can_view_member(gen_random_uuid())$$,
  '42501', null, 'anon cannot call the visibility function');

select * from finish();
rollback;
