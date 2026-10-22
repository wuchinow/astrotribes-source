// Jane Kwan's art: the manifest. Every piece the site can show is listed here, and nothing renders a
// piece that is not (tests/art-crop.test.ts). Boxes are in the source file's pixels, [x, y, width,
// height], marked by eye on the part A picks page (staging/26.9.25 - 1e art picks/, confirmed by
// David on Sep 25). Sources stay in ~/Developer/astrotribes/reference and never enter git;
// scripts/art.mjs cuts the web files in public/art/ from them.
//
// Two modes. A wash is wallpaper: behind a page or section at the visitor's wash strength, hidden
// by None, and credited in the footer. A framed piece is the subject: full strength, never hidden,
// with its caption. None is approved to appear yet (open decision 6), so every piece is a flagged
// placeholder on the noindex site.

import type { SignId } from './keys';

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
  /** The file in reference/jane's art/. */
  source: string;
  /** Source size in pixels. */
  size: readonly [width: number, height: number];
  /** The part of the photograph that is the artwork. */
  crop: Box;
  marks: readonly ArtMark[];
  approved: false;
  caption: 'Painting by Jane Kwan' | 'Collage by Jane Kwan' | 'Calligraphy by Jane Kwan';
  alt: string;
  orientation: 'confirmed' | 'unconfirmed';
  source_note?: 'web-size file; ask Jane for the original';
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

const WEB_SIZE = 'web-size file; ask Jane for the original' as const;

export const WASHES = {
  h: {
    p: null,
    stem: 'h-ink-wash',
    source: 'IMG_9821 1.png',
    size: [1447, 1138],
    crop: [0, 0, 1447, 1138],
    marks: [],
    mode: 'wash',
    name: 'Ink wash',
    alt: 'Grey and violet ink bleeding across pale paper, with a few black drops',
    caption: 'Painting by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    cuts: { crop: { box: [0, 0, 1447, 1138], widths: [1440, 720, 160] } },
    use: { sm: 'crop', lg: 'crop', strip: 'crop', thumb: 'crop', texture: 'crop' },
  },
  p6: {
    p: 'P6',
    stem: 'p6-characters',
    source: 'IMG-2460-1.jpg 1.png',
    size: [1298, 2048],
    crop: [13, 10, 1220, 1956],
    marks: [],
    mode: 'wash',
    name: 'Brushed characters',
    alt: 'Columns of black brushed characters over washes of red and blue watercolor, with gold flecks',
    caption: 'Calligraphy by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [13, 10, 1220, 1956], widths: [720, 160] },
      // A landscape band for wide regions, so a desktop screen does not load the whole tall sheet.
      wide: { box: [13, 610, 1220, 760], widths: [1220] },
    },
    use: { sm: 'crop', lg: 'wide', strip: 'wide', thumb: 'crop', texture: 'wide' },
  },
  p7: {
    p: 'P7',
    stem: 'p7-gold-collage',
    source: 'IMG-1025.jpg 1.png',
    size: [1494, 2048],
    crop: [0, 10, 1464, 2038],
    marks: [
      { kind: 'seal', label: 'Two seals, upper right', box: [1240, 184, 179, 308] },
      { kind: 'seal', label: 'Three seals, left column', box: [15, 881, 194, 614] },
      { kind: 'seal', label: 'Oval seal, center left', box: [463, 1147, 90, 184] },
      { kind: 'seal', label: 'Two seals, lower right', box: [1150, 1556, 165, 205] },
      { kind: 'seal', label: 'Seal, bottom left', box: [75, 1802, 164, 185] },
      { kind: 'signature', label: 'Handwritten numerals, bottom right', box: [1360, 1823, 97, 205] },
      { kind: 'signature', label: 'Handwritten numerals on a scrap, top', box: [896, 41, 75, 184] },
    ],
    mode: 'wash',
    name: 'Gold collage',
    alt: 'A large black brushed character on torn white paper over gold, with red seals and newspaper scraps',
    caption: 'Collage by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [0, 10, 1464, 2038], widths: [] },
      // David, Sep 25: the clean wide window at desktop widths, the clean tall window on phones.
      wide: { box: [0, 700, 1464, 800], widths: [1440] },
      tall: { box: [0, 10, 1141, 2038], widths: [720] },
      // The heart of the sheet with no mark inside, for strips and the panel thumbnail.
      free: { box: [210, 226, 939, 920], widths: [720, 160] },
    },
    use: { sm: 'tall', lg: 'wide', strip: 'free', thumb: 'free', texture: 'free' },
    // David, Sep 25 evening: Contact keeps P7 on Paper; on Night the gold collage lays a warm veil
    // over the navy, so the page shows P9 there. A visitor's own pick still wins.
    night: 'p9',
  },
  p9: {
    p: 'P9',
    stem: 'p9-leaves',
    source: 'IMG-2465-1.jpg 1.png',
    size: [1432, 2048],
    crop: [0, 0, 1375, 2048],
    marks: [
      { kind: 'seal', label: 'Two seals, top right', box: [931, 246, 172, 327] },
      { kind: 'seal', label: 'Seal, bottom left, on the collage strip', box: [186, 1536, 143, 184] },
    ],
    mode: 'wash',
    name: 'Leaves',
    alt: 'One sweeping black brushstroke with skeleton leaves and gold flecks on white paper',
    caption: 'Calligraphy by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    cuts: {
      crop: { box: [0, 0, 1375, 2048], widths: [] },
      wide: { box: [0, 660, 1375, 751], widths: [1375, 720, 160] },
      tall: { box: [0, 0, 1147, 2048], widths: [720] },
    },
    use: { sm: 'tall', lg: 'wide', strip: 'wide', thumb: 'wide', texture: 'wide' },
  },
  p10: {
    p: 'P10',
    stem: 'p10-ink-on-grey',
    source: 'IMG_9820 1.png',
    size: [1512, 2016],
    // Drops the dish at the top-right edge and the table past the paper (part A, with the 30px
    // pull-in at the bottom right).
    crop: [0, 222, 1285, 1794],
    marks: [],
    mode: 'wash',
    name: 'Ink on grey',
    alt: 'Large black ink masses on grey paper, with one red stroke and touches of teal and blue',
    caption: 'Painting by Jane Kwan',
    approved: false,
    // Portrait as stored; it may have been photographed sideways. Jane settles it.
    orientation: 'unconfirmed',
    cuts: {
      crop: { box: [0, 222, 1285, 1794], widths: [720, 160] },
      // A landscape band through the red stroke and the largest mass, for wide regions.
      wide: { box: [0, 600, 1285, 800], widths: [1285] },
    },
    use: { sm: 'crop', lg: 'wide', strip: 'wide', thumb: 'crop', texture: 'wide' },
  },
} as const satisfies Record<WashKey, WashPiece>;

export const FRAMED = {
  p1: {
    p: 'P1',
    stem: 'p1-night-hill',
    source: 'IMG_2454.jpg 1.png',
    size: [1013, 1024],
    crop: [0, 8, 1013, 998],
    marks: [],
    mode: 'framed',
    alt: 'A navy and near-black hill under a pale swirling sky, flecked with ochre and orange',
    caption: 'Painting by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    source_note: WEB_SIZE,
    cuts: { crop: { box: [0, 8, 1013, 998], widths: [1013, 506] } },
    maxCssWidth: 506,
  },
  p2: {
    p: 'P2',
    stem: 'p2-black-arch',
    source: 'P1160515-1-scaled.jpg 1.png',
    size: [1024, 493],
    crop: [0, 0, 1024, 493],
    marks: [],
    mode: 'framed',
    alt: 'Thick strokes of pink, violet, and red around a black arch, with white splashes',
    caption: 'Painting by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    source_note: WEB_SIZE,
    // David, Sep 25: across the Tribe grid it shows at 1x on wide screens; the full 1024 is served.
    cuts: { crop: { box: [0, 0, 1024, 493], widths: [1024, 512] } },
    maxCssWidth: 1024,
  },
  p3: {
    p: 'P3',
    stem: 'p3-yellow-lavender',
    source: 'P1160514-scaled.jpg 1.png',
    size: [1024, 441],
    crop: [0, 0, 1024, 441],
    marks: [],
    mode: 'framed',
    alt: 'Yellow at the top right, lavender and white across the middle, dark red at the left',
    caption: 'Painting by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    source_note: WEB_SIZE,
    cuts: { crop: { box: [0, 0, 1024, 441], widths: [1024, 512] } },
    maxCssWidth: 512,
  },
  p4: {
    p: 'P4',
    stem: 'p4-tissue-hills',
    source: 'P1260084-1.jpg 1.png',
    size: [640, 480],
    crop: [0, 0, 640, 480],
    marks: [],
    mode: 'framed',
    alt: 'Blue and green tissue paper over cream, crossed by black brush strokes',
    caption: 'Collage by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    source_note: WEB_SIZE,
    cuts: { crop: { box: [0, 0, 640, 480], widths: [640, 320] } },
    maxCssWidth: 320,
  },
  p5: {
    p: 'P5',
    stem: 'p5-enso',
    source: 'P1260073-1.jpg 1.png',
    size: [421, 561],
    crop: [0, 0, 421, 561],
    marks: [
      { kind: 'seal', label: 'Seal, top', box: [181, 39, 72, 62] },
      { kind: 'seal', label: 'Seal, inside the circle', box: [202, 123, 93, 113] },
    ],
    mode: 'framed',
    alt: 'A black ink circle with a red seal inside it, over blue and green paper hills',
    caption: 'Collage by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    source_note: WEB_SIZE,
    cuts: { crop: { box: [0, 0, 421, 561], widths: [421, 210] } },
    maxCssWidth: 210,
  },
  p8: {
    p: 'P8',
    stem: 'p8-character-rubbing',
    source: 'P1190232-1.jpg 1.png',
    size: [453, 639],
    crop: [0, 0, 453, 639],
    marks: [],
    mode: 'framed',
    alt: 'A black brushed character over a red rubbing, with gold flecks on cream',
    caption: 'Calligraphy by Jane Kwan',
    approved: false,
    orientation: 'confirmed',
    source_note: WEB_SIZE,
    cuts: { crop: { box: [0, 0, 453, 639], widths: [453, 226] } },
    maxCssWidth: 226,
  },
} as const satisfies Record<string, FramedPiece>;

/**
 * The 12 Tribe cards' images (1h): each a 2:1 window into P2's served cut (1024 by 493), a different
 * window per card, until Jane's sign paintings arrive. One file for all twelve, shown by
 * background-position, so the grid adds no bytes. P2 has no seal or signature; tests/art-crop.test.ts
 * still checks every window against its marks and that no two windows share more than a quarter.
 */
export const TRIBE_CROPS = {
  aries: [0, 300, 256, 128],
  taurus: [220, 290, 256, 128],
  gemini: [560, 0, 256, 128],
  cancer: [768, 170, 256, 128],
  leo: [290, 0, 256, 128],
  virgo: [768, 365, 256, 128],
  libra: [520, 200, 256, 128],
  scorpio: [330, 140, 256, 128],
  sagittarius: [0, 40, 256, 128],
  capricorn: [90, 170, 256, 128],
  aquarius: [768, 0, 256, 128],
  pisces: [512, 365, 256, 128],
} as const satisfies Record<SignId, Box>;

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
