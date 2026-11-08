import files from './tribe-paintings-files.json';
import type { SignId } from './keys';

/**
 * Kirstie Connon's twelve Tribe paintings (acrylic on canvas, 2026), one per sign, each the sign's
 * animal or figure over her mandala, with the glyph at the top and her "KC 2026" mark at the lower
 * right. Dawa traded readings for them and asked for them on the Tribe pages, with Jane Kwan's art
 * still the leading look (Oct 28); David supplied the files on Nov 3, saved from the Lovable site.
 *
 * Each one is a framed subject on its Tribe page, full strength, never hidden by None, and credited
 * on the page under the image (the rule for art that is the subject). The sources stay outside the
 * repo; `scripts/tribe-paintings.mjs` cuts them square and writes `lib/tribe-paintings-files.json`.
 */
export const TRIBE_PAINTING_CREDIT = 'Kirstie Connon';
export const TRIBE_PAINTING_YEAR = 2026;

export interface TribePainting {
  /** The source file's name in the folder the script reads. */
  source: string;
  /** Its size in pixels, checked by the script. */
  size: readonly [number, number];
  /** What the painting shows, for alt text. */
  alt: string;
}

export const TRIBE_PAINTINGS: Record<SignId, TribePainting> = {
  aries: { source: 'aries.jpg', size: [3300, 3300], alt: 'A ram’s head with great curled horns over a red mandala.' },
  taurus: { source: 'taurus.jpg', size: [3300, 3300], alt: 'A bull with long pale horns over a green mandala.' },
  gemini: { source: 'gemini.jpg', size: [3300, 3300], alt: 'Two faces in profile, eyes closed, turned away from each other over a pale blue mandala.' },
  cancer: { source: 'cancer.jpg', size: [3000, 3000], alt: 'A blue crab with raised claws over a blue mandala.' },
  leo: { source: 'leo.jpg', size: [3000, 3000], alt: 'A lion’s face with a golden mane over a red mandala.' },
  virgo: { source: 'virgo.jpg', size: [3000, 3000], alt: 'A woman with a laurel crown in her hair, eyes lowered, over a green mandala.' },
  libra: { source: 'libra.jpg', size: [2956, 3000], alt: 'A pair of golden scales over a lavender mandala.' },
  scorpio: { source: 'scorpio.jpg', size: [2748, 2793], alt: 'A blue scorpion, its tail curled, over a deep blue mandala.' },
  sagittarius: { source: 'sagittarius.jpg', size: [2873, 2949], alt: 'A centaur drawing a bow over a pink mandala.' },
  capricorn: { source: 'capricorn.jpg', size: [2660, 2685], alt: 'A mountain goat with curled horns over a dark green mandala.' },
  aquarius: { source: 'aquarius.png', size: [1272, 1264], alt: 'A figure pouring water from a jar, in blues.' },
  pisces: { source: 'pisces.jpg', size: [3000, 3000], alt: 'Two fish circling each other, in pale blues.' },
};

/** The widths cut, in pixels; a painting smaller than one is cut at its own size instead. */
export const TRIBE_PAINTING_WIDTHS = [384, 768] as const;

interface CutFile {
  src: string;
  bytes: number;
}
type PaintingFiles = Record<SignId, { size: number; files: Record<string, { avif: CutFile; webp: CutFile }> }>;

const cuts = files as PaintingFiles;

/** The srcsets and fallback for one painting (square, so one number is its width and height). */
export function tribePaintingSet(sign: SignId) {
  const entry = cuts[sign];
  const widths = Object.keys(entry.files)
    .map(Number)
    .sort((a, b) => a - b);
  const set = (format: 'avif' | 'webp') => widths.map((w) => `${entry.files[w][format].src} ${w}w`).join(', ');
  const widest = widths[widths.length - 1];
  return { avif: set('avif'), webp: set('webp'), fallback: entry.files[widest].webp.src, size: widest };
}
