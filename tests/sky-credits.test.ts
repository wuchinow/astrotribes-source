// Telescope credits live in the footer (David, Nov 4, like the art): SKY_PAGES in lib/sky.ts says which
// page shows which image, and the footer reads it by path. This holds the map to the pages' own code,
// so a sky image added to a page without its entry fails here, and checks that no picture carries a
// caption of its own any more.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLANET_PAGES, planetHref } from '@/content/planets';
import { SIGN_IDS } from '@/lib/keys';
import skyFiles from '@/public/sky-images/credits.json';
import { SKY_PAGES } from '@/lib/sky';
import { FLAMMARION } from '@/lib/flammarion';
import { footerCredits } from '@/lib/sky-credits';

const PAGE_FILES: Record<string, string> = {
  '/': 'app/(public)/page.tsx',
  '/sky': 'app/(public)/sky/page.tsx',
  '/keys': 'app/(public)/keys/page.tsx',
  '/your-chart': 'app/(public)/your-chart/page.tsx',
};

const skyIdsIn = (file: string) =>
  [...readFileSync(file, 'utf8').matchAll(/\bsky(?:=|:\s*)["'](\w+)["']/g)].map((m) => m[1]);

describe('telescope credits in the footer', () => {
  it('list every page with a sky image, and only its images', () => {
    for (const [path, file] of Object.entries(PAGE_FILES)) {
      expect([...(SKY_PAGES[path] ?? [])].sort(), path).toEqual(skyIdsIn(file).sort());
    }
    // Chiron and the Nodes have no NASA photo of their own, so no picture and no credit (Nov 6).
    const pictured = PLANET_PAGES.filter((planet) => planet.sky);
    for (const planet of pictured) expect(SKY_PAGES[planetHref(planet)]).toEqual([planet.sky]);
    for (const planet of PLANET_PAGES.filter((p) => !p.sky)) expect(SKY_PAGES[planetHref(planet)]).toBeUndefined();
    // The Clan and Vibe pages (4l): each kind shows the same photos on all twelve, named in its page
    // file; since 4m the Clan pages' famous Moons stand on the galactic center, and the Tribe pages'
    // "Your people" on Andromeda.
    expect(skyIdsIn('app/(public)/clans/[sign]/page.tsx')).toEqual(['clanMoon', 'keysCenter']);
    expect(skyIdsIn('app/(public)/vibes/[sign]/page.tsx')).toEqual(['vibeRising']);
    expect(skyIdsIn('app/(public)/tribes/[sign]/page.tsx')).toEqual(['andromeda']);
    for (const sign of SIGN_IDS) {
      expect(SKY_PAGES[`/clans/${sign}`]).toEqual(['clanMoon', 'keysCenter']);
      expect(SKY_PAGES[`/vibes/${sign}`]).toEqual(['vibeRising']);
      expect(SKY_PAGES[`/tribes/${sign}`]).toEqual(['andromeda']);
    }
    const kin = SIGN_IDS.flatMap((sign) => [`/clans/${sign}`, `/vibes/${sign}`, `/tribes/${sign}`]);
    expect(Object.keys(SKY_PAGES).sort()).toEqual([...Object.keys(PAGE_FILES), ...pictured.map(planetHref), ...kin].sort());
  });

  it('say NASA only, the same on every page, with every full credit kept in the manifest (David, Nov 4 and 9)', () => {
    expect(footerCredits.space).toBe('Space photos: NASA.');
    for (const ids of Object.values(SKY_PAGES)) {
      for (const id of ids) {
        expect(skyFiles.images[id].credit, id).toMatch(/NASA/);
        expect(skyFiles.images[id].license, id).toMatch(/not copyrighted/);
      }
    }
  });

  it('credit the Flammarion engraving in the footer, not under the picture', () => {
    expect(footerCredits.publicDomain).toContain(FLAMMARION.credit.replace('The Flammarion engraving, ', ''));
    const landing = readFileSync('app/(public)/page.tsx', 'utf8');
    expect(landing).not.toMatch(/figcaption|FLAMMARION\.credit/);
  });

  it('leave no caption under a picture', () => {
    for (const file of ['components/SkyWindow.tsx', 'components/TintPanel.tsx', 'components/KeysCard.tsx', 'components/Backdrop.tsx']) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/\.credit\b/);
    }
  });
});
