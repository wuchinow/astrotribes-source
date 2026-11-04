-- 0003: the admin members page. Only someone on the admin list gets anything, every look writes
-- an audit row, and no birth detail ever leaves the function. The users are synthetic, as always;
-- three are marked not demo inside this rolled-back transaction, so the numbers have someone to count.
begin;
select plan(26);

-- The catalog: two private tables, locked to every API role, and a door that is not a definer.
select has_table('private', 'admins', 'the admin list exists');
select has_table('private', 'admin_views', 'the audit table exists');
select ok((select relrowsecurity from pg_class where oid = 'private.admins'::regclass), 'the admin list has RLS on');
select ok((select relrowsecurity from pg_class where oid = 'private.admin_views'::regclass), 'the audit table has RLS on');
select is(
  (select count(*)
   from unnest(array['anon', 'authenticated', 'service_role']) as r
   cross join unnest(array['private.admins', 'private.admin_views']) as t
   cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as p
   where has_table_privilege(r, t, p)),
  0::bigint, 'no API role can read or write the admin list or the audit table');
select ok(not (select prosecdef from pg_proc where oid = 'public.admin_members()'::regprocedure),
  'the door in public is security invoker');
select ok((select prosecdef from pg_proc where oid = 'private.admin_members()'::regprocedure),
  'the check behind it is security definer');
select ok(not has_function_privilege('anon', 'public.admin_members()', 'EXECUTE'), 'anon cannot call it');
select ok(not has_function_privilege('anon', 'private.admin_members()', 'EXECUTE'), 'anon cannot call the check');
select ok(not has_function_privilege('service_role', 'public.admin_members()', 'EXECUTE'),
  'the secret key cannot call it');
select ok(has_function_privilege('authenticated', 'public.admin_members()', 'EXECUTE'),
  'members may call it, and the check decides');

-- People: an admin, a member who finished, one who only picked a name, and a demo account.
select tests.new_user('boss', '{"display_name": "Boss"}');
select tests.new_user('done', '{"display_name": "Done"}');
select tests.new_user('half', '{"display_name": "Half"}');
select tests.new_user('demo');
update public.profiles set is_demo = false where id in (tests.id('boss'), tests.id('done'), tests.id('half'));
select tests.give_birth_data('done');
select tests.give_birth_data('demo');
insert into private.admins (user_id) values (tests.id('boss'));

-- A member not on the list gets the refusal, and no audit row is written.
select tests.be('half');
select throws_ok('select public.admin_members()', '42501', 'admin_only', 'a member not on the list is refused');
reset role;
select is((select count(*) from private.admin_views), 0::bigint, 'a refusal writes no audit row');

-- No session at all is refused too.
select tests.be_anon();
select throws_ok('select private.admin_members()', '42501', null, 'a visitor with no session is refused');
reset role;

-- The admin gets the page, and the look is written down.
create temp table seen (j jsonb);
grant select, insert on seen to authenticated;
select tests.be('boss');
insert into seen select public.admin_members();
reset role;
select is((select count(*) from private.admin_views where admin_id = tests.id('boss')), 1::bigint,
  'the look writes one audit row, naming the admin');

select is((select (j -> 'stats' ->> 'total')::int from seen), 3, 'the total leaves out the demo account');
select is((select (j -> 'stats' ->> 'joined_week')::int from seen), 3, 'all three joined this week');
select is((select (j -> 'stats' ->> 'total_week_ago')::int from seen), 0, 'and none before it');
select is((select (j -> 'stats' ->> 'finished')::int from seen), 1, 'one finished: a name and birth details');
select is((select (j ->> 'demo')::int from seen), 1, 'the demo account is counted on its own');
select is((select jsonb_array_length(j -> 'members') from seen), 4, 'the list shows everyone, demo included');
select is(
  (select array_agg(k order by k) from seen, jsonb_array_elements(j -> 'members') m, jsonb_object_keys(m) k
   where m ->> 'id' = tests.id('done')::text),
  array['birth_details', 'email', 'id', 'is_demo', 'joined', 'last_sign_in', 'name'],
  'a member row carries exactly these fields');
select is(
  (select (m ->> 'birth_details')::boolean from seen, jsonb_array_elements(j -> 'members') m
   where m ->> 'id' = tests.id('done')::text),
  true, 'birth details show as yes or no');
select ok(
  (select position('Synthetic place' in j::text) = 0
          and position((select birth_date::text from public.birth_data where user_id = tests.id('done')) in j::text) = 0
   from seen),
  'no birth place or birth date appears anywhere in what comes back');
select is((select j -> 'views' -> 0 ->> 'who' from seen), 'Boss', 'the page shows who looked');

-- Off the list, the door closes at once.
delete from private.admins where user_id = tests.id('boss');
select tests.be('boss');
select throws_ok('select public.admin_members()', '42501', 'admin_only', 'a removed admin is refused straight away');
reset role;

select * from finish();
rollback;
