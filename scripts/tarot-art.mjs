// The day's tarot card art (1c): the 78 cards of the original 1909 Rider-Waite-Smith deck drawn by
// Pamela Colman Smith, from Wikimedia Commons' scans of a first-edition "Roses & Lilies" deck
// (Category:Rider-Waite tarot deck (Roses & Lilies), scanned by Saskia Jansen). Never a later
// recoloring: those are copyrighted. Run by hand (node scripts/tarot-art.mjs); never in the build.
//
// For each card: look the file up on Commons (URL, SHA-1, first uploader, license tag), download
// the original into .cache/tarot/ (gitignored) and check its SHA-1, then write one WebP at 480px
// wide (twice the 240px the card is shown at), sRGB, metadata stripped, content-hashed so
// next.config.ts can cache it for a year. Writes lib/tarot-files.json (what the site reads) and
// content/oracle/credits.json (where each card came from), and fails if a file breaks its budget.

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.cache', 'tarot');
const out = path.join(root, 'public', 'tarot');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'AstroTribesBuild/1.0 (https://astrotribes.vercel.app; weareastrotribes@gmail.com)';
const WIDTH = 480;
const QUALITY = 64;
const BUDGET = 100_000;

const MAJOR = [
  'Fool', 'Magician', 'High Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  'Strength', 'Hermit', 'Wheel of Fortune', 'Justice', 'Hanged Man', 'Death', 'Temperance', 'Devil',
  'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World',
];
const SUITS = ['wands', 'cups', 'swords', 'pentacles'];
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Card id to its Commons file name. */
const CARDS = [
  ...MAJOR.map((name, n) => [`major-${pad(n)}`, `RWS1909 - ${pad(n)} ${name}.jpeg`]),
  ...SUITS.flatMap((suit) =>
    Array.from({ length: 14 }, (_, i) => [
      `${suit}-${pad(i + 1)}`,
      `RWS1909 - ${suit[0].toUpperCase()}${suit.slice(1)} ${pad(i + 1)}.jpeg`,
    ]),
  ),
];

async function commons(file) {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${file}`,
    prop: 'imageinfo|revisions',
    iiprop: 'url|sha1|user|timestamp|size',
    iilimit: '50',
    rvprop: 'content',
    rvslots: 'main',
    format: 'json',
  });
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${file}: Commons answered ${res.status}`);
  const page = Object.values((await res.json()).query.pages)[0];
  if (!page.imageinfo) throw new Error(`${file}: not on Commons`);
  const versions = page.imageinfo;
  const current = versions[0];
  const first = versions[versions.length - 1];
  const wikitext = page.revisions[0].slots.main['*'];
  const license = [...wikitext.matchAll(/\{\{\s*(PD-[^}|]+)/g)].map((m) => m[1].trim());
  const scan = /scanned by ([^.]+?) from/.exec(wikitext)?.[1] ?? null;
  if (!license.length) throw new Error(`${file}: no public-domain license tag on its page`);
  return {
    page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(`File:${file}`.replaceAll(' ', '_'))}`,
    url: current.url,
    sha1: current.sha1,
    uploader: first.user,
    uploaded: first.timestamp,
    license,
    scan,
  };
}

async function original(id, info) {
  const file = path.join(cache, `${id}.jpg`);
  let buffer = await readFile(file).catch(() => null);
  if (!buffer || createHash('sha1').update(buffer).digest('hex') !== info.sha1) {
    let res;
    // Wikimedia's upload server rate-limits bulk downloads: pace them, and wait when told to.
    for (let attempt = 0; attempt < 6; attempt++) {
      await sleep(1500);
      res = await fetch(info.url, { headers: { 'User-Agent': UA } });
      if (res.status !== 429) break;
      await sleep(Number(res.headers.get('retry-after') ?? 0) * 1000 || 15_000 * (attempt + 1));
    }
    if (!res.ok) throw new Error(`${id}: download answered ${res.status}`);
    buffer = Buffer.from(await res.arrayBuffer());
    const sha1 = createHash('sha1').update(buffer).digest('hex');
    if (sha1 !== info.sha1) throw new Error(`${id}: SHA-1 ${sha1} does not match Commons (${info.sha1})`);
    await writeFile(file, buffer);
  }
  return buffer;
}

await mkdir(cache, { recursive: true });
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const files = {};
const credits = {};
const over = [];

for (const [id, file] of CARDS) {
  const info = await commons(file);
  const buffer = await original(id, info);
  const { data, info: size } = await sharp(buffer)
    .resize({ width: WIDTH, kernel: 'lanczos3' })
    .toColorspace('srgb')
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  const name = `${id}.${createHash('sha256').update(data).digest('hex').slice(0, 8)}.webp`;
  await writeFile(path.join(out, name), data);
  files[id] = { src: `/tarot/${name}`, width: size.width, height: size.height, bytes: data.length };
  if (data.length > BUDGET) over.push(`${name}: ${data.length} bytes, budget ${BUDGET}`);
  credits[id] = {
    file,
    commons: info.page,
    license: info.license,
    uploader: info.uploader,
    uploaded: info.uploaded,
    scan: info.scan,
    sha1: info.sha1,
  };
  process.stdout.write('.');
}

await writeFile(path.join(root, 'lib', 'tarot-files.json'), `${JSON.stringify(files, null, 2)}\n`);
await writeFile(
  path.join(root, 'content', 'oracle', 'credits.json'),
  `${JSON.stringify(
    {
      $about:
        'Where each card image on /oracle comes from. Written by scripts/tarot-art.mjs from each file page on Wikimedia Commons.',
      artist: 'Pamela Colman Smith',
      deck: 'Rider-Waite-Smith tarot, first edition ("Roses & Lilies"), William Rider & Son, London, 1909',
      credit: 'Card by Pamela Colman Smith, 1909',
      category: 'https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)',
      cards: credits,
    },
    null,
    2,
  )}\n`,
);
console.log(`\n${(await readdir(out)).length} files in public/tarot/`);
if (over.length) {
  console.error(`Over budget:\n${over.join('\n')}`);
  process.exit(1);
}
