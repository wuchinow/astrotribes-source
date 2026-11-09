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
//
// Since 4w (David, Nov 9: "feature an article or several on the website without linking to
// substack. perhaps all of them", and "at least one open on learn where they can read by scrolling
// not clicking") every article reads in full on the site, at /learn/<its Substack address>, from the
// body his feed carries (lib/article-html.ts). The Learn page shows one in full (FEATURED_URL) and the
// rest as cards with their opening lines. The text is still typed nowhere in the repo: when the feed
// cannot be read, a card shows the excerpt below and its page links to the post on Substack.

import type { ArticleNode } from '@/lib/article-html';
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
  /** The post in full, from the feed (4w); absent when the feed cannot be read. */
  content?: readonly ArticleNode[];
  /** The post's opening lines for its card, from the feed (4w). */
  opening?: string;
  /** It lists Key names Dawa has changed since he wrote it, so its page says so (4w). */
  olderKeys?: boolean;
}

/** The part of a post's Substack address after /p/, which is also its address on Learn. */
export const slugOf = (url: string) => url.slice(url.indexOf('/p/') + 3).split(/[?#/]/)[0];

/** Its page on the site (4w). */
export const learnHref = (article: Pick<Article, 'url'>) => `/learn/${slugOf(article.url)}`;

/** "Astrology: A New Language", Dawa's series on the planets, in the order he wrote it. */
export const SERIES_TITLE = 'Astrology: A new language';

export const SERIES: readonly Article[] = [
  {
    url: `${SUBSTACK_URL}/p/astrology-a-new-language`,
    title: 'Introduction',
    excerpt: 'Fresh words for astrological meaning in today’s world.',
    date: '2026-08-27',
    // Its list is the 26 Keys of August, before the renames (lib/keys.ts has today's 28).
    olderKeys: true,
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

/**
 * The article Learn shows in full (4w): the Galactic Center, which reads well on its own and lists no
 * Key (David, Nov 9). He first picked the series' introduction, but its list holds the August Key names.
 */
export const FEATURED_URL = `${SUBSTACK_URL}/p/the-galactic-center-point`;

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
    // It calls the Sun's house Key Kingdom, an older name (today Realm).
    olderKeys: true,
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
  lede: 'Dawa writes about astrology in fresh words for today: the planets, the points that matter most, and the times we live in. Read him here, or get each new article by email from his Substack.',
  subscribe: 'Subscribe on Substack',
  featuredEyebrow: 'Start here',
  /** Over the featured article and on each article's page: where it sits in the series. */
  seriesPart: (n: number) => `${SERIES_TITLE}, part ${n}`,
  articleEyebrow: 'From Dawa',
  byline: 'By Dawa',
  minutes: (words: number) => `${Math.max(1, Math.round(words / 230))} min read`,
  back: 'All articles',
  next: (title: string) => `Next in the series: ${title}`,
  previous: (title: string) => `Before this: ${title}`,
  moreHeading: 'Keep',
  moreAccent: 'reading.',
  aboutHeading: 'About Dawa',
  about: 'Dawa is the AstroTribes astrologer. He gave every placement in a chart its Key, the names this site is built on.',
  /** For screen readers: the next and previous parts under a series article. */
  seriesNav: 'More in the series',
  subscribeLine: 'Dawa’s new articles arrive here and by email from his Substack.',
  /** When the feed cannot be read and the article page has only the excerpt. */
  unavailable: 'This article will be back here shortly. In the meantime you can read it on Dawa’s Substack.',
  readThere: 'Read on Substack',
  /** Over an article whose Key names have changed since (olderKeys); the link goes to the 28 Keys. */
  olderKeysNote: 'Dawa wrote this in the summer of 2026, and some Key names have changed since. For the current ones, see',
  olderKeysLink: 'the 28 Keys',
  seriesEyebrow: 'A series',
  part: (n: number) => `Part ${n}`,
  seriesLede: 'Why each planet takes the words it does in AstroTribes, one planet at a time.',
  articlesHeading: 'More from Dawa',
  read: 'Read the article',
  videosHeading: 'Videos',
  videosComing: 'Dawa’s videos are on the way. They will show here as soon as the first one is ready.',
  /** On a planet's page under /keys. */
  planetLink: (planet: string) => `Read Dawa’s article on ${the(planet)}`,
};
