// The 12 Tribe pages' words (3a, first look). The layout follows David's "warm community" direction
// (Oct 21: version 1 of the three Aries designs). Dawa writes the site copy; until his arrives, every
// block marked PLACEHOLDER holds ours, and swapping his in is a change to this file only. Key names
// and glosses come from lib/keys.ts, never typed here. Members, conversations, and art on these pages
// are examples until members can join (layer 3 fills them from the database).

import type { SignId } from '@/lib/keys';

export interface TribeWords {
  /** The sign's symbol, in sentence case: "The ram". */
  symbol: string;
  /** What members call each other, plural: "Rams". */
  fellows: string;
  /** One line under the hero headline. */
  tagline: string;
  /** Four qualities for the signature chips. */
  traits: readonly [string, string, string, string];
  /** The ruling planet and what it stands for. A second ruler is the traditional one. */
  ruler: { name: string; line: string; traditional?: string };
  /** Three questions for the Tribe to talk over. */
  prompts: readonly [string, string, string];
  /** A light line the Tribe would recognize. */
  smile: string;
}

// PLACEHOLDER: every sign's words. reviewed: false until Dawa approves them.
export const TRIBE_WORDS: Record<SignId, TribeWords> = {
  aries: {
    symbol: 'The ram',
    fellows: 'Rams',
    tagline: 'Your spark. Your people. Your place in the circle.',
    traits: ['Courage', 'Initiative', 'Independence', 'Enthusiasm'],
    ruler: { name: 'Mars', line: 'Mars stands for action, drive, and the way you go after what matters.' },
    prompts: [
      'What have you had the courage to begin?',
      'Anyone else learning to slow down?',
      'What did you start this year?',
    ],
    smile: '“I’m working on my patience. How long does that take?”',
  },
  taurus: {
    symbol: 'The bull',
    fellows: 'Bulls',
    tagline: 'Steady ground. Good company. A place to stay a while.',
    traits: ['Patience', 'Loyalty', 'Comfort', 'Persistence'],
    ruler: { name: 'Venus', line: 'Venus stands for love, beauty, and what you value enough to keep.' },
    prompts: [
      'What are you building slowly?',
      'The small comforts that keep you going',
      'How do you handle change you did not choose?',
    ],
    smile: '“I’m open to new ideas, as long as nothing changes.”',
  },
  gemini: {
    symbol: 'The twins',
    fellows: 'Twins',
    tagline: 'Two minds, many questions, and a room full of people who get it.',
    traits: ['Wit', 'Versatility', 'Questions', 'Connection'],
    ruler: { name: 'Mercury', line: 'Mercury stands for thought, words, and the way ideas travel.' },
    prompts: [
      'What are you curious about this week?',
      'Too many tabs open: how do you choose?',
      'The best conversation you had lately',
    ],
    smile: '“I have two moods and both of them have opinions.”',
  },
  cancer: {
    symbol: 'The crab',
    fellows: 'Crabs',
    tagline: 'A soft place to land, among people who remember.',
    traits: ['Care', 'Memory', 'Protection', 'Intuition'],
    ruler: { name: 'Moon', line: 'The Moon stands for feeling, home, and the way you look after people.' },
    prompts: [
      'Where do you feel most at home?',
      'Family you were born to, family you chose',
      'How do you take care of yourself, not just everyone else?',
    ],
    smile: '“I’m not crying, I’m remembering something from 2009.”',
  },
  leo: {
    symbol: 'The lion',
    fellows: 'Lions',
    tagline: 'Warmth, light, and a circle that cheers you on.',
    traits: ['Warmth', 'Generosity', 'Pride', 'Play'],
    ruler: { name: 'Sun', line: 'The Sun stands for the self, vitality, and the light you bring to a room.' },
    prompts: [
      'What lights you up right now?',
      'Something you made that you are proud of',
      'How do you share the spotlight?',
    ],
    smile: '“I don’t need attention. I just like it when it finds me.”',
  },
  virgo: {
    symbol: 'The maiden',
    fellows: 'Virgos',
    tagline: 'Care in the details, and people who notice them too.',
    traits: ['Care', 'Precision', 'Service', 'Discernment'],
    ruler: { name: 'Mercury', line: 'Mercury stands for thought, words, and the way you sort and improve things.' },
    prompts: [
      'A small habit that changed a lot',
      'How do you rest when there is always more to fix?',
      'Something useful you learned this month',
    ],
    smile: '“I’m relaxed. I made a list of ways to relax.”',
  },
  libra: {
    symbol: 'The scales',
    fellows: 'Librans',
    tagline: 'Balance, beauty, and good company to share them with.',
    traits: ['Harmony', 'Fairness', 'Grace', 'Partnership'],
    ruler: { name: 'Venus', line: 'Venus stands for love, beauty, and the way you bring people together.' },
    prompts: [
      'What does a fair outcome look like to you?',
      'Something beautiful you noticed today',
      'How do you decide when both sides are right?',
    ],
    smile: '“I can’t decide whether this is funny. What do you think?”',
  },
  scorpio: {
    symbol: 'The scorpion',
    fellows: 'Scorpios',
    tagline: 'Depth, trust, and people who go all the way in.',
    traits: ['Depth', 'Loyalty', 'Intensity', 'Renewal'],
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
  },
  sagittarius: {
    symbol: 'The archer',
    fellows: 'Archers',
    tagline: 'Wide horizons, big questions, and friends for the road.',
    traits: ['Optimism', 'Freedom', 'Honesty', 'Adventure'],
    ruler: { name: 'Jupiter', line: 'Jupiter stands for growth, faith, and the urge to see more.' },
    prompts: [
      'Where do you want to go next?',
      'A belief you changed your mind about',
      'The best thing a stranger taught you',
    ],
    smile: '“I’m not late. I took the scenic route through three other plans.”',
  },
  capricorn: {
    symbol: 'The sea goat',
    fellows: 'Goats',
    tagline: 'Steady climbing, good footing, and people who respect the work.',
    traits: ['Discipline', 'Ambition', 'Responsibility', 'Endurance'],
    ruler: { name: 'Saturn', line: 'Saturn stands for structure, time, and what you build to last.' },
    prompts: [
      'What are you working toward this year?',
      'How do you know when to rest?',
      'Advice you would give your younger self',
    ],
    smile: '“I scheduled some spontaneity for Thursday.”',
  },
  aquarius: {
    symbol: 'The water bearer',
    fellows: 'Water bearers',
    tagline: 'Fresh ideas, a common cause, and room to be yourself.',
    traits: ['Originality', 'Friendship', 'Vision', 'Independence'],
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
  },
  pisces: {
    symbol: 'The fish',
    fellows: 'Fish',
    tagline: 'Dreams, compassion, and a current that carries you home.',
    traits: ['Compassion', 'Imagination', 'Intuition', 'Empathy'],
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

  hero: {
    eyebrow: 'Your Tribe',
    line: 'Welcome home,',
    accent: (sign: string) => `${sign}.`,
    note: 'Free, and nothing is saved.',
  },

  signature: {
    eyebrow: 'The signature',
    line: (sign: string) => `What every ${sign}`,
    accent: 'has in common.',
    smileLabel: 'You will recognize this',
    facts: { dates: 'Sun dates', element: 'Element', mode: 'Mode', symbol: 'Symbol', ruler: 'Ruling planet' },
    traditional: (name: string) => `${name} is the traditional ruler.`,
  },

  // Key names come from lib/keys.ts: the counts are written around them.
  people: {
    eyebrow: 'Closer connections',
    line: 'One Tribe,',
    accent: (count: number) => `${count.toLocaleString('en-US')} kinds of you.`,
    lede: (sign: string) =>
      `Everyone here is ${article(sign)} ${sign} Sun. Your Moon, your rising sign, and the house your Sun sits in make you one of many kinds of ${sign}. Match on any of them to find the people closest to you.`,
    sum: (moon: string, rising: string, house: string) =>
      `Twelve ${moon}s times twelve ${rising}s times twelve ${house}s.`,
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
      { title: `${sign} through the years`, body: 'Well-known members of the Tribe and their stories, oldest first.' },
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
    body: 'Your Sun, Moon, and Rising from your birth details. No account, nothing saved.',
    secondary: { href: '/#tribes', label: 'See all 12 Tribes' },
  },

  element: { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' } as const,
  mode: { cardinal: 'Cardinal: starts things', fixed: 'Fixed: sees things through', mutable: 'Mutable: adapts and connects' } as const,
};
