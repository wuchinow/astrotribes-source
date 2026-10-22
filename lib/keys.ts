// The 28 Keys: Dawa's vocabulary for every placement in a chart.
// This is the only file where a key name is typed. Everything else imports from here.
// Source: Dawa's "AstroTribes' 28 Keys" (Drive, edited Sep 29, 2026, adopted by David on Sep 30), via
// docs/brief.md. tests/keys.test.ts checks this file against the brief.

export const SIGN_IDS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const; // zodiac order: sign n starts at n x 30 degrees of longitude
export type SignId = (typeof SIGN_IDS)[number];

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Mode = 'cardinal' | 'fixed' | 'mutable';

export const BODY_IDS = [
  'sun',
  'moon',
  'rising',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'northNode',
  'southNode',
  'chiron',
  'galacticCenter',
] as const;
export type BodyId = (typeof BODY_IDS)[number];

export type Dimension = 'sign' | 'house';
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// 14 sign keys (every body but the Galactic Center) and 14 house keys (every body but Rising).
export type KeyId =
  | `${Exclude<BodyId, 'galacticCenter'>}Sign`
  | `${Exclude<BodyId, 'rising'>}House`;

export interface KeyDef {
  /** Placement-based and permanent. A rename never changes it. */
  id: KeyId;
  /** Dawa's name for the key. Typed here and nowhere else. */
  name: string;
  body: BodyId;
  dimension: Dimension;
  /** Dawa's one-line gloss, verbatim from his doc (the Sep 29 edit). */
  gloss: string;
  /** The Core Five: the Sun's and Moon's sign and house keys, and the rising sign's. */
  core: boolean;
  /** False while Dawa has not confirmed a key: every key whose name differs from his Sept 18 list. */
  settled: boolean;
}

export const KEYS = {
  sunSign: {
    id: 'sunSign',
    name: 'Tribe',
    body: 'sun',
    dimension: 'sign',
    gloss: 'your Sun sign; your core astrological identity',
    core: true,
    settled: true,
  },
  sunHouse: {
    id: 'sunHouse',
    name: 'Kingdom',
    body: 'sun',
    dimension: 'house',
    gloss:
      "your Sun's placement by house; the place you radiate from and naturally express your innermost essence",
    core: true,
    settled: false,
  },
  moonSign: {
    id: 'moonSign',
    name: 'Clan',
    body: 'moon',
    dimension: 'sign',
    gloss: 'your Moon sign; the way your feelings manifest',
    core: true,
    settled: true,
  },
  moonHouse: {
    id: 'moonHouse',
    name: 'Hearth',
    body: 'moon',
    dimension: 'house',
    gloss: 'your emotional home; your natural place of ease',
    core: true,
    settled: false,
  },
  risingSign: {
    id: 'risingSign',
    name: 'Vibe',
    body: 'rising',
    dimension: 'sign',
    gloss: 'your rising sign; how you appear to the world; impulse',
    core: true,
    settled: true,
  },
  mercurySign: {
    id: 'mercurySign',
    name: 'Voice',
    body: 'mercury',
    dimension: 'sign',
    gloss: "Mercury's sign; your communication style",
    core: false,
    settled: true,
  },
  mercuryHouse: {
    id: 'mercuryHouse',
    name: 'Stage',
    body: 'mercury',
    dimension: 'house',
    gloss: 'where your thoughts live and your story unfolds',
    core: false,
    settled: false,
  },
  venusSign: {
    id: 'venusSign',
    name: 'Resonance',
    body: 'venus',
    dimension: 'sign',
    gloss: "Venus' sign; what you harmonize with",
    core: false,
    settled: true,
  },
  venusHouse: {
    id: 'venusHouse',
    name: 'Attraction',
    body: 'venus',
    dimension: 'house',
    gloss: 'where you find harmony and beauty',
    core: false,
    settled: false,
  },
  marsSign: {
    id: 'marsSign',
    name: 'Warrior',
    body: 'mars',
    dimension: 'sign',
    gloss: "Mars' sign; your action style",
    core: false,
    settled: true,
  },
  marsHouse: {
    id: 'marsHouse',
    name: 'Arena',
    body: 'mars',
    dimension: 'house',
    gloss: 'where you most naturally express your energy, ambition, and drive',
    core: false,
    settled: true,
  },
  jupiterSign: {
    id: 'jupiterSign',
    name: 'Abundance',
    body: 'jupiter',
    dimension: 'sign',
    gloss: "Jupiter's sign; what is presented as resource and inspiration",
    core: false,
    settled: false,
  },
  jupiterHouse: {
    id: 'jupiterHouse',
    name: 'Opportunity',
    body: 'jupiter',
    dimension: 'house',
    gloss: 'your place of growth, depth, and expansion',
    core: false,
    settled: false,
  },
  saturnSign: {
    id: 'saturnSign',
    name: 'Challenge',
    body: 'saturn',
    dimension: 'sign',
    gloss: "Saturn's sign; how you learn and grow",
    core: false,
    settled: true,
  },
  saturnHouse: {
    id: 'saturnHouse',
    name: 'Lesson',
    body: 'saturn',
    dimension: 'house',
    gloss: 'where your lessons and challenges show up',
    core: false,
    settled: true,
  },
  uranusSign: {
    id: 'uranusSign',
    name: 'Leap',
    body: 'uranus',
    dimension: 'sign',
    gloss: "Uranus' sign; how the unexpected enters the world via your generation",
    core: false,
    settled: false,
  },
  uranusHouse: {
    id: 'uranusHouse',
    name: 'Frontier',
    body: 'uranus',
    dimension: 'house',
    gloss: 'where fresh newness appears in your life',
    core: false,
    settled: true,
  },
  neptuneSign: {
    id: 'neptuneSign',
    name: 'Ideals',
    body: 'neptune',
    dimension: 'sign',
    gloss: "Neptune's sign; your generation's collective vision",
    core: false,
    settled: true,
  },
  neptuneHouse: {
    id: 'neptuneHouse',
    name: 'Inspiration',
    body: 'neptune',
    dimension: 'house',
    gloss: 'where you receive the collective signal and embody it',
    core: false,
    settled: false,
  },
  plutoSign: {
    id: 'plutoSign',
    name: 'Alchemy',
    body: 'pluto',
    dimension: 'sign',
    gloss: "Pluto's sign; your generation's deep transformation",
    core: false,
    settled: true,
  },
  plutoHouse: {
    id: 'plutoHouse',
    name: 'Rebirth',
    body: 'pluto',
    dimension: 'house',
    gloss: 'where the old burns away and is replaced with newness',
    core: false,
    settled: true,
  },
  northNodeSign: {
    id: 'northNodeSign',
    name: "Dragon's Quest",
    body: 'northNode',
    dimension: 'sign',
    gloss: "North Node's sign; your growth journey",
    core: false,
    settled: true,
  },
  northNodeHouse: {
    id: 'northNodeHouse',
    name: "Dragon's Lair",
    body: 'northNode',
    dimension: 'house',
    gloss: 'where you grow and evolve',
    core: false,
    settled: true,
  },
  southNodeSign: {
    id: 'southNodeSign',
    name: "Dragon's Treasure",
    body: 'southNode',
    dimension: 'sign',
    gloss: "South Node's sign; your past patterns and habits",
    core: false,
    settled: true,
  },
  southNodeHouse: {
    id: 'southNodeHouse',
    name: "Dragon's Vault",
    body: 'southNode',
    dimension: 'house',
    gloss: 'where your past life habits and memories live',
    core: false,
    settled: true,
  },
  chironSign: {
    id: 'chironSign',
    name: 'Wound',
    body: 'chiron',
    dimension: 'sign',
    gloss: "Chiron's sign; the energy of healing that our inner child requires",
    core: false,
    settled: false,
  },
  chironHouse: {
    id: 'chironHouse',
    name: 'Scar',
    body: 'chiron',
    dimension: 'house',
    gloss: "Chiron's house; the area where growth and healing occurs",
    core: false,
    settled: false,
  },
  galacticCenterHouse: {
    id: 'galacticCenterHouse',
    name: 'Alignment',
    body: 'galacticCenter',
    dimension: 'house',
    gloss:
      "the Galactic Center's house; where Truth arrives from the galactic core of wisdom and light",
    core: false,
    settled: false,
  },
} satisfies Record<KeyId, KeyDef>; // a missing or extra key is a compile error

export const KEY_LIST: readonly KeyDef[] = Object.values(KEYS);

/**
 * Retired key names: older revisions of Dawa's doc and the pitch deck, the Sept 18 names his later
 * edits replaced, and the two Sep 28 names his Sep 29 edit dropped. Typed here so the lint guard
 * (eslint.config.ts) can keep them out of copy too; CLAUDE.md lists the same set. Kingdom, Hearth,
 * and Leap are current again (Sep 29), and so are the Sept 18 names for Saturn's house and
 * Neptune's sign (Sep 30).
 */
export const RETIRED_KEY_NAMES: readonly string[] = [
  // Before Sept 18: the Sept 17 doc and the pitch deck.
  'Instinct',
  'Remedy',
  'Style',
  'Story',
  'Oasis',
  'Classroom',
  'Jolt',
  'Channel',
  'Pyre',
  'Magnet',
  // The Sept 18 names changed on Sep 28 and still replaced after the Sep 29 edit.
  'Sphere',
  'Haven',
  'Curiosity',
  'Delight',
  'Gift',
  'Reset',
  'Lens',
  'Healing',
  'Signal',
  // Sep 28 names the Sep 29 edit dropped.
  'Limitation',
  'Ethos',
];

/** Keys that need a birth time: every house key, and Vibe (the rising sign). */
export const needsBirthTime = (key: KeyDef): boolean =>
  key.dimension === 'house' || key.body === 'rising';

/** Outer-planet sign keys, shared by everyone born within a few years of you. */
export const isGenerational = (key: KeyDef): boolean =>
  key.dimension === 'sign' &&
  (key.body === 'uranus' || key.body === 'neptune' || key.body === 'pluto');

/** "Sun sign", "Chiron house": where a key comes from, derived rather than typed. */
export const sourceLabel = (key: KeyDef): string =>
  `${BODIES[key.body].name} ${key.dimension}`;

/** A gloss standing alone as a sentence starts with a capital. */
export const glossSentence = (key: KeyDef): string =>
  key.gloss.charAt(0).toUpperCase() + key.gloss.slice(1);

// Bodies, grouped the way the design system groups key cards. A group id is never a key name, so a
// rename cannot leave it stale: the Galactic Center's group was 'signal' until 1k.
export type BodyGroup = 'identity' | 'journey' | 'planets' | 'generational' | 'healing' | 'galacticCenter';

export interface BodyDef {
  id: BodyId;
  name: string;
  group: BodyGroup;
  /**
   * Dawa's line for the body, over its pair of keys in his doc (the Oct 21 edit), sentence case.
   * Mercury's two lines, one over each key, are joined the way his other lines join two thoughts.
   */
  line: string;
}

export const BODIES: Record<BodyId, BodyDef> = {
  sun: { id: 'sun', name: 'Sun', group: 'identity', line: 'Your core identity; the qualities you naturally express' },
  moon: { id: 'moon', name: 'Moon', group: 'identity', line: 'Your emotional nature; how you respond to triggers' },
  rising: { id: 'rising', name: 'Rising', group: 'identity', line: 'How you express your inner self and appear to the world' },
  mercury: { id: 'mercury', name: 'Mercury', group: 'planets', line: 'Your communication style; where the mind engages' },
  venus: { id: 'venus', name: 'Venus', group: 'planets', line: 'What you are attracted to and where you find beauty' },
  mars: { id: 'mars', name: 'Mars', group: 'planets', line: 'How your energy manifests in the world' },
  jupiter: { id: 'jupiter', name: 'Jupiter', group: 'planets', line: 'What you are gifted with' },
  saturn: { id: 'saturn', name: 'Saturn', group: 'planets', line: 'Your karmic school' },
  uranus: { id: 'uranus', name: 'Uranus', group: 'generational', line: "Your generation's leap" },
  neptune: { id: 'neptune', name: 'Neptune', group: 'generational', line: "Your generation's collective spirit" },
  pluto: { id: 'pluto', name: 'Pluto', group: 'generational', line: "Your generation's evolution" },
  northNode: { id: 'northNode', name: 'North Node', group: 'journey', line: "Your forward journey; the strengths you're growing into" },
  southNode: { id: 'southNode', name: 'South Node', group: 'journey', line: 'Your history; the experiences and habits you bring' },
  chiron: { id: 'chiron', name: 'Chiron', group: 'healing', line: 'The healing journey' },
  galacticCenter: { id: 'galacticCenter', name: 'Galactic Center', group: 'galacticCenter', line: 'Where wisdom arises' },
};

export interface BodyGroupDef {
  id: BodyGroup;
  /** The group's label: the design system's, in sentence case. A label, not a key name. */
  name: string;
}

/**
 * The groups in the design system's order (README, Layout), with their labels. Two labels are also
 * key names, which is why they are typed here and nowhere else: Chiron's group is "Healing", the
 * design system's label and also a retired key name (kept as the label by David, Oct 2; Dawa to
 * confirm), and the Galactic Center's group takes its one key's name, so a rename carries it.
 */
export const BODY_GROUPS: readonly BodyGroupDef[] = [
  { id: 'identity', name: 'Identity' },
  { id: 'journey', name: 'Journey' },
  { id: 'planets', name: 'Planets' },
  { id: 'generational', name: 'Generational family' },
  { id: 'healing', name: 'Healing' },
  { id: 'galacticCenter', name: KEYS.galacticCenterHouse.name },
];

/** A group's bodies, in BODY_IDS order. */
export const bodiesIn = (group: BodyGroup): BodyId[] => BODY_IDS.filter((body) => BODIES[body].group === group);

// Signs, with their element, mode, and usual Sun dates.
/** [month, day], 1-based. */
export type MonthDay = readonly [number, number];

export interface SignDef {
  id: SignId;
  name: string;
  element: Element;
  mode: Mode;
  /** The usual tropical Sun dates. The cusp moves by a day in some years; a chart settles it. */
  dates: { start: MonthDay; end: MonthDay };
}

export const SIGNS: Record<SignId, SignDef> = {
  aries: { id: 'aries', name: 'Aries', element: 'fire', mode: 'cardinal', dates: { start: [3, 21], end: [4, 19] } },
  taurus: { id: 'taurus', name: 'Taurus', element: 'earth', mode: 'fixed', dates: { start: [4, 20], end: [5, 20] } },
  gemini: { id: 'gemini', name: 'Gemini', element: 'air', mode: 'mutable', dates: { start: [5, 21], end: [6, 20] } },
  cancer: { id: 'cancer', name: 'Cancer', element: 'water', mode: 'cardinal', dates: { start: [6, 21], end: [7, 22] } },
  leo: { id: 'leo', name: 'Leo', element: 'fire', mode: 'fixed', dates: { start: [7, 23], end: [8, 22] } },
  virgo: { id: 'virgo', name: 'Virgo', element: 'earth', mode: 'mutable', dates: { start: [8, 23], end: [9, 22] } },
  libra: { id: 'libra', name: 'Libra', element: 'air', mode: 'cardinal', dates: { start: [9, 23], end: [10, 22] } },
  scorpio: { id: 'scorpio', name: 'Scorpio', element: 'water', mode: 'fixed', dates: { start: [10, 23], end: [11, 21] } },
  sagittarius: { id: 'sagittarius', name: 'Sagittarius', element: 'fire', mode: 'mutable', dates: { start: [11, 22], end: [12, 21] } },
  capricorn: { id: 'capricorn', name: 'Capricorn', element: 'earth', mode: 'cardinal', dates: { start: [12, 22], end: [1, 19] } },
  aquarius: { id: 'aquarius', name: 'Aquarius', element: 'air', mode: 'fixed', dates: { start: [1, 20], end: [2, 18] } },
  pisces: { id: 'pisces', name: 'Pisces', element: 'water', mode: 'mutable', dates: { start: [2, 19], end: [3, 20] } },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthDay = ([month, day]: MonthDay) => `${MONTHS[month - 1]} ${day}`;

/** "Mar 21 to Apr 19". Ranges use "to", never a dash. */
export const signDates = (sign: SignId): string =>
  `${monthDay(SIGNS[sign].dates.start)} to ${monthDay(SIGNS[sign].dates.end)}`;

/**
 * The sign whose usual Sun dates hold a calendar date (UTC). A season marker for the landing, never a
 * chart: near a change of sign the real Sun may be a day either side, and only a chart settles it.
 */
export function sunSeasonSign(date: Date): SignId {
  const md = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
  const within = ({ start, end }: SignDef['dates']) => {
    const [s, e] = [start[0] * 100 + start[1], end[0] * 100 + end[1]];
    return s <= e ? md >= s && md <= e : md >= s || md <= e;
  };
  return SIGN_IDS.find((sign) => within(SIGNS[sign].dates)) ?? 'aries';
}

export const ELEMENTS: readonly Element[] = ['fire', 'earth', 'air', 'water'];
export const MODES: readonly Mode[] = ['cardinal', 'fixed', 'mutable'];
export const elementOf = (sign: SignId): Element => SIGNS[sign].element;
export const modeOf = (sign: SignId): Mode => SIGNS[sign].mode;

// The twelve houses, with Dawa's Unfolding Journey question and his line for each.
export interface HouseDef {
  number: HouseNumber;
  roman: string;
  name: string;
  question: string;
  /** Dawa's line for the house in his doc's list of the twelve (the Oct 21 edit), verbatim but for case. */
  line: string;
}

export const HOUSES: readonly HouseDef[] = [
  { number: 1, roman: 'I', name: 'Identity', question: 'Who am I?', line: 'How you show up in the world' },
  { number: 2, roman: 'II', name: 'Resources', question: 'What supports me?', line: 'What you value and rely on' },
  { number: 3, roman: 'III', name: 'Engagement', question: 'How do I connect?', line: 'How you engage with your world' },
  { number: 4, roman: 'IV', name: 'Roots', question: 'Where do I come from?', line: 'Where you find your foundation' },
  { number: 5, roman: 'V', name: 'Creativity', question: 'What can I bring forth?', line: 'How you express your unique gifts' },
  { number: 6, roman: 'VI', name: 'Service', question: 'How can I contribute?', line: 'How you contribute through training' },
  { number: 7, roman: 'VII', name: 'Partnership', question: 'Where is my synergy?', line: 'How you grow through relationship' },
  { number: 8, roman: 'VIII', name: 'Depth', question: 'What lies beneath the surface?', line: 'What draws you deep' },
  { number: 9, roman: 'IX', name: 'Expansion', question: 'How do I discover more?', line: 'How you expand your horizons' },
  { number: 10, roman: 'X', name: 'Achievement', question: 'What can I accomplish?', line: 'Your accomplishments in the world' },
  { number: 11, roman: 'XI', name: 'Vision', question: 'What future do I envision?', line: 'Shared hopes and dreams' },
  { number: 12, roman: 'XII', name: 'Assimilation', question: 'How do I become whole?', line: 'Finding wholeness' },
];

export const houseOf = (number: HouseNumber): HouseDef => HOUSES[number - 1];

// Placement to key: which keys a body carries. Built from KEYS, so no name is repeated.
export const PLACEMENT_KEYS = Object.fromEntries(
  BODY_IDS.map((body) => [
    body,
    {
      sign: KEY_LIST.find((k) => k.body === body && k.dimension === 'sign'),
      house: KEY_LIST.find((k) => k.body === body && k.dimension === 'house'),
    },
  ]),
) as Record<BodyId, { sign?: KeyDef; house?: KeyDef }>;

/** keyFor('rising', 'house') and keyFor('galacticCenter', 'sign') are undefined; the other 28 pairs resolve. */
export const keyFor = (body: BodyId, dimension: Dimension): KeyDef | undefined =>
  PLACEMENT_KEYS[body][dimension];
