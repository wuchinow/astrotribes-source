// Cuts Jane Kwan's pieces for the web from the reference folder, per the manifest in lib/art.ts.
// Run by hand after a manifest change (node scripts/art.mjs); never in the build. The sources stay in
// ~/Developer/astrotribes/reference and never enter git; only the cuts in public/art/ do.
//
// For each cut: crop, resize to each width (never up), convert to sRGB, strip every bit of metadata
// (phone photos can carry a location), and write AVIF and WebP with a content hash in the name, so
// next.config.ts can cache them for a year. Then write lib/art-files.json, which the site reads,
// and fail if a file breaks its budget.

import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const reference = path.join(root, '..', 'reference', "jane's art");
const out = path.join(root, 'public', 'art');

const { ART } = await createJiti(import.meta.url).import(path.join(root, 'lib', 'art.ts'));

// Budgets in bytes. A wash's widest file is the first-screen painting at 1280 (at most 120 KB); a
// framed piece or a narrower wash loads on scroll, so it gets less.
const BUDGET = { washWide: 120_000, other: 90_000, thumb: 8_000 };
const QUALITY = { avif: 45, webp: 62 };

const hash = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 8);
const files = {};
const over = [];

for (const [id, piece] of Object.entries(ART)) {
  const dir = path.join(out, piece.stem);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const meta = await sharp(path.join(reference, piece.source)).metadata();
  if (meta.width !== piece.size[0] || meta.height !== piece.size[1]) {
    throw new Error(`${id}: ${piece.source} is ${meta.width}x${meta.height}, the manifest says ${piece.size.join('x')}`);
  }
  files[id] = {};

  for (const [cutName, cut] of Object.entries(piece.cuts)) {
    if (!cut.widths.length) continue;
    const [left, top, width, height] = cut.box;
    const entry = { ratio: +(width / height).toFixed(4), files: {} };
    for (const target of cut.widths) {
      if (target > width) throw new Error(`${id} ${cutName}: ${target}px is wider than the cut (${width}px)`);
      const h = Math.round((height * target) / width);
      const base = sharp(path.join(reference, piece.source))
        .extract({ left, top, width, height })
        .resize(target, h, { kernel: 'lanczos3' })
        .toColorspace('srgb');
      const variant = { h };
      for (const format of ['avif', 'webp']) {
        const buffer = await base
          .clone()
          [format]({ quality: QUALITY[format], effort: format === 'avif' ? 6 : 5 })
          .toBuffer();
        const name = `${piece.stem}-${cutName}-${target}.${hash(buffer)}.${format}`;
        await writeFile(path.join(dir, name), buffer);
        variant[format] = { src: `/art/${piece.stem}/${name}`, bytes: buffer.length };
        const limit =
          target <= 160 ? BUDGET.thumb : piece.mode === 'wash' && target === cut.widths[0] ? BUDGET.washWide : BUDGET.other;
        if (format === 'avif' && buffer.length > limit) over.push(`${name}: ${buffer.length} bytes, budget ${limit}`);
      }
      entry.files[target] = variant;
    }
    files[id][cutName] = entry;
  }
  console.log(`${id}: ${(await readdir(dir)).length} files`);
}

await writeFile(path.join(root, 'lib', 'art-files.json'), `${JSON.stringify(files, null, 2)}\n`);
console.log('wrote lib/art-files.json');
if (over.length) {
  console.error(`Over budget:\n${over.join('\n')}`);
  process.exit(1);
}
