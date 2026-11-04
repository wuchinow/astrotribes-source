// The real sky (design system v21, The three motifs, item 3): telescope images used as backgrounds,
// cut at build time in their own color over night-900 (David, Oct 26: the blue grey ink is gone). This manifest is
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
   * Levels on each channel before the photo is screened over night-900: values at or below `black`
   * land on night-900, at or above `white` stay full, with `gamma` applied between (below 1 lifts the mids).
   */
  levels: { black: number; white: number; gamma: number };
  /**
   * A median filter of this size (odd, in source pixels) before the levels. It softens a dense star field
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
    // 1h (U27): lifted so the ring reads through the hexagram card's frosted panel.
    levels: { black: 4, white: 255, gamma: 0.65 },
    strength: 0.6,
    widths: [1100, 720],
    alt: 'The Ring Nebula, a glowing ring of gas around a darker center, in its own colors',
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
    levels: { black: 14, white: 255, gamma: 1.1 },
    median: 5,
    strength: 0.8,
    widths: [720],
    alt: 'The crowded core of our galaxy, a soft glow of stars and dust in its own colors',
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
    levels: { black: 4, white: 255, gamma: 0.85 },
    strength: 0.8,
    widths: [720],
    alt: 'The upper arc of the Ring Nebula, a pale ring of gas rising over a dark center',
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
    levels: { black: 8, white: 255, gamma: 0.9 },
    strength: 0.8,
    widths: [720],
    alt: 'Pillars of gas and dust rising toward the top of the frame, with a few bright stars',
    credit: 'NASA, ESA, Hubble 20th Anniversary Team, Mario Livio (STScI)',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/asset/hubble/hubble-captures-view-of-mystic-mountain/',
    released: '2010-04-22',
  },
  // Nov 4 (David): every picture its own image, cut sharp from the full-size originals (the Lovable
  // export, also in Drive). The landing's next step, Today's sky hero, and the 28 Keys page.
  andromeda: {
    stem: 'andromeda',
    subject: 'The Andromeda galaxy (M31) in ultraviolet',
    // Misnamed in the Lovable export: GALEX's Andromeda mosaic (PIA04921), not the Horsehead.
    source: 'nasa-horsehead-nebula.jpg',
    size: [6200, 6200],
    sha256: '4c2bc14dccd339b73c55cba14d3c18a63c4609041c375be18c442ee13153a274',
    crop: [700, 700, 4800, 4800],
    levels: { black: 6, white: 255, gamma: 0.9 },
    strength: 0.9,
    widths: [1200, 720],
    alt: 'The Andromeda galaxy seen at a slant, its spiral arms a pale blue band of young stars around a bright golden core',
    credit: 'NASA/JPL/California Institute of Technology',
    tinted: false,
    license: 'NASA and JPL release; not copyrighted in the United States',
    release: 'https://www.jpl.nasa.gov/images/pia04921-andromeda-galaxy/',
    released: '2003-12-10',
  },
  today: {
    stem: 'galactic-center',
    subject: 'The center of the Milky Way, from Hubble, Spitzer, and Chandra together',
    // Misnamed in the Lovable export: the Great Observatories' galactic center (2009), not Andromeda.
    source: 'nasa-andromeda.jpg',
    size: [9725, 4862],
    sha256: 'a0a1cad866d6e68f127a09d72bf53397049afd03211090529864d26794d80064',
    crop: [4500, 862, 4000, 4000],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1040, 640],
    alt: 'The crowded heart of our galaxy, a bright white glow among red and gold clouds and blue starlight',
    credit: 'NASA, ESA, SSC, CXC, and STScI',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/asset/hubble/views-of-the-galactic-center-region-from-nasas-great-observatories',
    released: '2009-11-10',
  },
  keysCenter: {
    stem: 'galactic-center-arcs',
    subject: 'Gas arcs near the center of the Milky Way, from Hubble, Spitzer, and Chandra together',
    source: 'nasa-andromeda.jpg',
    size: [9725, 4862],
    sha256: 'a0a1cad866d6e68f127a09d72bf53397049afd03211090529864d26794d80064',
    crop: [0, 300, 4500, 1800],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1600, 800],
    alt: 'Golden arcs of gas and a blue glow drifting through a field of red and violet stars',
    credit: 'NASA, ESA, SSC, CXC, and STScI',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/asset/hubble/views-of-the-galactic-center-region-from-nasas-great-observatories',
    released: '2009-11-10',
  },
} as const satisfies Record<string, SkyImage>;

export type SkyId = keyof typeof SKY;

export const skyCredit = (image: SkyImage) => (image.tinted ? `${image.credit} (tinted)` : image.credit);

/** wash-sky in app/tokens.css: an image's strength when its manifest names none. */
export const WASH_SKY_DEFAULT = 0.5;

export const skyStrength = (image: SkyImage) => image.strength ?? WASH_SKY_DEFAULT;
