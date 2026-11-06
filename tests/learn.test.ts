// The Learn page (David, Nov 4): Dawa's articles as cards that open on his Substack, no full text
// on the site, a place for videos, and a link from each planet page he has written about.

import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ARTICLES, SERIES, SUBSTACK_URL, VIDEOS, articleFor, learnCopy } from '@/content/articles';
import { PLANET_PAGES } from '@/content/planets';
import { PRIMARY_NAV } from '@/lib/site';
import { config } from '@/proxy';
import { FEED_URL, learnArticles, mergeFeed, parseFeed, sentenceCase } from '@/lib/substack';

let document: Document;

beforeAll(async () => {
  const page = (await import('@/app/(public)/learn/page')).default;
  const html = renderToStaticMarkup(await page());
  document = parseHTML(`<!doctype html><html lang="en"><head></head><body>${html}</body></html>`).document;
});

const all = [...SERIES, ...ARTICLES];

describe('the articles', () => {
  it('each link to a post on Dawa’s Substack, once', () => {
    for (const article of all) expect(article.url.startsWith(`${SUBSTACK_URL}/p/`)).toBe(true);
    expect(new Set(all.map((article) => article.url)).size).toBe(all.length);
  });

  it('carry a real date, the series oldest first and the rest newest first', () => {
    for (const article of all) expect(Number.isNaN(Date.parse(article.date))).toBe(false);
    const dates = (list: readonly (typeof all)[number][]) => list.map((article) => article.date);
    expect(dates(SERIES)).toEqual([...dates(SERIES)].sort());
    expect(dates(ARTICLES)).toEqual([...dates(ARTICLES)].sort().reverse());
  });

  it('are all on the page, each card a link to its post', () => {
    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    for (const article of all) expect(hrefs).toContain(article.url);
    expect(document.body.textContent).toContain(learnCopy.read);
  });

  it('show only a short excerpt, never the post itself', () => {
    for (const article of all) expect(article.excerpt.length).toBeLessThan(160);
  });
});

describe('the videos', () => {
  it('say they are on the way while there are none', () => {
    expect(VIDEOS.length).toBe(0);
    expect(document.body.textContent).toContain(learnCopy.videosComing);
    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('the way to Learn', () => {
  it('is in the main nav and outside the passcode', () => {
    expect(PRIMARY_NAV.map((link) => link.href)).toContain('/learn');
    expect(config.matcher.some((pattern: string) => pattern.startsWith('/learn'))).toBe(false);
  });

  it('runs from each planet page Dawa has written about', () => {
    const slugs = PLANET_PAGES.map((planet) => planet.slug);
    const linked = all.filter((article) => article.body);
    expect(linked.length).toBe(5);
    for (const article of linked) {
      expect(slugs).toContain(article.body);
      expect(articleFor(article.body!)).toBe(article);
    }
  });
});

// The feed in tests/fixtures/substack-feed.xml is his real feed of Nov 6, cut down, plus two made-up
// posts (a Jupiter part of the series and a new post) to show what a new post does.
const xml = readFileSync(path.join(process.cwd(), 'tests/fixtures/substack-feed.xml'), 'utf8');

describe('the Substack feed (3y)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads each post’s address, title, subtitle, and day', () => {
    const items = parseFeed(xml);
    expect(items).toHaveLength(10);
    expect(items[3]).toEqual({
      url: `${SUBSTACK_URL}/p/astrology-a-new-language`,
      title: 'Astrology: A New Language',
      subtitle: 'Fresh words for astrological meaning in today’s world',
      date: '2026-08-27',
    });
    expect(items[7].title).toBe('Symbolism of the North Node');
  });

  it('puts titles in sentence case, keeping names', () => {
    expect(sentenceCase('Questioning Reality at the Dawn of the Age of Aquarius')).toBe(
      'Questioning reality at the dawn of the Age of Aquarius',
    );
    expect(sentenceCase('The Ninth House in your Horoscope')).toBe('The ninth house in your horoscope');
    expect(sentenceCase('The Galactic Center Point')).toBe('The Galactic Center point');
    expect(sentenceCase('AI and the future of humanity')).toBe('AI and the future of humanity');
  });

  it('adds new posts, keeps the series’ own titles, and leaves out the two old ones', () => {
    const { series, articles } = mergeFeed(parseFeed(xml));
    // Every typed post is still there, the series oldest first and the rest newest first.
    for (const article of SERIES) expect(series.map((a) => a.url)).toContain(article.url);
    for (const article of ARTICLES) expect(articles.map((a) => a.url)).toContain(article.url);
    expect(series.map((a) => a.date)).toEqual([...series.map((a) => a.date)].sort());
    expect(articles.map((a) => a.date)).toEqual([...articles.map((a) => a.date)].sort().reverse());
    // The series keeps its typed part titles; a new part takes its planet's name and page.
    expect(series.find((a) => a.url.endsWith('-mars'))!.title).toBe('Mars');
    expect(series.at(-1)).toMatchObject({ title: 'Jupiter', body: 'jupiter', excerpt: 'Your gift and your opportunity.' });
    // A new post arrives in sentence case with no "!", at the top.
    expect(articles[0]).toMatchObject({ title: 'A brand new post about Saturn', excerpt: 'Learning from limits.', date: '2026-11-08' });
    expect(articles.find((a) => a.url.endsWith('/the-ninth-house-in-your-horoscope'))).toMatchObject({
      title: 'The ninth house in your horoscope',
      excerpt: 'Creating a conscious life.',
    });
    const urls = [...series, ...articles].map((a) => a.url);
    expect(urls).not.toContain(`${SUBSTACK_URL}/p/coming-soon`);
    expect(urls).not.toContain(`${SUBSTACK_URL}/p/calm-before-the-storm`);
  });

  it('reads the feed, cached for an hour, and falls back to the typed posts if it cannot', async () => {
    const calls: unknown[] = [];
    vi.stubGlobal('fetch', (url: string, init: unknown) => {
      calls.push([url, init]);
      return Promise.resolve(new Response(xml));
    });
    const live = await learnArticles();
    expect(calls[0]).toEqual([FEED_URL, expect.objectContaining({ next: { revalidate: 3600 } })]);
    expect(live.articles[0].title).toBe('A brand new post about Saturn');
    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')));
    expect(await learnArticles()).toEqual({ series: SERIES, articles: ARTICLES });
  });
});
