// The real sky (design system v21, The three motifs, item 3): telescope images used as backgrounds,
// cut at build time in their own color over night-900 (David, Oct 26: the blue grey ink is gone). This manifest is
// what scripts/ink-sky.mjs cuts from ../reference and what the site renders from; the served files
// and their credits land in public/sky-images/credits.json (not public/sky/: proxy.ts gates /sky). The Ring
// Nebula behind the Oracle's hexagram card (1c, lifted in 1h), and one image on each of the landing's three
// Keys cards (1h): the Milky Way's core on Sun, the Ring's upper arc on Moon, Earthrise on Rising (Mystic Mountain until Nov 4, when it came out for being part ESA).

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
    stem: 'earthrise',
    subject: 'Earthrise, from Apollo 8',
    // Nov 4 (David): pure NASA in place of Mystic Mountain, which was part ESA. Saved by the Claude
    // extension from NASA's page into Drive (AstroTribes 2.0 / planet photos / rising-earthrise.jpg).
    source: 'rising-earthrise.jpg',
    size: [3000, 1971],
    sha256: '71034e6ab962869b25d6ac1d5e548482e7b0129d45445e2d99078c1af5fdd68c',
    crop: [300, 180, 2700, 1519],
    levels: { black: 8, white: 255, gamma: 1 },
    strength: 0.8,
    widths: [720],
    alt: 'Earth, half in sunlight, rising above the grey horizon of the Moon',
    credit: 'NASA',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://www.nasa.gov/image-detail/moon-landing-l-7-months-10-apollo-8-earthrise-photo-as08-14-2383',
    released: '1968-12-24',
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
    stem: 'saturn-eclipse',
    subject: 'Saturn backlit by the Sun, from Cassini ("The Day the Earth Smiled")',
    // Nov 4 (David): pure NASA in place of the Great Observatories' galactic center, which was part ESA.
    // Saved by the Claude extension into Drive (planet photos / today-earth-smiled.jpg).
    source: 'today-earth-smiled.jpg',
    size: [9000, 3500],
    sha256: '028f7cea0875a6aad90456d1a8a25b52d31f4f9013d5bb0920a7f8c68d431455',
    crop: [2750, 0, 3500, 3500],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1040, 640],
    alt: 'Saturn seen from its night side, a dark globe ringed with sunlight, its rings glowing gold and blue',
    credit: 'NASA/JPL-Caltech/Space Science Institute',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/resource/the-day-the-earth-smiled',
    released: '2013-11-12',
  },
  keysCenter: {
    stem: 'chandra-galactic-center',
    subject: 'The center of the Milky Way in X-rays, from Chandra',
    // Nov 4 (David): pure NASA in place of the Great Observatories' arcs, which were part ESA. Saved by
    // the Claude extension into Drive (planet photos / keys-galactic-center.jpg); cut inside the
    // mosaic's zigzag edge.
    source: 'keys-galactic-center.jpg',
    size: [2987, 1158],
    sha256: 'dfbb970e78a69c23c337a7b73a508efdcb13a60d206691e8000babf6ef1e9602',
    crop: [400, 180, 2000, 800],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1600, 800],
    alt: 'The heart of our galaxy in X-rays, gold and red clouds scattered with bright points of light',
    credit: 'NASA/UMass/D. Wang et al.',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/resource/chandra-x-ray-mosaic-of-galactic-center',
    released: '2002-01-10',
  },
  // The Jupiter page's hero (David, Nov 4): Cassini's Jupiter, saved by David from the Photojournal
  // (file PIA04866.jpg, 1920x2400). Pure NASA, so public domain. Its release date waits on the catalog
  // page; December 2000 is when Cassini took it on the way past Jupiter.
  jupiter: {
    stem: 'cassini-jupiter',
    subject: 'Jupiter from the Cassini spacecraft, with the Great Red Spot',
    source: 'cassini-jupiter-PIA04866.jpg',
    size: [1920, 2400],
    sha256: 'bcd8549b7bbcc0041309d0a35673a2329ee78dcecc4f06bfc86488434132f3cd',
    crop: [0, 0, 1920, 2400],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'Jupiter half in shadow, its cream and rust cloud bands swirling around the Great Red Spot',
    credit: 'NASA/JPL/Space Science Institute',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/cassini-jupiter-portrait/',
    released: '2000-12',
  },
} as const satisfies Record<string, SkyImage>;

export type SkyId = keyof typeof SKY;

/**
 * Which page shows which telescope images, so the footer can credit them (David, Nov 4: the credits
 * go in the footer, like the art, and nothing sits under a picture). tests/sky-credits.test.ts holds
 * this to the pages' own code, so an image added to a page without its entry here fails the tests.
 */
export const SKY_PAGES: Readonly<Record<string, readonly SkyId[]>> = {
  '/': ['keysSun', 'keysMoon', 'keysRising', 'andromeda'],
  '/sky': ['today'],
  '/keys': ['keysCenter'],
  '/keys/jupiter': ['jupiter'],
};

export const skyCredit = (image: SkyImage) => (image.tinted ? `${image.credit} (tinted)` : image.credit);

/** wash-sky in app/tokens.css: an image's strength when its manifest names none. */
export const WASH_SKY_DEFAULT = 0.5;

export const skyStrength = (image: SkyImage) => image.strength ?? WASH_SKY_DEFAULT;
