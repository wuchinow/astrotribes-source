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
    // Nov 4 (David): the Sun's card shows the Sun, not a galaxy. The upper limb of the SDO photo that
    // stands whole on /keys/sun, so the card is a different cut of it (Spitzer's galactic core came out).
    stem: 'sdo-sun-limb',
    subject: 'The Sun from the Solar Dynamics Observatory, its upper limb',
    source: 'sun.jpg',
    size: [4096, 4096],
    sha256: '8b829280455d14fa7bbeac4d5ebe18fabacb74221344634947359ed0efd28a82',
    crop: [0, 0, 4096, 2304],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.8,
    widths: [720],
    alt: 'The top of the Sun in gold, loops of plasma rising from its edge into the dark',
    credit: 'NASA/GSFC/Solar Dynamics Observatory',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/image-of-sun-from-nasas-solar-dynamics-observatory/',
    released: '2025-09-15',
  },
  keysMoon: {
    // Nov 4 (David): the Moon's card shows the Moon, not a nebula. The upper half of the LRO photo that
    // stands whole on /keys/moon (the Ring Nebula came out; its credit is M86's best guess too).
    stem: 'lroc-moon-limb',
    subject: 'The near side of the Moon from the Lunar Reconnaissance Orbiter, its upper half',
    source: 'moon.jpg',
    size: [1400, 1400],
    sha256: '039dff75b050aa0ffc0792579797514846f6dd097d1b83747ef1124872c50548',
    crop: [0, 0, 1400, 788],
    levels: { black: 6, white: 255, gamma: 1 },
    median: 3,
    strength: 0.8,
    widths: [720],
    alt: 'The upper half of the full Moon in grey, its dark seas and bright craters',
    credit: 'NASA/GSFC/Arizona State University',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/mission/lro/',
    released: '2010-12',
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
  // The Sun's page (Nov 4): SDO's PIA26681, saved to Drive (planet photos / sun.jpg); the crop leaves out the instrument's label.
  sun: {
    stem: 'sdo-sun',
    subject: 'The Sun from the Solar Dynamics Observatory',
    source: 'sun.jpg',
    size: [4096, 4096],
    sha256: '8b829280455d14fa7bbeac4d5ebe18fabacb74221344634947359ed0efd28a82',
    crop: [148, 0, 3800, 3800],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'The Sun in extreme ultraviolet light, gold and seething, loops of plasma rising from its edge',
    credit: 'NASA/GSFC/Solar Dynamics Observatory',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/image-of-sun-from-nasas-solar-dynamics-observatory/',
    released: '2025-09-15',
  },
  // The Moon's page (Nov 4): Drive (planet photos / moon.jpg) holds LRO's wide-angle mosaic, labeled LROC WAC, Arizona State University, acquired December 2010, not the mosaic on the page the extension was pointed to; the credit is LROC's usual one, to confirm (M86). The crop leaves out the label.
  moon: {
    stem: 'lroc-moon',
    subject: 'The near side of the Moon from the Lunar Reconnaissance Orbiter',
    source: 'moon.jpg',
    size: [1400, 1400],
    sha256: '039dff75b050aa0ffc0792579797514846f6dd097d1b83747ef1124872c50548',
    crop: [0, 0, 1400, 1330],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1040, 640],
    alt: 'The full Moon in grey, its dark seas and bright craters sharp to the edge',
    credit: 'NASA/GSFC/Arizona State University',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/mission/lro/',
    released: '2010-12',
  },
  // Mercury's page (Nov 4): PIA12051, two views stacked; the top one, from MESSENGER's first flyby.
  mercury: {
    stem: 'messenger-mercury',
    subject: 'Mercury in enhanced color from MESSENGER',
    source: 'mercury.jpg',
    size: [683, 1400],
    sha256: '427230592b267ee2af720a48bc43959ce58b9f7befaa30fa0ee5ce13ab961a8d',
    crop: [0, 0, 683, 683],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [640],
    alt: 'Mercury in enhanced color, its cratered face in blues, tans, and bright rays',
    credit: 'NASA/Johns Hopkins University Applied Physics Laboratory/Smithsonian Institution/Carnegie Institution of Washington',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/a-global-view-of-mercurys-surface/',
    released: '2009-05-12',
  },
  // Venus's page (Nov 4): PIA23791, two versions side by side; the left one, the release's main view.
  venus: {
    stem: 'mariner-venus',
    subject: 'Venus from Mariner 10',
    source: 'venus.jpg',
    size: [2245, 1096],
    sha256: '853268f7922ea572a0966df4a378e6b54221102d6740bdc78f4011708ee71007',
    crop: [0, 0, 1096, 1096],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1040, 640],
    alt: 'Venus wrapped in pale clouds, faint bands of tan and blue across it',
    credit: 'NASA/JPL-Caltech',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/venus-from-mariner-10/',
    released: '2020-06-08',
  },
  // Mars's page (Nov 4): PIA00407, a mosaic of about 1,000 Viking orbiter images.
  mars: {
    stem: 'viking-mars',
    subject: 'Mars from the Viking orbiters',
    source: 'mars.jpg',
    size: [6787, 6787],
    sha256: 'fc62a86416794444988338e55591d23290e1de2c7c32f3613b872caa8413ea2f',
    crop: [0, 0, 6787, 6787],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'Mars, rust red, a white polar cap at the top and dark plains across its face',
    credit: 'NASA/JPL/USGS',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/global-color-views-of-mars/',
    released: '1998-06-08',
  },
  // Saturn's page (Nov 4): PIA06193, Cassini's mosaic of 126 images from Oct 6, 2004.
  saturn: {
    stem: 'cassini-saturn',
    subject: 'Saturn and its rings from Cassini',
    source: 'saturn.jpg',
    size: [8888, 4544],
    sha256: '0938b9e0c44a1e81efdca6560b1d75200e9e60caa6a02060bac0466357b9bae6',
    crop: [472, 372, 7700, 3850],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'Saturn tilted in its rings, the planet pale gold and the rings casting a dark band of shadow',
    credit: 'NASA/JPL/Space Science Institute',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/the-greatest-saturn-portrait-yet/',
    released: '2005-02-24',
  },
  // Uranus's page (Nov 4): PIA18182, Voyager 2 in 1986.
  uranus: {
    stem: 'voyager-uranus',
    subject: 'Uranus from Voyager 2',
    source: 'uranus.jpg',
    size: [1720, 1720],
    sha256: 'ca232227c8bf49a3946b7c65ba504f528b4f1082d0ed426d0a97243aa520acf5',
    crop: [0, 0, 1720, 1720],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'Uranus, a smooth pale blue green ball against black',
    credit: 'NASA/JPL-Caltech',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/uranus-as-seen-by-nasas-voyager-2/',
    released: '1986-12-18',
  },
  // Neptune's page (Nov 4): PIA01492, Voyager 2 in 1989.
  neptune: {
    stem: 'voyager-neptune',
    subject: 'Neptune from Voyager 2',
    source: 'neptune.jpg',
    size: [2188, 2185],
    sha256: '97b57802f44be2218578a98c8c26f8426ff7a95890d266d34486734f14c1edb6',
    crop: [0, 0, 2185, 2185],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'Neptune, deep blue, with the Great Dark Spot and thin white clouds',
    credit: 'NASA/JPL',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/neptune-full-disk-view/',
    released: '1998-10-30',
  },
  // Pluto's page (Nov 4): PIA19952, New Horizons on July 14, 2015; its colors enhanced, as NASA released it.
  pluto: {
    stem: 'new-horizons-pluto',
    subject: 'Pluto in enhanced color from New Horizons',
    source: 'pluto.jpg',
    size: [5000, 5000],
    sha256: '9ff70a2bc500fef4d9e53e3e73080b866cdde3dcb5d0cf6903ac1396a7ca5879',
    crop: [0, 0, 5000, 5000],
    levels: { black: 6, white: 255, gamma: 1 },
    strength: 0.9,
    widths: [1200, 640],
    alt: 'Pluto in enhanced color, its pale heart-shaped plain beside dark red highlands',
    credit: 'NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute',
    tinted: false,
    license: 'NASA release; not copyrighted in the United States',
    release: 'https://science.nasa.gov/photojournal/the-rich-color-variations-of-pluto/',
    released: '2015-09-24',
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
  '/keys/sun': ['sun'],
  '/keys/moon': ['moon'],
  '/keys/mercury': ['mercury'],
  '/keys/venus': ['venus'],
  '/keys/mars': ['mars'],
  '/keys/jupiter': ['jupiter'],
  '/keys/saturn': ['saturn'],
  '/keys/uranus': ['uranus'],
  '/keys/neptune': ['neptune'],
  '/keys/pluto': ['pluto'],
};

export const skyCredit = (image: SkyImage) => (image.tinted ? `${image.credit} (tinted)` : image.credit);

/** wash-sky in app/tokens.css: an image's strength when its manifest names none. */
export const WASH_SKY_DEFAULT = 0.5;

export const skyStrength = (image: SkyImage) => image.strength ?? WASH_SKY_DEFAULT;
