// PLACEHOLDER: quotes gathered by David (the Notion page "inspiring quotes", Sep 22) and from the old
// Lovable site (Nov 4), for Dawa to review. reviewed: false until he approves the set. Two from those
// lists are left out: a Grateful Dead lyric (song lyrics need a licence) and a line usually credited to
// Rumi that is not found in his work. Wording is as commonly quoted; `note` says where a line comes from
// when it is known.

export interface Quote {
  id: string;
  text: string;
  /** Who said it, as shown under the quote. */
  by: string;
  note?: string;
}

export const QUOTES_REVIEWED = false;

export const QUOTES = [
  {
    id: 'as-above',
    text: 'As above, so below.',
    by: 'Hermetic saying',
    note: 'After the Emerald Tablet; the short form is a later paraphrase.',
  },
  {
    id: 'dawa-inner-world',
    text: 'Approach your inner world with curiosity and compassion, acknowledging both strengths and areas for growth. This gentle self-inquiry nurtures a more authentic and fulfilling life, grounded in self-awareness and understanding.',
    by: 'Lama Dawa',
  },
  {
    id: 'eagleman',
    text: 'Science and mysticism have a real meeting ground with the three words of ‘I don’t know.’',
    by: 'David Eagleman',
  },
  {
    id: 'scheidt',
    text: 'Gratitude is both the measure of our spiritual wellness and the practice that deepens it.',
    by: 'Bill Scheidt',
  },
  { id: 'emerson', text: 'Adopt the pace of nature. Her secret is patience.', by: 'Ralph Waldo Emerson' },
  {
    id: 'watts',
    text: 'It’s only when you stop wishing that things were different that anything can truly change.',
    by: 'Alan Watts',
  },
  {
    id: 'van-gogh',
    text: 'Great things are done by a series of small things brought together.',
    by: 'Vincent van Gogh',
    note: 'Letter to his brother Theo, October 1882.',
  },
  { id: 'rams', text: 'Less but better.', by: 'Dieter Rams' },
  {
    id: 'kabat-zinn',
    text: 'Instead of ‘Let it go,’ we should probably say ‘Let it be.’',
    by: 'Jon Kabat-Zinn',
  },
  {
    id: 'campbell',
    text: 'The goal of life is to make your heartbeat match the beat of the universe, to match your nature with Nature.',
    by: 'Joseph Campbell',
  },
  {
    id: 'thoreau',
    text: 'That man is richest whose pleasures are the cheapest.',
    by: 'Henry David Thoreau',
    note: 'Journal, 1856.',
  },
  {
    id: 'socrates',
    text: 'The unexamined life is not worth living.',
    by: 'Socrates',
    note: 'In Plato’s Apology.',
  },
  {
    id: 'einstein',
    text: 'Imagination is more important than knowledge.',
    by: 'Albert Einstein',
    note: 'Interview with George Sylvester Viereck, 1929.',
  },
] as const satisfies readonly Quote[];

export type QuoteId = (typeof QUOTES)[number]['id'];

export const quote = (id: QuoteId): Quote => QUOTES.find((q) => q.id === id)!;

/** The Oracle's quote for a day: the whole list in turn, one a day from the Oracle's day 0. */
export const quoteForDay = (index: number): Quote => QUOTES[((index % QUOTES.length) + QUOTES.length) % QUOTES.length];
