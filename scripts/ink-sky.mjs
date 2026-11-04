// Cuts the sky images (design system v21, The three motifs, item 3). Run by hand after a change to
// lib/sky.ts (node scripts/ink-sky.mjs); never in the build, since the Vercel build cannot see
// ../reference. The output in public/sky-images/ is committed.
//
// For each image in the manifest: check the source's size and SHA-256, crop, soften with a median filter
// where the manifest asks (a star field), apply the levels to each channel (black point, white point,
// gamma), then screen the photo over night-900 (the Night token, read from app/tokens.css). The
// telescope's own color stays (David, Oct 26: no more blue grey ink), and its black is exactly the night
// band it sits on, so the edge never shows. Writes one WebP per width, content-hashed, metadata
// stripped, and public/sky-images/credits.json (with each image's strength).
// With --staging <folder name> it also writes before and after cuts to ../staging/<folder name>/ for David.
// With --only <id,id> it cuts those images and keeps the others and their credits as they are; with
// --source <folder> it reads the sources from that folder instead of ../reference (the SHA-256 check
// still holds them to the manifest).

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  if (i === -1) return null;
  if (!process.argv[i + 1]) throw new Error(`${flag} needs a value`);
  return process.argv[i + 1];
};
const only = arg('--only')?.split(',') ?? null;
const reference = arg('--source') ?? path.join(root, '..', 'reference', 'images', 'space images');
// Not public/sky/: proxy.ts gates everything under /sky (the engine page), so a public image there
// would send visitors to the passcode page.
const out = path.join(root, 'public', 'sky-images');
const stagingArg = process.argv.indexOf('--staging');
const stagingName = stagingArg === -1 ? null : process.argv[stagingArg + 1];
if (stagingArg !== -1 && !stagingName) throw new Error('--staging needs a folder name, such as "26.9.30 - 1h keys sky"');
const staging = stagingName ? path.join(root, '..', 'staging', stagingName) : null;
const BUDGET = 250_000;
const QUALITY = 80;

const { SKY, skyCredit, skyStrength } = await createJiti(import.meta.url).import(path.join(root, 'lib', 'sky.ts'));

// night-900 in the Night block of the token layer.
const tokens = await readFile(path.join(root, 'app', 'tokens.css'), 'utf8');
const nightBlock = tokens.slice(tokens.indexOf('[data-theme="night"]'));
const NIGHT_900 = /--night-900:\s*(#[0-9a-f]{6})/i.exec(nightBlock)[1].toLowerCase();

const NIGHT = [1, 3, 5].map((i) => parseInt(NIGHT_900.slice(i, i + 2), 16));

/** One image's levels as a 256-entry table, the same for each channel. */
function levels({ black, white, gamma }) {
  return Array.from({ length: 256 }, (_, v) => Math.min(1, Math.max(0, (v - black) / (white - black))) ** gamma);
}

/** Screen over night-900: black lands on the night band, white stays white, color stays color. */
const screen = (t, c) => Math.round(255 - (255 - NIGHT[c]) * (1 - t));

for (const id of only ?? []) if (!(id in SKY)) throw new Error(`--only ${id}: no such image in lib/sky.ts`);
const kept = only ? JSON.parse(await readFile(path.join(out, 'credits.json'), 'utf8')).images : {};
const credits = {};
if (only) for (const id of only) await rm(path.join(out, SKY[id].stem), { recursive: true, force: true });
else await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const [id, image] of Object.entries(SKY)) {
  if (only && !only.includes(id)) {
    if (!kept[id]) throw new Error(`${id} has no cut yet; run without --only`);
    credits[id] = kept[id];
    continue;
  }
  const file = path.join(reference, image.source);
  const source = await readFile(file);
  const sha = createHash('sha256').update(source).digest('hex');
  if (sha !== image.sha256) throw new Error(`${id}: ${image.source} has SHA-256 ${sha}, the manifest says ${image.sha256}`);
  const meta = await sharp(source).metadata();
  if (meta.width !== image.size[0] || meta.height !== image.size[1]) {
    throw new Error(`${id}: ${image.source} is ${meta.width}x${meta.height}, the manifest says ${image.size.join('x')}`);
  }

  const [left, top, width, height] = image.crop;
  const lut = levels(image.levels);
  const dir = path.join(out, image.stem);
  await mkdir(dir, { recursive: true });
  const files = {};
  let cutFull = null;

  for (const target of image.widths) {
    if (target > width) throw new Error(`${id}: ${target}px is wider than the crop (${width}px)`);
    const h = Math.round((height * target) / width);
    const { data } = await sharp(source)
      .extract({ left, top, width, height })
      .median(image.median ?? 1)
      .resize(target, h, { kernel: 'lanczos3' })
      .toColorspace('srgb')
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgb = Buffer.alloc(target * h * 3);
    for (let i = 0; i < target * h * 3; i++) rgb[i] = screen(lut[data[i]], i % 3);
    const cut = sharp(rgb, { raw: { width: target, height: h, channels: 3 } });
    if (!cutFull) cutFull = { rgb, width: target, height: h };
    const webp = await cut.clone().webp({ quality: QUALITY, effort: 6 }).toBuffer();
    if (webp.length > BUDGET) throw new Error(`${id} ${target}: ${webp.length} bytes, budget ${BUDGET}`);
    const name = `${image.stem}-${target}.${createHash('sha256').update(webp).digest('hex').slice(0, 8)}.webp`;
    await writeFile(path.join(dir, name), webp);
    files[target] = { src: `/sky-images/${image.stem}/${name}`, width: target, height: h, bytes: webp.length };
  }

  credits[id] = {
    subject: image.subject,
    credit: skyCredit(image),
    tinted: image.tinted,
    license: image.license,
    release: image.release,
    released: image.released,
    source: `reference/images/space images/${image.source}${image.source.startsWith('nasa-') ? ' (misnamed in the Lovable export)' : ''}`,
    crop: image.crop,
    levels: image.levels,
    median: image.median ?? null,
    strength: skyStrength(image),
    ground: NIGHT_900,
    files,
  };

  if (staging) {
    await mkdir(staging, { recursive: true });
    await sharp(source).extract({ left, top, width, height }).jpeg({ quality: 88 }).toFile(path.join(staging, `${image.stem} 1 before (color crop).jpg`));
    const { rgb, width: w, height: h } = cutFull;
    await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).png().toFile(path.join(staging, `${image.stem} 2 after (full strength).png`));
    // On the night-900 ground at the image's strength, with the Oracle's radial mask (for the ring).
    const night = parseInt(NIGHT_900.slice(1), 16);
    const ground = [(night >> 16) & 255, (night >> 8) & 255, night & 255];
    const onPage = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const d = Math.hypot(x - w / 2, y - h / 2) / (w / 2);
        const mask = d <= 0.62 ? 1 : d >= 1 ? 0 : 1 - (d - 0.62) / 0.38;
        const a = skyStrength(image) * mask;
        for (let c = 0; c < 3; c++) {
          const i = (y * w + x) * 3 + c;
          onPage[i] = Math.round(ground[c] * (1 - a) + rgb[i] * a);
        }
      }
    await sharp(onPage, { raw: { width: w, height: h, channels: 3 } }).png().toFile(path.join(staging, `${image.stem} 3 on night-900 (strength ${skyStrength(image)}, masked).png`));
  }
  console.log(`${id}: ${(await readdir(dir)).length} files`);
}

await writeFile(
  path.join(out, 'credits.json'),
  `${JSON.stringify({ $about: 'The sky images on the site, cut by scripts/ink-sky.mjs from lib/sky.ts. Credits confirmed on each release page.', images: credits }, null, 2)}\n`,
);
console.log('wrote public/sky-images/credits.json');
