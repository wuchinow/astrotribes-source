// Traces Dawa's brush glyphs into single-ink SVGs for public/glyphs/.
//
// A local tool, run by hand from repo/: `node scripts/trace-glyphs.mjs`.
// It reads the source photographs and cut-outs in ../reference (never copied
// into the repo), needs potrace on the PATH (`brew install potrace`), and writes
// the picks to public/glyphs/ and the alternates and contact sheet to
// ../staging/. The crop boxes below record which drawing on each sheet is used.
//
// Pipeline: crop, then an ink map (the alpha channel for cut-outs; for photos,
// greyscale divided by an estimate of the paper white, so uneven light drops
// out), threshold, drop specks, fit the longer side to 88 of a 96 viewBox,
// trace with potrace, and wrap the paths in <g id="glyph"> with no fill so
// GlyphIcon's <use> inherits currentColor.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const REFERENCE = path.resolve('../reference');
const PUBLIC = path.resolve('public/glyphs');
const STAGING = path.resolve('../staging/26.9.23 - 0b glyph traces');
const TMP = path.join(tmpdir(), 'astrotribes-glyph-trace');

const CANVAS = 1024; // bitmap handed to potrace
const ART = (CANVAS * 88) / 96; // the glyph's longer side, leaving a 4-unit margin

/**
 * crop: [left, top, width, height] in source pixels, the drawing Dawa marked.
 * threshold: ink cut-off, 0 to 1 (alpha: share of opacity; photo: multiplier on Otsu).
 * alt: an alternate candidate, written to staging only.
 * placeholder: a stand-in made with an image tool and cleaned by Fable, not
 * Dawa's; traced the same way and labelled as such on the contact sheet.
 */
const GLYPHS = [
  // Signs from the cut-outs (reference/glyphs alpha/)
  { id: 'taurus', source: 'alpha', file: 'glyphs alpha/5 1.png' },
  { id: 'leo', source: 'alpha', file: 'glyphs alpha/9 1.png' },
  { id: 'pisces', source: 'alpha', file: 'glyphs alpha/4 1.png' },
  // Signs from the photographs (reference/glyphs/)
  { id: 'aries', source: 'photo', file: 'glyphs/aries.png', crop: [520, 460, 1080, 600] },
  { id: 'gemini', source: 'photo', file: 'glyphs/gemini.png', crop: [436, 460, 540, 640] },
  {
    id: 'cancer',
    source: 'photo',
    file: 'glyphs/cancer.png',
    crop: [240, 370, 1190, 730],
    note: 'grey swirl, the arrow points to it',
  },
  {
    id: 'cancer',
    alt: true,
    source: 'photo',
    file: 'glyphs/cancer.png',
    crop: [350, 1270, 950, 730],
    note: 'bold version',
  },
  {
    id: 'virgo',
    source: 'photo',
    file: 'glyphs/virgo.png',
    crop: [575, 1065, 590, 555],
    note: 'top left, both arrows point to it',
  },
  {
    id: 'virgo',
    alt: true,
    source: 'photo',
    file: 'glyphs/virgo.png',
    crop: [545, 1625, 420, 420],
    note: 'bottom left',
  },
  {
    id: 'libra',
    source: 'photo',
    file: 'glyphs/libra.png',
    crop: [120, 790, 1330, 620],
    note: 'classic form; a marker-like line, not the brush set',
  },
  {
    id: 'libra',
    alt: true,
    source: 'photo',
    file: 'glyphs/libra.png',
    crop: [190, 60, 960, 400],
    note: 'stylized form',
  },
  {
    id: 'scorpio',
    source: 'photo',
    file: 'glyphs/scorpio.png',
    crop: [535, 975, 485, 530],
    note: 'middle row, both arrows point to it',
  },
  {
    id: 'scorpio',
    alt: true,
    source: 'photo',
    file: 'glyphs/scorpio.png',
    crop: [630, 1520, 600, 390],
    note: 'thin version below',
  },
  {
    id: 'sagittarius',
    source: 'photo',
    file: 'glyphs/sagittarius.png',
    crop: [450, 980, 760, 600],
    note: 'centre, the arrow points to it',
  },
  { id: 'capricorn', source: 'photo', file: 'glyphs/capricorn.png', crop: [480, 670, 510, 880] },
  {
    id: 'aquarius',
    source: 'photo',
    file: 'glyphs/aquarius.png',
    crop: [410, 975, 590, 600],
    note: 'tall middle one, both arrows point to it',
  },
  // Planets for Layer 1 (not rendered in 0b)
  {
    id: 'sun',
    source: 'alpha',
    file: 'glyphs alpha/3 1.png',
    threshold: 0.75,
    note: 'faint paper ground thresholded out',
  },
  { id: 'moon', source: 'alpha', file: 'glyphs alpha/8 1.png' },
  { id: 'mercury', source: 'alpha', file: 'glyphs alpha/10 1.png' },
  { id: 'venus', source: 'alpha', file: 'glyphs alpha/11 1.png' },
  { id: 'mars', source: 'alpha', file: 'glyphs alpha/1 2.png' },
  { id: 'jupiter', source: 'alpha', file: 'glyphs alpha/6 1.png' },
  { id: 'saturn', source: 'alpha', file: 'glyphs alpha/7 1.png' },
  { id: 'neptune', source: 'alpha', file: 'glyphs alpha/2 1.png' },
  // Placeholders until Dawa brushes his own (Sep 24): not his work, never credited to him
  {
    id: 'uranus',
    source: 'alpha',
    file: 'glyphs alpha/12 uranus (placeholder).png',
    placeholder: true,
  },
  {
    id: 'pluto',
    source: 'alpha',
    file: 'glyphs alpha/13 pluto orb (placeholder).png',
    placeholder: true,
    note: 'orb form, in use',
  },
  {
    id: 'pluto',
    alt: true,
    source: 'alpha',
    file: 'glyphs alpha/14 pluto pl (placeholder).png',
    placeholder: true,
    note: 'PL form, for Dawa to choose',
  },
  {
    id: 'chiron',
    source: 'alpha',
    file: 'glyphs alpha/15 chiron (placeholder).png',
    placeholder: true,
  },
];

const placeholderNames = () =>
  [...new Set(GLYPHS.filter((g) => g.placeholder && !g.alt).map((g) => g.id))].join(', ');

/** Ink map, 0 (paper) to 255 (ink), for the crop. */
async function inkMap(entry) {
  const file = path.join(REFERENCE, entry.file);
  let image = sharp(file);
  if (entry.crop) {
    const [left, top, width, height] = entry.crop;
    image = image.extract({ left, top, width, height });
  }

  if (entry.source === 'alpha') {
    const { data, info } = await image
      .ensureAlpha()
      .extractChannel(3)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const cut = Math.round((entry.threshold ?? 0.5) * 255);
    return { data, width: info.width, height: info.height, cut };
  }

  // Photo: flatten uneven light by dividing by the local paper white.
  const grey = image.flatten({ background: '#ffffff' }).greyscale();
  const { data, info } = await grey
    .clone()
    .blur(1.2)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const B = 48;
  const bw = Math.ceil(W / B);
  const bh = Math.ceil(H / B);
  const block = Buffer.alloc(bw * bh);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = Math.floor(y / B) * bw + Math.floor(x / B);
      if (data[y * W + x] > block[k]) block[k] = data[y * W + x];
    }
  const paper = await sharp(block, { raw: { width: bw, height: bh, channels: 1 } })
    .resize(W, H, { kernel: 'cubic' })
    .blur(20)
    .extractChannel(0) // sharp hands a one-channel raw buffer back as three channels otherwise
    .raw()
    .toBuffer();
  const ink = Buffer.alloc(W * H);
  const hist = new Array(256).fill(0);
  for (let i = 0; i < W * H; i++) {
    ink[i] = 255 - Math.round(255 * Math.min(1, data[i] / Math.max(paper[i], 1)));
    hist[ink[i]]++;
  }
  // Otsu on the ink map; the multiplier nudges it toward keeping pale strokes.
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0,
    wB = 0,
    best = 0,
    otsu = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = W * H - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const between = wB * wF * (sumB / wB - (sum - sumB) / wF) ** 2;
    if (between > best) {
      best = between;
      otsu = t;
    }
  }
  const cut = Math.round(255 - (255 - otsu) * (entry.threshold ?? 1.08));
  return { data: ink, width: W, height: H, cut };
}

/** Label 8-connected components; zero out the ones below minArea. Returns the bounding box of what is kept. */
function keepComponents(ink, W, H, cut, minArea) {
  const label = new Int32Array(W * H).fill(-1);
  const areas = [];
  const stack = [];
  for (let start = 0; start < W * H; start++) {
    if (ink[start] < cut || label[start] !== -1) continue;
    const id = areas.length;
    let area = 0;
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop();
      area++;
      const x = p % W,
        y = (p - x) / W;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const q = ny * W + nx;
          if (ink[q] >= cut && label[q] === -1) {
            label[q] = id;
            stack.push(q);
          }
        }
    }
    areas.push(area);
  }
  const total = areas.reduce((a, b) => a + b, 0);
  const floor = typeof minArea === 'function' ? minArea(total) : minArea;
  let x0 = W,
    y0 = H,
    x1 = -1,
    y1 = -1;
  for (let p = 0; p < W * H; p++) {
    const id = label[p];
    if (id === -1) continue;
    if (areas[id] < floor) {
      ink[p] = 0;
      continue;
    }
    const x = p % W,
      y = (p - x) / W;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, kept: areas.filter((a) => a >= floor).length };
}

function toPbm(bits, W, H) {
  const rowBytes = Math.ceil(W / 8);
  const body = Buffer.alloc(rowBytes * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (bits[y * W + x]) body[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
  return Buffer.concat([Buffer.from(`P4\n${W} ${H}\n`), body]);
}

async function trace(entry) {
  const { data, width, height, cut } = await inkMap(entry);
  // Specks under 0.15% of the ink (dust, pencil dots, paper fibre) go before measuring.
  const box = keepComponents(data, width, height, cut, (total) => total * 0.0015);
  const bw = box.x1 - box.x0 + 1;
  const bh = box.y1 - box.y0 + 1;
  const scale = ART / Math.max(bw, bh);
  const w = Math.max(1, Math.round(bw * scale));
  const h = Math.max(1, Math.round(bh * scale));

  // Resample the cleaned ink map (not the bitmap) so edges stay smooth.
  const fitted = await sharp(data, { raw: { width, height, channels: 1 } })
    .extract({ left: box.x0, top: box.y0, width: bw, height: bh })
    .resize(w, h, { kernel: 'lanczos3' })
    .extractChannel(0)
    .raw()
    .toBuffer();
  const bits = new Uint8Array(CANVAS * CANVAS);
  const ox = Math.round((CANVAS - w) / 2);
  const oy = Math.round((CANVAS - h) / 2);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (fitted[y * w + x] >= cut) bits[(y + oy) * CANVAS + x + ox] = 1;

  mkdirSync(TMP, { recursive: true });
  const name = entry.alt ? `${entry.id}-alt` : entry.id;
  const pbm = path.join(TMP, `${name}.pbm`);
  const raw = path.join(TMP, `${name}.svg`);
  writeFileSync(pbm, toPbm(bits, CANVAS, CANVAS));
  execFileSync('potrace', [
    '--svg',
    '--turdsize',
    '40',
    '--alphamax',
    '1',
    '--opttolerance',
    '0.4',
    '--width',
    '96pt',
    '--height',
    '96pt',
    '--unit',
    '1',
    '--output',
    raw,
    pbm,
  ]);

  const out = readFileSync(raw, 'utf8');
  const transform = /<g transform="([^"]+)"/.exec(out)?.[1];
  const paths = [...out.matchAll(/<path d="([^"]+)"\/>/g)].map((m) =>
    m[1].replace(/\s+/g, ' ').trim(),
  );
  if (!transform || paths.length === 0) throw new Error(`${name}: potrace produced no paths`);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
    `<g id="glyph" transform="${transform}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>\n`;
  return { name, svg, components: box.kept };
}

async function sourceThumb(entry) {
  let image = sharp(path.join(REFERENCE, entry.file));
  if (entry.crop) {
    const [left, top, width, height] = entry.crop;
    image = image.extract({ left, top, width, height });
  }
  const png = await image
    .flatten({ background: '#ffffff' })
    .resize(150, 150, { fit: 'contain', background: '#ffffff' })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

const MOODS = [
  { name: 'Paper', ground: '#f6f0e3', ink: '#1e1a17' },
  { name: 'Night', ground: '#132140', ink: '#f5eddb' },
];

function glyphAt(svg, x, y, size, fill) {
  const inner = /<g id="glyph" transform="([^"]+)">(.*)<\/g>/.exec(svg);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 96 96"><g transform="${inner[1]}" fill="${fill}">${inner[2]}</g></svg>`;
}

async function contactSheet(results) {
  const ROW = 190;
  const WIDTH = 1180;
  const rows = [];
  let y = 110;
  for (const { entry, name, svg, bytes } of results) {
    const thumb = await sourceThumb(entry);
    const parts = [
      `<rect x="20" y="${y}" width="${WIDTH - 40}" height="${ROW - 16}" fill="#fbf8f1" stroke="#d3c9b8"/>`,
      `<image href="${thumb}" x="32" y="${y + 12}" width="150" height="150"/>`,
      `<text x="200" y="${y + 32}" font-family="Helvetica, Arial" font-size="20" font-weight="700" fill="#1e1a17">${name}${entry.alt ? ' (alternate, staging only)' : ''}</text>`,
      `<text x="200" y="${y + 56}" font-family="Helvetica, Arial" font-size="14" fill="#3b3430">${entry.source === 'alpha' ? 'alpha cut-out' : 'photo'}: reference/${entry.file}${entry.crop ? ` [${entry.crop.join(', ')}]` : ''}</text>`,
      `<text x="200" y="${y + 76}" font-family="Helvetica, Arial" font-size="14" fill="#3b3430">${(bytes / 1024).toFixed(1)} KB${entry.note ? `. ${entry.note}` : ''}${entry.placeholder ? `<tspan fill="#a44716" font-weight="700">. Placeholder, not Dawa's</tspan>` : ''}</text>`,
    ];
    MOODS.forEach((mood, i) => {
      const x0 = 200 + i * 350;
      parts.push(`<rect x="${x0}" y="${y + 88}" width="330" height="70" fill="${mood.ground}"/>`);
      parts.push(
        `<text x="${x0 + 8}" y="${y + 104}" font-family="Helvetica, Arial" font-size="11" fill="${mood.ink}">${mood.name}</text>`,
      );
      parts.push(glyphAt(svg, x0 + 60, y + 111, 24, mood.ink));
      parts.push(glyphAt(svg, x0 + 110, y + 99, 48, mood.ink));
    });
    // 96 does not fit the 70px bands; it gets its own tiles on the right.
    parts.push(
      `<rect x="${WIDTH - 140}" y="${y + 8}" width="104" height="104" fill="#f6f0e3" stroke="#d3c9b8"/>`,
    );
    parts.push(glyphAt(svg, WIDTH - 136, y + 12, 96, '#1e1a17'));
    parts.push(`<rect x="${WIDTH - 260}" y="${y + 8}" width="104" height="104" fill="#132140"/>`);
    parts.push(glyphAt(svg, WIDTH - 256, y + 12, 96, '#f5eddb'));
    rows.push(parts.join(''));
    y += ROW;
  }
  const height = y + 90;
  const header =
    `<text x="20" y="44" font-family="Helvetica, Arial" font-size="28" font-weight="700" fill="#1e1a17">Glyphs traced for AstroTribes (0b, Sep 23 to 24, 2026)</text>` +
    `<text x="20" y="72" font-family="Helvetica, Arial" font-size="15" fill="#3b3430">Each row: the source crop, the trace at 24 and 48 on Paper and Night, and at 96 on the right. Alternates stay in staging until Dawa picks.</text>` +
    `<text x="20" y="94" font-family="Helvetica, Arial" font-size="15" fill="#3b3430">The Libra pick looks like a different hand (a marker-like line) from the brush set; Dawa may want to brush a new one.</text>`;
  const footer = `<text x="20" y="${height - 40}" font-family="Helvetica, Arial" font-size="16" fill="#a44716">Placeholders, made with an image tool and cleaned by Fable, not Dawa's: ${placeholderNames()}. They wait for Dawa's brush versions.</text>`;
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}"><rect width="100%" height="100%" fill="#ffffff"/>${header}${rows.join('')}${footer}</svg>`;
  writeFileSync(path.join(STAGING, 'contact-sheet.svg'), sheet);
  await sharp(Buffer.from(sheet)).png().toFile(path.join(STAGING, 'contact-sheet.png'));
}

async function main() {
  mkdirSync(PUBLIC, { recursive: true });
  mkdirSync(STAGING, { recursive: true });
  const results = [];
  for (const entry of GLYPHS) {
    const { name, svg, components } = await trace(entry);
    const dir = entry.alt ? STAGING : PUBLIC;
    const file = path.join(dir, `${name}.svg`);
    writeFileSync(file, svg);
    // Every trace, picks included, also goes to staging so Dawa's review set is complete.
    if (!entry.alt) writeFileSync(path.join(STAGING, `${name}.svg`), svg);
    const bytes = statSync(file).size;
    results.push({ entry, name, svg, bytes });
    console.log(
      `${name.padEnd(16)} ${entry.source.padEnd(6)} ${(bytes / 1024).toFixed(1).padStart(5)} KB  ${components} pieces`,
    );
  }
  await contactSheet(results);
  rmSync(TMP, { recursive: true, force: true });
  console.log(`Contact sheet: ${path.join(STAGING, 'contact-sheet.png')}`);
  console.log(`Placeholders awaiting Dawa's brush versions: ${placeholderNames()}`);
}

await main();
