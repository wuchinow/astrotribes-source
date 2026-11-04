-- 0003: the admin members page (Nov 4, David: "first just tracking users"). Invariant 2's
-- admin path: one security definer function that checks the caller is on the admin list, writes
-- an audit row, and returns only who joined and how far they got. No birth date, time, place,
-- coordinates, or degree ever leaves it. Nothing a member can see or do changes, and the secret
-- key gains nothing. Once applied this file is never edited; a fix is a new migration.

-- 1. Who may open the page. Kept in private, which the Data API does not serve. The first admin
--    is added in step 5; anyone after is added and removed by hand in the SQL Editor.
create table private.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

-- 2. The audit row: who opened the page, and when. Kept when an admin leaves, with no name.
create table private.admin_views (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  view text not null check (view in ('members')),
  viewed_at timestamptz not null default now()
);

-- RLS on, no policy and no grant: only the function below reads or writes them (invariant 1).
alter table private.admins enable row level security;
alter table private.admin_views enable row level security;
revoke all on private.admins, private.admin_views from public, anon, authenticated, service_role;
revoke all on sequence private.admin_views_id_seq from public, anon, authenticated, service_role;

-- 3. The page's one read. Refuses anyone not on the list (42501, the code for "not allowed"),
--    then writes the audit row, then reads. Demo accounts (invariant 8) are listed and flagged,
--    and left out of the numbers. "Finished" is a chosen name and saved birth details; the week-ago
--    figure dates it by when the birth details were first saved, since the name comes first.
create function private.admin_members()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  result jsonb;
begin
  if caller is null or not exists (select 1 from private.admins a where a.user_id = caller) then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  insert into private.admin_views (admin_id, view) values (caller, 'members');

  with people as (
    select
      u.id,
      u.email::text as email,
      p.display_name,
      coalesce(p.is_demo, false) as is_demo,
      -- The auth server sets created_at; the profile's own date stands in if it ever has not.
      coalesce(u.created_at, p.created_at) as joined,
      u.last_sign_in_at as last_sign_in,
      -- Only when the birth details were first saved. Never the details themselves.
      b.created_at as birth_saved
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.birth_data b on b.user_id = u.id
  )
  select jsonb_build_object(
    'stats', (
      select jsonb_build_object(
        'total', count(*),
        'total_week_ago', count(*) filter (where joined < now() - interval '7 days'),
        'joined_week', count(*) filter (where joined >= now() - interval '7 days'),
        'joined_week_before', count(*) filter (
          where joined >= now() - interval '14 days' and joined < now() - interval '7 days'),
        'finished', count(*) filter (where display_name is not null and birth_saved is not null),
        'finished_week_ago', count(*) filter (
          where display_name is not null and birth_saved < now() - interval '7 days'))
      from people
      where not is_demo),
    'demo', (select count(*) from people where is_demo),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', x.id,
        'email', x.email,
        'name', x.display_name,
        'joined', x.joined,
        'last_sign_in', x.last_sign_in,
        'birth_details', x.birth_saved is not null,
        'is_demo', x.is_demo) order by x.joined desc)
      from (select * from people order by joined desc limit 1000) x), '[]'::jsonb),
    'views', coalesce((
      select jsonb_agg(jsonb_build_object(
        'who', coalesce(p.display_name, u.email::text),
        'at', v.viewed_at) order by v.viewed_at desc)
      from (select * from private.admin_views order by viewed_at desc limit 50) v
      left join auth.users u on u.id = v.admin_id
      left join public.profiles p on p.id = v.admin_id), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;
revoke all on function private.admin_members() from public, anon, authenticated, service_role;
grant execute on function private.admin_members() to authenticated;

-- 4. The door the Data API serves. A security invoker function with a standard SQL body: it is
--    parsed once, here, so a member needs no right to the private schema to call it, only the
--    execute grant above, and the check inside does the rest. Anyone not on the list gets 42501
--    and nothing else. It is called with the member's own session, never the secret key.
create function public.admin_members()
returns jsonb
language sql
volatile
security invoker
set search_path = ''
return private.admin_members();
revoke all on function public.admin_members() from public, anon, authenticated, service_role;
grant execute on function public.admin_members() to authenticated;

-- 5. The first admin (David, Nov 4: "just me for now"), added here at his request so the push
--    does it. His sign-in address is already public as the Google sign-in support email. Anyone
--    after him is added and removed by hand in the SQL Editor. The notice says whether it found him.
do $$
declare
  added int;
begin
  insert into private.admins (user_id)
  select id from auth.users where email = 'wuchinow@gmail.com'
  on conflict do nothing;
  get diagnostics added = row_count;
  raise notice '0003: % admin added', added;
end;
$$;
