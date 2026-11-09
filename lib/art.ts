// The site's paintings: the manifest. Every piece the site can show is listed here, and nothing renders
// a piece that is not (tests/art-crop.test.ts). Since Nov 8 (David) they are public domain Chinese and
// Japanese ink landscapes from museum open-access collections, in place of the earlier art: landscape
// and nature only, no people as the subject and no faces. Boxes are in the source file's pixels,
// [x, y, width, height], marked by eye, each crop inside the painting (no mount or brocade) and clear
// of its seals and inscriptions. Sources live in Drive (AstroTribes 2.0 > Art/Design > Asian public
// domain images) and never enter git; scripts/art.mjs cuts the web files in public/art/ from them.
//
// Two modes. A wash is wallpaper: behind a page or section at the visitor's wash strength, hidden
// by None, and credited in the footer. A framed piece is the subject: full strength, never hidden.
// David picks where each goes after seeing them live (Nov 8), so every piece stays flagged.


export type Box = readonly [x: number, y: number, width: number, height: number];

export interface ArtMark {
  kind: 'seal' | 'signature';
  label: string;
  box: Box;
}

/**
 * A cut of the piece the site serves. How it renders follows from the marks: a cut with no mark
 * inside it may be cropped further by `cover`; a cut that holds a mark renders whole, full width,
 * never cropped, so the mark stays whole (lib/art-assets.ts).
 */
export interface ArtCut {
  box: Box;
  /** Widths of the web files, in pixels. Never wider than the box. */
  widths: readonly number[];
}

type WashCuts = 'crop' | 'wide' | 'tall' | 'free';

interface ArtBase {
  /** David's number for the piece; null for today's hero, which predates the numbering. */
  p: `P${number}` | null;
  /** Web file stem: public/art/<stem>/. */
  stem: string;
  /** The file in the Drive folder (asian-<artist>-<title>.jpg). */
  source: string;
  /** Source size in pixels. */
  size: readonly [width: number, height: number];
  /** The part of the photograph that is the artwork. */
  crop: Box;
  marks: readonly ArtMark[];
  approved: false;
  /** Artist and title as the file names them, for the About page and the credits. */
  caption: string;
  alt: string;
  orientation: 'confirmed' | 'unconfirmed';
}

/** The wash pieces' ids, typed ahead of the manifest so a piece can name another. */
type WashKey = 'h' | 'p6' | 'p7' | 'p9' | 'p10';

export interface WashPiece extends ArtBase {
  mode: 'wash';
  /** Short visible name in the Appearance panel. */
  name: string;
  cuts: Partial<Record<WashCuts, ArtCut>> & { crop: ArtCut };
  /**
   * Which cut fills a region on a phone (below 768px) and from 768px up, the card strip, the panel
   * swatch, and a texture. The texture cut holds no seal or signature, so any crop of it is safe
   * (tests/art-crop.test.ts).
   */
  use: { sm: WashCuts; lg: WashCuts; strip: WashCuts; thumb: WashCuts; texture: WashCuts };
  /** Where this piece is a page's own painting, Night shows this one instead (1f). */
  night?: WashKey;
}

export interface FramedPiece extends ArtBase {
  mode: 'framed';
  cuts: { crop: ArtCut };
  /** The widest it may render, in CSS pixels: half the cropped width, so it is sharp at 2x. */
  maxCssWidth: number;
}

export type ArtPiece = WashPiece | FramedPiece;

export const WASHES = {
  h: {
    p: null,
    stem: 'h-misty-river',
    source: 'asian-motonobu-ink-landscape.jpg',
    size: [3000, 2058],
    crop: [60, 250, 2670, 1560],
    marks: [{ kind: 'seal', label: 'Seal, bottom right', box: [2740, 1700, 160, 140] }],
    mode: 'wash',
    name: 'Misty river',
    alt: 'Ink mountains in mist over a wide river, with willows on an island and two small boats',
    caption: 'Ink landscape, Motonobu',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [60, 250, 2670, 1560], widths: [1440, 720, 160] } },
    use: { sm: 'crop', lg: 'crop', strip: 'crop', thumb: 'crop', texture: 'crop' },
  },
  p6: {
    p: 'P6',
    stem: 'p6-autumn-mist',
    source: 'asian-bian-wenyu-streams-and-mountains-in-autumn-mist.jpg',
    size: [2000, 975],
    crop: [0, 40, 2000, 870],
    marks: [],
    mode: 'wash',
    name: 'Autumn mist',
    alt: 'Grey ink hills folding back into mist, with pines on the ridges and willows by the water',
    caption: 'Streams and Mountains in Autumn Mist, Bian Wenyu',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [0, 40, 2000, 870], widths: [720] },
      // The Oracle stage reads the wide window (tests/oracle/stage-contrast.test.ts).
      wide: { box: [0, 40, 2000, 870], widths: [1440, 160] },
      // The mountains alone, for a phone.
      tall: { box: [700, 40, 800, 870], widths: [720] },
    },
    use: { sm: 'tall', lg: 'wide', strip: 'wide', thumb: 'wide', texture: 'wide' },
  },
  p7: {
    p: 'P7',
    stem: 'p7-clouds-river',
    source: 'asian-shen-zhou-clouds-over-the-river.jpg',
    size: [3000, 1822],
    crop: [0, 110, 3000, 1600],
    marks: [],
    mode: 'wash',
    name: 'Clouds over the river',
    alt: 'Soft blue peaks above low clouds, a quiet river, leaning trees, and a thatched hut on the bank',
    caption: 'Clouds over the River, Shen Zhou',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [0, 110, 3000, 1600], widths: [] },
      wide: { box: [0, 110, 3000, 1600], widths: [1440, 160] },
      // The trees and the hut, for a phone.
      tall: { box: [1700, 110, 1300, 1600], widths: [720] },
    },
    use: { sm: 'tall', lg: 'wide', strip: 'wide', thumb: 'wide', texture: 'wide' },
    // On Night the page shows P9 (David, Sep 25 evening); a visitor's own pick still wins.
    night: 'p9',
  },
  p9: {
    p: 'P9',
    stem: 'p9-eight-views',
    source: 'asian-tsunenobu-eight-views-of-xiao-and-xiang.jpg',
    size: [4000, 1723],
    crop: [0, 50, 2560, 1530],
    marks: [
      { kind: 'seal', label: 'Two seals, lower middle', box: [2570, 1270, 200, 250] },
      { kind: 'seal', label: 'Seal, right edge', box: [3830, 1150, 170, 200] },
    ],
    mode: 'wash',
    name: 'Eight views',
    alt: 'A rocky island with a temple rising out of clouds, low hills and a bridge below in pale ink',
    caption: 'Eight Views of Xiao and Xiang, Tsunenobu',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [0, 50, 2560, 1530], widths: [] },
      wide: { box: [0, 50, 2560, 1530], widths: [1440, 720, 160] },
      // The island and the temple, for a phone.
      tall: { box: [900, 50, 1300, 1530], widths: [720] },
    },
    use: { sm: 'tall', lg: 'wide', strip: 'wide', thumb: 'wide', texture: 'wide' },
  },
  p10: {
    p: 'P10',
    stem: 'p10-winter-landscape',
    source: 'asian-xie-shichen-winter-landscape.jpg',
    size: [3000, 771],
    crop: [0, 0, 3000, 771],
    marks: [],
    mode: 'wash',
    name: 'Winter landscape',
    alt: 'Snowy cliffs and pines in grey ink, with pavilions and a long wooden bridge across a gorge',
    caption: 'Winter Landscape, Xie Shichen',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [0, 0, 3000, 771], widths: [1440, 160] },
      wide: { box: [0, 0, 3000, 771], widths: [] },
      // The bridge and the pavilions, for a phone.
      tall: { box: [800, 0, 1000, 771], widths: [720] },
    },
    use: { sm: 'tall', lg: 'crop', strip: 'crop', thumb: 'crop', texture: 'crop' },
  },
} as const satisfies Record<WashKey, WashPiece>;

export const FRAMED = {
  p1: {
    p: 'P1',
    stem: 'p1-moon-pine',
    source: 'asian-rosetsu-moonlit-landscape.jpg',
    size: [1881, 4000],
    crop: [190, 1000, 1510, 2880],
    marks: [{ kind: 'signature', label: 'Signature and two seals, top left', box: [245, 240, 230, 720] }],
    mode: 'framed',
    alt: 'A full moon glowing through mist above a dark mountain and a windswept pine',
    caption: 'Moonlit Landscape, Rosetsu',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [190, 1000, 1510, 2880], widths: [755, 378] } },
    maxCssWidth: 755,
  },
  p2: {
    p: 'P2',
    stem: 'p2-streams-mountains',
    source: 'asian-anonymous-streams-and-mountains-without-end.jpg',
    size: [3400, 525],
    crop: [0, 0, 3400, 525],
    marks: [],
    mode: 'framed',
    alt: 'A long handscroll of hills, trees, and water receding into the distance in pale ink',
    caption: 'Streams and Mountains without End, anonymous',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [0, 0, 3400, 525], widths: [1700, 850] } },
    maxCssWidth: 1700,
  },
  p3: {
    p: 'P3',
    stem: 'p3-small-landscape',
    source: 'asian-chikuden-small-landscape-in-ink.jpg',
    size: [4000, 2998],
    // The valley below the poem, clear of the seals at the right edge.
    crop: [360, 1300, 3140, 1400],
    marks: [],
    mode: 'framed',
    alt: 'A valley of pines, hills, and a village by a river, in ink on warm golden silk',
    caption: 'Small Landscape in Ink, Chikuden',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [360, 1300, 3140, 1400], widths: [1570, 785] } },
    maxCssWidth: 1570,
  },
  p4: {
    p: 'P4',
    stem: 'p4-clearing-rain',
    source: 'asian-wang-hui-clearing-after-rain.jpg',
    size: [2128, 4000],
    // The mountains and trees between the inscription and the lower seals.
    crop: [330, 700, 1460, 2600],
    marks: [],
    mode: 'framed',
    alt: 'Ink mountains and clustered trees after rain, with a path winding up between them',
    caption: 'Clearing after Rain, Wang Hui',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [330, 700, 1460, 2600], widths: [730, 365] } },
    maxCssWidth: 730,
  },
  p5: {
    p: 'P5',
    stem: 'p5-enso',
    source: 'asian-taido-enso.jpg',
    size: [6540, 3137],
    // The circle alone, without the calligraphy at its left or the seal at its right.
    crop: [3450, 300, 2450, 2450],
    marks: [],
    mode: 'framed',
    alt: 'A single black brushed circle on pale paper',
    caption: 'Enso, Taido',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [3450, 300, 2450, 2450], widths: [448, 224] } },
    maxCssWidth: 1225,
  },
  p8: {
    p: 'P8',
    stem: 'p8-moonlight',
    source: 'asian-yogetsu-landscape-in-the-moonlight.jpg',
    size: [2667, 4000],
    crop: [535, 600, 1395, 3200],
    marks: [],
    mode: 'framed',
    alt: 'A pale moon over a steep cliff, a village among pines, and reeds by the water below',
    caption: 'Landscape in the Moonlight, Yogetsu',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [535, 600, 1395, 3200], widths: [697, 348] } },
    maxCssWidth: 697,
  },
} as const satisfies Record<string, FramedPiece>;

export type WashId = keyof typeof WASHES;
export type FramedId = keyof typeof FRAMED;
export type ArtId = WashId | FramedId;

/**
 * A texture (1f): the page's own painting behind a section at wash-art x wash-texture (6% at the
 * default), as ground rather than art, so text may sit on it. Each crop is a zoom into the piece's
 * texture cut, which holds no mark: `scale` enlarges the cut (at least 1, so it always covers the
 * section) about `origin`, a point given as percentages of the section.
 */
export const TEXTURE_CROPS = {
  a: { scale: 1.8, origin: [15, 80] },
  b: { scale: 2.2, origin: [85, 20] },
} as const satisfies Record<string, { scale: number; origin: readonly [number, number] }>;

export type TextureCrop = keyof typeof TEXTURE_CROPS;

/** The washes in the order the Appearance panel offers them. */
export const WASH_IDS = ['h', 'p6', 'p7', 'p9', 'p10'] as const satisfies readonly WashId[];

export const ART: Record<ArtId, ArtPiece> = { ...WASHES, ...FRAMED };

export const isWashId = (value: string): value is WashId => value in WASHES;

/** True when the box lies entirely inside the cut. */
const inside = (a: Box, b: Box) => a[0] >= b[0] && a[1] >= b[1] && a[0] + a[2] <= b[0] + b[2] && a[1] + a[3] <= b[1] + b[3];
/** True when the two boxes share any area. */
const overlaps = (a: Box, b: Box) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

/** A mark the cut's edge passes through. The crop test fails on any. */
export const marksCut = (piece: ArtPiece, cut: Box): ArtMark[] =>
  piece.marks.filter((mark) => overlaps(mark.box, cut) && !inside(mark.box, cut));

/** A cut with no mark inside may be cropped further (cover); one that holds a mark renders whole. */
export const cutIsFree = (piece: ArtPiece, cut: Box): boolean => !piece.marks.some((mark) => overlaps(mark.box, cut));

/**
 * The pieces a section backdrop may show (4m, David, Nov 8): an ink landscape beside a section's text, or
 * across the footer's top edge, laid with cover. Cover may crop anywhere, so only cuts with no seal or
 * signature in them are listed (tests/art-crop.test.ts). The hero's misty river is left out: its cut
 * holds its seal. Each names its phone and desktop cuts.
 */
export const BACKDROP_ART = {
  p1: { sm: 'crop', lg: 'crop' },
  p4: { sm: 'crop', lg: 'crop' },
  p6: { sm: 'tall', lg: 'wide' },
  p7: { sm: 'tall', lg: 'wide' },
  p8: { sm: 'crop', lg: 'crop' },
  p9: { sm: 'tall', lg: 'wide' },
  p10: { sm: 'tall', lg: 'crop' },
} as const satisfies Partial<Record<ArtId, { sm: string; lg: string }>>;

export type BackdropArtId = keyof typeof BACKDROP_ART;
