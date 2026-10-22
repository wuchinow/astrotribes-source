// The inked sky (1c, design system v21; the Keys cards and the ring's lift in 1h): files, credits, strength, and inking.

import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import credits from '@/public/sky-images/credits.json';
import { INK_STOPS, SKY, skyCredit } from '@/lib/sky';
import { readTokens } from '@/lib/tokens';

const tokens = readTokens();

type SkyId = keyof typeof SKY;
const IDS = Object.keys(SKY) as SkyId[];
const files = (id: SkyId) => Object.values(credits.images[id].files) as { src: string; width: number }[];

describe('the sky images', () => {
  it("ship the Oracle's ring and the three Keys cards' images, credited as released, no \"(tinted)\" since none asks", () => {
    expect(IDS).toEqual(['ring', 'keysSun', 'keysMoon', 'keysRising']);
    expect(credits.images.ring.credit).toBe('The Hubble Heritage Team (AURA/STScI/NASA)');
    expect(credits.images.keysMoon.credit).toBe(credits.images.ring.credit);
    expect(credits.images.keysSun.credit).toBe('NASA/JPL-Caltech/S. Stolovy (Spitzer Science Center/Caltech)');
    expect(credits.images.keysRising.credit).toBe('NASA, ESA, Hubble 20th Anniversary Team, Mario Livio (STScI)');
    for (const id of IDS) {
      expect(skyCredit(SKY[id])).toBe(credits.images[id].credit);
      expect(credits.images[id].tinted, id).toBe(false);
      expect(credits.images[id].release, id).toMatch(/^https:\/\/(science\.nasa\.gov|www\.spitzer\.caltech\.edu)\//);
      expect(credits.images[id].license, id).toMatch(/not copyrighted/);
    }
  });

  it('carry the strength the manifest gives them (1h: the ring lifted to 0.6, the Keys cards at 0.8)', () => {
    expect(credits.images.ring.strength).toBe(0.6);
    for (const id of ['keysSun', 'keysMoon', 'keysRising'] as const) expect(credits.images[id].strength).toBe(0.8);
  });

  it('crop inside the source and serve WebP files under 250 KB (the Keys cards under 30 KB each)', () => {
    for (const id of IDS) {
      const [x, y, w, h] = SKY[id].crop;
      expect(x + w, id).toBeLessThanOrEqual(SKY[id].size[0]);
      expect(y + h, id).toBeLessThanOrEqual(SKY[id].size[1]);
      for (const file of files(id)) {
        expect(file.src).toMatch(new RegExp(`^/sky-images/${SKY[id].stem}/${SKY[id].stem}-\\d+\\.[0-9a-f]{8}\\.webp$`));
        const bytes = statSync(path.join(process.cwd(), 'public', file.src)).size;
        expect(bytes, file.src).toBeLessThan(id === 'ring' ? 250_000 : 30_000);
      }
    }
  });

  it('are inked through night-900 (Night), the mid navy, and paper', () => {
    for (const id of IDS) {
      expect(credits.images[id].ramp, id).toEqual([tokens.night['night-900'].toLowerCase(), INK_STOPS.mid, INK_STOPS.light]);
    }
  });

  it("black in the ring is the night band's own color, so the edge never shows", async () => {
    const src = path.join(process.cwd(), 'public', credits.images.ring.files['1100'].src);
    const { data } = await sharp(readFileSync(src)).extract({ left: 0, top: 0, width: 8, height: 8 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const night = [1, 3, 5].map((i) => parseInt(tokens.night['night-900'].slice(i, i + 2), 16));
    for (let i = 0; i < data.length; i += 3) {
      for (let c = 0; c < 3; c++) expect(Math.abs(data[i + c] - night[c])).toBeLessThanOrEqual(4);
    }
  });

  it('are never served under /sky, which the preview passcode gates', () => {
    const proxy = readFileSync(path.join(process.cwd(), 'proxy.ts'), 'utf8');
    expect(proxy).toMatch(/'\/sky\/:path\*'/);
    for (const id of IDS) for (const file of files(id)) expect(file.src.startsWith('/sky/')).toBe(false);
  });
});
