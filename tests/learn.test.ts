// The Learn page (David, Nov 4): Dawa's articles as cards that open on his Substack, no full text
// on the site, a place for videos, and a link from each planet page he has written about.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { beforeAll, describe, expect, it } from 'vitest';
import { ARTICLES, SERIES, SUBSTACK_URL, VIDEOS, articleFor, learnCopy } from '@/content/articles';
import { PLANET_PAGES } from '@/content/planets';
import { PRIMARY_NAV } from '@/lib/site';
import { config } from '@/proxy';

let document: Document;

beforeAll(async () => {
  const page = (await import('@/app/(public)/learn/page')).default;
  const html = renderToStaticMarkup(createElement(page));
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
