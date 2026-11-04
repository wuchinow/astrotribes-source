-- 0004: is the signed-in member an admin (Nov 4, David: "an admin link from my dropdown since i
-- have privileges"). The account menu asks it once per page to decide whether to show the Admin
-- link. It answers yes or no and nothing else: no list, no names, no audit row (opening a menu is
-- not a look at the members page, which 0003 still records). The admin page keeps its own check.
-- Nothing a member can see or do changes, and the secret key gains nothing. Once applied this file
-- is never edited; a fix is a new migration.

-- 1. The check. Security definer so it can read private.admins, which no API role can; it reads
--    only the caller's own row, by the session's id, and returns a boolean (no session: false).
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from private.admins where user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public, anon, authenticated, service_role;
grant execute on function private.is_admin() to authenticated;

-- 2. The door the Data API serves, as in 0003: security invoker with a standard SQL body, parsed
--    once here, so a member needs only the execute grant. Visitors and the secret key cannot call it.
create function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
return private.is_admin();
revoke all on function public.is_admin() from public, anon, authenticated, service_role;
grant execute on function public.is_admin() to authenticated;
