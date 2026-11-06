// Dawa's Substack on the Learn page, kept up to date by itself (3y, admin to-do, David Nov 6: "yes to
// auto update with substack changes"). The page reads his public feed (docdawa.substack.com/feed) on
// the server at most once an hour, so a new post, or a title or subtitle he edits, reaches the page
// within the hour with no site update. Only each post's title, subtitle, date, and address are used;
// no full text is copied onto the site. If the feed cannot be read, the page shows the posts typed
// into content/articles.ts, which also hold what the feed cannot say: the series' part titles (his
// series posts all share one title) and which planet each is about.
import { SERIES, ARTICLES, SUBSTACK_URL, type Article } from '@/content/articles';
import { BODIES, SIGNS, type BodyId } from '@/lib/keys';

export const FEED_URL = `${SUBSTACK_URL}/feed`;

/** Posts kept off the page: a placeholder (Feb 16) and AstroTribes news from before the rebuild (Mar 26). */
export const LEFT_OUT = new Set([`${SUBSTACK_URL}/p/coming-soon`, `${SUBSTACK_URL}/p/calm-before-the-storm`]);

/** His series, "Astrology: A New Language": its posts' addresses start with this. */
const SERIES_PREFIX = `${SUBSTACK_URL}/p/astrology-a-new-language`;

export interface FeedItem {
  url: string;
  title: string;
  subtitle: string;
  /** YYYY-MM-DD (UTC). */
  date: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decode = (text: string) =>
  text
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => ENTITIES[name.toLowerCase()] ?? whole)
    .replace(/'/g, '’')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (item: string, name: string) => {
  const match = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(item);
  return match ? decode(match[1]) : '';
};

/** The posts in an RSS feed, newest first as the feed lists them. Items without an address or date are skipped. */
export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const url = tag(item, 'link').split('?')[0];
    const time = Date.parse(tag(item, 'pubDate'));
    if (!url.startsWith(`${SUBSTACK_URL}/p/`) || Number.isNaN(time)) continue;
    items.push({ url, title: tag(item, 'title'), subtitle: tag(item, 'description'), date: new Date(time).toISOString().slice(0, 10) });
  }
  return items;
}

// Names that keep their capital in sentence case: the signs, the planets and points, and the brand.
const PROPER = [
  ...Object.values(SIGNS).map((sign) => sign.name),
  ...Object.values(BODIES)
    .map((body) => body.name)
    .filter((name) => name !== 'Rising'),
  'AstroTribes',
  'Age of Aquarius',
  'Aquarian Age',
].sort((a, b) => b.length - a.length);

/**
 * Dawa's title in sentence case, like every string on the site: the first word and names keep their
 * capitals, words in capitals (AI) stay, the rest go lower case, which also lowers any key name in it.
 */
export function sentenceCase(text: string): string {
  const kept: string[] = [];
  let marked = text;
  for (const name of PROPER) {
    marked = marked.replace(new RegExp(`\\b${name}\\b`, 'gi'), () => `\u0000${kept.push(name) - 1}\u0000`);
  }
  let first = true;
  const out = marked.replace(/\u0000(\d+)\u0000|[A-Za-z][A-Za-z’']*/g, (word, index?: string) => {
    if (index !== undefined) {
      first = false;
      return kept[Number(index)];
    }
    const acronym = /^[A-Z]{2,}$/.test(word) || word === 'I';
    const result = acronym ? word : first ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
    first = false;
    return result;
  });
  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => kept[Number(i)]);
}

/** A subtitle as an excerpt: sentence case, no "!" (the copy rules), ending in a full stop. */
const excerptOf = (subtitle: string) => {
  const text = sentenceCase(subtitle.replace(/!+/g, '.')).replace(/\s+\.$/, '.');
  return !text || /[.?…]$/.test(text) ? text : `${text}.`;
};

/** The planet a series post is about, from its title or subtitle ("... - Mars", "The Moon"). */
const bodyIn = (text: string): BodyId | undefined =>
  (Object.values(BODIES).find((body) => new RegExp(`\\b${body.name}\\b`, 'i').test(text))?.id as BodyId | undefined) ?? undefined;

/** A new series post the site has not typed in: its part title is the planet, or the subtitle. */
function seriesPost(item: FeedItem): Article {
  const after = item.title.split(/\s*[-–]\s+/).slice(1).join(' ').trim();
  const name = after || item.subtitle;
  const body = bodyIn(name);
  const title = body ? (body === 'sun' || body === 'moon' ? `The ${BODIES[body].name}` : BODIES[body].name) : sentenceCase(name);
  const excerpt = after && item.subtitle ? excerptOf(item.subtitle) : '';
  return { url: item.url, title, excerpt, date: item.date, ...(body ? { body } : {}) };
}

/** Learn's two lists from the feed, with the typed posts filling in what the feed no longer lists. */
export function mergeFeed(items: readonly FeedItem[]): { series: Article[]; articles: Article[] } {
  const typedSeries = new Map(SERIES.map((article) => [article.url, article]));
  const typed = new Map(ARTICLES.map((article) => [article.url, article]));
  const series = new Map<string, Article>();
  const articles = new Map<string, Article>();
  for (const item of items) {
    if (LEFT_OUT.has(item.url)) continue;
    if (item.url.startsWith(SERIES_PREFIX) || typedSeries.has(item.url)) {
      // The series keeps its typed part titles and excerpts; the feed adds new parts.
      series.set(item.url, typedSeries.get(item.url) ?? seriesPost(item));
    } else {
      articles.set(item.url, {
        url: item.url,
        title: sentenceCase(item.title.replace(/!+/g, '')),
        excerpt: excerptOf(item.subtitle),
        date: item.date,
        ...(typed.get(item.url)?.body ? { body: typed.get(item.url)!.body } : {}),
      });
    }
  }
  for (const article of SERIES) if (!series.has(article.url)) series.set(article.url, article);
  for (const article of ARTICLES) if (!articles.has(article.url)) articles.set(article.url, article);
  const byDate = (a: Article, b: Article) => a.date.localeCompare(b.date);
  return { series: [...series.values()].sort(byDate), articles: [...articles.values()].sort((a, b) => byDate(b, a)) };
}

/** Learn's lists, from the feed when it answers (cached for an hour), else from content/articles.ts. */
export async function learnArticles(): Promise<{ series: readonly Article[]; articles: readonly Article[] }> {
  try {
    const response = await fetch(FEED_URL, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(String(response.status));
    const items = parseFeed(await response.text());
    if (items.length === 0) throw new Error('empty');
    return mergeFeed(items);
  } catch {
    return { series: SERIES, articles: ARTICLES };
  }
}

/** Dawa's article on a planet, for that planet's page. */
export async function learnArticleFor(body: BodyId): Promise<Article | undefined> {
  const { series, articles } = await learnArticles();
  return [...series, ...articles].find((article) => article.body === body);
}
