// Renders the favicon and app icons from the sun and moon's icon mark (public/brand/glyph-icon-ink.svg
// and glyph-icon-rays.svg, 16 heavier rays so they hold at 32px): the crescent in the logo's deep
// plum and the rays in gold-500 on a Paper tile (David, Oct 21). Run by hand from repo/ after the
// mark changes: `node scripts/brand-icons.mjs`.

import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const PAPER = '#f6f0e3';
const PLUM = '#4a2150';
const GOLD = '#cf9a17';

const layer = (file) => readFileSync(`public/brand/${file}`, 'utf8');
const ink = layer('glyph-icon-ink.svg');
const rays = layer('glyph-icon-rays.svg');
const [, minX, minY, width, height] = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/
  .exec(ink)
  .map(Number);
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// The mark fills 88% of the tile, centred.
function tile(size) {
  const art = size * 0.88;
  const scale = art / Math.max(width, height);
  const x = (size - width * scale) / 2 - minX * scale;
  const y = (size - height * scale) / 2 - minY * scale;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<rect width="${size}" height="${size}" rx="${size * 0.144}" fill="${PAPER}"/>` +
      `<g transform="translate(${x} ${y}) scale(${scale})">` +
      `<g color="${GOLD}">${inner(rays)}</g><g color="${PLUM}">${inner(ink)}</g></g></svg>`,
  );
}

const png = (size) =>
  sharp(tile(size), { density: 72 }).png({ compressionLevel: 9, palette: true }).toBuffer();

/** An .ico holding one PNG image, which every current browser reads. */
function ico(image, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(image.length, 14);
  header.writeUInt32LE(22, 18); // offset to the image
  return Buffer.concat([header, image]);
}

const files = {
  'app/icon1.png': await png(32),
  'app/icon2.png': await png(192),
  'app/apple-icon.png': await png(180),
  'app/favicon.ico': ico(await png(32), 32),
};
for (const [file, data] of Object.entries(files)) {
  writeFileSync(file, data);
  console.log(`${file.padEnd(20)} ${(data.length / 1024).toFixed(1)} KB`);
}
