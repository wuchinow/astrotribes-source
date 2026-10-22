// The real sky (design system v21, The three motifs, item 3): telescope images used as backgrounds,
// inked at build time so they read blue grey like Jane Kwan's ink wash on Night. This manifest is
// what scripts/ink-sky.mjs cuts from ../reference and what the site renders from; the served files
// and their credits land in public/sky-images/credits.json (not public/sky/: proxy.ts gates /sky). The Ring
// Nebula behind the Oracle's hexagram card (1c, lifted in 1h), and one image on each of the landing's three
// Keys cards (1h): the Milky Way's core on Sun, the Ring's upper arc on Moon, Mystic Mountain on Rising.

export type Box = readonly [x: number, y: number, width: number, height: number];

export interface SkyImage {
  /** Web file stem: public/sky-images/<stem>/. */
  stem: string;
  subject: string;
  /** The file in reference/images/space images/ (the Lovable export's names are wrong). */
  source: string;
  /** Source size in pixels, and its SHA-256, checked before cutting. */
  size: readonly [width: number, height: number];
  sha256: string;
  /** The square or band that is cut, in source pixels. */
  crop: Box;
  /**
   * Levels before inking: grey values at or below `black` map to night-900, at or above `white`
   * to paper, with `gamma` applied between (below 1 lifts the mids).
   */
  levels: { black: number; white: number; gamma: number };
  /**
   * A median filter of this size (odd, in source pixels) before inking. It softens a dense star field
   * into a glow, which a star field needs to stay under budget: every star is noise to WebP.
   */
  median?: number;
  /**
   * How strongly the image shows at the visitor's default wash (30%), scaled down with it like any
   * wash; wash-sky (0.5) when absent. The ring and the Keys cards carry their own, each held by a
   * contrast test on the text and credits around it.
   */
  strength?: number;
  /** The widths served, in pixels (never wider than the crop). */
  widths: readonly number[];
  alt: string;
  credit: string;
  /** Add "(tinted)" to the credit: only where the license asks for changes to be noted. */
  tinted: boolean;
  license: string;
  /** The release page the credit was confirmed on. */
  release: string;
  released: string;
}

export const SKY = {
  ring: {
    stem: 'ring-nebula',
    subject: 'The Ring Nebula (M57)',
    source: 'nasa-galaxy-cluster.jpg',
    size: [1215, 1241],
    sha256: '32deff3be5da6069b97da8ec870981412aa7410be706838b9ce5a70d639dc01c',
    crop: [58, 30, 1100, 1100],
    // 1h (U27): lifted so the ring reads through the hexagram card's frosted panel. More of the ring
    // reaches the paper stop; the brightest pixel is the same, so the panel's worst case barely moves.
    levels: { black: 4, white: 150, gamma: 0.65 },
    strength: 0.6,
    widths: [1100, 720],
    alt: 'The Ring Nebula, a glowing ring of gas around a darker center, in shades of blue grey',
    credit: 'The Hubble Heritage Team (AURA/STScI/NASA)',
    tinted: false,
    license: 'NASA and STScI release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/image-detail/hubble-ringnebula-1999-stsci-01evvfqsn9vs4r6nbd4t4x6j5g/',
    released: '1999-01-06',
  },
  // The landing's Keys cards (1h): one image per card at card scale, 16:9, in a night-900 window.
  keysSun: {
    stem: 'milky-way-core',
    subject: 'The center of the Milky Way in infrared',
    // Misnamed in the Lovable export: the Milky Way's center from Spitzer (ssc2006-02a1), not the Helix.
    source: 'nasa-helix-nebula.jpg',
    size: [7002, 5050],
    sha256: '9255bc5f7245f1da8c15b42575dbd8ce63056c9b5f89dad878cda051e75bd448',
    crop: [2140, 1985, 2800, 1575],
    levels: { black: 14, white: 240, gamma: 1.1 },
    median: 5,
    strength: 0.8,
    widths: [720],
    alt: 'The crowded core of our galaxy, a soft glow of stars and dust in shades of blue grey',
    credit: 'NASA/JPL-Caltech/S. Stolovy (Spitzer Science Center/Caltech)',
    tinted: false,
    license: 'NASA and JPL release; not copyrighted in the United States',
    release: 'https://www.spitzer.caltech.edu/image/ssc2006-02a1-spitzer-view-of-the-center-of-the-milky-way',
    released: '2006-01-10',
  },
  keysMoon: {
    stem: 'ring-nebula-arc',
    subject: 'The Ring Nebula (M57), its upper arc',
    source: 'nasa-galaxy-cluster.jpg',
    size: [1215, 1241],
    sha256: '32deff3be5da6069b97da8ec870981412aa7410be706838b9ce5a70d639dc01c',
    crop: [0, 40, 1215, 683],
    levels: { black: 4, white: 200, gamma: 0.85 },
    strength: 0.8,
    widths: [720],
    alt: 'The upper arc of the Ring Nebula, a pale ring of gas rising over a dark center, in blue grey',
    credit: 'The Hubble Heritage Team (AURA/STScI/NASA)',
    tinted: false,
    license: 'NASA and STScI release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/image-detail/hubble-ringnebula-1999-stsci-01evvfqsn9vs4r6nbd4t4x6j5g/',
    released: '1999-01-06',
  },
  keysRising: {
    stem: 'mystic-mountain',
    subject: 'Mystic Mountain in the Carina Nebula',
    // Misnamed in the Lovable export: Mystic Mountain, not the Earth.
    source: 'nasa-earth-from-space.jpg',
    size: [2104, 1937],
    sha256: '7aeac17246a70c88cd0f69a57872bec264f3ece247abf875142dac1a9e7794fe',
    crop: [0, 90, 2104, 1183],
    levels: { black: 8, white: 220, gamma: 0.9 },
    strength: 0.8,
    widths: [720],
    alt: 'Pillars of gas and dust rising toward the top of the frame, in blue grey, with a few bright stars',
    credit: 'NASA, ESA, Hubble 20th Anniversary Team, Mario Livio (STScI)',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/asset/hubble/hubble-captures-view-of-mystic-mountain/',
    released: '2010-04-22',
  },
} as const satisfies Record<string, SkyImage>;

export type SkyId = keyof typeof SKY;

/** The three stops every sky image is inked through: night-900 (Night), a mid navy, and paper. */
export const INK_STOPS = { mid: '#3a4a6b', light: '#e8dfc9' } as const;

export const skyCredit = (image: SkyImage) => (image.tinted ? `${image.credit} (tinted)` : image.credit);

/** wash-sky in app/tokens.css: an image's strength when its manifest names none. */
export const WASH_SKY_DEFAULT = 0.5;

export const skyStrength = (image: SkyImage) => image.strength ?? WASH_SKY_DEFAULT;
