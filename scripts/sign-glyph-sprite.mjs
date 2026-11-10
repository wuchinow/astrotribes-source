// Writes lib/sign-glyph-sprite.json: the twelve sign glyphs' drawings, read out of public/glyphs/,
// for the hero wheel (4z). The wheel draws them from the page itself instead of twelve files, so
// they are there at first paint on a first visit (components/SignGlyphSprite.tsx). Run by hand
// after any sign glyph is traced or changed: node scripts/sign-glyph-sprite.mjs.
// tests/landing/tribe-wheel.test.ts fails until it is.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

/** The `<g id="glyph">` of a traced glyph file: its transform and each path's data (and its fill rule, when it names one). */
function readGlyph(svg) {
  const group = /<g id="glyph"(?: transform="([^"]*)")?>([\s\S]*)<\/g>\s*<\/svg>\s*$/.exec(svg);
  if (!group) throw new Error('no <g id="glyph"> found');
  const PATH = /<path( fill-rule="evenodd")? d="([^"]*)"\s*\/>/g;
  const paths = [...group[2].matchAll(PATH)].map((m) => (m[1] ? { d: m[2], evenodd: true } : { d: m[2] }));
  if (paths.length === 0 || group[2].replace(PATH, '').trim() !== '') {
    throw new Error('the glyph group holds something other than plain paths');
  }
  return { transform: group[1] ?? null, paths };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(root, 'scripts/sign-glyph-sprite.mjs')) {
  const sprite = Object.fromEntries(
    SIGNS.map((sign) => [sign, readGlyph(readFileSync(path.join(root, 'public/glyphs', `${sign}.svg`), 'utf8'))]),
  );
  writeFileSync(path.join(root, 'lib/sign-glyph-sprite.json'), `${JSON.stringify(sprite)}\n`);
  console.log(`lib/sign-glyph-sprite.json: ${SIGNS.length} glyphs`);
}
