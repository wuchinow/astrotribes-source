// AA on the Oracle's stage (1c): the reading panel over P6 on Paper (and on Night, where a visitor
// can pick it), and over the inked Ring Nebula on Night.
//
// P6: every pixel of both served cuts, at every wash step, as the browser composites them: the
// hero ground, P6 at the wash (0.6 of it on Night), then the frosted surface-000 panel. The clearing
// behind the characters only removes P6, so full P6 everywhere is the strict case.
//
// The ring: the reading panel and the credit's small panel, over
// every pixel of each served file, at the strongest the ring gets (its manifest strength at the default 30% wash)
// and at every weaker step, composited as the browser does: the night-900 stage, the ring at its
// opacity, then the frosted surface-000 panel. The mask and the blur only lower the ring's
// contrast, so ignoring them makes the check stricter. (P6 on Paper is covered by
// tests/art-contrast.test.ts: the panel over a page wash, every wash.)

import { readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';
import { WASH_STEPS } from '@/lib/appearance';
import { readTokens } from '@/lib/tokens';
import { cutFiles } from '@/lib/art-assets';
import credits from '@/public/sky-images/credits.json';

type RGB = [number, number, number];
const night = readTokens().night;
const TOKENS_CSS = readFileSync(path.join(process.cwd(), 'app/tokens.css'), 'utf8');
const cssVar = (name: string) => Number(new RegExp(`--${name}:\\s*([\\d.]+);`).exec(TOKENS_CSS)![1]);
// The ring's own strength from the manifest (1h), not wash-sky.
const RING_STRENGTH = credits.images.ring.strength;
const WASH_ART = cssVar('wash-art');
const PANEL = cssVar('panel');


const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

async function colors(src: string): Promise<RGB[]> {
  const { data } = await sharp(path.join(process.cwd(), 'public', src)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const seen = new Map<number, RGB>();
  for (let i = 0; i < data.length; i += 3) seen.set((data[i] << 16) | (data[i + 1] << 8) | data[i + 2], [data[i], data[i + 1], data[i + 2]]);
  return [...seen.values()];
}

const pixels: RGB[][] = [];
const p6: RGB[][] = [];
beforeAll(async () => {
  for (const file of Object.values(credits.images.ring.files)) pixels.push(await colors(file.src));
  for (const cut of ['crop', 'wide']) {
    const entry = cutFiles('p6', cut);
    const widest = entry.files[Math.max(...Object.keys(entry.files).map(Number))];
    for (const format of ['avif', 'webp'] as const) p6.push(await colors(widest[format].src));
  }
}, 60_000);

const WASH_NIGHT = cssVar('wash-night');
const lowest: string[] = [];

describe('text on the reading panel over P6', () => {
  it.each(['paper', 'night'] as const)('%s: every text color at every wash step', (theme) => {
    const t = readTokens()[theme];
    const ground = rgb(t['surface-hero']);
    const panel = rgb(t['surface-000']);
    const checks = [['ink-900', 4.5], ['ink-700', 4.5], ['ink-500', 4.5], ['highlight', 4.5], ['cobalt-600', 4.5], ['ember-500', 4.5], ['cobalt-400', 3]] as const;
    for (const [color, min] of checks) {
      const l = lum(rgb(t[color]));
      let worst = Infinity;
      for (const step of WASH_STEPS) {
        const alpha = (step / 100) * (theme === 'night' ? WASH_NIGHT : 1);
        for (const set of p6) {
          for (const p of set) {
            const c = p.map((v, i) => (ground[i] * (1 - alpha) + v * alpha) * (1 - PANEL) + panel[i] * PANEL) as RGB;
            worst = Math.min(worst, ratio(l, lum(c)));
          }
        }
      }
      lowest.push(`${theme} ${color} ${worst.toFixed(2)}:1`);
      expect(worst, `${theme} ${color}`).toBeGreaterThanOrEqual(min);
    }
    if (process.env.ART_CONTRAST_REPORT) console.log(lowest.join('\n'));
  });
});

function range(alpha: number) {
  const ground = rgb(night['night-900']);
  const panel = rgb(night['surface-000']);
  let min = Infinity;
  let max = -Infinity;
  for (const set of pixels) {
    for (const p of set) {
      const c = p.map((v, i) => (ground[i] * (1 - alpha) + v * alpha) * (1 - PANEL) + panel[i] * PANEL) as RGB;
      const l = lum(c);
      if (l < min) min = l;
      if (l > max) max = l;
    }
  }
  return { min, max };
}

describe('text on the panels over the inked ring (Night)', () => {
  it.each([
    ['ink-900', 4.5], ['ink-700', 4.5], ['ink-500', 4.5], ['highlight', 4.5], ['cobalt-600', 4.5],
    ['ember-500', 4.5], ['cobalt-400', 3],
  ] as const)('%s holds %s:1 at every wash step', (color, min) => {
    const l = lum(rgb(night[color]));
    for (const step of WASH_STEPS) {
      const r = range(RING_STRENGTH * (step / 100 / WASH_ART));
      const worst = Math.min(ratio(l, r.min), ratio(l, r.max));
      expect(worst, `${color} at ${step}%`).toBeGreaterThanOrEqual(min);
    }
  });
});
