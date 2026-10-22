// AA over Jane's washes, across the whole wash range, in both moods (U10 and U11, made repeatable).
//
// For every wash piece and every cut the site serves, the served file's pixels are composited the
// way the browser does, in sRGB, at a normal blend in both moods (v3.4 retired the Night multiply):
// the region's ground (surface-hero under a hero, the page or the band under a section), the art at
// the wash strength times the mood's factor (0.6 on Night) times the region's (0.5 behind a section;
// a texture is 0.2 of the wash in both moods), then what the text sits on (the hero-top fade for the
// nav; the frosted panel or pin over a hero; nothing over a texture, which is ground). The darkest
// and lightest results bound every background a text color can meet, and each color must hold its
// minimum against both. The blur is ignored and the fade counts only for the nav, which only makes
// the check stricter. Set ART_CONTRAST_REPORT=1 to print the lowest ratios.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';
import { WASHES, type WashId } from '@/lib/art';
import { cutFiles } from '@/lib/art-assets';
import { WASH_STEPS } from '@/lib/appearance';
import { readTokens, type Theme } from '@/lib/tokens';

type RGB = readonly [number, number, number];

const tokens = readTokens();
const css = (name: string, theme: Theme) => tokens[theme][name];
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as RGB;
const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// The factors and opacities, read from the token layer so the test follows any change there.
const TOKENS_CSS = readFileSync(path.join(process.cwd(), 'app/tokens.css'), 'utf8');
const cssVar = (name: string) => Number(new RegExp(`--${name}:\\s*([\\d.]+);`).exec(TOKENS_CSS)![1]);
const WASH_NIGHT = cssVar('wash-night');
const WASH_SECTION = cssVar('wash-section');
const WASH_TEXTURE = cssVar('wash-texture');
const PANEL = cssVar('panel');
const PIN = 0.82; // .pin-frost in app/globals.css
// The hero-top fade (85% surface-100 to transparent over 182px), taken at the lower edge of the
// tallest thing in the nav row: the 148px lockup, 72px tall, from y 32 to 104 (1h).
const NAV_FADE = 0.85 * (1 - 104 / 182);

interface Layer {
  color: string;
  alpha: number;
}
interface Stack {
  name: string;
  /** page: a hero wash; section: a wash behind a section; texture: ground behind a section. */
  kind: 'page' | 'section' | 'texture';
  /** The color under the art. */
  ground: string;
  over: Layer[];
  /** [token, minimum ratio] */
  colors: Array<[string, number]>;
}

const STACKS: Stack[] = [
  {
    name: 'nav over the hero fade',
    kind: 'page',
    ground: 'surface-hero',
    over: [{ color: 'surface-hero', alpha: NAV_FADE }],
    // The focus ring is not here: its surface-000 halo (app/globals.css) means it always meets that
    // solid color (the cobalt-400 on surface-000 pair in lib/tokens.ts), never the art.
    colors: [['ink-900', 4.5], ['cobalt-600', 4.5], ['ink-700', 3], ['logo', 3]],
  },
  {
    name: 'frosted panel over a page wash',
    kind: 'page',
    ground: 'surface-hero',
    over: [{ color: 'surface-000', alpha: PANEL }],
    colors: [
      ['ink-900', 4.5], ['ink-700', 4.5], ['ink-500', 4.5], ['highlight', 4.5], ['cobalt-600', 4.5],
      ['ember-500', 4.5], ['cobalt-400', 3], ['button-primary', 3],
    ],
  },
  {
    name: 'frosted pin over a page wash',
    kind: 'page',
    ground: 'surface-hero',
    over: [{ color: 'surface-000', alpha: PIN }],
    colors: [['ink-900', 4.5], ['ink-500', 4.5], ['cobalt-600', 4.5]],
  },
  {
    name: 'frosted panel over a section wash',
    kind: 'section',
    ground: 'surface-100',
    over: [{ color: 'surface-000', alpha: PANEL }],
    colors: [['ink-900', 4.5], ['ink-700', 4.5], ['ink-500', 4.5], ['highlight', 4.5], ['cobalt-600', 4.5]],
  },
  // A texture is ground, so text sits on it directly (design system v20, The three motifs, item 2).
  ...(['surface-100', 'surface-band'] as const).map(
    (ground): Stack => ({
      name: `text on a texture over ${ground === 'surface-100' ? 'the page' : 'the band'}`,
      kind: 'texture',
      ground,
      over: [],
      colors: [
        ['ink-900', 4.5], ['ink-700', 4.5], ['ink-500', 4.5], ['highlight', 4.5], ['cobalt-600', 4.5],
        ['ember-500', 4.5], ['cobalt-400', 3], ['button-primary', 3],
      ],
    }),
  ),
];

/**
 * The colors that can give the darkest and the lightest composite. Luminance rises with every
 * channel, so only Pareto-minimal and Pareto-maximal pixels matter: for each (red, green) keep the
 * least and greatest blue, then drop any dominated by a neighbor.
 */
async function extremes(file: string): Promise<{ lo: RGB[]; hi: RGB[] }> {
  const { data, info } = await sharp(path.join(process.cwd(), 'public', file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bmin = new Int16Array(65536).fill(999);
  const bmax = new Int16Array(65536).fill(-1);
  for (let i = 0; i < info.width * info.height * 3; i += 3) {
    const key = (data[i] << 8) | data[i + 1];
    const b = data[i + 2];
    if (b < bmin[key]) bmin[key] = b;
    if (b > bmax[key]) bmax[key] = b;
  }
  const pre = new Int16Array(65536);
  const suf = new Int16Array(65536);
  for (let r = 0; r < 256; r++)
    for (let g = 0; g < 256; g++) {
      const k = (r << 8) | g;
      pre[k] = Math.min(bmin[k], r ? pre[k - 256] : 999, g ? pre[k - 1] : 999);
    }
  for (let r = 255; r >= 0; r--)
    for (let g = 255; g >= 0; g--) {
      const k = (r << 8) | g;
      suf[k] = Math.max(bmax[k], r < 255 ? suf[k + 256] : -1, g < 255 ? suf[k + 1] : -1);
    }
  const lo: RGB[] = [];
  const hi: RGB[] = [];
  for (let r = 0; r < 256; r++)
    for (let g = 0; g < 256; g++) {
      const k = (r << 8) | g;
      if (bmin[k] !== 999 && bmin[k] < Math.min(r ? pre[k - 256] : 999, g ? pre[k - 1] : 999)) lo.push([r, g, bmin[k]]);
      if (bmax[k] !== -1 && bmax[k] > Math.max(r < 255 ? suf[k + 256] : -1, g < 255 ? suf[k + 1] : -1)) hi.push([r, g, bmax[k]]);
    }
  return { lo, hi };
}

/** The luminance range behind the text for one stack at one art opacity. */
function range(ext: { lo: RGB[]; hi: RGB[] }, theme: Theme, artAlpha: number, ground: string, over: Layer[]) {
  const base = rgb(css(ground, theme));
  // Each layer is linear in the art pixel, so the composite is K + pixel * m per channel. Normal
  // blend: ground * (1 - a) + art * a.
  let k: number[] = base.map((c) => c * (1 - artAlpha));
  let m: number[] = base.map(() => artAlpha);
  for (const layer of over) {
    const c = rgb(css(layer.color, theme));
    k = k.map((v, i) => v * (1 - layer.alpha) + c[i] * layer.alpha);
    m = m.map((v) => v * (1 - layer.alpha));
  }
  const lum = (p: RGB) => luminance([k[0] + p[0] * m[0], k[1] + p[1] * m[1], k[2] + p[2] * m[2]]);
  return { min: Math.min(...ext.lo.map(lum)), max: Math.max(...ext.hi.map(lum)) };
}

/** The worst ratio a color meets anywhere in the range. */
function worst(hex: string, { min, max }: { min: number; max: number }) {
  const l = luminance(rgb(hex));
  return l >= min && l <= max ? 1 : Math.min(ratio(l, min), ratio(l, max));
}

// Every file a wash region can load (each piece's phone and desktop cuts), and every file a texture
// can load (the texture cut's files from 720px up), in both formats. A piece's Night alternate is a
// wash in its own right, so it is covered here too.
const SERVED = (Object.keys(WASHES) as WashId[]).flatMap((id) => {
  const piece = WASHES[id];
  const region = [...new Set([piece.use.sm, piece.use.lg])].flatMap((cut) => {
    const entry = cutFiles(id, cut);
    const widest = Math.max(...Object.keys(entry.files).map(Number));
    return (['avif', 'webp'] as const).map((format) => ({ id, cut, format, texture: false, src: entry.files[widest][format].src }));
  });
  const entry = cutFiles(id, piece.use.texture);
  const texture = Object.keys(entry.files)
    .map(Number)
    .filter((w) => w >= 720)
    .flatMap((w) =>
      (['avif', 'webp'] as const).map((format) => ({ id, cut: `${piece.use.texture} ${w}`, format, texture: true, src: entry.files[w][format].src })),
    );
  return [...region, ...texture];
});

const lowest: Record<string, { ratio: number; where: string }> = {};
const ext = new Map<string, { lo: RGB[]; hi: RGB[] }>();

describe('AA over the washes, at every wash step, in both moods', () => {
  beforeAll(async () => {
    for (const file of SERVED) ext.set(file.src, await extremes(file.src));
  }, 60_000);

  describe.each(STACKS)('$name', (stack) => {
    it.each(['paper', 'night'] as const)('%s', (theme) => {
      const failures: string[] = [];
      for (const file of SERVED) {
        if (file.texture !== (stack.kind === 'texture')) continue;
        for (const step of WASH_STEPS) {
          const alpha =
            stack.kind === 'texture'
              ? (step / 100) * WASH_TEXTURE
              : (step / 100) * (theme === 'night' ? WASH_NIGHT : 1) * (stack.kind === 'section' ? WASH_SECTION : 1);
          const r = range(ext.get(file.src)!, theme, alpha, stack.ground, stack.over);
          for (const [color, min] of stack.colors) {
            const value = worst(css(color, theme), r);
            const key = `${theme} ${stack.name}: ${color}`;
            if (!lowest[key] || value < lowest[key].ratio) {
              lowest[key] = { ratio: value, where: `${file.id} ${file.cut} ${file.format} at ${step}%` };
            }
            if (value < min) failures.push(`${color} ${value.toFixed(2)}:1 < ${min} (${file.id} ${file.cut} ${file.format}, ${step}%)`);
          }
        }
      }
      expect(failures).toEqual([]);
    });
  });

  it('reports the lowest ratios when asked', () => {
    if (process.env.ART_CONTRAST_REPORT) {
      for (const [key, { ratio: r, where }] of Object.entries(lowest).sort()) {
        console.log(`${key.padEnd(62)} ${r.toFixed(2)}:1  ${where}`);
      }
    }
    expect(Object.keys(lowest).length).toBeGreaterThan(0);
  });
});
