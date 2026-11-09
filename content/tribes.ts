// The 12 Tribe pages' words (3a, first look). The layout follows David's "warm community" direction
// (Oct 21: version 1 of the three Aries designs). Dawa writes the site copy; until his arrives, every
// block marked PLACEHOLDER holds ours, and swapping his in is a change to this file only. Key names
// and glosses come from lib/keys.ts, never typed here. Members, conversations, and art on these pages
// are examples until members can join (layer 3 fills them from the database).

import type { SignId } from '@/lib/keys';
import { The, the } from './the';
import { skyCopy } from './sky';

export interface TribeWords {
  /** The sign's symbol, in sentence case: "The ram". */
  symbol: string;
  /** What members call each other, plural: "Rams". */
  fellows: string;
  /** The ruling planet and what it stands for. A second ruler is the traditional one. */
  ruler: { name: string; line: string; traditional?: string };
  /** Three questions for the Tribe to talk over. */
  prompts: readonly [string, string, string];
  /** A light line the Tribe would recognize. */
  smile: string;
  /** Two more for the humor section (Dawa's Nov 7 note 19: "Astro humor should be an important component"). */
  jokes: readonly [string, string];
}

// PLACEHOLDER: ours, for Dawa to review. His own words for each Tribe (hello, traits, shadows, facts,
// slogans) are in content/tribe-dawa.ts, and his story paragraphs in content/sun-stories.ts.
export const TRIBE_WORDS: Record<SignId, TribeWords> = {
  aries: {
    symbol: 'The ram',
    fellows: 'Rams',
    ruler: { name: 'Mars', line: 'Mars stands for action, drive, and the way you go after what matters.' },
    prompts: [
      'What have you had the courage to begin?',
      'Anyone else learning to slow down?',
      'What did you start this year?',
    ],
    smile: '“I’m working on my patience. How long does that take?”',
    jokes: ['“How many Aries does it take to change a light bulb?” “One. It’s done. What’s next?”', 'An Aries’ favorite exercise: jumping to conclusions.'],
  },
  taurus: {
    symbol: 'The bull',
    fellows: 'Bulls',
    ruler: { name: 'Venus', line: 'Venus stands for love, beauty, and what you value enough to keep.' },
    prompts: [
      'What are you building slowly?',
      'The small comforts that keep you going',
      'How do you handle change you did not choose?',
    ],
    smile: '“I’m open to new ideas, as long as nothing changes.”',
    jokes: ['“How many Taurus does it take to change a light bulb?” “None. We like the old one.”', 'A Taurus reads the whole menu, slowly, and orders the usual.'],
  },
  gemini: {
    symbol: 'The twins',
    fellows: 'Twins',
    ruler: { name: 'Mercury', line: 'Mercury stands for thought, words, and the way ideas travel.' },
    prompts: [
      'What are you curious about this week?',
      'Too many tabs open: how do you choose?',
      'The best conversation you had lately',
    ],
    smile: '“I have two moods and both of them have opinions.”',
    jokes: ['“How many Geminis does it take to change a light bulb?” “Two. Or one, depending on the mood.”', 'A Gemini’s to-do list has a podcast on, three tabs open, and a second to-do list.'],
  },
  cancer: {
    symbol: 'The crab',
    fellows: 'Crabs',
    ruler: { name: 'Moon', line: 'The Moon stands for feeling, home, and the way you look after people.' },
    prompts: [
      'Where do you feel most at home?',
      'Family you were born to, family you chose',
      'How do you take care of yourself, not just everyone else?',
    ],
    smile: '“I’m not crying, I’m remembering something from 2009.”',
    jokes: ['“How many Cancers does it take to change a light bulb?” “One, but they keep the old bulb for sentimental reasons.”', 'A Cancer’s idea of going out: inviting everyone over.'],
  },
  leo: {
    symbol: 'The lion',
    fellows: 'Lions',
    ruler: { name: 'Sun', line: 'The Sun stands for the self, vitality, and the light you bring to a room.' },
    prompts: [
      'What lights you up right now?',
      'Something you made that you are proud of',
      'How do you share the spotlight?',
    ],
    smile: '“I don’t need attention. I just like it when it finds me.”',
    jokes: ['“How many Leos does it take to change a light bulb?” “One. Everyone else holds the ladder and claps.”', 'A Leo’s favorite song is the one they’re singing.'],
  },
  virgo: {
    symbol: 'The maiden',
    fellows: 'Virgos',
    ruler: { name: 'Mercury', line: 'Mercury stands for thought, words, and the way you sort and improve things.' },
    prompts: [
      'A small habit that changed a lot',
      'How do you rest when there is always more to fix?',
      'Something useful you learned this month',
    ],
    smile: '“I’m relaxed. I made a list of ways to relax.”',
    jokes: ['“How many Virgos does it take to change a light bulb?” “One, after cleaning the fixture and checking the wattage.”', 'A Virgo doesn’t judge. They just notice everything, quietly, with notes.'],
  },
  libra: {
    symbol: 'The scales',
    fellows: 'Librans',
    ruler: { name: 'Venus', line: 'Venus stands for love, beauty, and the way you bring people together.' },
    prompts: [
      'What does a fair outcome look like to you?',
      'Something beautiful you noticed today',
      'How do you decide when both sides are right?',
    ],
    smile: '“I can’t decide whether this is funny. What do you think?”',
    jokes: ['“How many Libras does it take to change a light bulb?” “Hmm. Warm white or soft white?”', 'A Libra asked the group where to eat. The group is still deciding. So is the Libra.'],
  },
  scorpio: {
    symbol: 'The scorpion',
    fellows: 'Scorpios',
    ruler: {
      name: 'Pluto',
      traditional: 'Mars',
      line: 'Pluto stands for depth, power, and change from the inside out. Mars is the older ruler.',
    },
    prompts: [
      'What have you let go of that made room for something new?',
      'Who earned your trust, and how?',
      'The question you keep coming back to',
    ],
    smile: '“I’ll tell you how I feel. Eventually. Maybe.”',
    jokes: ['“How many Scorpios does it take to change a light bulb?” “Who wants to know?”', 'A Scorpio forgives. A Scorpio also remembers the exact date.'],
  },
  sagittarius: {
    symbol: 'The archer',
    fellows: 'Archers',
    ruler: { name: 'Jupiter', line: 'Jupiter stands for growth, faith, and the urge to see more.' },
    prompts: [
      'Where do you want to go next?',
      'A belief you changed your mind about',
      'The best thing a stranger taught you',
    ],
    smile: '“I’m not late. I took the scenic route through three other plans.”',
    jokes: ['“How many Sagittarians does it take to change a light bulb?” “The sun’s out. Let’s go outside.”', 'A Sagittarius tells you a hard truth, then invites you on a road trip.'],
  },
  capricorn: {
    symbol: 'The sea goat',
    fellows: 'Goats',
    ruler: { name: 'Saturn', line: 'Saturn stands for structure, time, and what you build to last.' },
    prompts: [
      'What are you working toward this year?',
      'How do you know when to rest?',
      'Advice you would give your younger self',
    ],
    smile: '“I scheduled some spontaneity for Thursday.”',
    jokes: ['“How many Capricorns does it take to change a light bulb?” “None. They hired someone, and now they own the light bulb company.”', 'A Capricorn is born forty and gets younger every year.'],
  },
  aquarius: {
    symbol: 'The water bearer',
    fellows: 'Water bearers',
    ruler: {
      name: 'Uranus',
      traditional: 'Saturn',
      line: 'Uranus stands for change, freedom, and the unexpected. Saturn is the older ruler.',
    },
    prompts: [
      'An idea you think the world is ready for',
      'How do you belong without fitting in?',
      'The community that shaped you',
    ],
    smile: '“I’m a team player. The team just hasn’t caught up yet.”',
    jokes: ['“How many Aquarians does it take to change a light bulb?” “Light bulbs? We’re building a better sun.”', 'An Aquarius loves humanity. People, one at a time, are a work in progress.'],
  },
  pisces: {
    symbol: 'The fish',
    fellows: 'Fish',
    ruler: {
      name: 'Neptune',
      traditional: 'Jupiter',
      line: 'Neptune stands for dreams, compassion, and imagination. Jupiter is the older ruler.',
    },
    prompts: [
      'A dream you remember',
      'Where do you find quiet?',
      'Something that moved you this week',
    ],
    smile: '“I didn’t forget. I was somewhere else for a minute.”',
    jokes: ['“How many Pisces does it take to change a light bulb?” “What light bulb? I was watching the Moon.”', 'A Pisces cried at a commercial, then wrote it a poem.'],
  },
};

/** "an Aries", "a Leo". */
const article = (sign: string) => (/^[AEIOU]/.test(sign) ? 'an' : 'a');

// PLACEHOLDER: the page's shared words.
export const tribePage = {
  placeholder: true,
  reviewed: false,

  metaTitle: (sign: string) => `The ${sign} Tribe`,
  description: (sign: string) => `Your Tribe home on AstroTribes: what ${sign} shares, and the people who share it.`,

  // Dawa (Oct 23 Tribe page doc): "Welcome Home!!" and "Because you are unique, but never alone".
  hero: {
    eyebrow: 'Your Tribe',
    line: 'Welcome home,',
    accent: (sign: string) => `${sign}!`,
    lede: 'Because you are unique, but never alone.',
    note: 'Free with an account. No payment.',
  },

  // Dawa's "Hello" and story paragraphs (content/tribe-dawa.ts, content/sun-stories.ts).
  hello: {
    eyebrow: (sign: string) => `Hello, ${sign}`,
    story: 'Your Tribe’s story',
  },

  signature: {
    eyebrow: 'The signature',
    line: (sign: string) => `What every ${sign}`,
    accent: 'has in common.',
    // Dawa's name for it (Nov 7 note 19). The lines are ours (TRIBE_WORDS), for him to swap.
    smileLabel: 'Astro humor',
    // Dawa's words (Tribe Shadows doc, Oct 26), lightly edited for punctuation. Not a placeholder.
    shadow: {
      // Dawa, Nov 7: "Your Tribe’s Shadow Side".
      label: 'Your Tribe’s shadow side',
      note: [
        'Not every Tribe member necessarily has each of these shadows. They are not meant to insult! They are the potential pitfalls, and represent the shadow side of each zodiac sign.',
        'But keep in mind, the shadow is as valid as the Tribe’s more traditionally positive qualities. The shadow exists because of the Sun’s light. There cannot be one without the other. To fully understand a zodiac sign’s energy, you must know all aspects of each sign.',
      ],
    },
    facts: {
      dates: 'Sun dates',
      latin: 'The name',
      element: 'Element',
      mode: 'Mode',
      symbol: 'Symbol',
      ruler: 'Ruling planet',
      house: 'House affinity',
      season: 'Season',
      stars: 'Key stars',
    },
    traits: 'Traits',
    didYouKnow: 'Did you know?',
    // PLACEHOLDER: our words, beside the Urania's Mirror card (4j), until Dawa's copy replaces them.
    plate: {
      label: 'In the night sky',
      line: (sign: string) =>
        `The ${sign} constellation on a hand-colored star card from 1824. Its stars were punched through, so they shone when you held the card up to a lamp.`,
    },
    traditional: (name: string) => `${The(name)} is the traditional ruler.`,
  },

  famous: {
    eyebrow: 'Tribe celebrities',
    title: (sign: string) => `Well-known members of the ${sign} Tribe`,
    lede: 'Oldest first. A name in blue opens their chart.',
  },

  // Filled from Today's sky (lib/tribe-news.ts) until Dawa's monthly news arrives.
  news: {
    eyebrow: 'News flash',
    title: (sign: string) => `This week in the ${sign} sky`,
    ruler: (planet: string, sign: string, retrograde: boolean) =>
      `Your ruling planet, ${the(planet)}, is in ${sign}${retrograde ? ', and retrograde' : ''}.`,
    visiting: (bodies: string[], sign: string) => {
      const names = bodies.map((b, i) => (i === 0 ? The(b) : the(b)));
      const list = names.length > 2 ? `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}` : names.join(' and ');
      return `${list} ${names.length > 1 ? 'are' : 'is'} in ${sign} now.`;
    },
    nobody: (sign: string) => `No planet is in ${sign} right now.`,
    moonVisit: (sign: string) => `The Moon visits ${sign} on`,
    lunation: { full: (sign: string) => `Full Moon in ${sign}:`, new: (sign: string) => `New Moon in ${sign}:` },
    ingress: skyCopy.soon.ingress,
    leaves: (body: string, sign: string) => `${The(body)} leaves for ${sign}`,
    retrograde: skyCopy.soon.retrograde,
    direct: skyCopy.soon.direct,
    more: { href: '/sky', label: 'See all of today’s sky' },
  },

  // Key names come from lib/keys.ts: the counts are written around them.
  people: {
    // Dawa, Nov 7: "Tighter connections" and "1728 possibilities", counted over his three, Tribe, Clan, and Vibe.
    eyebrow: 'Tighter connections',
    line: (count: number) => count.toLocaleString('en-US'),
    accent: 'possibilities.',
    lede: (sign: string) =>
      `Everyone here is ${article(sign)} ${sign} Sun. Your Moon sign and your rising sign make you one of 144 kinds of ${sign}, and one of 1,728 across all twelve Tribes. Match on all three to find the people closest to you.`,
    sum: (tribe: string, moon: string, rising: string) =>
      `Twelve ${tribe}s times twelve ${moon}s times twelve ${rising}s.`,
    action: 'Find your three',
  },

  fire: {
    eyebrow: (sign: string) => `Around the ${sign} fire`,
    line: 'Three conversations',
    accent: 'to bring with you.',
    lede: 'Your Tribe talks them over when the doors open. Start thinking now.',
  },

  opening: {
    eyebrow: 'As members join',
    title: (sign: string) => `Your ${sign} home fills up.`,
    items: (fellows: string, sign: string) => [
      { title: 'Conversations', body: `Questions, wins, and advice, between people who share your Sun.` },
      { title: `Meet your fellow ${fellows.toLowerCase()}`, body: 'A directory by birthday or by the day they joined, showing only what each member shares.' },
      { title: 'The gallery', body: `Room for three pieces of art from every member, with ${article(sign)} ${sign} piece in the spotlight each month.` },
      { title: `${sign} through the years`, body: 'The stories behind the well-known members, oldest first.' },
    ],
  },

  family: {
    eyebrow: (element: string) => `The ${element.toLowerCase()} family`,
    line: 'Your element,',
    accent: 'shared three ways.',
    lede: (sign: string, element: string, others: string) =>
      `${sign} shares ${element.toLowerCase()} with ${others}. Same element, a different way of using it.`,
    and: ' and ',
  },

  neighbors: { label: 'Tribes in zodiac order', previous: 'Previous Tribe', next: 'Next Tribe' },

  nextStep: {
    eyebrow: 'Start here',
    title: 'Find your first three.',
    body: 'Your Sun, Moon, and Rising from your birth details. Free with an account, no payment.',
    secondary: { href: '/#tribes', label: 'See all 12 Tribes' },
  },

  element: { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' } as const,
  mode: { cardinal: 'Cardinal: starts things', fixed: 'Fixed: sees things through', mutable: 'Mutable: adapts and connects' } as const,
};
