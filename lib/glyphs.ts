// Registry for the brush glyphs. Traced SVGs live in public/glyphs/ (made by
// scripts/trace-glyphs.mjs, reviewed by Dawa one by one); a glyph without one
// renders its text symbol. A few are placeholders made with an image tool, not
// Dawa's: flagged here and never credited to him.

import { BODIES, SIGN_IDS, SIGNS, type BodyId, type SignId } from './keys';

export type GlyphId = SignId | BodyId;

export interface GlyphDef {
  id: GlyphId;
  /** Accessible name when the glyph stands alone. */
  label: string;
  /** Shown until an SVG exists: the Unicode symbol, forced to text presentation. */
  symbol: string;
  /** The traced SVG under public/, or null. */
  svg: string | null;
  /** True for a stand-in made with an image tool (not Dawa's), until he brushes his own. */
  placeholder: boolean;
  /** True once Dawa has approved this SVG. Flips one glyph at a time. */
  reviewed: boolean;
  /** Who drew it, for credits. Null for a placeholder or a symbol. */
  credit: 'Lama Dawa' | null;
  /** Optical size correction, fixed at the source during vectorizing when possible. */
  scale?: number;
  /** The South Node uses the North Node glyph turned 180 degrees until Dawa draws one. */
  rotate?: 180;
}

// U+FE0E asks for text presentation, so no platform swaps in an emoji.
const TEXT = '︎';

const SIGN_SYMBOLS: Record<SignId, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

const BODY_SYMBOLS: Record<BodyId, string> = {
  sun: '☉',
  moon: '☽',
  rising: 'AC',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  northNode: '☊',
  southNode: '☊',
  chiron: '⚷',
  galacticCenter: 'GC',
};

const withText = (symbol: string) => (symbol.length === 1 ? symbol + TEXT : symbol);

// Dawa's glyphs traced so far (0b, Sep 23): all 12 signs and 8 planets.
const BY_DAWA: ReadonlySet<GlyphId> = new Set<GlyphId>([
  ...SIGN_IDS,
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'neptune',
]);

// Placeholders (Sep 24), made with an image tool and cleaned by Fable, until
// Dawa brushes his own. Pluto uses the orb form; the PL form waits in staging.
const PLACEHOLDERS: ReadonlySet<GlyphId> = new Set<GlyphId>(['uranus', 'pluto', 'chiron']);

// The nodes, Rising, and the Galactic Center have no drawing yet.

/** None is reviewed yet: Dawa approves each traced glyph on the contact sheet. */
const REVIEWED: ReadonlySet<GlyphId> = new Set<GlyphId>();

function art(id: GlyphId) {
  const traced = BY_DAWA.has(id) || PLACEHOLDERS.has(id);
  return {
    svg: traced ? `/glyphs/${id}.svg` : null,
    placeholder: PLACEHOLDERS.has(id),
    reviewed: REVIEWED.has(id),
    credit: BY_DAWA.has(id) ? ('Lama Dawa' as const) : null,
  };
}

export const GLYPHS: Record<GlyphId, GlyphDef> = {
  ...(Object.fromEntries(
    Object.values(SIGNS).map((s) => [
      s.id,
      { id: s.id, label: s.name, symbol: withText(SIGN_SYMBOLS[s.id]), ...art(s.id) },
    ]),
  ) as Record<SignId, GlyphDef>),
  ...(Object.fromEntries(
    Object.values(BODIES).map((b) => [
      b.id,
      {
        id: b.id,
        label: b.name,
        symbol: withText(BODY_SYMBOLS[b.id]),
        ...art(b.id),
        ...(b.id === 'southNode' ? { rotate: 180 as const } : {}),
      },
    ]),
  ) as Record<BodyId, GlyphDef>),
};
