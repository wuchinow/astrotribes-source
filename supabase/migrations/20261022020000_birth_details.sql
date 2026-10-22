-- 0002 (2c): birth details at sign-in. Two columns and one trigger; no policy or grant is
-- widened. Once applied this file is never edited; a fix is a new migration.

-- 1. The other sign on a day a body changed sign, when the birth time is unknown (U12). The
--    member picks the Sun's and the Moon's sign, which goes in `sign`; the engine's other
--    candidate is kept here. Null on every other row.
alter table public.placements
  add column sign_alternate text check (sign_alternate in (
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces')),
  add constraint placements_alternate_differs check (sign_alternate is null or sign_alternate <> sign);

-- Members read it as they read `sign`: under placements_select_visible. Still no degree or minute.
grant select (sign_alternate) on public.placements to authenticated;

-- 2. When the birth details last changed (S11). The "tribe" visibility level depends on the
--    viewer's own Sun row, so a member who could change their birth date at will could visit
--    every Tribe in turn. One change an hour, held here rather than in the app, so no client and
--    no warm server instance can get round it.
alter table public.birth_data
  add column updated_at timestamptz not null default now();

create function private.birth_data_changed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if old.updated_at > now() - interval '1 hour' then
      -- A fixed message the app maps to a code. It never carries a value from the row.
      raise exception 'birth_data_too_soon' using errcode = 'P0001';
    end if;
    new.created_at := old.created_at;
  end if;
  -- Whatever the request sent, the clock is the database's.
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.birth_data_changed() from public, anon, authenticated, service_role;

create trigger birth_data_changed
  before insert or update on public.birth_data
  for each row execute function private.birth_data_changed();
