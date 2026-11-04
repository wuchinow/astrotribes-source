// The members pages and the visibility setting (3g): our words, not Dawa's. Every block is marked
// PLACEHOLDER until his copy replaces it. Key names come from lib/keys.ts, never from here.
import type { Visibility } from '@/lib/visibility';

// PLACEHOLDER: who can see your chart, on the account page. The levels are open decision 10 (Dawa's).
export const visibilityCopy = {
  heading: 'Who can see your chart',
  levels: {
    private: { label: 'Only you', body: 'No other member sees your chart. Everyone starts here.' },
    tribe: { label: 'Your Tribe', body: 'Members who share your Sun sign.' },
    everyone: { label: 'All members', body: 'Anyone signed in to AstroTribes.' },
  } satisfies Record<Visibility, { label: string; body: string }>,
  what: 'Members who can see you see your name, the signs and houses in your chart, and the Keys you share. They never see your birth date, time, or place. Signs and houses together can hint at when you were born, so choose what feels right.',
  save: 'Save',
  saved: 'Saved.',
  failed: "That didn't save. Try again.",
  members: 'See members',
};

// PLACEHOLDER: the members list.
export const membersCopy = {
  title: 'Members',
  eyebrow: 'Members',
  line: 'Who shares',
  accent: 'your Keys.',
  lede: 'Members who let you see their chart, and the Keys you have in common. The ones you have the most connection points with come first.',
  yourSetting: (label: string) => `Who can see your chart: ${label}.`,
  change: 'Change this',
  privateNote: "Other members can't see you here until you change it. You can still see the members who let you.",
  emptyHeading: 'No one to show yet',
  emptyBody:
    'Members appear here once they let others see their chart. Ask a friend to choose All members on their account page.',
  failed: "We couldn't load members just now. Try again in a minute.",
  demo: 'Demo',
  more: (count: number) => `and ${count} more`,
  open: (name: string) => `See the Keys you share with ${name}`,
};

/** "25 connection points" (3p). */
export const pointsCount = (count: number): string =>
  count === 1 ? '1 connection point' : `${count} connection points`;

/** "3 Keys in common", or none. Generational keys are counted apart. */
export const sharedCount = (count: number): string =>
  count === 0 ? 'No personal Keys in common' : count === 1 ? '1 Key in common' : `${count} Keys in common`;

// PLACEHOLDER: one member's page.
export const memberCopy = {
  eyebrow: 'A member',
  accent: 'and you.',
  threeHeading: (name: string) => `${name}'s Sun, Moon, and rising`,
  sharedHeading: 'Keys you share',
  sharedNone: "You don't share any personal Keys. That happens: there are 28 of them, and a lot of ways to differ.",
  generationalNote: 'Most people born within a few years of each other share these.',
  noTimeMine: 'House Keys need a birth time from both of you.',
  addTime: 'Add your birth time',
  noTimeTheirs: (name: string) => `House Keys need a birth time from both of you, and ${name} hasn't added one.`,
  back: 'All members',
};

/** "Sun and Moon", "Sun, Moon, and Rising". */
const joinNames = (names: readonly string[]): string =>
  names.length <= 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;

// PLACEHOLDER: how the connection points add up, on one member's page (3p). Body names come from
// lib/keys.ts (BODIES), and Key names reach the screen only through KeyChip.
export const pointsCopy = {
  heading: 'How your points add up',
  intro:
    'Every Key you share earns points, and so do a few ways your charts meet. These values are a first pass, and Dawa may tune them.',
  keysHeading: 'Keys you share',
  crossHeading: 'Where your charts meet',
  bonusHeading: 'Rare combinations',
  cross: (mine: string, theirs: string, where: string) => `Your ${mine} and their ${theirs}, both in ${where}`,
  house: (roman: string) => `house ${roman}`,
  bonus: (names: readonly string[]) => `The same ${joinNames(names)} signs`,
  mirror: (northNode: string) => `Not counted: it always mirrors the ${northNode}.`,
  points: (count: number) => (count === 0 ? '0' : `+${count}`),
  total: 'Connection points',
  noTime: 'House Keys and Rising need a birth time from both of you, so they are not counted here.',
};
