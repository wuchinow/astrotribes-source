// The chart wheel on Your chart (3g): our words, not Dawa's. PLACEHOLDER until his copy replaces it.
// Body and sign names come from lib/keys.ts; no key name is typed here.

// PLACEHOLDER
export const chartWheelCopy = {
  /** The page's headline, now that the wheel leads Your chart (David, Nov 4). */
  line: 'Your sky,',
  accent: 'the moment you were born.',
  body: 'Where the Sun, the Moon, and every planet stood when you were born, set around the twelve signs.',
  houses: 'The lines inside mark your twelve houses, counted from your Rising at the left.',
  noTime:
    'Without a birth time there are no houses, and the planets sit where they were at midday, so the Moon may be a few degrees off.',
  listLabel: 'What the wheel shows',
  house: (roman: string) => `house ${roman}`,
  /** The tap panel (3t). */
  hint: 'Tap a planet on the wheel or in the list to see its Keys.',
  close: 'Close',
  retrogradeMark: 'retrograde',
  retrograde: (name: string) => `${name} was retrograde: seen from Earth, it seemed to move backward through the signs.`,
  noHouse: 'The house needs a birth time.',
  more: (name: string) => `More about ${name}`,
  figure: 'Your chart as a wheel. The list beside it says the same in words.',
};
