-- Helpers for the tests that follow, in a schema of their own on the local database only.
-- They are never part of a migration. The tests connect as the local stack's superuser
-- (`npm run test:db`), because two of them act as supabase_auth_admin, the role the auth server
-- uses, and only a superuser may take that role. "reset role" in a test returns to it. Every user they make is synthetic (invariant 8): a random
-- id, an @example.test address, birth details drawn from random(), flagged is_demo, and made
-- inside a test's transaction, which is rolled back.
create extension if not exists pgtap with schema extensions;

drop schema if exists tests cascade;
create schema tests;
grant usage on schema tests to anon, authenticated, service_role, supabase_auth_admin;

-- A new auth user, remembered under a label for the rest of the transaction.
create function tests.new_user(label text, meta jsonb default '{}'::jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (uid, label || '-' || uid || '@example.test', meta);
  update public.profiles set is_demo = true where id = uid;
  perform set_config('tests.' || label, uid::text, true);
  return uid;
end;
$$;

create function tests.id(label text)
returns uuid
language sql
stable
set search_path = ''
as $$ select current_setting('tests.' || label)::uuid $$;

-- Moves a labelled user's last change of birth details two hours back, past 0002's one change
-- an hour, so a test can update the row. Triggers are off for this one statement only, which
-- needs the superuser the tests connect as.
create function tests.backdate_birth_data(label text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  set local session_replication_role = replica;
  update public.birth_data set updated_at = now() - interval '2 hours' where user_id = tests.id(label);
  set local session_replication_role = origin;
end;
$$;

-- Random birth details for a labelled user, last changed two hours ago.
create function tests.give_birth_data(label text)
returns void
language sql
set search_path = ''
as $$
  insert into public.birth_data
    (user_id, birth_date, birth_time, time_known, place_label, latitude, longitude, timezone)
  values (
    tests.id(label),
    date '1960-01-01' + floor(random() * 16800)::int,
    make_time(floor(random() * 24)::int, floor(random() * 60)::int, 0),
    true,
    'Synthetic place',
    random() * 120 - 60,
    random() * 360 - 180,
    'Etc/UTC');
  select tests.backdate_birth_data(label);
$$;

-- A full chart for a labelled user: the Sun in the sign given, everything else at random.
create function tests.give_chart(label text, sun text)
returns void
language sql
set search_path = ''
as $$
  insert into public.placements (user_id, body, sign, house, degree, minute, retrograde, engine_version)
  select
    tests.id(label),
    b,
    case when b = 'sun' then sun
         else (array['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio',
                     'sagittarius', 'capricorn', 'aquarius', 'pisces'])[1 + floor(random() * 12)::int]
    end,
    case when b = 'rising' then null else 1 + floor(random() * 12)::int end,
    floor(random() * 30)::int,
    floor(random() * 60)::int,
    false,
    'test-engine@0'
  from unnest(array['sun', 'moon', 'rising', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
                    'uranus', 'neptune', 'pluto', 'northNode', 'southNode', 'chiron',
                    'galacticCenter']) as b;
$$;

-- Become a signed-in member, the way the Data API does it: the role, and the session's claims.
create function tests.be(label text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', tests.id(label), 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

-- Become a visitor with no session.
create function tests.be_anon()
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'anon', true);
end;
$$;

select plan(1);
select has_schema('tests', 'the test helpers are installed');
select * from finish();
