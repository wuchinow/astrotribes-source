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

  it('grants nothing to anon', () => {
    const grants = [...migrations.matchAll(/^\s*grant\b[^;]+;/gim)].map((m) => m[0]);
    expect(grants.length).toBeGreaterThan(0);
    for (const grant of grants) expect(grant, grant.trim()).not.toMatch(/\banon\b/);
  });

  it('keeps every security definer function out of the served schema, with a fixed search path', () => {
    // A header ends at its quoted body ($$) or at a standard SQL body (0003's `return`).
    const functions = [...migrations.matchAll(/create (?:or replace )?function (\w+)\.(\w+)[\s\S]*?(?:\$\$|\breturn\b)/g)];
    expect(functions.length).toBeGreaterThan(0);
    for (const [header, schema, name] of functions) {
      if (!/security definer/.test(header)) continue;
      expect(schema, name).toBe('private');
      expect(header, name).toContain("set search_path = ''");
    }
  });

  it('serves one function, the admin door, as security invoker over a check in private (0003)', () => {
    const served = [...migrations.matchAll(/create (?:or replace )?function public\.(\w+)/g)].map((m) => m[1]);
    expect(served).toEqual(['admin_members']);
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
