// The 28 Keys page (1k, 1m), rendered as the server sends it: all 28 keys and all 12 houses, read
// from lib/keys.ts, in the design system's order, with Dawa's lines; the example chart whole; the birth-time and generational notes on exactly the
// keys they apply to; no retired key name in the page's words; and no mark on a key Dawa has not
// confirmed. This file types no key name.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { beforeAll, describe, expect, it } from 'vitest';
import { EXAMPLE_CHART } from '@/content/keys-example';
import { keysPage } from '@/content/keys-page';
import {
  BODIES,
  BODY_GROUPS,
  BODY_IDS,
  HOUSES,
  KEY_LIST,
  KEYS,
  RETIRED_KEY_NAMES,
  SIGNS,
  bodiesIn,
  glossSentence,
  houseOf,
  isGenerational,
  keyFor,
  needsBirthTime,
  type BodyId,
  type KeyId,
} from '@/lib/keys';
import { isGatedPath } from '@/lib/preview';
import { PRIMARY_NAV } from '@/lib/site';
import { config } from '@/proxy';

let document: Document;

beforeAll(async () => {
  const page = (await import('@/app/(public)/keys/page')).default;
  const html = renderToStaticMarkup(createElement(page));
  document = parseHTML(`<!doctype html><html lang="en"><head></head><body>${html}</body></html>`).document;
});

const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const cells = () => [...document.querySelectorAll('[data-key]')];
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('the 28 Keys page', () => {
  it('lists all 28 keys once each, by group, body, sign then house', () => {
    const expected = BODY_GROUPS.flatMap((group) =>
      bodiesIn(group.id).flatMap((body) => [keyFor(body, 'sign'), keyFor(body, 'house')]),
    )
      .filter((key) => key !== undefined)
      .map((key) => key.id);
    expect(expected).toHaveLength(28);
    expect(new Set(expected)).toEqual(new Set(KEY_LIST.map((key) => key.id)));
    expect(cells().map((cell) => cell.getAttribute('data-key'))).toEqual(expected);
  });

  it("shows each key's name and Dawa's gloss from lib/keys.ts", () => {
    for (const cell of cells()) {
      const key = KEYS[cell.getAttribute('data-key') as KeyId];
      const words = text(cell);
      expect(words, key.id).toContain(key.name);
      expect(words, key.id).toContain(glossSentence(key));
    }
  });

  it("gives each body Dawa's line from lib/keys.ts", () => {
    const lines = [...document.querySelectorAll('[data-body-line]')].map(text);
    expect(lines).toEqual(BODY_GROUPS.flatMap((group) => bodiesIn(group.id)).map((body) => BODIES[body].line));
  });

  it('shows the example chart whole: every body, its keys with their values, in group order', () => {
    const rows = [...document.querySelectorAll('[data-example-body]')];
    const order = BODY_GROUPS.flatMap((group) => bodiesIn(group.id));
    expect(rows.map((row) => row.getAttribute('data-example-body'))).toEqual(order);
    let chips = 0;
    for (const row of rows) {
      const body = row.getAttribute('data-example-body') as BodyId;
      const at = EXAMPLE_CHART.placements[body];
      // Chips render name and value as sibling spans, so compare without spaces.
      const words = text(row).replace(/\s/g, '');
      const sign = keyFor(body, 'sign');
      const house = keyFor(body, 'house');
      if (sign) {
        expect(words, body).toContain(`${sign.name}${SIGNS[at.sign].name}`.replace(/\s/g, ''));
        chips += 1;
      }
      if (house) {
        expect(words, body).toContain(`${house.name}${houseOf(at.house!).roman}`.replace(/\s/g, ''));
        chips += 1;
      }
    }
    expect(chips).toBe(28);
  });

  it('heads the six groups with their labels, in order, every body in one of them', () => {
    const labels = [...document.querySelectorAll('[data-group-label]')].map(text);
    expect(labels).toEqual(BODY_GROUPS.map((group) => group.name));
    expect(BODY_GROUPS.flatMap((group) => bodiesIn(group.id)).sort()).toEqual([...BODY_IDS].sort());
  });

  it('lists the twelve houses, I to XII, with their names, questions, and lines', () => {
    const items = [...document.querySelectorAll('[data-house]')];
    expect(items).toHaveLength(12);
    items.forEach((item, i) => {
      const house = HOUSES[i];
      expect(item.getAttribute('data-house')).toBe(String(house.number));
      expect(text(item.querySelector('.step-numeral'))).toBe(`${keysPage.houses.numberLabel} ${house.roman}`);
      expect(text(item.querySelector('h3'))).toBe(house.name);
      expect(text(item.querySelector('p'))).toBe(house.question);
      expect(text(item.querySelector('[data-house-line]'))).toBe(house.line);
    });
    // Roman numerals only: no house is shown by its digit.
    for (const item of items) expect(text(item)).not.toMatch(/\d/);
  });

  it('says which keys need a birth time and which are generational, on exactly those keys', () => {
    for (const cell of cells()) {
      const key = KEYS[cell.getAttribute('data-key') as KeyId];
      const notes = [...cell.querySelectorAll('[data-note]')];
      const expected = needsBirthTime(key) ? 'birthTime' : isGenerational(key) ? 'generational' : null;
      expect(notes.map((note) => note.getAttribute('data-note')), key.id).toEqual(expected ? [expected] : []);
      if (expected) expect(text(notes[0]), key.id).toBe(keysPage.notes[expected]);
    }
    expect(document.querySelectorAll('[data-note="birthTime"]')).toHaveLength(15);
    expect(document.querySelectorAll('[data-note="generational"]')).toHaveLength(3);
    const strip = text(document.querySelector('dl'));
    expect(strip).toContain(keysPage.strip.date.body(13));
    expect(strip).toContain(keysPage.strip.time.body(15));
  });

  it('explains the two bodies with one key, and no others', () => {
    const oneKey = BODY_IDS.filter((body) => !keyFor(body, 'sign') || !keyFor(body, 'house'));
    expect(Object.keys(keysPage.noKey).sort()).toEqual([...oneKey].sort());
    for (const body of oneKey) expect(text(document.body)).toContain(keysPage.noKey[body]);
  });

  it('shows no retired key name, group labels aside', () => {
    // The one exemption is by name: a group heading whose words are exactly a group's label in
    // lib/keys.ts (Chiron's group keeps the design system's label, which is also a retired key
    // name). Those headings and their copies in the contents lists are taken out; everything else
    // on the page is checked.
    const labels = new Set(BODY_GROUPS.map((group) => group.name));
    const exempt = [...document.querySelectorAll('[data-group-label], nav a[href^="#"]')];
    for (const el of exempt.filter((el) => el.hasAttribute('data-group-label'))) {
      expect(labels.has(text(el)), text(el)).toBe(true);
    }
    for (const el of exempt) if (labels.has(text(el))) el.remove();
    const words = text(document.body);
    for (const name of RETIRED_KEY_NAMES) {
      expect(words, name).not.toMatch(new RegExp(`\\b${escape(name)}\\b`));
    }
  });

  it('puts no mark on a key Dawa has not confirmed', () => {
    for (const file of ['app/(public)/keys/page.tsx', 'components/KeyRow.tsx', 'components/KeyChip.tsx', 'content/keys-page.ts']) {
      expect(readFileSync(path.join(process.cwd(), file), 'utf8'), file).not.toMatch(/settled/i);
    }
    const settled = cells().find((cell) => KEYS[cell.getAttribute('data-key') as KeyId].settled)!;
    const unsettled = cells().find((cell) => !KEYS[cell.getAttribute('data-key') as KeyId].settled)!;
    const shape = (cell: Element) => [...cell.querySelectorAll('*')].map((el) => `${el.tagName}.${el.getAttribute('class')}`);
    // Same elements and classes; only a house key's birth-time note may differ, so compare chips.
    expect(shape(unsettled.querySelector('span')!)).toEqual(shape(settled.querySelector('span')!));
  });

  it("carries Dawa's glyph only where he has drawn one", async () => {
    const { GLYPHS } = await import('@/lib/glyphs');
    const shown = [...document.querySelectorAll('[data-key-row] use')].map((use) => use.getAttribute('href'));
    const byDawa = BODY_GROUPS.flatMap((group) => bodiesIn(group.id)).filter((body) => GLYPHS[body].credit !== null);
    expect(shown).toEqual(byDawa.map((body) => `${GLYPHS[body].svg}#glyph`));
    for (const body of BODY_IDS) if (GLYPHS[body].placeholder) expect(shown).not.toContain(`${GLYPHS[body].svg}#glyph`);
  });
});

describe('the way to the 28 Keys page', () => {
  it('is the main nav link, a page of its own', () => {
    const hrefs = PRIMARY_NAV.map((link) => link.href);
    expect(hrefs).toContain('/keys');
    expect(hrefs.some((href) => href.includes('#keys'))).toBe(false);
  });

  it('is outside the passcode', () => {
    expect(isGatedPath('/keys')).toBe(false);
    expect(config.matcher.some((pattern: string) => pattern.startsWith('/keys'))).toBe(false);
  });
});
