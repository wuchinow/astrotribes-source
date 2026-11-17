// The Moon's phase at birth on Your chart (5h, Dawa's Nov 15 note 9). PLACEHOLDER: our words, after the
// eight phases of the lunation cycle as Dane Rudhyar described them. His book is under copyright, so
// nothing here is his text; each paragraph is listed in Notion "Drafts for Dawa to review" for Dawa to
// rewrite in his own voice. No key name is typed here.

import type { BirthPhase } from '@/lib/birth-moon';

export const birthMoonCopy = {
  title: 'The Moon you were born under',
  /** In the side list. */
  rail: 'Your birth Moon',
  /** "Gibbous Moon or Full Moon" */
  orName: (phase: string, other: string) => `${phase} or ${other}`,
  /** With no birth time, when the day crossed from one phase to the next. */
  either: (phase: string, other: string) =>
    `Without a birth time we can’t be sure: the Moon moved from one phase to the next that day, so yours is the ${phase} or the ${other}. Read both, and see which sounds more like you.`,
  intro:
    'Every month the Moon goes from new to full and back again. Where it stood in that cycle when you were born colors how you meet life: as a starter, a builder, a sharer, or someone who closes one chapter and seeds the next.',
  source: 'The eight phases follow the astrologer Dane Rudhyar’s lunation cycle.',
  names: {
    new: 'New Moon',
    crescent: 'Crescent Moon',
    firstQuarter: 'First Quarter Moon',
    gibbous: 'Gibbous Moon',
    full: 'Full Moon',
    disseminating: 'Disseminating Moon',
    lastQuarter: 'Last Quarter Moon',
    balsamic: 'Balsamic Moon',
  } satisfies Record<BirthPhase, string>,
  /** The everyday name, where Rudhyar's differs from it. */
  also: {
    new: null,
    crescent: 'waxing crescent',
    firstQuarter: null,
    gibbous: 'waxing gibbous',
    full: null,
    disseminating: 'waning gibbous',
    lastQuarter: null,
    balsamic: 'waning crescent',
  } satisfies Record<BirthPhase, string | null>,
  /** "also called the waxing crescent" */
  alsoCalled: (name: string) => `Also called the ${name}.`,
  lines: {
    new: 'The Moon had just passed the Sun and the sky was dark. You act on instinct and leap before the map is drawn. You learn by doing, and you start things others would still be thinking over.',
    crescent:
      'A thin light had just appeared. You push forward against the pull of the old and familiar. Your gift is momentum: the steady effort that gets a new idea off the ground.',
    firstQuarter:
      'The Moon was half lit and growing. You meet obstacles head on and build as you go. You come alive when there is a decision to make and something real to put up.',
    gibbous:
      'The Moon was nearly full. You refine, question, and improve. You want to know why things work, and you keep polishing until the work means something.',
    full: 'The Moon stood opposite the Sun, fully lit. You see things clearly, and you see yourself most clearly through other people. Relationships are where your life comes into focus.',
    disseminating:
      'The light had begun to ebb. You are here to share what you have found. You teach, pass on, and spread ideas, and what you learn grows when you give it away.',
    lastQuarter:
      'The Moon was half lit and fading. You question the old ways and turn toward new ones. You are often a step ahead, letting go of what no longer works before others notice it has stopped working.',
    balsamic:
      'The last sliver of light was about to disappear. You carry the end of one cycle and the seed of the next. You sense where things are headed, and you are often working for a future you can already see.',
  } satisfies Record<BirthPhase, string>,
};
