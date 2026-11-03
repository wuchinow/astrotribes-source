// Cuts Kirstie Connon's twelve Tribe paintings for the web, per lib/tribe-paintings.ts.
// Run by hand (node scripts/tribe-paintings.mjs [source folder]); never in the build. The sources
// stay outside the repo, in ../reference/kirstie connon/ by default; only the cuts in
// public/tribe-paintings/ enter git.
//
// For each painting: the centred square (each canvas is square to within 3%, and her mark sits well
// inside the edge), resized to each width (never up), sRGB, every bit of metadata stripped, AVIF and
// WebP with a content hash in the name. Then lib/tribe-paintings-files.json, and a failure if a file
// breaks its budget.

import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = path.resolve(process.argv[2] ?? path.join(root, '..', 'reference', 'kirstie connon'));
const out = path.join(root, 'public', 'tribe-paintings');

const { TRIBE_PAINTINGS, TRIBE_PAINTING_WIDTHS } = await createJiti(import.meta.url).import(
  path.join(root, 'lib', 'tribe-paintings.ts'),
);

const BUDGET = 90_000;
const QUALITY = { avif: 50, webp: 70 };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 8);
const files = {};
const over = [];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const [sign, painting] of Object.entries(TRIBE_PAINTINGS)) {
  const source = path.join(sources, painting.source);
  const meta = await sharp(source).metadata();
  if (meta.width !== painting.size[0] || meta.height !== painting.size[1]) {
    throw new Error(`${sign}: ${painting.source} is ${meta.width}x${meta.height}, the manifest says ${painting.size.join('x')}`);
  }
  const side = Math.min(meta.width, meta.height);
  const box = {
    left: Math.floor((meta.width - side) / 2),
    top: Math.floor((meta.height - side) / 2),
    width: side,
    height: side,
  };
  const widths = [...new Set(TRIBE_PAINTING_WIDTHS.map((w) => Math.min(w, side)))];
  files[sign] = { size: side, files: {} };
  for (const width of widths) {
    const base = sharp(source).extract(box).resize(width, width, { kernel: 'lanczos3' }).toColorspace('srgb');
    const variant = {};
    for (const format of ['avif', 'webp']) {
      const buffer = await base
        .clone()
        [format]({ quality: QUALITY[format], effort: format === 'avif' ? 6 : 5 })
        .toBuffer();
      const name = `${sign}-${width}.${hash(buffer)}.${format}`;
      await writeFile(path.join(out, name), buffer);
      variant[format] = { src: `/tribe-paintings/${name}`, bytes: buffer.length };
      if (format === 'avif' && buffer.length > BUDGET) over.push(`${name}: ${buffer.length} bytes, budget ${BUDGET}`);
    }
    files[sign].files[width] = variant;
  }
  console.log(`${sign}: ${widths.join(', ')}`);
}

await writeFile(path.join(root, 'lib', 'tribe-paintings-files.json'), `${JSON.stringify(files, null, 2)}\n`);
console.log('wrote lib/tribe-paintings-files.json');
if (over.length) {
  console.error(`Over budget:\n${over.join('\n')}`);
  process.exit(1);
}
