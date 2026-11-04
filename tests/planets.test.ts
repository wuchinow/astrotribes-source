// A planet's own page (Nov 4, from Dawa's Jupiter doc): every planet with a page carries his intro,
// one line for each of the twelve signs and each of the twelve houses, in the copy rules; the page
// renders all 24 under the planet's own sign key and house key from lib/keys.ts; and the 28 Keys
// page links to it. This file types no key name.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { PLANET_PAGES, planetHref } from '@/content/planets';
import { BODIES, HOUSES, KEY_LIST, RETIRED_KEY_NAMES, SIGN_IDS, SIGNS, keyFor } from '@/lib/keys';

const render = async (element: ReturnType<typeof createElement>) =>
  parseHTML(`<!doctype html><html lang="en"><head></head><body>${renderToStaticMarkup(element)}</body></html>`)
    .document;

const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('planet pages', () => {
  it('carry an intro and a line for every sign and every house, in the copy rules', () => {
    expect(PLANET_PAGES.length).toBeGreaterThan(0);
    const names = [...KEY_LIST.map((k) => k.name), ...RETIRED_KEY_NAMES].filter((name) => name !== 'Tribe');
    const typed = new RegExp(`\\b(?:${names.map(escape).join('|')})\\b`);
    for (const planet of PLANET_PAGES) {
      expect(keyFor(planet.body, 'sign'), planet.body).toBeDefined();
      expect(keyFor(planet.body, 'house'), planet.body).toBeDefined();
      expect(planet.intro.length, planet.body).toBeGreaterThan(0);
      expect(Object.keys(planet.signs).sort()).toEqual([...SIGN_IDS].sort());
      expect(Object.keys(planet.houses).map(Number)).toEqual(HOUSES.map((h) => h.number));
      const words = [...planet.intro, ...Object.values(planet.signs), ...Object.values(planet.houses)];
      for (const line of words) {
        expect(line, planet.body).not.toMatch(/[—!]/);
        expect(line, planet.body).not.toMatch(typed);
      }
      for (const sign of SIGN_IDS) expect(planet.signs[sign]).toContain(SIGNS[sign].name);
    }
  });

  it('render all twelve signs and all twelve houses under the planet’s own keys', async () => {
    const page = (await import('@/app/(public)/keys/[planet]/page')).default;
    for (const planet of PLANET_PAGES) {
      const document = await render(await page({ params: Promise.resolve({ planet: planet.slug }) } as never));
      const signKey = keyFor(planet.body, 'sign')!;
      const houseKey = keyFor(planet.body, 'house')!;
      const signs = [...document.querySelectorAll('[data-planet-sign]')];
      const houses = [...document.querySelectorAll('[data-planet-house]')];
      expect(signs.map((li) => li.getAttribute('data-planet-sign'))).toEqual([...SIGN_IDS]);
      expect(houses).toHaveLength(12);
      signs.forEach((li, i) => {
        expect(text(li)).toContain(signKey.name);
        expect(text(li)).toContain(planet.signs[SIGN_IDS[i]]);
      });
      houses.forEach((li, i) => expect(text(li)).toContain(planet.houses[HOUSES[i].number]));
      expect(text(document.body)).toContain(houseKey.name);
      expect(text(document.querySelector('h1'))).toContain(BODIES[planet.body].name);
      for (const paragraph of planet.intro) expect(text(document.querySelector('[data-planet-intro]'))).toContain(paragraph);
    }
  });

  it('are linked from the 28 Keys page', async () => {
    const page = (await import('@/app/(public)/keys/page')).default;
    const document = await render(createElement(page));
    const links = [...document.querySelectorAll('[data-body-more]')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(PLANET_PAGES.map(planetHref));
  });
});
