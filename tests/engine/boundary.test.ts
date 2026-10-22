import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isGatedPath } from '@/lib/preview';

// Invariant 4 and the AGPL boundary: the engine runs on the server only, and no client
// component imports it. lib/engine/index.ts imports 'server-only', so a client import also
// fails `next build`; this catches it earlier and names the file.
const root = process.cwd();
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });

describe('engine boundary', () => {
  it('marks the engine server-only', () => {
    const index = readFileSync(path.join(root, 'lib/engine/index.ts'), 'utf8');
    expect(index).toMatch(/^import 'server-only';$/m);
  });

  it('is imported by no client component', () => {
    const sources = ['app', 'components', 'content', 'lib'].flatMap((dir) => walk(path.join(root, dir)));
    const offenders = sources.filter((file) => {
      const text = readFileSync(file, 'utf8');
      return /^['"]use client['"]/m.test(text) && /from ['"](@\/lib\/engine|\.{1,2}\/.*engine)/.test(text);
    });
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });

  it('is imported only by routes behind the preview passcode (S4)', () => {
    const sources = ['app', 'components', 'content', 'lib'].flatMap((dir) => walk(path.join(root, dir)));
    const importers = sources
      .filter((file) => !file.startsWith(path.join(root, 'lib/engine')))
      .filter((file) => /from ['"]@\/lib\/engine['"]/.test(readFileSync(file, 'utf8')))
      .map((f) => path.relative(root, f));
    expect(importers).toEqual(['app/api/chart/route.ts']);
    // The route's URL, from its file path: app/api/chart/route.ts serves /api/chart.
    for (const file of importers) {
      const url = `/${file.replace(/^app\//, '').replace(/\/route\.ts$/, '').replace(/\([^)]+\)\//g, '')}`;
      expect(isGatedPath(url), url).toBe(true);
    }
  });

  it('never reaches the public share page', () => {
    const share = walk(path.join(root, 'app/(public)/share'));
    expect(share.length).toBeGreaterThan(0);
    for (const file of share) {
      expect(readFileSync(file, 'utf8'), path.relative(root, file)).not.toMatch(/lib\/engine|sweph/);
    }
  });

  it('keeps sweph inside the adapter', () => {
    const sources = ['app', 'components', 'content', 'lib'].flatMap((dir) => walk(path.join(root, dir)));
    const importers = sources.filter((file) => /from ['"]sweph['"]/.test(readFileSync(file, 'utf8')));
    expect(importers.map((f) => path.relative(root, f))).toEqual(['lib/engine/swisseph.ts']);
  });
});
