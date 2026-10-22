-- The shape of the schema: RLS, policies, and privileges, read from the catalog.
begin;
select plan(49);

-- Invariant 1: RLS on every table, no policy that is simply true.
select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'),
  3::bigint, 'public holds three tables');
select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0::bigint, 'every table in public has RLS enabled');
select is(
  (select count(*) from pg_policies
   where schemaname = 'public' and (qual = 'true' or with_check = 'true')),
  0::bigint, 'no policy is USING (true) or WITH CHECK (true)');
select is(
  (select count(*) from pg_policies where schemaname = 'public' and roles <> '{authenticated}'),
  0::bigint, 'every policy is for authenticated, and only authenticated');
select policies_are('public', 'profiles', array['profiles_select_visible', 'profiles_update_own']);
select policies_are('public', 'birth_data',
  array['birth_data_select_own', 'birth_data_insert_own', 'birth_data_update_own']);
select policies_are('public', 'placements', array['placements_select_visible']);

-- anon: no privilege of any kind on any table or view in public, and none on a column.
select is(
  (select count(*)
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) as p
   where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'p', 'f')
     and has_table_privilege('anon', c.oid, p)),
  0::bigint, 'anon has no table privilege on anything in public');
select is(
  (select count(*)
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'p', 'f')
     and has_any_column_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')),
  0::bigint, 'anon has no column privilege on anything in public');
select ok(not has_schema_privilege('anon', 'private', 'USAGE'), 'anon cannot use the private schema');
select ok(not has_function_privilege('anon', 'private.can_view_member(uuid)', 'EXECUTE'),
  'anon cannot execute can_view_member');
select ok(not has_function_privilege('anon', 'private.member_counts()', 'EXECUTE'),
  'anon cannot execute member_counts');

-- authenticated: exactly the grants in the migration.
select ok(has_table_privilege('authenticated', 'public.profiles', 'SELECT'), 'members select profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'INSERT'), 'members do not insert profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'DELETE'), 'members do not delete profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'UPDATE'), 'members have no table-wide update on profiles');
select ok(has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'), 'members update display_name');
select ok(has_column_privilege('authenticated', 'public.profiles', 'visibility', 'UPDATE'), 'members update visibility');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'is_demo', 'UPDATE'), 'members cannot update is_demo');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'), 'members cannot update a profile id');

select ok(has_table_privilege('authenticated', 'public.birth_data', 'SELECT'), 'members select birth_data (their own, by RLS)');
select ok(has_table_privilege('authenticated', 'public.birth_data', 'INSERT'), 'members insert birth_data');
select ok(has_table_privilege('authenticated', 'public.birth_data', 'UPDATE'), 'members update birth_data');
select ok(not has_table_privilege('authenticated', 'public.birth_data', 'DELETE'), 'members do not delete birth_data');

select ok(not has_table_privilege('authenticated', 'public.placements', 'SELECT'), 'members have no table-wide select on placements');
select ok(has_column_privilege('authenticated', 'public.placements', 'sign', 'SELECT'), 'members read a placement''s sign');
select ok(has_column_privilege('authenticated', 'public.placements', 'house', 'SELECT'), 'members read a placement''s house');
select ok(has_column_privilege('authenticated', 'public.placements', 'sign_alternate', 'SELECT'), 'members read a placement''s alternate sign (0002)');
select ok(not has_column_privilege('authenticated', 'public.placements', 'degree', 'SELECT'), 'members cannot read a degree');
select ok(not has_column_privilege('authenticated', 'public.placements', 'minute', 'SELECT'), 'members cannot read a minute');
select ok(not has_table_privilege('authenticated', 'public.placements', 'INSERT'), 'members do not insert placements');
select ok(not has_table_privilege('authenticated', 'public.placements', 'UPDATE'), 'members do not update placements');
select ok(not has_table_privilege('authenticated', 'public.placements', 'DELETE'), 'members do not delete placements');
select ok(not has_any_column_privilege('authenticated', 'public.placements', 'INSERT, UPDATE'),
  'members have no column-level write on placements');

select ok(has_table_privilege('authenticated', 'public.member_counts', 'SELECT'), 'members read the counts');
select ok(not has_table_privilege('authenticated', 'public.member_counts', 'INSERT'), 'members do not write the counts');
select ok(not has_schema_privilege('authenticated', 'private', 'USAGE'), 'members cannot use the private schema');
select ok(not has_function_privilege('authenticated', 'private.handle_new_user()', 'EXECUTE'),
  'members cannot execute the new-user trigger function');
select ok(not has_function_privilege('authenticated', 'private.birth_data_changed()', 'EXECUTE'),
  'members cannot execute the birth details trigger function (0002)');

-- service_role: placements only. No path to birth_data (invariant 2).
select ok(has_table_privilege('service_role', 'public.placements', 'SELECT, INSERT, UPDATE, DELETE'),
  'the server writes placements');
select ok(not has_table_privilege('service_role', 'public.birth_data', 'SELECT'), 'the secret key cannot read birth_data');
select ok(not has_any_column_privilege('service_role', 'public.birth_data', 'SELECT, INSERT, UPDATE'),
  'the secret key has no column privilege on birth_data');
select ok(not has_table_privilege('service_role', 'public.profiles', 'SELECT'), 'the secret key cannot read profiles');

-- Functions: none in the served schema; every definer function is in private with a fixed path.
select is(
  (select count(*) from pg_proc where pronamespace = 'public'::regnamespace),
  0::bigint, 'public holds no functions');
select is(
  (select count(*) from pg_proc
   where prosecdef and pronamespace = 'private'::regnamespace
     and not coalesce(proconfig, '{}') @> array['search_path=""']),
  0::bigint, 'every security definer function in private has an empty search_path');
select function_returns('private', 'can_view_member', array['uuid'], 'boolean');
select is(
  (select reloptions::text from pg_class where oid = 'public.member_counts'::regclass),
  '{security_invoker=true}', 'member_counts is a security invoker view');

-- Default privileges: a new table made by postgres in public starts with no API access.
set local role postgres;
create table public.probe_default_privileges (id int);
reset role;
select is(
  (select count(*)
   from unnest(array['anon', 'authenticated', 'service_role']) as r
   cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as p
   where has_table_privilege(r, 'public.probe_default_privileges', p)),
  0::bigint, 'a new table in public is not exposed until it is granted');
select is(
  (select count(*) from pg_default_acl d
   where d.defaclnamespace = 'public'::regnamespace
     and pg_get_userbyid(d.defaclrole) = 'postgres'
     and d.defaclacl::text ~ '(anon|authenticated|service_role)='),
  0::bigint, 'postgres''s default privileges in public name no API role');

select * from finish();
rollback;
