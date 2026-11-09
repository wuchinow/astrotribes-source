import files from './zodiac-jade-files.json';
import type { ChineseSign } from './chinese-zodiac';

type Animal = ChineseSign['animal'];

/**
 * The Chinese zodiac animals on Your chart (4p, David, Nov 9: "certainly an image of the animal, but
 * also perhaps the chinese character to go with it"). Twelve small nephrite figures carved in China in
 * the 18th or 19th century, The Metropolitan Museum of Art, "Twelve animals of the Chinese zodiac",
 * 02.18.730a–l, public domain (the Met's Open Access). David picked the jade set over brush paintings,
 * which came in too many styles to read as one family, with the backgrounds removed.
 *
 * The front view of each figure was cut out on David's Mac (transparent PNG, kept in Drive and Notion
 * as "Chinese zodiac jade"); the sources never enter git. `scripts/zodiac-jade.mjs` trims each to the
 * figure and cuts AVIF and WebP with their transparency into `public/zodiac-jade/`. Credited in the
 * footer only, like every image (David, Nov 4).
 *
 * The characters are the traditional forms, as the Oracle's hexagram names are; they render in Noto
 * Serif TC Bold cut to these twelve by `scripts/hanzi-font.mjs`.
 */
export interface ZodiacJade {
  /** The cutout's file name. */
  source: string;
  /** The animal's character, traditional form. */
  hanzi: string;
  /** Its pinyin, for the screen reader's label and the title. */
  pinyin: string;
  alt: string;
}

const jade = (what: string) => `A small jade carving from China, 1700s or 1800s: a seated figure in robes with ${what}.`;

export const ZODIAC_JADE: Record<Animal, ZodiacJade> = {
  Rat: { source: 'jade-rat.png', hanzi: '鼠', pinyin: 'shǔ', alt: jade('a rat’s head') },
  Ox: { source: 'jade-ox.png', hanzi: '牛', pinyin: 'niú', alt: jade('an ox’s head') },
  Tiger: { source: 'jade-tiger.png', hanzi: '虎', pinyin: 'hǔ', alt: jade('a tiger’s head') },
  Rabbit: { source: 'jade-rabbit.png', hanzi: '兔', pinyin: 'tù', alt: jade('a rabbit’s head') },
  Dragon: { source: 'jade-dragon.png', hanzi: '龍', pinyin: 'lóng', alt: jade('a dragon’s head') },
  Snake: { source: 'jade-snake.png', hanzi: '蛇', pinyin: 'shé', alt: jade('a snake’s head') },
  Horse: { source: 'jade-horse.png', hanzi: '馬', pinyin: 'mǎ', alt: jade('a horse’s head') },
  Goat: { source: 'jade-goat.png', hanzi: '羊', pinyin: 'yáng', alt: jade('a goat’s head') },
  Monkey: { source: 'jade-monkey.png', hanzi: '猴', pinyin: 'hóu', alt: jade('a monkey’s head') },
  Rooster: { source: 'jade-rooster.png', hanzi: '雞', pinyin: 'jī', alt: jade('a rooster’s head') },
  Dog: { source: 'jade-dog.png', hanzi: '狗', pinyin: 'gǒu', alt: jade('a dog’s head') },
  Pig: { source: 'jade-pig.png', hanzi: '豬', pinyin: 'zhū', alt: jade('a pig’s head') },
};

/** The footer's line for the page that shows one. */
export const zodiacJadeCredit = 'Jade zodiac animals, China, 1700s to 1800s, The Metropolitan Museum of Art.';

/** The widths cut, in pixels; a figure narrower than one is cut at its own width instead. */
export const ZODIAC_JADE_WIDTHS = [256, 512] as const;

interface Cut {
  width: number;
  height: number;
  files: Record<string, { avif: { src: string; bytes: number }; webp: { src: string; bytes: number } }>;
}

const cuts = files as Record<string, Cut>;

/** The srcsets for one animal's cutout. */
export function zodiacJadeSet(animal: Animal) {
  const entry = cuts[animal.toLowerCase()];
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
