// Today's sky (1d): the page's facts come from skyNow and match published events, and the page is
// public, reads no cookie, and shows every planet as the engine places it.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { skyCopy } from '@/content/sky';
import { skyNow } from '@/lib/engine';
import { BODIES, SIGNS } from '@/lib/keys';
import { MOON_DAYS, PLANET_IDS, todaySky } from '@/lib/today-sky';

const minutesBetween = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / 60_000;

describe('todaySky', () => {
  it('places the Sun, the Moon, and every planet exactly as skyNow does', () => {
    const at = new Date('2026-10-26T23:00:00Z');
    const sky = todaySky(at);
    const engine = skyNow(at);
    expect(sky.sun).toEqual(engine.bodies.sun);
    expect(sky.moon).toMatchObject({ ...engine.bodies.moon, phase: engine.moon.phase, illumination: engine.moon.illumination });
    expect(sky.planets.map((p) => p.id)).toEqual([...PLANET_IDS]);
    for (const { id, body } of sky.planets) expect(body, id).toEqual(engine.bodies[id]);
  });

  it('finds the next new Moon (Nov 9, 2026, 07:02 UTC) and full Moon (Nov 24, 2026, 14:53 UTC)', () => {
    const sky = todaySky(new Date('2026-10-26T23:00:00Z'));
    expect(sky.lunations.map((l) => l.kind)).toEqual(['new', 'full']);
    expect(minutesBetween(sky.lunations[0].at, '2026-11-09T07:02:00Z')).toBeLessThanOrEqual(60);
    expect(minutesBetween(sky.lunations[1].at, '2026-11-24T14:53:00Z')).toBeLessThanOrEqual(60);
    expect(sky.lunations[0].sign).toBe('scorpio');
  });

  it('builds the Moon strip from the day before the UTC date, with today marked', () => {
    const sky = todaySky(new Date('2026-10-26T23:00:00Z'));
    expect(sky.moonDays).toHaveLength(MOON_DAYS + 2);
    expect(sky.moonDays[0].date).toBe('2026-10-25');
    expect(sky.moonDays.filter((d) => d.today).map((d) => d.date)).toEqual(['2026-10-26']);
    // The Oct 26, 2026 full Moon fell at 04:12 UTC, so by noon it is waning.
    expect(sky.moonDays[1]).toMatchObject({ phase: 'full', waning: true });
    expect(sky.moonDays[0].waning).toBe(false);
  });

  it('lists the March 2024 equinox and Mercury turning retrograde on Apr 1, 2024 (22:14 UTC), and no Moon ingress', () => {
    const sky = todaySky(new Date('2024-03-19T00:00:00Z'));
    const sun = sky.changes.find((c) => c.kind === 'ingress' && c.body === 'sun');
    expect(sun).toMatchObject({ from: 'pisces', to: 'aries' });
    expect(minutesBetween(sun!.at, '2024-03-20T03:06:00Z')).toBeLessThanOrEqual(2);

    const station = todaySky(new Date('2024-03-28T00:00:00Z')).changes.find((c) => c.kind === 'station' && c.body === 'mercury');
    expect(station).toMatchObject({ turns: 'retrograde', sign: 'aries' });
    expect(minutesBetween(station!.at, '2024-04-01T22:14:00Z')).toBeLessThanOrEqual(60);

    expect(sky.changes.some((c) => c.body === 'moon')).toBe(false);
    const times = sky.changes.map((c) => c.at);
    expect(times).toEqual([...times].sort());
    for (const t of times) expect(Date.parse(t)).toBeLessThanOrEqual(Date.parse('2024-03-26T00:00:00Z') + 60 * 60_000);
  });
});

describe('the /sky page', () => {
  afterEach(() => vi.useRealTimers());

  it('reads no cookie and no passcode', () => {
    const source = readFileSync(path.join(process.cwd(), 'app/(public)/sky/page.tsx'), 'utf8');
    expect(source).not.toMatch(/next\/headers|cookies\(|hasPreviewAccess|redirect\(/);
  });

  it('shows each planet in the sign and degree the engine gives, and the Sun and the Moon', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-26T23:00:00Z'));
    const page = (await import('@/app/(public)/sky/page')).default;
    const { document } = parseHTML(`<!doctype html><html><body>${renderToStaticMarkup(createElement(page))}</body></html>`);
    const engine = skyNow(new Date('2026-10-26T23:00:00Z'));

    for (const id of PLANET_IDS) {
      const row = document.querySelector(`[data-planet="${id}"]`);
      const { sign, degree, minute, retrograde } = engine.bodies[id];
      expect(row?.textContent, id).toContain(BODIES[id].name);
      expect(row?.textContent, id).toContain(SIGNS[sign].name);
      expect(row?.textContent, id).toContain(`${degree}°${String(minute).padStart(2, '0')}′`);
      expect(row?.querySelector('[data-retrograde]') !== null, id).toBe(retrograde);
    }
    expect(document.querySelector('[data-light="sun"]')?.textContent).toContain(
      skyCopy.inSign(BODIES.sun.name, SIGNS[engine.bodies.sun.sign].name),
    );
    expect(document.querySelector('[data-light="moon"]')?.textContent).toContain(skyCopy.phases[engine.moon.phase]);
    expect(document.querySelectorAll('li[aria-current="date"]')).toHaveLength(1);
  });
});
