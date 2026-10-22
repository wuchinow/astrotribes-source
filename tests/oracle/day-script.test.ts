// The Oracle's day script (1c): the visitor's local calendar date picks the day, at the edges of the
// built window in UTC+14 and UTC-12, from a cache up to a day old; the UTC day without JavaScript.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { oracleWindow } from '@/lib/oracle';
import { LOCAL_ATTR, NEAREST_ATTR, applyOracleDay, oracleDayCss, oracleDayScript } from '@/lib/oracle-head';

const original = process.env.TZ;
afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = original;
});

/** Run the script as a browser in `zone` would at `instant`, against a page built at `builtAt`. */
function dayShown(builtAt: string, instant: string, zone: string) {
  const days = oracleWindow(new Date(builtAt)).map((d) => d.date);
  process.env.TZ = zone;
  vi.useFakeTimers();
  vi.setSystemTime(new Date(instant));
  const attrs: Record<string, string> = {};
  const documentElement = {
    setAttribute: (name: string, value: string) => (attrs[name] = value),
    removeAttribute: (name: string) => delete attrs[name],
  };
  new Function('document', oracleDayScript(days))({ documentElement });
  // The layout effect (client navigation) makes the same choice.
  const effect: Record<string, string> = {};
  applyOracleDay(days, { setAttribute: (n: string, v: string) => (effect[n] = v), removeAttribute: (n: string) => delete effect[n] } as unknown as Element);
  expect(effect).toEqual(attrs);
  return { day: attrs[LOCAL_ATTR], nearest: NEAREST_ATTR in attrs, days };
}

describe('the local date picks the day', () => {
  it('in UTC+14 and UTC-12 on the same instant', () => {
    const at = '2026-09-25T11:30:00Z';
    expect(dayShown(at, at, 'Pacific/Kiritimati').day).toBe('2026-09-26'); // UTC+14
    expect(dayShown(at, at, 'Etc/GMT+12').day).toBe('2026-09-24'); // UTC-12
    expect(dayShown(at, at, 'UTC').day).toBe('2026-09-25');
    expect(dayShown(at, at, 'America/Los_Angeles').day).toBe('2026-09-25');
  });

  it('at the edges of the window, from a page built a day earlier', () => {
    // Built just before UTC midnight, served just before the next one: 23 to 27 still holds every zone.
    const built = '2026-09-24T23:59:00Z';
    const late = '2026-09-25T23:59:00Z';
    const east = dayShown(built, late, 'Pacific/Kiritimati');
    expect(east.days).toEqual(['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26']);
    expect(east).toMatchObject({ day: '2026-09-26', nearest: false });
    expect(dayShown(built, late, 'Etc/GMT+12')).toMatchObject({ day: '2026-09-25', nearest: false });
    expect(dayShown(built, '2026-09-24T00:01:00Z', 'Etc/GMT+12')).toMatchObject({ day: '2026-09-23', nearest: false });
  });

  it('two visitors on the same local date see the same day, wherever they are', () => {
    const at = '2026-09-25T20:00:00Z';
    expect(dayShown(at, at, 'Europe/London').day).toBe(dayShown(at, at, 'America/New_York').day);
  });

  it('falls back to the nearest built day, with its note, when the clock is outside the window', () => {
    const built = '2026-09-25T12:00:00Z';
    expect(dayShown(built, '2026-10-30T12:00:00Z', 'UTC')).toMatchObject({ day: '2026-09-27', nearest: true });
    expect(dayShown(built, '2026-08-01T12:00:00Z', 'UTC')).toMatchObject({ day: '2026-09-23', nearest: true });
  });
});

describe('the day CSS', () => {
  const days = ['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'];
  const css = oracleDayCss(days, '2026-09-25');

  it('hides every day, then shows the UTC day without JavaScript and the local day with it', () => {
    expect(css).toContain('[data-day]{display:none}');
    expect(css).toContain(`html:not([${LOCAL_ATTR}]) [data-day="2026-09-25"]`);
    for (const day of days) expect(css).toContain(`html[${LOCAL_ATTR}="${day}"] [data-day="${day}"]`);
    expect(css).toContain(`html[${NEAREST_ATTR}] .oracle-nearest{display:block}`);
  });

  it('keeps the script to reading the clock: no storage, cookies, or requests', () => {
    const script = oracleDayScript(days);
    expect(script).not.toMatch(/cookie|localStorage|sessionStorage|fetch|XMLHttpRequest|sendBeacon|location/);
  });
});
