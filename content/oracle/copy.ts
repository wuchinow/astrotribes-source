// PLACEHOLDER: the Oracle's own words around the readings (1c), ours until Dawa's. The readings
// themselves are James Legge's and A. E. Waite's, quoted verbatim from iching.json and tarot.json;
// the copy rules apply to these words, not to theirs. Sentence case, no dashes.

export const oracleCopy = {
  metaTitle: 'Daily Oracle',
  description: 'One I Ching hexagram and one tarot card a day, the same for everyone.',
  heading: 'Daily Oracle',
  hexagram: 'Hexagram',
  above: 'Above',
  below: 'Below',
  judgment: 'The judgment',
  image: 'The image',
  sixLines: 'The six lines',
  /** The hexagram card's button that opens the image and the six lines in a modal (David, Oct 21). */
  readMore: 'Read more',
  /** Its name for screen readers, after the hexagram's name. */
  readMoreAbout: (name: string) => `: the image and the six lines of ${name}`,
  close: 'Close',
  /** The page's one headline, over the pair (1i, B2). PLACEHOLDER until Dawa's words. */
  headline: { line: 'One hexagram, one card.', accent: 'The same for everyone today.' },
  allLines: 'When all six lines change',
  /** After a reading's own credit ("From James Legge's 1882 translation."), while it is unreviewed. */
  onItsWay: 'Our own plain reading is on its way.',
  cardEyebrow: "Today's card",
  cardCredit: 'Card by Pamela Colman Smith, 1909',
  /** An entry was missing, so an earlier day's pair stands in (never empty). */
  standIn: (label: string) => `Today's reading isn't ready yet, so this is the reading for ${label}.`,
  /** The visitor's date is outside the days built into the page, so the nearest one shows. */
  nearest: (label: string) => `This is the reading for ${label}.`,
  consult: {
    eyebrow: 'Consult',
    line: 'Ask your own question.',
    body: 'Hold a question in mind, then toss three coins six times, here or with your own coins.',
    action: 'Consult the I Ching',
  },
  lineWords: {
    unbroken: 'unbroken',
    broken: 'broken',
    /** "Hexagram 25, from the bottom line up: unbroken, broken, ..." */
    figure: (n: number, lines: string) => `Hexagram ${n}, from the bottom line up: ${lines}`,
  },
};

export const consultCopy = {
  metaTitle: 'Consult the I Ching',
  eyebrow: 'Consult',
  heading: 'Ask the I Ching',
  intro: 'Hold a question in mind. Then cast six lines, from the bottom up, and read what they make.',
  privacy: 'Your cast stays on this screen. Nothing is saved or sent.',
  modeLegend: 'How do you want to cast?',
  modes: {
    coins: { label: 'Toss coins here', hint: 'Three coins, six tosses.' },
    real: { label: 'Use my own coins', hint: 'Toss three coins yourself and enter each throw.' },
  },
  begin: 'Begin',
  toss: 'Toss the coins',
  tossProgress: (n: number) => `Toss ${n} of 6`,
  heads: 'heads',
  tails: 'tails',
  countsNote: 'Heads count 3 and tails 2, so each toss makes a 6, 7, 8, or 9.',
  realLegend: (n: number) => (n === 1 ? 'Line 1, the bottom line: how many heads?' : `Line ${n}: how many heads?`),
  realOptions: ['No heads', 'One head', 'Two heads', 'Three heads'],
  addLine: 'Add this line',
  back: 'Back',
  castSoFar: 'Your lines so far',
  /** The polite announcement after each line. */
  announce: (n: number, coins: string | null, value: number) =>
    `${coins ? `Toss ${n} of 6: ${coins}.` : `Line ${n}:`} ${LINE_NAMES[value]}.`,
  resultHeading: 'Your reading',
  changingHeading: 'The changing lines',
  line: (n: number) => `Line ${n}`,
  relatingHeading: 'What it is changing into',
  noChange: 'No lines are changing, so there is no second hexagram.',
  castAgain: 'Cast again',
  backToToday: 'Back to the Daily Oracle',
};

/** What each value makes, for the announcement and the figure's label. */
export const LINE_NAMES: Record<number, string> = {
  6: 'Six, a broken line, changing',
  7: 'Seven, an unbroken line',
  8: 'Eight, a broken line',
  9: 'Nine, an unbroken line, changing',
};
