-- 0004: the account menu's admin check. It answers yes or no for the signed-in member only,
-- writes nothing, and visitors and the secret key cannot call it. The users are synthetic.
begin;
select plan(13);

select function_returns('public', 'is_admin', array[]::text[], 'boolean', 'the door returns a yes or no, nothing else');
select function_returns('private', 'is_admin', array[]::text[], 'boolean', 'the check returns a yes or no, nothing else');
select ok(not (select prosecdef from pg_proc where oid = 'public.is_admin()'::regprocedure),
  'the door in public is security invoker');
select ok((select prosecdef from pg_proc where oid = 'private.is_admin()'::regprocedure),
  'the check behind it is security definer');
select ok(not has_function_privilege('anon', 'public.is_admin()', 'EXECUTE'), 'anon cannot call it');
select ok(not has_function_privilege('service_role', 'public.is_admin()', 'EXECUTE'), 'the secret key cannot call it');
select ok(has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE'), 'members may call it');

select tests.new_user('boss', '{"display_name": "Boss"}');
select tests.new_user('half', '{"display_name": "Half"}');
insert into private.admins (user_id) values (tests.id('boss'));

select tests.be('half');
select is(public.is_admin(), false, 'a member not on the list gets no');
reset role;

select tests.be('boss');
select is(public.is_admin(), true, 'an admin gets yes');
reset role;
select is((select count(*) from private.admin_views), 0::bigint, 'asking writes no audit row');

select tests.be_anon();
select throws_ok('select public.is_admin()', '42501', null, 'a visitor with no session is refused');
reset role;

-- Off the list, the answer changes at once.
delete from private.admins where user_id = tests.id('boss');
select tests.be('boss');
select is(public.is_admin(), false, 'a removed admin gets no straight away');
reset role;

-- It never says anything about anyone else: the only input is the session.
select is((select pronargs from pg_proc where oid = 'public.is_admin()'::regprocedure), 0::smallint,
  'it takes no argument, so it cannot be asked about another member');

select * from finish();
rollback;
