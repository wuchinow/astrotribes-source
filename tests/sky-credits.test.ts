// Telescope credits live in the footer (David, Nov 4, like the art): SKY_PAGES in lib/sky.ts says which
// page shows which image, and the footer reads it by path. This holds the map to the pages' own code,
// so a sky image added to a page without its entry fails here, and checks that no picture carries a
// caption of its own any more.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLANET_PAGES, planetHref } from '@/content/planets';
import skyFiles from '@/public/sky-images/credits.json';
import { SKY_PAGES } from '@/lib/sky';
import { skyCreditLines } from '@/lib/sky-credits';

const PAGE_FILES: Record<string, string> = {
  '/': 'app/(public)/page.tsx',
  '/sky': 'app/(public)/sky/page.tsx',
  '/keys': 'app/(public)/keys/page.tsx',
};

const skyIdsIn = (file: string) =>
  [...readFileSync(file, 'utf8').matchAll(/\bsky(?:=|:\s*)["'](\w+)["']/g)].map((m) => m[1]);

describe('telescope credits in the footer', () => {
  it('list every page with a sky image, and only its images', () => {
    for (const [path, file] of Object.entries(PAGE_FILES)) {
      expect([...(SKY_PAGES[path] ?? [])].sort(), path).toEqual(skyIdsIn(file).sort());
    }
    for (const planet of PLANET_PAGES) expect(SKY_PAGES[planetHref(planet)]).toEqual([planet.sky]);
    expect(Object.keys(SKY_PAGES).sort()).toEqual(
      [...Object.keys(PAGE_FILES), ...PLANET_PAGES.map(planetHref)].sort(),
    );
  });

  it('give each page one line naming every image’s credit', () => {
    const lines = skyCreditLines();
    for (const [path, ids] of Object.entries(SKY_PAGES)) {
      for (const id of ids) expect(lines[path], path).toContain(skyFiles.images[id].credit);
      expect(lines[path]).not.toMatch(/[—!]|\.\.$/);
    }
  });

  it('leave no caption under a picture', () => {
    for (const file of ['components/SkyWindow.tsx', 'components/TintPanel.tsx', 'components/KeysCard.tsx']) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/\.credit\b/);
    }
  });
});
