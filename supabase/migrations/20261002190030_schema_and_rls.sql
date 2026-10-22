-- 0001: profiles, birth_data, placements, member_counts. RLS on every table, explicit grants.
-- Invariants 1, 2, 3, and 7 (CLAUDE.md). Key names are never stored: placements hold the
-- engine's body and sign ids (BODY_IDS and SIGN_IDS in lib/keys.ts), and the app maps them
-- to Keys. tests/schema.test.ts holds the two lists to lib/keys.ts.
-- Once applied this file is never edited; a fix is a new migration.

-- 1. A schema the Data API does not serve, for the functions the policies call.
create schema private;
revoke all on schema private from public, anon, authenticated, service_role;

-- 2. New tables, sequences, and functions in public start with no API access. This project's
--    defaults grant everything to anon, authenticated, and service_role, for objects made by
--    postgres and by supabase_admin, so both are revoked. postgres is not a member of
--    supabase_admin on a hosted project and may be refused the second; the tables below are
--    revoked one by one as well, so nothing here depends on it, and the notice says which ran.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated, service_role;

do $$
begin
  alter default privileges for role supabase_admin in schema public
    revoke all on tables from anon, authenticated, service_role;
  alter default privileges for role supabase_admin in schema public
    revoke all on sequences from anon, authenticated, service_role;
  alter default privileges for role supabase_admin in schema public
    revoke all on functions from anon, authenticated, service_role;
  raise notice '0001: default privileges revoked for supabase_admin in public';
exception
  when insufficient_privilege then
    raise notice '0001: default privileges for supabase_admin in public left as they were (not permitted to this role)';
end;
$$;

-- 3. Tables.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Chosen on our own sign-up form, never copied from Google. Null until the member picks one.
  display_name text
    constraint profiles_display_name_length check (char_length(display_name) between 1 and 40),
  -- Text with a check, not an enum: a change to the levels (open decision 10) swaps this
  -- constraint and the body of private.can_view_member, with no table rewrite.
  visibility text not null default 'private'
    constraint profiles_visibility_check check (visibility in ('private', 'tribe', 'everyone')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.birth_data (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  birth_date date not null,
  -- Null exactly when time_known is false (open decision 11).
  birth_time time,
  time_known boolean not null,
  place_label text not null check (char_length(place_label) between 1 and 200),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  timezone text not null check (char_length(timezone) between 1 and 64),
  created_at timestamptz not null default now(),
  constraint birth_data_time_matches_flag check (time_known = (birth_time is not null))
);

-- One row per body per member, as the engine computes it (lib/engine/types.ts, Placement).
-- With no birth time there is no rising row and every house is null. How an uncertain sign is
-- stored (a body that changes sign on the birth date) waits for 2c.
create table public.placements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (body in (
    'sun', 'moon', 'rising', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus',
    'neptune', 'pluto', 'northNode', 'southNode', 'chiron', 'galacticCenter')),
  sign text not null check (sign in (
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces')),
  house smallint check (house between 1 and 12),
  degree smallint not null check (degree between 0 and 29),
  minute smallint not null check (minute between 0 and 59),
  retrograde boolean not null default false,
  engine_version text not null check (char_length(engine_version) between 1 and 64),
  computed_at timestamptz not null default now(),
  primary key (user_id, body),
  constraint placements_rising_has_no_house check (body <> 'rising' or house is null)
);
create index placements_body_sign_idx on public.placements (body, sign);

revoke all on public.profiles, public.birth_data, public.placements
  from public, anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.birth_data enable row level security;
alter table public.placements enable row level security;

-- 4. Who may see a member's profile and placements. One function, returning only yes or no,
--    so a change to the levels is a change to this body and nothing else.
--    private: the owner only. tribe: signed-in members with the same Sun sign.
--    everyone: any signed-in member.
--    It fails closed: no session, no profile row, a viewer with no Sun row, or an owner with
--    none, is a no.
create function private.can_view_member(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (select auth.uid()) is null then false
    when owner = (select auth.uid()) then true
    else coalesce((
      select p.visibility = 'everyone'
          or (p.visibility = 'tribe' and exists (
               select 1
               from public.placements theirs
               join public.placements mine
                 on mine.body = 'sun' and mine.sign = theirs.sign
               where theirs.user_id = owner
                 and theirs.body = 'sun'
                 and mine.user_id = (select auth.uid())))
      from public.profiles p
      where p.id = owner), false)
  end;
$$;
revoke all on function private.can_view_member(uuid) from public, anon, authenticated, service_role;
grant execute on function private.can_view_member(uuid) to authenticated;

-- 5. Policies. Every one names its role; none is USING (true); anon has none.
create policy profiles_select_visible on public.profiles
  for select to authenticated
  using (private.can_view_member(id));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy birth_data_select_own on public.birth_data
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy birth_data_insert_own on public.birth_data
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy birth_data_update_own on public.birth_data
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy placements_select_visible on public.placements
  for select to authenticated
  using (private.can_view_member(user_id));

-- 6. Grants: only what the app needs. Nothing to anon.
grant select on public.profiles to authenticated;
grant update (display_name, visibility) on public.profiles to authenticated;
grant select, insert, update on public.birth_data to authenticated;
-- No member reads a degree through the API, their own included: a Sun degree is a birthday.
-- The owner's own degrees come from the server.
grant select (user_id, body, sign, house, retrograde, engine_version, computed_at)
  on public.placements to authenticated;
-- Placements are written by the server only, after it runs the engine, for the member id it
-- reads from the verified session. The tribe level depends on the viewer's own Sun row, so
-- that row is not self-writable.
grant select, insert, update, delete on public.placements to service_role;
-- service_role has no grant on birth_data or profiles: no admin path in 2a (invariant 2).

-- 7. A profile row for every new user. The display name comes only from the sign-up form's
--    own field, trimmed and cut to 40 characters, so a sign-up cannot fail here.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(btrim(left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40)), '')
  );
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- 8. Counts per sign for the Sun, the Moon, and the rising sign: numbers only, never rows.
--    Every member counts, whatever their visibility. Signed-in members only for now.
create function private.member_counts()
returns table (body text, sign text, members bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.body, p.sign, count(*)
  from public.placements p
  where p.body in ('sun', 'moon', 'rising')
  group by p.body, p.sign;
$$;
revoke all on function private.member_counts() from public, anon, authenticated, service_role;
grant execute on function private.member_counts() to authenticated;

create view public.member_counts
  with (security_invoker = true) as
  select body, sign, members from private.member_counts();
revoke all on public.member_counts from public, anon, authenticated, service_role;
grant select on public.member_counts to authenticated;
