// Dawa's writing on the Learn page (David, Nov 4): his Substack, "AstroTribes" by Doc Dawa
// (docdawa.substack.com), read Nov 4 from its archive. Each card shows the post's title, its subtitle
// (the preview line Substack itself shows) as the excerpt, or his opening line where the subtitle
// is only the planet's name, and the date, and links to the post on
// Substack. No full text is copied onto the site. Titles and subtitles are Dawa's words, put in
// sentence case like every string on the site, with any key name in them lowercased (the lint keeps
// key names to lib/keys.ts). Two posts are left out: "Coming soon" (Feb 16, a placeholder) and "Calm
// Before the Storm" (Mar 26, AstroTribes news from before the rebuild).
//
// Since 3y (Nov 6) the Learn page reads his Substack feed by itself (lib/substack.ts): new posts and
// edited titles arrive within the hour. These entries are the fallback when the feed cannot be read,
// and they keep what the feed cannot say: the series' part titles, its excerpts, and each planet.

import type { BodyId } from '@/lib/keys';
import { the } from './the';

export const SUBSTACK_URL = 'https://docdawa.substack.com';

export interface Article {
  /** The post's address on Substack, which is also its id. */
  url: string;
  title: string;
  /** Dawa's subtitle, or his opening line where the subtitle is only the planet's name. */
  excerpt: string;
  /** The day it was posted, YYYY-MM-DD (UTC). */
  date: string;
  /** The planet a post is about, so its page under /keys can link to it. */
  body?: BodyId;
}

/** "Astrology: A New Language", Dawa's series on the planets, in the order he wrote it. */
export const SERIES_TITLE = 'Astrology: A new language';

export const SERIES: readonly Article[] = [
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language`,
    title: 'Introduction',
    excerpt: 'Fresh words for astrological meaning in today’s world.',
    date: '2026-08-27',
  },
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language-41c`,
    title: 'The Sun',
    excerpt: 'In this series of posts we will explain the meaning and reasoning behind the choices of words…',
    date: '2026-08-28',
    body: 'sun',
  },
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language-4b3`,
    title: 'The Moon',
    excerpt: 'The Sun and the Moon are obviously the most major “planets” in the horoscope.',
    date: '2026-08-29',
    body: 'moon',
  },
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language-b1c`,
    title: 'Mercury',
    excerpt: 'Mercury was called “the messenger of the gods”.',
    date: '2026-08-29',
    body: 'mercury',
  },
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language-d15`,
    title: 'Venus',
    excerpt: 'Planet of resonance, harmony, attraction, and love.',
    date: '2026-09-02',
    body: 'venus',
  },
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language-mars`,
    title: 'Mars',
    excerpt: 'Your inner warrior; your arena.',
    date: '2026-09-07',
    body: 'mars',
  },
];

/** Everything else he has written, newest first. */
export const ARTICLES: readonly Article[] = [
  {
    url: `${SUBSTACK_URL}/p/questioning-reality-at-the-dawn-of`,
    title: 'Questioning reality at the dawn of the Age of Aquarius',
    excerpt: 'AI and the future of humanity.',
    date: '2026-08-12',
  },
  {
    url: `${SUBSTACK_URL}/p/the-galactic-center-point`,
    title: 'The Galactic Center point',
    excerpt: 'Why 27 degrees Sagittarius may be the most important spiritual point in your horoscope.',
    date: '2026-08-12',
  },
  {
    url: `${SUBSTACK_URL}/p/the-ninth-house-in-your-horoscope`,
    title: 'The ninth house in your horoscope',
    excerpt: 'Creating a conscious life.',
    date: '2026-08-10',
  },
  {
    url: `${SUBSTACK_URL}/p/symbolism-of-the-north-node`,
    title: 'Symbolism of the North Node',
    excerpt: 'Your personal time traveling dragon.',
    date: '2026-08-09',
  },
  {
    url: `${SUBSTACK_URL}/p/crazy-ass-times`,
    title: 'Crazy ass times',
    excerpt: 'Astrology at the cusp of the Aquarian Age.',
    date: '2026-02-17',
  },
];

/** Dawa's article on a planet, for that planet's page. */
export const articleFor = (body: BodyId): Article | undefined =>
  [...SERIES, ...ARTICLES].find((article) => article.body === body);

export interface Video {
  /** The YouTube video id (the part after watch?v=). */
  youtubeId: string;
  title: string;
  excerpt: string;
  date: string;
}

/** Dawa's videos, newest first. None yet (Nov 4): the section says they are on the way. */
export const VIDEOS: readonly Video[] = [];

// PLACEHOLDER: our words, not Dawa's, until his copy replaces them.
export const learnCopy = {
  title: 'Learn',
  description: 'Articles by Dawa, the AstroTribes astrologer, and videos to come.',
  eyebrow: 'Learn',
  line: 'Learn the language',
  accent: 'of the sky.',
  lede: 'Dawa writes about astrology in fresh words for today: the planets, the points that matter most, and the times we live in. Every article opens on his Substack.',
  subscribe: 'Subscribe on Substack',
  seriesEyebrow: 'A series',
  part: (n: number) => `Part ${n}`,
  seriesLede: 'Why each planet takes the words it does in AstroTribes, one planet at a time.',
  articlesHeading: 'More from Dawa',
  read: 'Read on Substack',
  /** For screen readers: where the card goes. */
  readLabel: (title: string) => `${title}, on Dawa’s Substack`,
  videosHeading: 'Videos',
  videosComing: 'Dawa’s videos are on the way. They will show here as soon as the first one is ready.',
  /** On a planet's page under /keys. */
  planetLink: (planet: string) => `Read Dawa’s article on ${the(planet)}`,
};
