// The Learn page (David, Nov 4): Dawa's articles, a place for videos, and a link from each planet
// page he has written about. Since 4w (David, Nov 9) each article reads in full on the site, from the
// body his feed carries, and the series' introduction reads in full on Learn itself.

import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ARTICLES, FEATURED_URL, SERIES, SUBSTACK_URL, VIDEOS, articleFor, learnCopy, learnHref, slugOf } from '@/content/articles';
import { articleBody, openingOf, parseArticleHtml, textOf } from '@/lib/article-html';
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

  it('are all on the page, each card a link to its page on the site (4w)', () => {
    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    for (const article of all) expect(hrefs).toContain(learnHref(article));
    for (const article of all) expect(hrefs).not.toContain(article.url);
    expect(document.body.textContent).toContain(learnCopy.read);
  });

  it('feature one of them, and mark the introduction’s August Key names', () => {
    expect(all.map((article) => article.url)).toContain(FEATURED_URL);
    expect(SERIES[0].olderKeys).toBe(true);
    expect(slugOf(SERIES[0].url)).toBe('astrology-a-new-language');
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
    expect(items[3]).toMatchObject({
      url: `${SUBSTACK_URL}/p/astrology-a-new-language`,
      title: 'Astrology: A New Language',
      subtitle: 'Fresh words for astrological meaning in today’s world',
      date: '2026-08-27',
    });
    expect(items[3].html).toMatch(/^<h3>/);
    expect(items[7].title).toBe('Symbolism of the North Node');
    expect(items[7]).not.toHaveProperty('html');
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

// 4w: the bodies. The fixture's introduction carries a made-up body in Substack's markup (its
// subscribe widget, a centered paragraph, a link to another of his posts, a script, an empty line).
describe('the articles in full (4w)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const feedOnline = () => vi.stubGlobal('fetch', () => Promise.resolve(new Response(xml)));

  it('keep only the article: no widgets, forms, scripts, styles, or unsafe links and images', () => {
    const nodes = parseArticleHtml(
      '<div class="captioned-button-wrap"><a href="https://x.test/share">Share</a></div>' +
        '<p class="x" style="color:red" onclick="steal()">Hi <b>there</b> <i>you</i>' +
        ' <a href="javascript:alert(1)">bad</a> <a href="https://example.com/a" target="_blank">good</a></p>' +
        '<style>p{}</style><iframe src="https://evil.test"></iframe>' +
        '<img src="https://evil.test/a.png"><img src="https://substackcdn.com/image/fetch/a.png" alt="A sky">' +
        '<ul><li>One</li><li>Two</li></ul>',
    );
    expect(nodes).toEqual([
      {
        tag: 'p',
        children: [
          'Hi ',
          { tag: 'strong', children: ['there'] },
          ' ',
          { tag: 'em', children: ['you'] },
          ' bad ',
          { tag: 'a', href: 'https://example.com/a', children: ['good'] },
        ],
      },
      { tag: 'img', src: 'https://substackcdn.com/image/fetch/a.png', alt: 'A sky', children: [] },
      { tag: 'ul', children: [{ tag: 'li', children: ['One'] }, { tag: 'li', children: ['Two'] }] },
    ]);
  });

  it('leave out the title where it opens the body, and take off bold where every paragraph is bold', () => {
    const nodes = articleBody(
      '<h3><strong><span>Symbolism of the North Node</span></strong></h3><p><strong><span>One.</span></strong></p><p><strong>Two, with a book named </strong><em>Moon</em><strong> in it, as his North Node post has.</strong></p>',
      ' Symbolism of the North Node ',
    );
    expect(nodes).toEqual([
      { tag: 'p', children: ['One.'] },
      { tag: 'p', children: ['Two, with a book named ', { tag: 'em', children: ['Moon'] }, ' in it, as his North Node post has.'] },
    ]);
  });

  it('leave out a title and subtitle set as paragraphs, take off italic set on everything, and read a long heading as text', () => {
    const nodes = articleBody(
      '<p><em>The Galactic Center Point</em></p><p><em>Why it matters</em></p><p><em><strong>First paragraph of the post.</strong></em></p>' +
        '<p><strong>Second, in bold.</strong></p><p><em>Third.</em></p><h3><strong>' + 'A closing sentence set as a heading. '.repeat(5) + '</strong></h3>',
      'The Galactic Center Point',
      'Why it matters',
    );
    expect(nodes.slice(0, 3)).toEqual([
      { tag: 'p', children: ['First paragraph of the post.'] },
      { tag: 'p', children: ['Second, in bold.'] },
      { tag: 'p', children: ['Third.'] },
    ]);
    expect(nodes[3]).toMatchObject({ tag: 'p' });
  });

  it('give each card its opening lines', () => {
    expect(openingOf(parseArticleHtml('<p>Short.</p><p>' + 'word '.repeat(100) + '</p>'))).toMatch(/^word( word)+…$/);
  });

  it('come from the feed, with his own posts linking to their page here', async () => {
    feedOnline();
    const { series } = await learnArticles();
    const intro = series.find((article) => article.url === SERIES[0].url)!;
    const text = intro.content!.map(textOf).join('\n');
    expect(text).toContain('A made-up opening paragraph');
    expect(text).not.toMatch(/Subscribe|alert|Astrology: A New Language/);
    expect(intro.opening).toMatch(/^A made-up opening paragraph/);
    expect(JSON.stringify(intro.content)).toContain('"href":"/learn/the-galactic-center-point"');
  });

  it('read in full on Learn itself, by scrolling, under the hero', async () => {
    // The fixture's body sits on the introduction, so feature it here.
    vi.resetModules();
    vi.doMock('@/content/articles', async (original) => ({
      ...(await original<typeof import('@/content/articles')>()),
      FEATURED_URL: SERIES[0].url,
    }));
    feedOnline();
    const page = (await import('@/app/(public)/learn/page')).default;
    const online = parseHTML(`<!doctype html><html><body>${renderToStaticMarkup(await page())}</body></html>`).document;
    vi.doUnmock('@/content/articles');
    vi.resetModules();
    const featured = online.querySelector('[data-learn-featured]')!;
    expect(featured.textContent).toContain('A made-up opening paragraph');
    expect(featured.querySelector('[data-older-keys] a[href="/keys"]')).not.toBeNull();
    expect(featured.querySelector('script, form, input, [style]')).toBeNull();
    expect(featured.querySelector('a[href="/learn/astrology-a-new-language-41c"]')).not.toBeNull();
  });

  it('each have their own page, which falls back to the excerpt and Substack when the feed is down', async () => {
    const Page = (await import('@/app/(public)/learn/[slug]/page')).default;
    const render = async (slug: string) =>
      parseHTML(
        `<!doctype html><html><body>${renderToStaticMarkup(await Page({ params: Promise.resolve({ slug }) } as never))}</body></html>`,
      ).document;
    feedOnline();
    const online = await render('astrology-a-new-language');
    expect(online.querySelector('[data-article-body]')!.textContent).toContain('A made-up opening paragraph');
    expect(online.querySelector('h1')!.textContent).toBe('Introduction');
    vi.unstubAllGlobals();
    const offline = await render('symbolism-of-the-north-node');
    expect(offline.querySelector('[data-article-body]')).toBeNull();
    expect(offline.body.textContent).toContain(learnCopy.unavailable);
    expect(offline.querySelector(`a[href="${SUBSTACK_URL}/p/symbolism-of-the-north-node"]`)).not.toBeNull();
    await expect(render('coming-soon')).rejects.toThrow();
    await expect(render('no-such-post')).rejects.toThrow();
  });
});
