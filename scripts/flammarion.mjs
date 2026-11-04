// Cuts the colored Flammarion engraving for the landing (David, Nov 4). Run by hand
// (node scripts/flammarion.mjs <source file>); never in the build. The source stays outside the repo;
// only the cuts in public/flammarion/ and lib/flammarion-files.json enter git. Each width (never up),
// sRGB, metadata stripped, AVIF and WebP with a content hash in the name.
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Pass the source file.');
const out = path.join(root, 'public', 'flammarion');
const WIDTHS = [480, 966];
const QUALITY = { avif: 55, webp: 75 };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 8);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const meta = await sharp(source).metadata();
const files = { width: meta.width, height: meta.height, files: {} };
for (const width of WIDTHS.filter((w) => w <= meta.width)) {
  files.files[width] = {};
  for (const format of ['avif', 'webp']) {
    const buffer = await sharp(source).resize({ width }).toColourspace('srgb')[format]({ quality: QUALITY[format] }).toBuffer();
    const name = `flammarion-${width}.${hash(buffer)}.${format}`;
    await writeFile(path.join(out, name), buffer);
    files.files[width][format] = { src: `/flammarion/${name}`, bytes: buffer.length };
  }
}
await writeFile(path.join(root, 'lib', 'flammarion-files.json'), `${JSON.stringify(files, null, 2)}\n`);
console.log(JSON.stringify(files, null, 2));
