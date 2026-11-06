// A planet's own page (Nov 4, from Dawa's Jupiter doc): every planet from the Sun to Pluto has one,
// with an introduction (his, or one drafted for him under a draft note) and his lines for the signs
// and houses he has written, in the copy rules; the page renders each under the planet's own sign key
// and house key from lib/keys.ts; and the 28 Keys page links to it. The Galactic Center's page (Nov 6)
// has its house key and house lines only. A line or note may run to paragraphs. This file types no key name.

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
/** Every paragraph of a line or note appears in the element's text. */
const holds = (el: Element | null, s: string | undefined) => {
  for (const paragraph of (s ?? '').split('\n\n')) expect(text(el)).toContain(paragraph.replace(/\s+/g, ' ').trim());
};
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('planet pages', () => {
  it('cover the Sun to Pluto and the Galactic Center, each with an introduction and lines in the copy rules', () => {
    expect(PLANET_PAGES.map((p) => p.body)).toEqual([
      'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'galacticCenter',
    ]);
    // Jupiter's is Dawa's alone; the rest carry a draft for him until he rewrites or approves it.
    expect(PLANET_PAGES.find((p) => p.body === 'jupiter')!.draft).toEqual([]);
    const names = [...KEY_LIST.map((k) => k.name), ...RETIRED_KEY_NAMES].filter((name) => name !== 'Tribe');
    const typed = new RegExp(`\\b(?:${names.map(escape).join('|')})\\b`);
    for (const planet of PLANET_PAGES) {
      if (planet.body === 'galacticCenter') expect(Object.keys(planet.signs)).toEqual([]);
      else expect(keyFor(planet.body, 'sign'), planet.body).toBeDefined();
      expect(keyFor(planet.body, 'house'), planet.body).toBeDefined();
      expect(planet.intro.length + planet.draft.length, planet.body).toBeGreaterThan(0);
      for (const sign of Object.keys(planet.signs)) expect(SIGN_IDS, planet.body).toContain(sign);
      for (const house of Object.keys(planet.houses)) expect(HOUSES.map((h) => String(h.number))).toContain(house);
      const words = [
        ...planet.intro,
        ...planet.draft,
        ...(Object.values(planet.signs) as string[]),
        ...(Object.values(planet.houses) as string[]),
        ...[planet.signsNote, planet.housesNote].filter((note): note is string => Boolean(note)),
      ];
      for (const line of words) {
        expect(line, planet.body).not.toMatch(/[—!]/);
        expect(line, planet.body).not.toMatch(typed);
      }
    }
    // Jupiter's lines each name their sign, and every sign has two qualities since Nov 4.
    const jupiter = PLANET_PAGES.find((p) => p.body === 'jupiter')!;
    for (const sign of SIGN_IDS) {
      expect(jupiter.signs[sign]).toContain(SIGNS[sign].name);
      expect(jupiter.signs[sign], sign).toMatch(/ and /);
    }
  });

  it('render every written sign and house under the planet’s own keys, and the draft under its note', async () => {
    const page = (await import('@/app/(public)/keys/[planet]/page')).default;
    for (const planet of PLANET_PAGES) {
      const document = await render(await page({ params: Promise.resolve({ planet: planet.slug }) } as never));
      const signKey = keyFor(planet.body, 'sign');
      const houseKey = keyFor(planet.body, 'house')!;
      const signs = [...document.querySelectorAll('[data-planet-sign]')];
      const houses = [...document.querySelectorAll('[data-planet-house]')];
      const written = SIGN_IDS.filter((sign) => planet.signs[sign]);
      const writtenHouses = HOUSES.filter((house) => planet.houses[house.number]);
      expect(signs.map((li) => li.getAttribute('data-planet-sign'))).toEqual(written);
      expect(houses.map((li) => Number(li.getAttribute('data-planet-house')))).toEqual(writtenHouses.map((h) => h.number));
      signs.forEach((li, i) => {
        expect(text(li)).toContain(signKey!.name);
        holds(li, planet.signs[written[i]]);
      });
      houses.forEach((li, i) => holds(li, planet.houses[writtenHouses[i].number]));
      if (!signKey) expect(document.querySelector('#planet-signs'), planet.body).toBeNull();
      for (const note of [planet.signsNote, planet.housesNote]) {
        if (note) holds(document.body, note);
      }
      expect(text(document.body)).toContain(houseKey.name);
      expect(text(document.querySelector('h1'))).toContain(BODIES[planet.body].name);
      for (const paragraph of planet.intro) expect(text(document.querySelector('[data-planet-intro]'))).toContain(paragraph);
      const draft = document.querySelector('[data-planet-draft]');
      expect(draft === null, planet.body).toBe(planet.draft.length === 0);
      for (const paragraph of planet.draft) expect(text(draft)).toContain(paragraph);
    }
  });

  it('are linked from the 28 Keys page', async () => {
    const page = (await import('@/app/(public)/keys/page')).default;
    const document = await render(createElement(page));
    const links = [...document.querySelectorAll('[data-body-more]')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(PLANET_PAGES.map(planetHref));
  });
});
