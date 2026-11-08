// Cuts the Tribe pages' old prints for the web, per lib/old-prints.ts: the Urania's Mirror
// constellation cards and Grandville's engravings. Run by hand, never in the build:
//
//   node scripts/old-prints.mjs <constellation folder> <grandville folder>
//
// The sources stay outside the repo (David's Drive); only the cuts in public/old-prints/ enter git.
// Each scan is trimmed of its plain page margin, resized to each width (never up), sRGB, every bit of
// metadata stripped, AVIF and WebP with a content hash in the name. Then lib/old-prints-files.json,
// and a failure if a file breaks its budget.

import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [plateDir, cartoonDir] = process.argv.slice(2);
if (!plateDir || !cartoonDir) throw new Error('Usage: node scripts/old-prints.mjs <constellation folder> <grandville folder>');
const out = path.join(root, 'public', 'old-prints');

const { PLATES, CARTOONS, OLD_PRINT_WIDTHS } = await createJiti(import.meta.url).import(path.join(root, 'lib', 'old-prints.ts'));

const BUDGET = 220_000;
const QUALITY = { avif: 55, webp: 72 };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 8);
const files = {};
const over = [];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const jobs = [
  ...Object.entries(PLATES).map(([sign, print]) => [`plate-${sign}`, path.join(plateDir, print.source), print]),
  ...Object.entries(CARTOONS).map(([id, print]) => [`cartoon-${id}`, path.join(cartoonDir, print.source), print]),
];

for (const [id, source, print] of jobs) {
  const meta = await sharp(source).metadata();
  if (meta.width !== print.size[0] || meta.height !== print.size[1]) {
    throw new Error(`${id}: ${print.source} is ${meta.width}x${meta.height}, the manifest says ${print.size.join('x')}`);
  }
  // Trim the plain margin around the print (white or cream page), keeping the print itself whole.
  const trimmed = await sharp(source).flatten({ background: '#ffffff' }).trim({ threshold: 18 }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = trimmed.info;
  const widths = [...new Set(OLD_PRINT_WIDTHS.map((target) => Math.min(target, w)))];
  files[id] = { width: w, height: h, files: {} };
  for (const width of widths) {
    const base = sharp(trimmed.data).resize(width, null, { kernel: 'lanczos3' }).toColorspace('srgb');
    const variant = {};
    for (const format of ['avif', 'webp']) {
      const buffer = await base
        .clone()
        [format]({ quality: QUALITY[format], effort: format === 'avif' ? 6 : 5 })
        .toBuffer();
      const name = `${id}-${width}.${hash(buffer)}.${format}`;
      await writeFile(path.join(out, name), buffer);
      variant[format] = { src: `/old-prints/${name}`, bytes: buffer.length };
      if (format === 'avif' && buffer.length > BUDGET) over.push(`${name}: ${buffer.length} bytes, budget ${BUDGET}`);
    }
    files[id].files[width] = variant;
  }
  console.log(`${id}: ${w}x${h}, ${widths.join(', ')}`);
}

await writeFile(path.join(root, 'lib', 'old-prints-files.json'), `${JSON.stringify(files, null, 2)}\n`);
console.log('wrote lib/old-prints-files.json');
if (over.length) {
  console.error(`Over budget:\n${over.join('\n')}`);
  process.exit(1);
}
