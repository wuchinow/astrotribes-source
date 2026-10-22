// The 28 Keys page's words (1k, built out in 1m). Dawa writes the site copy; until his arrives, every
// block marked PLACEHOLDER holds ours, and swapping his in is a change to this file only. Key names,
// glosses, group labels, his line for each body and each house, house names, and the houses'
// questions are his already and come from lib/keys.ts, never typed here. A key name in a sentence
// arrives as an argument, as on the Tribe pages.

import type { BodyGroup, BodyId } from '@/lib/keys';

export const keysPage = {
  placeholder: true,

  // PLACEHOLDER: the page title and description
  metaTitle: 'The 28 Keys',
  description: 'Every placement in a chart has a name. All 28 Keys, each with a one-line meaning.',

  // PLACEHOLDER: headline and lede. The first line is the landing's, carried over.
  hero: {
    eyebrow: 'The 28 Keys',
    line: 'Every placement has a name.',
    accent: 'Here are all 28.',
    lede: 'Your chart puts the Sun, the Moon, and each planet in a sign and in a house. Each of those placements is a Key.',
  },

  // PLACEHOLDER: which keys need a birth time, said once at the top. The counts come from lib/keys.ts.
  strip: {
    date: {
      title: 'From your birth date',
      body: (count: number) => `${count} Keys. Every sign key except your rising sign's.`,
    },
    time: {
      title: 'With your birth time',
      body: (count: number) => `${count} more. Every house key, and your rising sign's.`,
    },
    more: { href: '/#faq-birth-time', label: 'Why we ask for your birth time' },
  },

  contents: 'On this page',

  // PLACEHOLDER: one placement, shown as its two keys, before the full list.
  how: {
    id: 'how-a-key-works',
    contents: 'How a Key works',
    eyebrow: 'How a Key works',
    line: 'One placement,',
    accent: 'two Keys.',
    body: (person: string) =>
      `The Sun, the Moon, and each planet sit in a sign and in a house. The sign gives each one a Key, and the house gives it a second. Here is the Sun in ${person}'s chart.`,
    sign: (sign: string) => `In ${sign}`,
    house: (roman: string, name: string) => `In house ${roman}, ${name}`,
    /** Under the body's name in the example: whose chart it is. */
    whose: (person: string) => `In ${person}'s chart`,
  },

  // PLACEHOLDER: the note under each key it applies to.
  notes: {
    birthTime: 'Needs your birth time.',
    generational: 'Shared by everyone born within a few years of you.',
  },

  // PLACEHOLDER: one line under a group's heading, only where it carries something the keys do not.
  groupLedes: {
    generational:
      'Uranus, Neptune, and Pluto move slowly, so their signs belong to a whole generation. Their houses are yours alone.',
  } as Partial<Record<BodyGroup, string>>,

  // PLACEHOLDER: why a body has one key, not two, in place of the missing one.
  noKey: {
    rising: 'No house key. Your rising sign is where house I begins.',
    galacticCenter: 'No sign key. The Galactic Center sits in the same sign for everyone alive today.',
  } as Partial<Record<BodyId, string>>,

  // PLACEHOLDER: the houses' heading and intro. "The unfolding journey" is Dawa's name for the twelve questions.
  houses: {
    eyebrow: 'The unfolding journey',
    line: 'Twelve houses.',
    accent: 'One question each.',
    intro: 'A house key names the house a planet was in when you were born. Each house asks a question.',
    /** The section's name in the contents list. */
    contents: 'The twelve houses',
    /** For a screen reader, ahead of the Roman numeral. */
    numberLabel: 'House',
  },

  // PLACEHOLDER: one whole chart, read in Keys. "Putting it all together" is Dawa's heading for his
  // worked examples. The chart's details are in content/keys-example.ts.
  example: {
    id: 'one-chart',
    contents: 'One chart, in Keys',
    eyebrow: 'Putting it all together',
    line: 'One chart.',
    accent: 'All 28 Keys.',
    intro: (born: string) =>
      `${born}. The birth certificate records the time, so every one of Einstein's Keys can be read.`,
    /** Dawa's way of signing a quote: "Leo Tribe, Aries Vibe, Libra Clan". */
    signature: (person: string, three: string) => `${person}, ${three}`,
    /** The house that holds the most keys. Spelled-out counts read better in a sentence. */
    cluster: (count: number, roman: string, house: string, keys: string) =>
      `${['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][count] ?? count} of Einstein's Keys sit in house ${roman}, ${house}: ${keys}.`,
    houseHeading: 'House',
    signHeading: 'Sign',
  },

  // PLACEHOLDER: how keys connect people. "Coherence and connection" is Dawa's heading for the
  // matching in his doc; the points he gives each match are his to settle, so none are shown.
  connect: {
    id: 'where-charts-meet',
    contents: 'Where charts meet',
    eyebrow: 'Coherence and connection',
    title: 'Where two charts meet.',
    items: (k: { tribe: string; clan: string; kingdom: string; vibe: string; voice: string }) => [
      {
        title: 'The same sign',
        body: `Two Moons in one sign share a ${k.clan}. Two Suns in one sign share a ${k.tribe}, the widest circle there is.`,
      },
      {
        title: 'The same house',
        body: `Two Suns in the same house share a ${k.kingdom}, whatever their signs. Houses need a birth time, so these matches are rarer.`,
      },
      {
        title: 'Across two Keys',
        body: `One person's ${k.vibe} can sit in the same sign as another's ${k.voice}. A thread between two different Keys still counts.`,
      },
      {
        title: 'Closer counts more',
        body: 'The same Key in the same place is the strongest thread. Add them up and you find the people whose charts meet yours most.',
      },
    ],
  },

  // PLACEHOLDER: the next step
  nextStep: {
    eyebrow: 'Start here',
    title: 'See your first three.',
    body: 'Your Sun, Moon, and Rising from your birth details. No account, nothing saved.',
    secondary: { href: '/#tribes', label: 'Find your Tribe' },
  },
};
