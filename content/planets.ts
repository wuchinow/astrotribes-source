// A page of its own for each planet whose Keys Dawa has written out in full (David, Nov 4): his
// introduction, then the planet in each of the twelve signs (its sign key) and each of the twelve
// houses (its house key). Each member sees their own two lines on Your chart. Key names come from
// lib/keys.ts and arrive as arguments; nothing here types one.
//
// Jupiter: Dawa's "Jupiter Signs and House Keys" (Drive, Nov 3), his words verbatim but for
// punctuation fitted to the copy rules (no exclamation marks, no dashes standing in for commas).
// Its facts wait on his review (the Nov 4 plan doc's notes), so `reviewed` stays false.

import type { BodyId, HouseNumber, SignId } from '@/lib/keys';
import type { SkyId } from '@/lib/sky';

export interface PlanetContent {
  body: BodyId;
  /** The path segment under /keys. A body id, never a key name. */
  slug: string;
  /** The telescope picture beside the hero's words (lib/sky.ts), credited under it. */
  sky: SkyId;
  /** Dawa's introduction, one string per paragraph. */
  intro: readonly string[];
  /** His line for the planet in each sign. */
  signs: Readonly<Record<SignId, string>>;
  /** His line for the planet in each house. */
  houses: Readonly<Record<HouseNumber, string>>;
  /** Where the words come from, for the foot of the page. */
  source: string;
  reviewed: boolean;
}

const jupiter: PlanetContent = {
  body: 'jupiter',
  slug: 'jupiter',
  sky: 'jupiter',
  intro: [
    'Jupiter is our solar system’s largest planet, and is the “ruler” of Sagittarius, the sign appropriately associated with expansion, exploration, and reaching beyond what is close at hand, so enlarging our perspective. It is about abundance, growth, expansion, exploration and optimism as well as being loose and free in expression, through humor and other means.',
    'Jupiter has 115 moons (and counting) with the four largest being the first extraterrestrial moons visible to humans (with the aid of his human-made telescope). These four moons are significant because observing their movements and positions gave Galileo the information he needed to confirm that Copernicus was correct in stating that the Earth was not the center of the universe. For his troubles, the Roman Catholic Church put Galileo under house arrest for the rest of his life and forbidden to teach or write.',
    'The four Galilean moons are Ganymede (the largest, even larger than the planet Mercury), followed by Callisto, Io, and Europa. Great ideas for names for a pet or even a racehorse.',
    'Galileo was an Italian professor and his teachings were considered heretical by the Church. Interestingly on the evening of January 7, 1610 when he made his ground shifting observations, both the Moon and Jupiter itself were in the sign of Gemini. The Sun of course was in Capricorn (Jan 7) and almost certainly the rising sign was Leo.',
    'Astrologically Jupiter takes about 12 years to make its journey through the entire 12 signs of the Zodiac. In other words it spends close to a year on average in each sign. Just as we have a famous Saturn return every 28-29 years, we have a “Jupiter return” every 12 years, so when we are 12 ish we have our initial Jupiter return, and then when we are about 24 years of age, 36 years old, 48, 60, 72 etc. The Romans called Jupiter Jove, and the ancient Greeks called Jupiter Zeus.',
  ],
  signs: {
    aries: 'The advantage that Jupiter in Aries conveys is enthusiasm and courage.',
    taurus: 'The advantage that Jupiter in Taurus conveys is patience and calmness.',
    gemini: 'The advantage that Jupiter in Gemini conveys is a combination of versatility and flexibility.',
    cancer: 'The advantage that Jupiter in Cancer conveys is nurturing and sensitivity.',
    leo: 'The advantage that Jupiter in Leo conveys is confidence and creativity.',
    virgo: 'The advantage that Jupiter in Virgo conveys is precision and mindfulness.',
    libra: 'The advantage that Jupiter in Libra conveys is balance and fairness.',
    scorpio: 'The advantage that Jupiter in Scorpio conveys is resilience and renewal.',
    sagittarius: 'The advantage that Jupiter in Sagittarius conveys is discovery.',
    capricorn: 'The advantage that Jupiter in Capricorn conveys is determination.',
    aquarius: 'The advantage that Jupiter in Aquarius conveys is individuality and innovation.',
    pisces: 'The advantage that Jupiter in Pisces conveys is empathy and openness.',
  },
  houses: {
    1: 'Jupiter in the 1st brings opportunity through one’s mode of self expression.',
    2: 'Jupiter in the 2nd brings opportunity through resources.',
    3: 'Jupiter in the 3rd brings opportunity through communication and connections.',
    4: 'Jupiter in the 4th house brings opportunity through belonging and roots.',
    5: 'Jupiter in the 5th house brings opportunity through creativity and joy.',
    6: 'Jupiter in the 6th brings opportunity through service and skills.',
    7: 'Jupiter in the 7th brings opportunity through synergy.',
    8: 'Jupiter in the 8th house brings opportunity through investigation and intimacy.',
    9: 'Jupiter in the 9th brings opportunity through adventure and optimism.',
    10: 'Jupiter in the 10th brings opportunity through diligence and drive.',
    11: 'Jupiter in the 11th brings opportunity through vision and allies.',
    12: 'Jupiter in the 12th brings opportunity through intuition and reflection.',
  },
  source: 'Words by Dawa',
  reviewed: false,
};

/** The planets with a page, in the order of lib/keys.ts. More arrive as Dawa writes them. */
export const PLANET_PAGES: readonly PlanetContent[] = [jupiter];

export const planetPage = (body: BodyId): PlanetContent | undefined => PLANET_PAGES.find((p) => p.body === body);

export const planetHref = (planet: PlanetContent) => `/keys/${planet.slug}`;

// PLACEHOLDER: the planet page's own words around Dawa's. A key name arrives as an argument.
export const planetPageCopy = {
  eyebrow: 'The 28 Keys',
  /** The page title: "Jupiter, its two Keys" */
  metaTitle: (planet: string) => `${planet}, its two Keys`,
  description: (planet: string) => `${planet} in each of the twelve signs and each of the twelve houses.`,
  introTitle: (planet: string) => `About ${planet}`,
  signsTitle: (planet: string) => `${planet} in the signs`,
  housesTitle: (planet: string) => `${planet} in the houses`,
  /** "Your Gift is the sign Jupiter was in when you were born." */
  signsLede: (keyName: string, planet: string) => `Your ${keyName} is the sign ${planet} was in when you were born.`,
  housesLede: (keyName: string, planet: string) =>
    `Your ${keyName} is the house ${planet} was in. It needs your birth time.`,
  houseLabel: (roman: string, name: string) => `House ${roman}, ${name}`,
  back: 'All 28 Keys',
  more: (planet: string) => `More about ${planet}`,
  yourChart: { href: '/your-chart', label: 'See yours on Your chart' },
};
