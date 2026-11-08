// Birth details and the member's own chart (2c): our words, not Dawa's. Every block is marked
// PLACEHOLDER until his copy replaces it. Key names come from lib/keys.ts through KeyChip, never here.

import { the } from './the';

// PLACEHOLDER: the welcome steps.
export const welcomeCopy = {
  title: 'Welcome',
  eyebrow: 'Welcome',
  /** The steps, shown as "Step 2 of 2". */
  step: (n: number) => `Step ${n} of 2`,
  /** The name comes second (David, Nov 3), so the chart is already saved when it is asked. */
  nameLine: 'Your chart is ready.',
  nameAccent: 'What should we call you?',
  nameSave: 'See my chart',
  redraw: 'Your details are saved, but your chart was not drawn. Check them and save once more.',
  birthLine: 'Your chart starts',
  birthAccent: 'with your birth.',
  editEyebrow: 'Your account',
  editLine: 'Your birth details,',
  editAccent: 'to change.',
  lede: 'Your chart comes from these three. Only you ever see them. Other members see signs and houses, never your birth date, time, or place.',
  date: { label: 'Birth date', help: 'Day, month, and year.' },
  time: { label: 'Birth time', help: 'As close as you know it. A birth certificate often has it.' },
  place: { label: 'Birthplace', help: 'Start typing the town or city, then pick it from the list.' },
  unknownTime: "I don't know my birth time",
  // A short form of Dawa's answer to "Why do you ask for my birth time?" (Nov 7).
  unknownTimeNote:
    'That is fine. Your time of birth dials in your rising sign and your houses, so those Keys wait for it. Most of your sign Keys still work without it, and you can add a time later from your account.',
  submit: 'Save and see my chart',
  submitEdit: 'Save changes',
  submitting: 'Saving',
  cancel: 'Back to your account',
  chooseHeading: 'One choice for you',
  choose: (body: string) =>
    `The ${body} changed sign on your birthday. Without a time, either could be yours. Read both, and pick the one that sounds more like you.`,
  chooseSubmit: 'Save my choice',
  chooseNote: 'You can change this later, and a birth time settles it.',
  /** Shown when the last change was under an hour ago; `time` is the visitor's own clock. */
  waitNote: (time: string) => `You changed these less than an hour ago. You can change them again after ${time}.`,
  /** Under a failed save: the step and the database's code, for support. No value from the form. */
  errorRef: (ref: string) => `Reference for support: ${ref}`,
  errors: {
    invalid_body: "Something in the form didn't come through. Try again.",
    invalid_date: "That date isn't valid. Pick it from the calendar, or type it in full.",
    out_of_range: 'Charts cover births from 1800 on.',
    invalid_time: "That time isn't valid. Use hours and minutes, or tick that you don't know it.",
    invalid_place: 'Pick your birthplace from the list, so we know where on Earth it is.',
    invalid_pick: 'Pick one of the two signs.',
    too_soon: 'You changed these less than an hour ago. Try again in a little while.',
    limit: 'Too many tries. Wait a few minutes, then try again.',
    failed: "Your details didn't save this time. Try again in a moment.",
  },
};

// PLACEHOLDER: the member's own chart page.
export const yourChartCopy = {
  title: 'Your chart',
  eyebrow: 'Your chart',
  line: 'Your three,',
  accent: 'saved.',
  lede: 'Your Sun, your Moon, and your rising sign start your chart. Your 28 Keys follow below.',
  /** On a picked sign: "You chose Leo. Virgo is the other one it could be." */
  picked: (chosen: string, other: string) => `You chose ${chosen}. ${other} is the other sign it could be.`,
  noTime: 'You saved your chart without a birth time, so Rising and the houses wait on one.',
  // PLACEHOLDER: the member's own Keys, one planet at a time as Dawa writes each in full
  // (content/planets.ts). Key names arrive as arguments.
  keys: {
    eyebrow: 'Your Keys',
    // Dawa's headline (Nov 7). He will rewrite the introduction later.
    line: 'Your planets,',
    accent: 'your Keys.',
    lede: 'Each planet in your chart gives you two Keys: one from its sign and one from its house.',
    /** "Jupiter in Leo" */
    inSign: (planet: string, sign: string) => `${planet} in ${sign}`,
    /** "Jupiter in house X, Accomplishment" */
    inHouse: (planet: string, roman: string, name: string) => `${planet} in house ${roman}, ${name}`,
    noTime: (keyName: string) => `Your ${keyName} needs your birth time. Add it and it appears here.`,
    more: (planet: string) => `All of ${the(planet)}'s Keys`,
  },
  // The Chinese zodiac sign (3y, admin to-do): a small panel under Your Keys. PLACEHOLDER words for Dawa.
  chinese: {
    title: 'Your Chinese zodiac sign',
    /** "Fire Horse" */
    name: (element: string, animal: string) => `${element} ${animal}`,
    /** "February 17, 1966" */
    body: (newYear: string) =>
      `It comes from the Chinese calendar, a tradition separate from your Western chart. Your Chinese year began at Lunar New Year, ${newYear}, and each year pairs one of twelve animals with one of five elements.`,
  },
  next: {
    eyebrow: 'What comes next',
    line: 'Your chart is the start.',
    accent: 'Here is where it leads.',
    /** "Meet the Leo Tribe" */
    tribe: (sign: string) => `Meet the ${sign} Tribe`,
    tribeBody: 'Your Sun sign is your Tribe: the people who share it, and what you have in common.',
    cards: [
      { href: '/keys', title: 'The 28 Keys', body: 'Each Key unlocks a piece of your horoscope. Read them all.' },
      { href: '/oracle', title: 'The Daily Oracle', body: 'One hexagram and one card, new each day.' },
      { href: '/sky', title: "Today's sky", body: 'Where the Sun, the Moon, and every planet are right now.' },
      { href: '/members', title: 'Members', body: 'Find the members who share your Keys.' },
      { href: '/famous', title: 'Famous charts', body: 'See how your chart meets the charts of famous people from history.' },
    ],
    shareTitle: 'Share your three',
    shareBody: 'The link carries your three signs and nothing else: no date, no time, no place.',
    edit: 'Change your birth details',
    addTime: 'Add your birth time',
  },
};

// PLACEHOLDER: the header's account menu.
export const accountMenuCopy = {
  /** The button's name for screen readers, with the member's name. */
  open: (name: string) => `${name}, account menu`,
  chart: 'Your chart',
  members: 'Members',
  /** Only for someone on the admin list (0004). */
  admin: 'Admin',
  account: 'Account',
  signOut: 'Sign out',
};

// PLACEHOLDER: the first-visit welcome guide on Your chart (David, Nov 4: "the welcome you propose
// sounds good"). Four short steps, shown once, skippable. Our words in Dawa's register until his copy
// replaces them. No key name is typed here.
export const welcomeGuideCopy = {
  /** The dialog's name for screen readers. */
  label: 'Welcome to AstroTribes',
  /** "Welcome, 1 of 4" */
  eyebrow: (n: number, total: number) => `Welcome, ${n} of ${total}`,
  steps: [
    {
      id: 'birth',
      line: 'Your chart starts',
      accent: 'with your birth.',
      body: [
        'Your birth date, time, and place draw everything you see here. Only you ever see them.',
        'To fix a detail or add a birth time later, open Account in the menu at the top of any page.',
      ],
      links: [],
    },
    {
      id: 'chart',
      line: 'Your chart',
      accent: 'and your Tribe.',
      body: [
        'The wheel on this page is the sky at the moment you were born. Tap any planet to see its two Keys, one from its sign and one from its house, and what they say about you.',
        'Your Sun sign is your Tribe. Further down the page you can meet the people who share it.',
      ],
      links: [],
    },
    {
      id: 'members',
      line: 'Find',
      accent: 'your people.',
      body: [
        'Members shows the people who share Keys with you, the closest connections first.',
        'For now every member can see every other member. You choose who sees your chart in Account. No one ever sees your birth date, time, or place.',
      ],
      links: [{ href: '/members', label: 'See members' }],
    },
    {
      id: 'more',
      line: 'Go further',
      accent: 'when you like.',
      body: [
        'Famous charts sets your chart beside well-known people from history, and shows what you share.',
        'Learn holds Dawa’s articles on the planets, one at a time, in fresh words for today.',
      ],
      links: [
        { href: '/famous', label: 'Famous charts' },
        { href: '/learn', label: 'Learn' },
      ],
    },
  ],
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  done: 'Done',
  close: 'Close',
  /** On Your chart, to open the guide again. */
  again: 'Take the welcome tour again',
};
