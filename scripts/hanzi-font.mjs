// The Oracle's Chinese characters (1c): Noto Serif TC Bold (SIL Open Font License), cut down to the
// 71 characters the 64 hexagram names and the eight trigrams use, so the font is a few kilobytes
// instead of eight megabytes. Run by hand (node scripts/hanzi-font.mjs) after the names change;
// never in the build. It reads the characters from content/oracle/iching.json and the source font
// from .cache/fonts/ (gitignored; fetched from github.com/notofonts/noto-cjk if missing), and writes
// app/(public)/oracle/hanzi-bold.woff2 beside its licence.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.cache', 'fonts');
const outDir = path.join(root, 'app', '(public)', 'oracle');
const SOURCE = 'https://github.com/notofonts/noto-cjk/raw/main/Serif/SubsetOTF/TC/NotoSerifTC-Bold.otf';
const LICENSE = 'https://github.com/notofonts/noto-cjk/raw/main/Serif/LICENSE';

async function cached(url, name) {
  const file = path.join(cache, name);
  const have = await readFile(file).catch(() => null);
  if (have) return have;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await mkdir(cache, { recursive: true });
  await writeFile(file, buffer);
  return buffer;
}

const iching = JSON.parse(await readFile(path.join(root, 'content', 'oracle', 'iching.json'), 'utf8'));
const chars = [
  ...new Set([
    ...iching.hexagrams.flatMap((h) => [...h.chinese]),
    ...Object.values(iching.trigrams).flatMap((t) => [...t.chinese]),
  ]),
].sort();

const font = await cached(SOURCE, 'NotoSerifTC-Bold.otf');
const license = await cached(LICENSE, 'LICENSE');
const woff2 = await subsetFont(font, chars.join(''), { targetFormat: 'woff2' });
await writeFile(path.join(outDir, 'hanzi-bold.woff2'), woff2);
await writeFile(path.join(outDir, 'hanzi-bold-OFL.txt'), license);
console.log(`${chars.length} characters, ${woff2.length} bytes: app/(public)/oracle/hanzi-bold.woff2`);
