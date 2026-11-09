import files from './old-prints-files.json';
import type { SignId } from './keys';

/**
 * Old prints on the Tribe pages (4j, Dawa's Nov 7 notes; David, Nov 8), both public domain:
 *
 * - The constellation cards of "Urania's Mirror" (London, 1824), hand colored, one per zodiac
 *   constellation, from the Library of Congress scans on Wikimedia Commons. The stars on the cards
 *   were punched through, so they shone when the card was held up to a light.
 * - J. J. Grandville's engravings of the sky from "Un autre monde" (Paris, 1844), a stand-in for the
 *   humor section Dawa is writing. Eight plates for twelve Tribes, so a few are shared.
 *
 * The sources live in David's Drive ("Constellation plates (Urania's Mirror 1824)" and "Grandville
 * cartoons (1844)") and never enter git; `scripts/old-prints.mjs` trims the scan's page margin and
 * cuts AVIF and WebP into `public/old-prints/`. Shown whole and full strength, as framed pictures;
 * credited in the footer only, like every image (David, Nov 4).
 */
export interface OldPrint {
  /** The file's name in its Drive folder. */
  source: string;
  /** Its size in pixels, checked by the script. */
  size: readonly [number, number];
  /** What it shows, for alt text. */
  alt: string;
}

const card = (what: string) => `A hand-colored star card from 1824: ${what}`;

export const PLATES: Record<SignId, OldPrint> = {
  aries: { source: 'constellation-aries.jpg', size: [3588, 2509], alt: card('a leaping ram with golden horns, its stars marked on its body, and a small fly above it.') },
  taurus: { source: 'constellation-taurus.jpg', size: [3602, 2533], alt: card('a charging dark bull with long pale horns, its stars marked on its body.') },
  gemini: { source: 'constellation-gemini.jpg', size: [3568, 2494], alt: card('the twins sitting close, one with a lyre and one with a club, their stars marked.') },
  cancer: { source: 'constellation-cancer.jpg', size: [3280, 4690], alt: card('a large orange crab, its stars marked on its shell and claws.') },
  leo: { source: 'constellation-leo.jpg', size: [3305, 4709], alt: card('two lions, one above the other, their stars marked.') },
  virgo: { source: 'constellation-virgo.jpg', size: [3566, 2505], alt: card('a winged woman in a pink and green gown holding a palm frond, her stars marked.') },
  libra: { source: 'constellation-libra.jpg', size: [3586, 2506], alt: card('a pair of golden scales tilted across the sky, its stars marked.') },
  scorpio: { source: 'constellation-scorpio.jpg', size: [2494, 3573], alt: card('a green scorpion with its tail curled, its stars marked.') },
  sagittarius: { source: 'constellation-sagittarius.png', size: [3572, 2498], alt: card('a centaur drawing a bow, with a wreath, a telescope, and a microscope around him, his stars marked.') },
  capricorn: { source: 'constellation-capricornus.jpg', size: [3600, 2516], alt: card('a sea goat, a goat in front and a curled fish tail behind, its stars marked.') },
  aquarius: { source: 'constellation-aquarius.jpg', size: [3568, 2498], alt: card('a bearded man pouring water from a golden jar, with a fish and a balloon below, his stars marked.') },
  pisces: { source: 'constellation-pisces.jpg', size: [3567, 2497], alt: card('two fish tied together by a long ribbon, their stars marked.') },
};

const engraving = (what: string) => `An engraving from 1844: ${what}`;

export const CARTOONS = {
  'bubble-worlds': { source: 'grandville-bubble-worlds.jpg', size: [1837, 2025], alt: engraving('an old man in a turban and a small horned imp blow soap bubbles, and each bubble holds a little world.') },
  comet: { source: 'grandville-comet.jpg', size: [3279, 4308], alt: engraving('a comet as a lady in a long spotted gown sweeps across a night hung with starry chandeliers.') },
  eclipse: { source: 'grandville-eclipse.jpg', size: [2009, 2499], alt: engraving('telescopes on legs crowd a hill to watch the Moon slide across the Sun.') },
  'juggler-of-worlds': { source: 'grandville-juggler-of-worlds.jpg', size: [1716, 2319], alt: engraving('a wild-haired juggler standing on the clouds tosses planets into the air.') },
  moon: { source: 'grandville-moon.jpg', size: [2737, 3372], alt: engraving('the Moon as a sleeping baby on a purple cushion, floating above a quiet lake.') },
  'planet-bridge': { source: 'grandville-planet-bridge.jpg', size: [2166, 1470], alt: engraving('an iron bridge runs across space from one planet to the next.') },
  star: { source: 'grandville-star.jpg', size: [1944, 2016], alt: engraving('a star as a lady in a lace gown, leaning on a balcony of clouds, with light shining from her head.') },
  'sun-and-moon': { source: 'grandville-sun-and-moon.jpg', size: [2289, 2484], alt: engraving('the Sun dozes in bed under a heavy quilt while the Moon sits up on a cloud above him.') },
} as const satisfies Record<string, OldPrint>;

export type CartoonId = keyof typeof CARTOONS;

/** A cut print's id, as `oldPrintSet` takes it. */
export type OldPrintId = `plate-${SignId}` | `cartoon-${CartoonId}`;

/** Which engraving each Tribe page shows beside its smile. */
export const TRIBE_CARTOON: Record<SignId, CartoonId> = {
  aries: 'comet',
  taurus: 'sun-and-moon',
  gemini: 'juggler-of-worlds',
  cancer: 'moon',
  leo: 'star',
  virgo: 'eclipse',
  libra: 'planet-bridge',
  scorpio: 'bubble-worlds',
  sagittarius: 'comet',
  capricorn: 'eclipse',
  aquarius: 'juggler-of-worlds',
  pisces: 'bubble-worlds',
};

/** The widths cut, in pixels; a print narrower than one is cut at its own width instead. */
export const OLD_PRINT_WIDTHS = [384, 768] as const;

interface CutFile {
  src: string;
  bytes: number;
}
type PrintFiles = Record<string, { width: number; height: number; files: Record<string, { avif: CutFile; webp: CutFile }> }>;

const cuts = files as PrintFiles;

/** The srcsets, fallback, and size of one cut print, by its id (`plate-aries`, `cartoon-comet`). */
export function oldPrintSet(id: string) {
  const entry = cuts[id];
  const widths = Object.keys(entry.files)
    .map(Number)
    .sort((a, b) => a - b);
  const set = (format: 'avif' | 'webp') => widths.map((w) => `${entry.files[w][format].src} ${w}w`).join(', ');
  const widest = widths[widths.length - 1];
  return {
    avif: set('avif'),
    webp: set('webp'),
    fallback: entry.files[widest].webp.src,
    width: widest,
    height: Math.round((widest * entry.height) / entry.width),
  };
}
