// The free chart's words: the passcode page, the form, the result, and the share page. Dawa writes
// the site copy; until his arrives every block here is ours and marked PLACEHOLDER. Key names come
// from lib/keys.ts through KeyChip, never typed here (Tribe, the brand noun, may be).

import type { ThreeBody } from '@/lib/free-chart';

// PLACEHOLDER: the passcode page.
export const previewCopy = {
  eyebrow: 'Preview',
  line: "Today's sky",
  accent: 'is in preview.',
  body: 'Anyone can open it. Type the passcode below to come in.',
  /** Shown with the passcode itself (David, Oct 22). */
  code: 'The passcode is',
  label: 'Passcode',
  submit: 'Open the preview',
  wrong: "That passcode didn't match. Check it and try again.",
  closed: 'The preview is closed right now.',
  elsewhere: 'Meanwhile, the daily oracle is open to everyone.',
  oracle: 'The daily oracle',
  home: 'Back to the home page',
};

// PLACEHOLDER: the form.
export const formCopy = {
  eyebrow: 'Free, no sign-up',
  line: 'Your free chart,',
  accent: 'in three signs.',
  lede: 'Your Sun, Moon, and Rising, from your birth date, time, and place.',
  whyWeAsk:
    'Why we ask: your date, time, and place set your chart. We use them once for this page and keep nothing.',
  date: { label: 'Date of birth', help: 'Pick it from the calendar, or type it in.' },
  time: { label: 'Time of birth', help: 'As close as you know it. A birth certificate often has it.' },
  unknownTime: "I don't know my birth time",
  unknownTimeNote: 'No time? You still get your Sun and Moon. Your rising sign needs one.',
  place: {
    label: 'Place of birth',
    help: 'Start typing the town or city, then pick it from the list.',
    searching: 'Searching',
    none: 'No places match that yet. Try the nearest town.',
    count: (n: number) => (n === 1 ? '1 place found.' : `${n} places found.`),
  },
  submit: 'Show my three',
  submitting: 'Working it out',
  noscript: 'The free chart needs JavaScript to find your birthplace and work out your signs.',
};

// PLACEHOLDER: the errors, in ember under the field or the form.
export const errorCopy = {
  invalid_date: "That date isn't valid. Pick it from the calendar, or type it in full.",
  out_of_range: 'The chart covers births from 1800 on.',
  invalid_time: "That time isn't valid. Use hours and minutes, or tick that you don't know it.",
  invalid_place: 'Pick your birthplace from the list, so we know where on Earth it is.',
  rate_limited: "That's a lot of charts at once. Wait a minute and try again.",
  place_down: "Place search isn't answering. Try again in a moment.",
  place_off: 'Place search is not set up here yet.',
  failed: "Your chart didn't come through this time. Try again in a moment.",
};

// PLACEHOLDER: the result.
export const resultCopy = {
  eyebrow: 'Your free chart',
  line: 'Your three,',
  accent: 'in plain words.',
  lede: 'Three signs, and each one is a key to your chart.',
  bodies: {
    sun: 'Sun',
    moon: 'Moon',
    rising: 'Rising',
  } satisfies Record<ThreeBody, string>,
  either: (bodyName: string) =>
    `The ${bodyName} changed sign on your birth date, so the time decides it. A birth time settles it.`,
  risingUnknown: {
    title: 'Rising needs a time',
    body: 'Your rising sign moves through all twelve signs in a day, so only a birth time can place it. A birth certificate, a hospital record, or a parent may have it.',
  },
  /** On a shared page the chart is someone else's. */
  shared: {
    either: (bodyName: string) =>
      `The ${bodyName} changed sign on their birth date, so the time decides it.`,
    risingUnknown:
      'The rising sign moves through all twelve signs in a day, so it waits on a birth time.',
  },
  next: {
    eyebrow: 'What comes next',
    tribe: 'Meet your Tribe',
    tribeSoon: 'Coming soon',
    keys: 'All 28 Keys',
    keysSoon: 'Joining opens soon',
  },
  share: 'Share your three',
  copied: 'Link copied',
  shareNote: 'The link carries your three signs, nothing else.',
  startOver: 'Start over',
  facts: (element: string, mode: string, dates: string) => `${element}, ${mode}. Usual dates ${dates}.`,
};

// PLACEHOLDER: the share page.
export const shareCopy = {
  eyebrow: 'Shared from AstroTribes',
  line: 'Three signs,',
  accent: 'one sky.',
  lede: 'Someone shared their Sun, Moon, and Rising with you.',
  cta: 'Get your own free chart',
  imageAlt: (summary: string) => `${summary}, shared from AstroTribes`,
  /** "Sun in Leo, Moon in Taurus, Rising in Gemini"; Rising drops out when the time is unknown. */
  summary: (sun: string, moon: string, rising: string | null) =>
    [`Sun in ${sun}`, `Moon in ${moon}`, ...(rising ? [`Rising in ${rising}`] : [])].join(', '),
  risingUnknown: 'Rising waits on a birth time',
};
