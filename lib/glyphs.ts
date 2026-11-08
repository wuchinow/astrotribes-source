// Registry for the brush glyphs. Traced SVGs live in public/glyphs/ (made by
// scripts/trace-glyphs.mjs, reviewed by Dawa one by one); a glyph without one
// renders its text symbol. A few are stand-ins, not Dawa's: flagged here as
// placeholders and never credited to him.

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
  /** True for a stand-in (not Dawa's), until he brushes his own. */
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

// Dawa's glyphs traced so far: all 12 signs and 8 planets (0b, Sep 23), and his
// Uranus and Pluto (Nov 8, from his Apr 10 photos, found in Drive). Libra is
// his drawing thickened by scripts/bold-glyph.py (Nov 4) to the weight of the rest, as he
// asked, until his own bolder Libra file arrives.
const BY_DAWA: ReadonlySet<GlyphId> = new Set<GlyphId>([
  ...SIGN_IDS,
  // His Sun, closed and thickened by scripts/sun-standin.py (Nov 6, his Nov 5
  // note: too light, and the gap is confusing) until he repaints it.
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
]);

// Placeholders until Dawa brushes his own. Chiron (Sep 24) was made with an
// image tool and cleaned by Fable; David kept it over a version built from
// Dawa's strokes (Nov 8). Uranus and Pluto were stand-ins too until his own
// were found Nov 8. The North Node was drawn by
// scripts/brush-glyphs.py in the manner of Dawa's set (David, Nov 4), and the
// South Node turns the North Node's over, as its symbol does. The Galactic
// Center is traced from the brushed starburst on the old Lovable site (Nov 6,
// asked for at the Nov 4 call). Best guess it is Dawa's, but nobody has said
// so, so it stays a placeholder and uncredited until he confirms. The Rising
// (the Sun's half disc on the horizon, with rays) was drawn by the same script
// on Nov 8, when David saw the homepage Rising card had none.
const PLACEHOLDERS: ReadonlySet<GlyphId> = new Set<GlyphId>([
  'rising',
  'chiron',
  'northNode',
  'southNode',
  'galacticCenter',
]);

/** The file each glyph is drawn from, where it is not its own. */
const SHARED_FILE: Partial<Record<GlyphId, GlyphId>> = { southNode: 'northNode' };

/** None is reviewed yet: Dawa approves each traced glyph on the contact sheet. */
const REVIEWED: ReadonlySet<GlyphId> = new Set<GlyphId>();

function art(id: GlyphId) {
  const traced = BY_DAWA.has(id) || PLACEHOLDERS.has(id);
  return {
    svg: traced ? `/glyphs/${SHARED_FILE[id] ?? id}.svg` : null,
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

/**
 * Whether a glyph has a drawing to show: Dawa's, or a stand-in until he brushes his own. Dawa asked on
 * Nov 7 for every planet's glyph on the 28 Keys page, Uranus and Pluto included, so the stand-ins show
 * wherever the wheel shows them, still uncredited. Rising has none.
 */
export const drawn = (id: GlyphId): boolean => GLYPHS[id].svg !== null;
