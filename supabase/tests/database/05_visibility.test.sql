-- Invariant 3: placements (and the profile beside them) follow the owner's visibility, row by
-- row, in the database. And no member reads a degree by any path, at any level.
begin;
select plan(45);

select tests.new_user('owner');     -- Sun in leo
select tests.new_user('same');      -- Sun in leo too
select tests.new_user('other');     -- Sun in aries
select tests.new_user('chartless'); -- signed in, no chart yet
select tests.give_chart('owner', 'leo');
select tests.give_chart('same', 'leo');
select tests.give_chart('other', 'aries');

-- private (the default).
select tests.be('owner');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 15::bigint,
  'private: the owner sees all 15 of their placements');
select is((select count(*) from public.profiles where id = tests.id('owner')), 1::bigint,
  'private: the owner sees their own profile');
select tests.be('same');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'private: a member with the same Sun sign sees no placements');
select is((select count(*) from public.profiles where id = tests.id('owner')), 0::bigint,
  'private: and no profile');
select tests.be('other');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'private: a member with another Sun sign sees no placements');
select tests.be('chartless');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'private: a member with no chart sees no placements');
select throws_ok('select degree from public.placements', '42501', null, 'private: no degree for another member');

-- tribe: the owner changes their own setting, and the next query follows it.
select tests.be('owner');
select lives_ok(
  $$update public.profiles set visibility = 'tribe' where id = tests.id('owner')$$,
  'the owner sets their visibility to tribe');
select tests.be('same');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 15::bigint,
  'tribe: a member with the same Sun sign sees the placements');
select is((select count(*) from public.profiles where id = tests.id('owner')), 1::bigint,
  'tribe: and the profile');
select throws_ok('select degree from public.placements', '42501', null, 'tribe: no degree for a member who sees the rows');
select throws_ok('select minute from public.placements', '42501', null, 'tribe: no minute');
select throws_ok('select * from public.placements', '42501', null, 'tribe: select * is refused, since it would include the degree');
select tests.be('other');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'tribe: a member with another Sun sign sees nothing');
select is((select count(*) from public.profiles where id = tests.id('owner')), 0::bigint,
  'tribe: and no profile');
select throws_ok('select degree from public.placements', '42501', null, 'tribe: no degree for a member outside it');
select tests.be('chartless');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'tribe: a member with no Sun row is not the same tribe (fails closed)');

-- tribe, and the owner has no Sun row: not the same tribe as anyone (fails closed).
reset role;
delete from public.placements where user_id = tests.id('owner') and body = 'sun';
select tests.be('same');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'tribe: an owner with no Sun row is seen by no one else');
select tests.be('owner');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 14::bigint,
  'the owner still sees their own');
reset role;
insert into public.placements (user_id, body, sign, house, degree, minute, engine_version)
  values (tests.id('owner'), 'sun', 'leo', 5, 12, 30, 'test-engine@0');

-- everyone: any signed-in member.
select tests.be('owner');
select lives_ok(
  $$update public.profiles set visibility = 'everyone' where id = tests.id('owner')$$,
  'the owner sets their visibility to everyone');
select tests.be('same');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 15::bigint,
  'everyone: a member with the same Sun sign sees the placements');
select tests.be('other');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 15::bigint,
  'everyone: a member with another Sun sign sees them');
select is((select count(*) from public.profiles where id = tests.id('owner')), 1::bigint,
  'everyone: and the profile');
select tests.be('chartless');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 15::bigint,
  'everyone: a member with no chart sees them');
select is(
  (select sign from public.placements where user_id = tests.id('owner') and body = 'sun'),
  'leo', 'everyone: sign and house are readable by name');
select throws_ok('select degree from public.placements', '42501', null, 'everyone: no degree');
select throws_ok('select minute from public.placements', '42501', null, 'everyone: no minute');
select throws_ok(
  $$select degree from public.placements where user_id = tests.id('owner') and body = 'sun'$$,
  '42501', null, 'everyone: no degree for one named row either');
select tests.be_anon();
select throws_ok('select sign from public.placements', '42501', null,
  'everyone never means the public: anon is still refused');

-- back to private: the rows are gone again on the next query.
select tests.be('owner');
select lives_ok(
  $$update public.profiles set visibility = 'private' where id = tests.id('owner')$$,
  'the owner sets their visibility back to private');
select tests.be('same');
select is((select count(*) from public.placements where user_id = tests.id('owner')), 0::bigint,
  'private again: nothing');

-- The owner does not read their own degree through the API either; the server supplies it.
select tests.be('owner');
select throws_ok('select degree from public.placements', '42501', null, 'the owner''s own degree is not served by the API');

-- No member writes a placement, their own included.
select throws_ok(
  $$insert into public.placements (user_id, body, sign, degree, minute, engine_version)
    values (tests.id('owner'), 'moon', 'aries', 1, 1, 'forged')$$,
  '42501', null, 'a member cannot insert a placement');
select throws_ok(
  $$update public.placements set sign = 'aries' where user_id = tests.id('owner') and body = 'sun'$$,
  '42501', null, 'a member cannot change their Sun sign');
select throws_ok(
  $$delete from public.placements where user_id = tests.id('owner')$$,
  '42501', null, 'a member cannot delete a placement');

-- No degree through a view or a function.
select tests.be('same');
select throws_ok('select * from private.member_counts()', '42501', null,
  'a member cannot call a private function directly');
select throws_ok(
  $$select private.can_view_member(tests.id('owner'))$$,
  '42501', null, 'nor the visibility function');
reset role;
select is(
  (select count(*)
   from information_schema.columns c
   where c.table_schema in ('public', 'private')
     and c.column_name in ('degree', 'minute')
     and has_column_privilege('authenticated', format('%I.%I', c.table_schema, c.table_name), c.column_name, 'SELECT')),
  0::bigint, 'no table or view gives a member a degree or minute column');
select is(
  (select count(*)
   from information_schema.columns c
   where c.table_schema in ('public', 'private')
     and c.column_name in ('degree', 'minute')
     and has_column_privilege('anon', format('%I.%I', c.table_schema, c.table_name), c.column_name, 'SELECT')),
  0::bigint, 'nor a visitor');
select columns_are('public', 'member_counts', array['body', 'sign', 'members'],
  'the counts view has three columns and no degree');
select is(
  (select array_agg(p.oid::regprocedure::text order by p.oid::regprocedure::text)
   from pg_proc p
   where p.pronamespace in ('public'::regnamespace, 'private'::regnamespace)
     and has_function_privilege('authenticated', p.oid, 'EXECUTE')),
  array['private.can_view_member(uuid)', 'private.member_counts()'],
  'members hold EXECUTE on two functions only, and only for the policies and the view to use');
select function_returns('private', 'can_view_member', array['uuid'], 'boolean',
  'the visibility function returns a yes or no, nothing else');
select is(
  (select pg_get_function_result('private.member_counts()'::regprocedure)),
  'TABLE(body text, sign text, members bigint)',
  'the counts function returns body, sign, and a number');

-- The server (service_role) is the one writer, and reads degrees for the owner's own pages.
set local role service_role;
select lives_ok(
  $$update public.placements set degree = 13 where user_id = tests.id('owner') and body = 'sun'$$,
  'service_role writes placements');
select is(
  (select degree::int from public.placements where user_id = tests.id('owner') and body = 'sun'),
  13, 'service_role reads a degree');
reset role;

select * from finish();
rollback;
