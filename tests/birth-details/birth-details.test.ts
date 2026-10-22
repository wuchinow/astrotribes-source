import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/engine';
import { choicesNeeded, parseBirthForm, placementRows } from '@/lib/birth-details';
import { BODY_IDS, SIGN_IDS } from '@/lib/keys';

// Saved birth details (2c). Synthetic inputs, chosen for what the sky did, not people (invariant 8).
const LONDON = { lat: 51.5, lon: -0.1 };
const USER = '00000000-0000-4000-8000-000000000000';

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
};
const base = { date: '2010-03-03', time: '08:15', lat: '51.5', lon: '-0.1', place_label: 'Synthetic place' };

describe('parseBirthForm', () => {
  it('reads a full form', () => {
    expect(parseBirthForm(form(base))).toEqual({
      ok: true,
      value: { date: '2010-03-03', time: '08:15', lat: 51.5, lon: -0.1, label: 'Synthetic place', picks: {} },
    });
  });

  it('drops the time when it is marked unknown', () => {
    const parsed = parseBirthForm(form({ ...base, time_unknown: 'on' }));
    expect(parsed.ok && parsed.value.time).toBeNull();
  });

  it('answers with a code and never a value', () => {
    expect(parseBirthForm(form({ ...base, date: '3 March 2010' }))).toEqual({ ok: false, code: 'invalid_date' });
    expect(parseBirthForm(form({ ...base, time: '8am' }))).toEqual({ ok: false, code: 'invalid_time' });
    expect(parseBirthForm(form({ ...base, lat: '' }))).toEqual({ ok: false, code: 'invalid_place' });
    expect(parseBirthForm(form({ ...base, lat: '91' }))).toEqual({ ok: false, code: 'invalid_place' });
    expect(parseBirthForm(form({ ...base, place_label: '  ' }))).toEqual({ ok: false, code: 'invalid_place' });
    expect(parseBirthForm(form({ ...base, place_label: 'x'.repeat(201) }))).toEqual({ ok: false, code: 'invalid_place' });
    expect(parseBirthForm(form({ ...base, pick_moon: 'ophiuchus' }))).toEqual({ ok: false, code: 'invalid_pick' });
  });

  it('reads the Sun and Moon picks only', () => {
    const parsed = parseBirthForm(form({ ...base, pick_moon: 'scorpio', pick_venus: 'aries' }));
    expect(parsed.ok && parsed.value.picks).toEqual({ moon: 'scorpio' });
  });
});

describe('choicesNeeded', () => {
  const ingressDay = computeChart({ date: '2010-03-04', time: null, ...LONDON });

  it('asks nothing on a day nothing it asks about changed sign', () => {
    expect(choicesNeeded(computeChart({ date: '2010-03-03', time: null, ...LONDON }), {})).toEqual({});
  });

  it('asks for the Moon on a day it changed sign, until a pick from the pair arrives', () => {
    expect(choicesNeeded(ingressDay, {})).toEqual({ moon: ['libra', 'scorpio'] });
    expect(choicesNeeded(ingressDay, { moon: 'leo' })).toEqual({ moon: ['libra', 'scorpio'] });
    expect(choicesNeeded(ingressDay, { moon: 'scorpio' })).toEqual({});
  });

  it('never asks about Venus, which keeps the engine sign and an alternate', () => {
    expect(choicesNeeded(computeChart({ date: '2010-03-07', time: null, ...LONDON }), {})).toEqual({});
  });
});

describe('placementRows', () => {
  it('writes a row for every body, with houses and rising, when the time is known', () => {
    const rows = placementRows(computeChart({ date: '2010-03-03', time: '08:15', ...LONDON }), {}, USER);
    expect(rows.map((r) => r.body).sort()).toEqual([...BODY_IDS].sort());
    for (const row of rows) {
      expect(row.user_id).toBe(USER);
      expect(SIGN_IDS).toContain(row.sign);
      expect(row.sign_alternate).toBeNull();
      expect(row.degree).toBeGreaterThanOrEqual(0);
      expect(row.degree).toBeLessThanOrEqual(29);
      expect(row.engine_version.length).toBeLessThanOrEqual(64);
      if (row.body === 'rising') expect(row.house).toBeNull();
    }
  });

  it('writes no rising row and no houses without a time', () => {
    const rows = placementRows(computeChart({ date: '2010-03-03', time: null, ...LONDON }), {}, USER);
    expect(rows.map((r) => r.body)).not.toContain('rising');
    expect(rows.every((r) => r.house === null)).toBe(true);
  });

  it('stores the pick and keeps the other sign, at the edge of the picked sign', () => {
    const chart = computeChart({ date: '2010-03-04', time: null, ...LONDON });
    const moon = (picks: Parameters<typeof placementRows>[1]) =>
      placementRows(chart, picks, USER).find((r) => r.body === 'moon')!;
    const later = moon({ moon: 'scorpio' });
    expect([later.sign, later.sign_alternate]).toEqual(['scorpio', 'libra']);
    const earlier = moon({ moon: 'libra' });
    expect([earlier.sign, earlier.sign_alternate]).toEqual(['libra', 'scorpio']);
    // Whichever the engine's noon sign is keeps its degree; the other takes the edge.
    const moved = chart.placements.moon.sign === 'libra' ? later : earlier;
    expect([moved.degree, moved.minute]).toEqual(moved.sign === 'libra' ? [29, 59] : [0, 0]);
  });

  it('keeps the engine sign for any other body that changed sign, with its alternate', () => {
    const chart = computeChart({ date: '2010-03-07', time: null, ...LONDON });
    const venus = placementRows(chart, {}, USER).find((r) => r.body === 'venus')!;
    expect(venus.sign).toBe(chart.placements.venus.sign);
    expect(venus.sign_alternate).toBe(venus.sign === 'pisces' ? 'aries' : 'pisces');
  });
});

describe('the save path keeps quiet', () => {
  // The free chart's canary runs its route; this path needs a session and a database, so the
  // promise is held as text: no console call, and errors are codes from a fixed list.
  const files = [
    'app/(public)/welcome/actions.ts',
    'lib/birth-details.ts',
    'lib/carry.ts',
    'components/BirthDetailsForm.tsx',
    'app/(public)/your-chart/page.tsx',
    'app/(public)/welcome/page.tsx',
  ];
  it.each(files)('%s logs nothing', (file) => {
    expect(readFileSync(path.join(process.cwd(), file), 'utf8')).not.toMatch(/\bconsole\.|\bdebugger\b/);
  });

  it('stores the alternate sign as one of the twelve, in order (0002)', () => {
    const sql = readFileSync(path.join(process.cwd(), 'supabase/migrations/20261022020000_birth_details.sql'), 'utf8');
    const list = /sign_alternate text check \(sign_alternate in \(([^)]+)\)/.exec(sql)?.[1] ?? '';
    expect([...list.matchAll(/'([^']+)'/g)].map((m) => m[1])).toEqual([...SIGN_IDS]);
  });
});
