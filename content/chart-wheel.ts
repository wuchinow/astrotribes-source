// The chart wheel on Your chart (3g): our words, not Dawa's. PLACEHOLDER until his copy replaces it.
// Body and sign names come from lib/keys.ts; no key name is typed here.

import { the, The } from './the';

// PLACEHOLDER, except the headline and body: Dawa's (Nov 7), his *you* in italics.
export const chartWheelCopy = {
  /** The page's headline, now that the wheel leads Your chart (David, Nov 4). */
  line: 'The solar system,',
  accent: 'the moment you were born.',
  body: 'Your horoscope is a snapshot of the solar system, where every planet was, at the moment of your birth. This unique moment in time is your celestial DNA and is what makes you uniquely *you*!',
  houses: 'The lines inside mark your twelve houses, counted from your Rising at the left.',
  noTime:
    'Without a birth time there are no houses, and the planets sit where they were at midday, so the Moon may be a few degrees off.',
  listLabel: 'What the wheel shows',
  house: (numeral: string) => `house ${numeral}`,
  /**
   * The hint beside the wheel's heading (5g, Dawa, Nov 15 note 4: "a small notice that says something like
   * 'hover and click on any planet or house cusp to see more details'"), at reading size. A device that
   * can hover reads the first; a touch screen the second (David, Nov 11: "tap" is phone-only wording).
   */
  hint: { pointer: 'Hover over or click any planet to see more.', touch: 'Press any planet to see more.' },
  /** With a birth time (3z, Dawa, Nov 5: the house degrees on hover or press, not printed). */
  hintHouses: {
    pointer: 'Hover over or click any planet or house line to see more.',
    touch: 'Press any planet or house line to see more.',
  },
  /** "House IV, Roots" */
  houseTitle: (numeral: string, name: string) => `House ${numeral}, ${name}`,
  /** "Begins at 12°05′ Leo" */
  cuspAt: (degrees: string, sign: string) => `Begins at ${degrees} ${sign}`,
  housesLabel: 'Where each house begins',
  close: 'Close',
  retrogradeMark: 'retrograde',
  retrograde: (name: string) => `${The(name)} was retrograde: seen from Earth, it seemed to move backward through the signs.`,
  noHouse: 'The house needs a birth time.',
  more: (name: string) => `More about ${the(name)}`,
  figure: 'Your chart as a wheel. The list beside it says the same in words.',
};
