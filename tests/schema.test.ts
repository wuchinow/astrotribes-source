import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BODY_IDS, KEY_LIST, RETIRED_KEY_NAMES, SIGN_IDS } from '@/lib/keys';

// The schema, read as text, so these run in `npm run check` with no database. What the
// policies actually do is tested against a real Postgres in supabase/tests/database
// (`npm run test:db`, which needs Docker).
const root = process.cwd();
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith('.sql') ? [full] : [];
  });

const migrationFiles = walk(path.join(root, 'supabase/migrations'));
const sqlFiles = walk(path.join(root, 'supabase'));
const withoutComments = (sql: string) => sql.replace(/--.*$/gm, '');
const migrations = migrationFiles.map((file) => withoutComments(readFileSync(file, 'utf8'))).join('\n');

/** The quoted ids inside `<column> in ( ... )` on a table's column check. */
const checkList = (column: string): string[] => {
  const match = new RegExp(`\\b${column} text not null check \\(${column} in \\(([^)]+)\\)`).exec(migrations);
  return match ? [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
};

describe('the schema', () => {
  it('has migrations to read', () => {
    expect(migrationFiles.length).toBeGreaterThan(0);
  });

  it('stores exactly the body and sign ids of lib/keys.ts', () => {
    expect(checkList('body')).toEqual([...BODY_IDS]);
    expect(checkList('sign')).toEqual([...SIGN_IDS]);
  });

  it('enables RLS on every table it creates (invariant 1)', () => {
    const tables = [...migrations.matchAll(/create table (public\.\w+)/g)].map((m) => m[1]);
    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(migrations, table).toContain(`alter table ${table} enable row level security;`);
    }
  });

  it('has no policy that is simply true (invariant 1)', () => {
    expect(migrations).not.toMatch(/\b(using|with check)\s*\(\s*true\s*\)/i);
  });

  it('grants nothing to anon but the keepalive (0007)', () => {
    const grants = [...migrations.matchAll(/^\s*grant\b[^;]+;/gim)].map((m) => m[0].trim());
    expect(grants.length).toBeGreaterThan(0);
    const toAnon = grants.filter((grant) => /\banon\b/.test(grant));
    expect(toAnon).toEqual([
      'grant execute on function private.keepalive() to anon;',
      'grant execute on function public.keepalive() to anon;',
    ]);
  });

  it('lets the keepalive bump one private row and nothing else (0007)', () => {
    const door = /create function public\.keepalive\(\)[\s\S]*?return private\.keepalive\(\);/.exec(migrations)?.[0] ?? '';
    expect(door).toContain('returns boolean');
    expect(door).toContain('security invoker');
    expect(door).not.toContain('security definer');
    const ping = /create function private\.keepalive\(\)[\s\S]*?\$\$[\s\S]*?\$\$/.exec(migrations)?.[0] ?? '';
    expect(ping).toContain('security definer');
    expect(ping).toContain('update private.keepalive');
    // It names no other table.
    expect(ping).not.toMatch(/\b(public\.|auth\.|private\.(?!keepalive\b))/);
  });

  it('keeps every security definer function out of the served schema, with a fixed search path', () => {
    // A header ends at its quoted body ($$) or at a standard SQL body (0003's `return`, 0005's `begin atomic`).
    const functions = [...migrations.matchAll(/create (?:or replace )?function (\w+)\.(\w+)[\s\S]*?(?:\$\$|\breturn\b|\bbegin atomic\b)/g)];
    expect(functions.length).toBeGreaterThan(0);
    for (const [header, schema, name] of functions) {
      if (!/security definer/.test(header)) continue;
      expect(schema, name).toBe('private');
      expect(header, name).toContain("set search_path = ''");
    }
  });

  it('serves five functions, the admin door (0003), the admin yes or no (0004), close matches (0005), the keepalive (0007), and member animals (0008), each security invoker over a check in private', () => {
    const served = [...migrations.matchAll(/create (?:or replace )?function public\.(\w+)/g)].map((m) => m[1]);
    expect(served).toEqual(['admin_members', 'is_admin', 'close_matches', 'keepalive', 'member_animals']);
    const door = /create function public\.admin_members\(\)[\s\S]*?return private\.admin_members\(\);/.exec(migrations)?.[0] ?? '';
    expect(door).toContain('security invoker');
    expect(door).not.toContain('security definer');
    const check = /create function private\.admin_members\(\)[\s\S]*?\$\$[\s\S]*?\$\$/.exec(migrations)?.[0] ?? '';
    expect(check).toContain('security definer');
    // The admin list is checked, and the audit row written, before anything is read.
    const refuse = check.indexOf("raise exception 'admin_only'");
    const audit = check.indexOf('insert into private.admin_views');
    const read = check.indexOf('from auth.users');
    expect(refuse).toBeGreaterThan(0);
    expect(audit).toBeGreaterThan(refuse);
    expect(read).toBeGreaterThan(audit);
    // Only whether birth details exist leaves it, never a column of them (invariant 2).
    for (const column of ['birth_date', 'birth_time', 'place_label', 'latitude', 'longitude', 'timezone', 'degree', 'minute']) {
      expect(check, column).not.toMatch(new RegExp(`\\b${column}\\b`));
    }
  });

  it('tells a member which placements sit close, only for members they may see, never a degree (0005)', () => {
    const door = /create function public\.close_matches\(others uuid\[\]\)[\s\S]*?end;/.exec(migrations)?.[0] ?? '';
    expect(door).toContain('security invoker');
    expect(door).not.toContain('security definer');
    expect(door).toContain('from private.close_matches(others)');
    const work = /create function private\.close_matches\(others uuid\[\]\)[\s\S]*?\$\$[\s\S]*?\$\$/.exec(migrations)?.[0] ?? '';
    expect(work).toContain('security definer');
    expect(work).toContain('returns table (member uuid, mine text, theirs text, kind text)');
    // Every other member passes the same visibility check the policies use, and never the viewer.
    expect(work).toContain('private.can_view_member(o)');
    expect(work).toContain('o <> viewer.id');
    // It writes nothing.
    expect(work).not.toMatch(/\b(insert|update|delete)\b/i);
    for (const grant of [door, work]) expect(grant).not.toMatch(/grant execute[^;]*\b(anon|service_role)\b/);
    expect(migrations).toMatch(/grant execute on function public\.close_matches\(uuid\[\]\) to authenticated;/);
    expect(migrations).not.toMatch(/grant execute on function (public|private)\.close_matches\(uuid\[\]\) to [^;]*\b(anon|service_role)\b/);
  });

  it('tells a member only the Chinese animal of members they may see, never a date, with the app’s Lunar New Year dates (0008)', () => {
    const door = /create function public\.member_animals\(others uuid\[\]\)[\s\S]*?end;/.exec(migrations)?.[0] ?? '';
    expect(door).toContain('security invoker');
    expect(door).not.toContain('security definer');
    expect(door).toContain('from private.member_animals(others)');
    const work = /create function private\.member_animals\(others uuid\[\]\)[\s\S]*?\$\$[\s\S]*?\$\$/.exec(migrations)?.[0] ?? '';
    expect(work).toContain('security definer');
    expect(work).toContain('returns table (member uuid, animal text)');
    expect(work).toContain('private.can_view_member(o)');
    expect(work).toContain('o <> viewer.id');
    expect(work).not.toMatch(/\b(insert|update|delete)\b/i);
    // Only the animal leaves: the select at the end names no birth column.
    const last = work.slice(work.lastIndexOf('select'));
    for (const column of ['birth_date', 'birth_time', 'place_label', 'latitude', 'longitude', 'timezone']) {
      expect(last, column).not.toMatch(new RegExp(`\\b${column}\\b`));
    }
    // The same 201 Lunar New Year dates as lib/chinese-zodiac.ts.
    const app = /const LUNAR_NEW_YEAR = `([\s\S]*?)`/.exec(readFileSync('lib/chinese-zodiac.ts', 'utf8'))![1].trim().split(/\s+/);
    const sql = [...work.matchAll(/'(\d{4})'/g)].map((m) => m[1]);
    expect(sql).toEqual(app);
    expect(migrations).toMatch(/grant execute on function public\.member_animals\(uuid\[\]\) to authenticated;/);
    expect(migrations).not.toMatch(/grant execute on function (public|private)\.member_animals\(uuid\[\]\) to [^;]*\b(anon|service_role)\b/);
  });

  it('answers only yes or no to the menu, about the caller only, and writes nothing (0004)', () => {
    const door = /create function public\.is_admin\(\)[\s\S]*?return private\.is_admin\(\);/.exec(migrations)?.[0] ?? '';
    expect(door).toContain('returns boolean');
    expect(door).toContain('security invoker');
    expect(door).not.toContain('security definer');
    const check = /create function private\.is_admin\(\)[\s\S]*?\$\$[\s\S]*?\$\$/.exec(migrations)?.[0] ?? '';
    expect(check).toContain('returns boolean');
    expect(check).toContain('security definer');
    expect(check).toContain('stable');
    expect(check).toContain('auth.uid()');
    expect(check).not.toMatch(/\binsert\b|\bupdate\b|\bdelete\b/);
  });

  it('never stores a key name: no .sql file under supabase/ types one', () => {
    // Tribe is the brand noun, and "tribe" is a visibility level; every other name is checked.
    const names = [...KEY_LIST.map((k) => k.name), ...RETIRED_KEY_NAMES].filter((name) => name !== 'Tribe');
    for (const file of sqlFiles) {
      const text = readFileSync(file, 'utf8');
      for (const name of names) {
        expect(new RegExp(`\\b${name}\\b`).test(text), `${path.relative(root, file)}: ${name}`).toBe(false);
      }
    }
  });
});
