// Inks the sky images (design system v21, The three motifs, item 3). Run by hand after a change to
// lib/sky.ts (node scripts/ink-sky.mjs); never in the build, since the Vercel build cannot see
// ../reference. The output in public/sky-images/ is committed.
//
// For each image in the manifest: check the source's size and SHA-256, crop, soften with a median filter
// where the manifest asks (a star field), convert to grey (Rec. 709 luma), apply the levels (black point, white point, gamma), then map every grey through a
// three-stop ramp interpolated in OKLab: night-900 (the Night token, read from app/tokens.css),
// the mid navy #3a4a6b, and paper #e8dfc9. That way the telescope's black is exactly the night band
// it sits on, and the sky reads blue grey like Jane Kwan's ink wash on Night. Writes one WebP per
// width, content-hashed, metadata stripped, and public/sky-images/credits.json (with each image's strength).
// With --staging <folder name> it also writes before and after cuts to ../staging/<folder name>/ for David.

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const reference = path.join(root, '..', 'reference', 'images', 'space images');
// Not public/sky/: proxy.ts gates everything under /sky (the engine page), so a public image there
// would send visitors to the passcode page.
const out = path.join(root, 'public', 'sky-images');
const stagingArg = process.argv.indexOf('--staging');
const stagingName = stagingArg === -1 ? null : process.argv[stagingArg + 1];
if (stagingArg !== -1 && !stagingName) throw new Error('--staging needs a folder name, such as "26.9.30 - 1h keys sky"');
const staging = stagingName ? path.join(root, '..', 'staging', stagingName) : null;
const BUDGET = 250_000;
const QUALITY = 80;

const { SKY, INK_STOPS, skyCredit, skyStrength } = await createJiti(import.meta.url).import(path.join(root, 'lib', 'sky.ts'));

// night-900 in the Night block of the token layer.
const tokens = await readFile(path.join(root, 'app', 'tokens.css'), 'utf8');
const nightBlock = tokens.slice(tokens.indexOf('[data-theme="night"]'));
const NIGHT_900 = /--night-900:\s*(#[0-9a-f]{6})/i.exec(nightBlock)[1].toLowerCase();

// sRGB <-> OKLab (Björn Ottosson's matrices).
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function oklab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function srgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255));
}

/** The 256-entry ramp for one image's levels: grey in, [r, g, b] out. */
function ramp({ black, white, gamma }) {
  const stops = [oklab(NIGHT_900), oklab(INK_STOPS.mid), oklab(INK_STOPS.light)];
  return Array.from({ length: 256 }, (_, grey) => {
    const t = Math.min(1, Math.max(0, (grey - black) / (white - black))) ** gamma;
    const [a, b, u] = t <= 0.5 ? [stops[0], stops[1], t * 2] : [stops[1], stops[2], (t - 0.5) * 2];
    return srgb(a.map((v, i) => v + (b[i] - v) * u));
  });
}

const credits = {};
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const [id, image] of Object.entries(SKY)) {
  const file = path.join(reference, image.source);
  const source = await readFile(file);
  const sha = createHash('sha256').update(source).digest('hex');
  if (sha !== image.sha256) throw new Error(`${id}: ${image.source} has SHA-256 ${sha}, the manifest says ${image.sha256}`);
  const meta = await sharp(source).metadata();
  if (meta.width !== image.size[0] || meta.height !== image.size[1]) {
    throw new Error(`${id}: ${image.source} is ${meta.width}x${meta.height}, the manifest says ${image.size.join('x')}`);
  }

  const [left, top, width, height] = image.crop;
  const lut = ramp(image.levels);
  const dir = path.join(out, image.stem);
  await mkdir(dir, { recursive: true });
  const files = {};
  let inkedFull = null;

  for (const target of image.widths) {
    if (target > width) throw new Error(`${id}: ${target}px is wider than the crop (${width}px)`);
    const h = Math.round((height * target) / width);
    const { data } = await sharp(source)
      .extract({ left, top, width, height })
      .median(image.median ?? 1)
      .resize(target, h, { kernel: 'lanczos3' })
      .toColorspace('srgb')
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgb = Buffer.alloc(target * h * 3);
    for (let i = 0; i < target * h; i++) rgb.set(lut[data[i]], i * 3);
    const inked = sharp(rgb, { raw: { width: target, height: h, channels: 3 } });
    if (!inkedFull) inkedFull = { rgb, width: target, height: h };
    const webp = await inked.clone().webp({ quality: QUALITY, effort: 6 }).toBuffer();
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
    source: `reference/images/space images/${image.source} (misnamed in the Lovable export)`,
    crop: image.crop,
    levels: image.levels,
    median: image.median ?? null,
    strength: skyStrength(image),
    ramp: [NIGHT_900, INK_STOPS.mid, INK_STOPS.light],
    files,
  };

  if (staging) {
    await mkdir(staging, { recursive: true });
    await sharp(source).extract({ left, top, width, height }).jpeg({ quality: 88 }).toFile(path.join(staging, `${image.stem} 1 before (color crop).jpg`));
    const { rgb, width: w, height: h } = inkedFull;
    await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).png().toFile(path.join(staging, `${image.stem} 2 after (inked, full strength).png`));
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
  `${JSON.stringify({ $about: 'The sky images on the site, inked by scripts/ink-sky.mjs from lib/sky.ts. Credits confirmed on each release page.', images: credits }, null, 2)}\n`,
);
console.log('wrote public/sky-images/credits.json');
