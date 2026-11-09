// Cuts the Chinese zodiac jade figures for the web, per lib/zodiac-jade.ts: twelve transparent PNG
// cutouts of the Met's Qing jade set (public domain), made on David's Mac. Run by hand, never in the
// build:
//
//   node scripts/zodiac-jade.mjs <cutouts folder>
//
// The sources stay outside the repo (Drive and Notion, "Chinese zodiac jade"); only the cuts in
// public/zodiac-jade/ enter git. Each cutout is trimmed to the figure (its transparent margin), resized
// to each width (never up), sRGB, every bit of metadata stripped, AVIF and WebP with the transparency
// kept and a content hash in the name. Then lib/zodiac-jade-files.json, and a failure if a file breaks
// its budget.

import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [sourceDir] = process.argv.slice(2);
if (!sourceDir) throw new Error('Usage: node scripts/zodiac-jade.mjs <cutouts folder>');
const out = path.join(root, 'public', 'zodiac-jade');

const { ZODIAC_JADE, ZODIAC_JADE_WIDTHS } = await createJiti(import.meta.url).import(path.join(root, 'lib', 'zodiac-jade.ts'));

const BUDGET = 90_000;
const QUALITY = { avif: 60, webp: 80 };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 8);
const files = {};
const over = [];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const [animal, jade] of Object.entries(ZODIAC_JADE)) {
  const id = animal.toLowerCase();
  const source = path.join(sourceDir, jade.source);
  const meta = await sharp(source).metadata();
  if (!meta.hasAlpha) throw new Error(`${jade.source} has no transparency; expected a cutout`);
  // Trim to the figure: the cutout's margin is fully transparent.
  const trimmed = await sharp(source).ensureAlpha().trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = trimmed.info;
  const widths = [...new Set(ZODIAC_JADE_WIDTHS.map((target) => Math.min(target, w)))];
  files[id] = { width: w, height: h, files: {} };
  for (const width of widths) {
    const base = sharp(trimmed.data).resize(width, null, { kernel: 'lanczos3' }).toColorspace('srgb');
    const variant = {};
    for (const format of ['avif', 'webp']) {
      const buffer = await base
        .clone()
        [format]({ quality: QUALITY[format], effort: format === 'avif' ? 6 : 5, ...(format === 'webp' ? { alphaQuality: 90 } : {}) })
        .toBuffer();
      const name = `${id}-${width}.${hash(buffer)}.${format}`;
      await writeFile(path.join(out, name), buffer);
      variant[format] = { src: `/zodiac-jade/${name}`, bytes: buffer.length };
      if (buffer.length > BUDGET) over.push(`${name}: ${buffer.length} bytes, budget ${BUDGET}`);
    }
    files[id].files[width] = variant;
  }
  console.log(`${id}: ${w}x${h}, ${widths.join(', ')}`);
}

await writeFile(path.join(root, 'lib', 'zodiac-jade-files.json'), `${JSON.stringify(files, null, 2)}\n`);
console.log('wrote lib/zodiac-jade-files.json');
if (over.length) {
  console.error(`Over budget:\n${over.join('\n')}`);
  process.exit(1);
}
