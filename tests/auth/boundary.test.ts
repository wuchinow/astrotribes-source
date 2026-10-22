import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isMemberPath } from '@/lib/preview';

// Invariant 4 for sign-in (2b): the secret key lives in one server-only file, which only the
// account's export and delete import, and no client component reaches a server-side client.
const root = process.cwd();
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
const sources = ['app', 'components', 'content', 'lib', 'proxy.ts'].flatMap((entry) =>
  entry.endsWith('.ts') ? [path.join(root, entry)] : walk(path.join(root, entry)),
);
const rel = (file: string) => path.relative(root, file);
const text = (file: string) => readFileSync(file, 'utf8');

describe('the Supabase clients', () => {
  it('marks the admin and server clients server-only', () => {
    for (const file of ['lib/supabase/admin.ts', 'lib/supabase/server.ts']) {
      expect(text(path.join(root, file)), file).toMatch(/^import 'server-only';$/m);
    }
  });

  it('names the secret key in the admin client only', () => {
    const named = sources.filter((file) => text(file).includes('SUPABASE_SECRET_KEY')).map(rel);
    expect(named).toEqual(['lib/supabase/admin.ts']);
  });

  it('lets only the export route, the account actions, and the birth details save import the admin client', () => {
    const importers = sources
      .filter((file) => /from ['"]@\/lib\/supabase\/admin['"]/.test(text(file)))
      .map(rel)
      .sort();
    expect(importers).toEqual([
      'app/(public)/account/actions.ts',
      'app/(public)/welcome/actions.ts',
      'app/api/account/export/route.ts',
    ]);
    for (const file of importers) {
      const url = `/${file.replace(/^app\//, '').replace(/\/(route|actions)\.ts$/, '').replace(/\([^)]+\)\//g, '')}`;
      expect(isMemberPath(url), url).toBe(true);
    }
  });

  it('keeps server-side clients out of client components', () => {
    const offenders = sources.filter(
      (file) => /^['"]use client['"]/m.test(text(file)) && /from ['"]@\/lib\/supabase\/(admin|server)['"]/.test(text(file)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('never exposes a secret through a NEXT_PUBLIC_ name', () => {
    const publicNames = sources.flatMap((file) => text(file).match(/NEXT_PUBLIC_[A-Z_]+/g) ?? []);
    expect(new Set(publicNames)).toEqual(new Set(['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']));
  });
});
