// The day shown, not just the day picked (1i, U26). Renders /oracle as the server would at 00:51 UTC
// on Sep 26, then, in a New York browser (local Fri Sep 25, 20:51), runs the served HTML's own day
// script, applies the served day CSS, and reads which day's reading and card are actually visible.
// Also: a client-side navigation (where React does not run the inline script, so OracleDaySync's
// layout effect applies the day) and a browser without JavaScript (the UTC day).

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { pickCard, pickHexagram, card } from '@/lib/oracle';
import { applyOracleDay } from '@/lib/oracle-head';

const AT = '2026-09-26T00:51:00Z';
const originalTz = process.env.TZ;
let html = '';

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(AT));
  const page = (await import('@/app/(public)/oracle/page')).default;
  html = renderToStaticMarkup(createElement(page));
});

afterAll(() => {
  vi.useRealTimers();
  process.env.TZ = originalTz;
});

/** Parse the served page; the <html> element starts as the server sends it. */
function served() {
  const { document } = parseHTML(`<!doctype html><html lang="en"><head></head><body>${html}</body></html>`);
  return document;
}

/** Which element's display the served day CSS leaves on: the cascade, in order, for the day rules. */
function visible(document: Document, selector: string) {
  const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').find((t) => t.includes('[data-day]{display:none}'))!;
  const rules = css
    .split('}')
    .filter(Boolean)
    .map((rule) => {
      const [selectors, body] = rule.split('{');
      return { selectors: selectors.split(','), display: /display:\s*(\w+)/.exec(body)?.[1] };
    });
  return [...document.querySelectorAll(selector)].filter((el) => {
    let display = 'block';
    for (const rule of rules) if (rule.display && rule.selectors.some((s) => el.matches(s.trim()))) display = rule.display;
    return display !== 'none';
  });
}

function shownPair(document: Document) {
  const days = visible(document, 'div[data-day]');
  return {
    days: days.map((el) => el.getAttribute('data-day')),
    hexagrams: days.map((el) => el.querySelector('.hexagram-no')!.textContent!.replace(/[:\s]+$/, '')),
    cards: days.map((el) => el.querySelector('h2[id^="card-"]')!.textContent),
  };
}

describe('at 00:51 UTC on Sep 26, a browser in New York (local Fri Sep 25, 20:51)', () => {
  it('runs the served script and shows Friday: hexagram 33 and its card', () => {
    const document = served();
    const script = [...document.querySelectorAll('script')].map((s) => s.textContent ?? '').find((t) => t.includes('data-oracle-day'))!;
    process.env.TZ = 'America/New_York';
    new Function('document', script)(document);
    expect(document.documentElement.getAttribute('data-oracle-day')).toBe('2026-09-25');
    const shown = shownPair(document);
    expect(shown.days).toEqual(['2026-09-25']);
    expect(shown.hexagrams).toEqual([`Hexagram ${pickHexagram('2026-09-25')}`]);
    expect(shown.hexagrams).toEqual(['Hexagram 33']);
    expect(shown.cards).toEqual([card(pickCard('2026-09-25')).name]);
  });

  it('shows Friday after a client-side navigation too, where only the layout effect runs', () => {
    const document = served();
    process.env.TZ = 'America/New_York';
    applyOracleDay(JSON.parse(/s=(\[[^\]]+\])/.exec(html)![1]), document.documentElement, new Date());
    expect(shownPair(document)).toMatchObject({ days: ['2026-09-25'], hexagrams: ['Hexagram 33'] });
  });

  it('without JavaScript, shows the UTC day, labeled with its date', () => {
    const document = served();
    const shown = shownPair(document);
    expect(shown.days).toEqual(['2026-09-26']);
    expect(shown.hexagrams).toEqual([`Hexagram ${pickHexagram('2026-09-26')}`]);
    const [day] = visible(document, 'div[data-day]');
    expect(day.querySelector('p')!.textContent).toContain('Saturday, September 26');
  });

  it('shows exactly one day in Tokyo as well (local Sat Sep 26)', () => {
    const document = served();
    const script = [...document.querySelectorAll('script')].map((s) => s.textContent ?? '').find((t) => t.includes('data-oracle-day'))!;
    process.env.TZ = 'Asia/Tokyo';
    new Function('document', script)(document);
    expect(shownPair(document).days).toEqual(['2026-09-26']);
  });
});
