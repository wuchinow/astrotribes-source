-- A profile row for every new user, made by the trigger, as the auth server's own role.
begin;
select plan(9);

select set_config('tests.plain', gen_random_uuid()::text, true);
select set_config('tests.named', gen_random_uuid()::text, true);
select set_config('tests.google', gen_random_uuid()::text, true);
select set_config('tests.long', gen_random_uuid()::text, true);
select set_config('tests.blank', gen_random_uuid()::text, true);

set local role supabase_auth_admin;
insert into auth.users (id, email) values (tests.id('plain'), 'plain@example.test');
insert into auth.users (id, email, raw_user_meta_data)
  values (tests.id('named'), 'named@example.test', '{"display_name": "  Synthetic Member  "}');
-- What Google sends: a full name and a name, and no display_name of ours.
insert into auth.users (id, email, raw_user_meta_data)
  values (tests.id('google'), 'google@example.test',
          '{"full_name": "Synthetic Person", "name": "Synthetic Person", "email_verified": true}');
insert into auth.users (id, email, raw_user_meta_data)
  values (tests.id('long'), 'long@example.test',
          json_build_object('display_name', repeat('a', 300))::jsonb);
insert into auth.users (id, email, raw_user_meta_data)
  values (tests.id('blank'), 'blank@example.test', '{"display_name": "   "}');
reset role;

select is((select count(*) from public.profiles
           where id in (tests.id('plain'), tests.id('named'), tests.id('google'), tests.id('long'), tests.id('blank'))),
  5::bigint, 'every new user has a profile');
select is((select visibility from public.profiles where id = tests.id('plain')), 'private',
  'a new profile is private');
select is((select is_demo from public.profiles where id = tests.id('plain')), false,
  'a new profile is not a demo member');
select is((select display_name from public.profiles where id = tests.id('plain')), null,
  'no display name without one from the form');
select is((select display_name from public.profiles where id = tests.id('named')), 'Synthetic Member',
  'the form''s display name is kept, trimmed');
select is((select display_name from public.profiles where id = tests.id('google')), null,
  'a Google sign-up starts with no display name');
select is((select char_length(display_name) from public.profiles where id = tests.id('long')), 40,
  'an over-long name is cut to 40 and the sign-up goes through');
select is((select display_name from public.profiles where id = tests.id('blank')), null,
  'a blank name is stored as none');
select is(
  (select count(*) from pg_trigger
   where tgrelid = 'auth.users'::regclass and tgname = 'on_auth_user_created' and not tgisinternal),
  1::bigint, 'the trigger is on auth.users');

select * from finish();
rollback;
