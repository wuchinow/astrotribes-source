// AA on the landing's Keys cards (1h): each card's credit sits on a small night-900 panel over its
// inked sky image, in both moods, at every wash step. Composited as the browser does: the window's
// night-900 ground, the image at its strength scaled by the wash, then the panel at `panel`. The
// fade mask only lowers the image, so ignoring it makes the check stricter. Every pixel of each
// served file is checked. The text below the window sits on the card's solid surface-200 (tested as
// token pairs in lib/tokens.ts), and no text touches a Tribe card's image.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';
import { WASH_STEPS } from '@/lib/appearance';
import { readTokens } from '@/lib/tokens';
import credits from '@/public/sky-images/credits.json';

type RGB = [number, number, number];
const TOKENS_CSS = readFileSync(path.join(process.cwd(), 'app/tokens.css'), 'utf8');
const cssVar = (name: string) => Number(new RegExp(`--${name}:\\s*([\\d.]+);`).exec(TOKENS_CSS)![1]);
const WASH_ART = cssVar('wash-art');
const PANEL = cssVar('panel');

const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const CARDS = ['keysSun', 'keysMoon', 'keysRising'] as const;
const pixels: Record<string, RGB[]> = {};

beforeAll(async () => {
  for (const id of CARDS) {
    const seen = new Map<number, RGB>();
    for (const file of Object.values(credits.images[id].files)) {
      const { data } = await sharp(path.join(process.cwd(), 'public', file.src)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 3) seen.set((data[i] << 16) | (data[i + 1] << 8) | data[i + 2], [data[i], data[i + 1], data[i + 2]]);
    }
    pixels[id] = [...seen.values()];
  }
}, 60_000);

describe("the Keys cards' credits over their sky images", () => {
  it.each(['paper', 'night'] as const)('%s: on-night-soft on the night panel holds 4.5:1 at every wash step', (theme) => {
    const t = readTokens()[theme];
    const ground = rgb(t['night-900']);
    const text = lum(rgb(t['on-night-soft']));
    for (const id of CARDS) {
      let worst = Infinity;
      for (const step of WASH_STEPS) {
        const alpha = credits.images[id].strength * (step / 100 / WASH_ART);
        for (const p of pixels[id]) {
          const c = p.map((v, i) => (ground[i] * (1 - alpha) + v * alpha) * (1 - PANEL) + ground[i] * PANEL) as RGB;
          worst = Math.min(worst, ratio(text, lum(c)));
        }
      }
      expect(worst, `${theme} ${id}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
