// The words around the 12 Clan pages (Moon sign) and 12 Vibe pages (rising sign), their two index pages, and
// the Clanmate and Vibemate lists (4l, Nov 8; Dawa's Nov 7 note 21, plan
// claude.ai/artifact/U5pJhfRWF1AoY11oBHdQpV, layout from his 2025 Clan docs).
//
// Dawa's own words are elsewhere: the Moon's signs, his note on the Clan, the Tribe, and the Hearth,
// and the twelve Hearth lines in content/planets.ts (the Moon's page shows the same); the rising sign's
// intro and lines in content/vibes.ts. Everything here is ours: PLACEHOLDER, for Dawa to rewrite.
// Key names arrive as arguments (`clan`, `vibe`, `hearth`, `tribe`), from lib/keys.ts.

/** "a" or "an" before a sign's name. */
const article = (word: string) => (/^[AEIOU]/.test(word) ? 'an' : 'a');

export const clanPage = {
  metaTitle: (sign: string, clan: string) => `The ${sign} ${clan}`,
  description: (sign: string, clan: string) => `The ${sign} ${clan}: everyone with the Moon in ${sign}, in Dawa’s words.`,
  hero: {
    eyebrow: (sign: string) => `Moon in ${sign}`,
    line: 'Welcome to the',
    accent: (sign: string, clan: string) => `${sign} ${clan}.`,
  },
  moon: { eyebrow: 'Your emotional nature', title: (sign: string) => `The Moon in ${sign}` },
  hearth: {
    eyebrow: (clan: string, hearth: string) => `Your ${clan} and your ${hearth}`,
    line: 'Twelve houses,',
    accent: 'twelve kinds of home.',
    lede: (hearth: string) => `Your ${hearth} is the house your Moon is in. Find yours: it needs a birth time.`,
    label: (roman: string, name: string) => `${roman} · ${name}`,
  },
  sun: {
    eyebrow: (tribe: string, clan: string) => `Your ${tribe} and your ${clan}`,
    line: 'The Sun',
    accent: 'lights the Moon.',
    lede: (sign: string, tribe: string) => `Every ${sign} Moon has a Sun sign too. Read about yours, and the twelve ${tribe}s:`,
    cardLabel: (moonSign: string, sunSign: string) => `${moonSign} Moon, ${sunSign} Sun`,
  },
  famous: {
    eyebrow: 'Famous faces',
    title: (sign: string) => `Famous ${sign} Moons`,
    lede: 'From our famous charts: people who have died, with birth times on record.',
    none: (sign: string) => `None of our famous charts has the Moon in ${sign} yet. More are on the way.`,
  },
  mates: {
    eyebrow: 'Members',
    title: (sign: string) => `${sign} Moons among the members`,
    body: (tribe: string, vibe: string, hearth: string) =>
      `Members with the Moon in this sign, with the ones who also share your ${tribe}, your ${vibe}, or your ${hearth} set apart. Only members who let others see their chart are listed.`,
    action: 'See your clanmates',
    guest: 'Sign in to see your clanmates.',
  },
  neighbors: { label: 'Clans in zodiac order', previous: 'Previous', next: 'Next', all: (clan: string) => `All 12 ${clan}s` },
  nextStep: {
    eyebrow: 'Start here',
    title: 'Find your Moon sign.',
    body: 'Your Sun, Moon, and Rising from your birth details. Free with an account, no payment.',
  },
};

export const vibePage = {
  metaTitle: (sign: string, vibe: string) => `The ${sign} ${vibe}`,
  description: (sign: string, vibe: string) => `The ${sign} ${vibe}: everyone with ${sign} rising, in Dawa’s words.`,
  hero: {
    eyebrow: (sign: string) => `${sign} rising`,
    line: 'The',
    accent: (sign: string, vibe: string) => `${sign} ${vibe}.`,
  },
  shows: { eyebrow: 'First impressions', title: (sign: string, vibe: string) => `How ${article(sign)} ${sign} ${vibe.toLowerCase()} shows up` },
  famous: {
    eyebrow: 'Famous faces',
    title: (sign: string) => `Famous ${sign} risings`,
    lede: 'From our famous charts: people who have died, with birth times on record, so each has a rising sign.',
    none: (sign: string) => `None of our famous charts has ${sign} rising yet. More are on the way.`,
  },
  mates: {
    eyebrow: 'Members',
    title: (sign: string) => `${sign} rising among the members`,
    body: (tribe: string, clan: string) =>
      `Members with this rising sign, with the ones who also share your ${tribe} or your ${clan} set apart. A rising sign needs a birth time, so only members who gave one are here, and only those who let others see their chart.`,
    action: 'See your vibemates',
    guest: 'Sign in to see your vibemates.',
  },
  noTime: {
    title: 'No birth time?',
    body: 'Your rising sign changes about every two hours, so it needs your time of birth. Add it to your chart and your rising sign appears.',
    action: 'Add your birth time',
    href: '/welcome?edit=birth',
  },
  neighbors: { label: 'Vibes in zodiac order', previous: 'Previous', next: 'Next', all: (vibe: string) => `All 12 ${vibe}s` },
  nextStep: {
    eyebrow: 'Start here',
    title: 'Find your rising sign.',
    body: 'Your Sun, Moon, and Rising from your birth details. Free with an account, no payment.',
  },
};

/** The two index pages, /clans and /vibes. */
export const clanIndex = {
  metaTitle: (clan: string) => `The 12 ${clan}s`,
  description: (clan: string) => `The twelve Moon signs, each a ${clan.toLowerCase()} of its own, in Dawa’s words.`,
  eyebrow: 'Your Moon sign',
  line: 'The twelve',
  accent: (clan: string) => `${clan}s.`,
  card: (sign: string) => `The Moon in ${sign}`,
};

export const vibeIndex = {
  metaTitle: (vibe: string) => `The 12 ${vibe}s`,
  description: (vibe: string) => `The twelve rising signs, each a ${vibe.toLowerCase()} of its own, in Dawa’s words.`,
  eyebrow: 'Your rising sign',
  line: 'The twelve',
  accent: (vibe: string) => `${vibe}s.`,
  card: (sign: string) => `${sign} rising`,
};

/** Links into the pages from Your chart, the Tribe pages, the 28 Keys page, and the Moon's page. */
export const clanLinks = {
  yourClan: (sign: string, clan: string) => `Visit the ${sign} ${clan}`,
  yourVibe: (sign: string, vibe: string) => `Visit the ${sign} ${vibe}`,
  allClans: (clan: string) => `The 12 ${clan}s`,
  allVibes: (vibe: string) => `The 12 ${vibe}s`,
  clanOf: (sign: string, clan: string) => `The ${sign} ${clan} page`,
};

// The Clanmate and Vibemate lists: member paths (/members/clan/<sign>, /members/vibe/<sign>), so the
// session is refreshed there like the members list's.
export const matesCopy = {
  clanTitle: (sign: string, clan: string) => `The ${sign} ${clan}: members`,
  vibeTitle: (sign: string, vibe: string) => `The ${sign} ${vibe}: members`,
  eyebrow: 'Members',
  clanLine: (sign: string) => `Moon in ${sign},`,
  vibeLine: (sign: string) => `${sign} rising,`,
  accent: 'among the members.',
  /** Shown only from 5 up, so a small group can't single anyone out (plan, Nov 8). */
  total: (count: number, sign: string, name: string) => `${count} members in the ${sign} ${name}, you included where you belong.`,
  groups: {
    tribe: (tribe: string, sign: string) => `Also in your ${tribe}, ${sign}`,
    vibe: (vibe: string, sign: string) => `Also your ${vibe}, ${sign} rising`,
    clan: (clan: string, sign: string) => `Also your ${clan}, Moon in ${sign}`,
    hearth: (hearth: string, roman: string) => `Also your ${hearth}, Moon in house ${roman}`,
  },
  everyone: 'Everyone you can see',
  empty: 'No one here yet that you can see. Members appear once they save their chart and let others see it.',
  failed: "We couldn't load members just now. Try again in a minute.",
  back: (sign: string, name: string) => `Back to the ${sign} ${name}`,
  allMembers: 'All members',
  noTimeVibe: 'You have no birth time saved, so you have no rising sign yet. You can still see who is here.',
};
