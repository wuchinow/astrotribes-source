import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { clockWords, longDate } from '@/content/famous';
import { FAMOUS_CHARTS, famousByName } from '@/content/famous-charts';
import { TRIBE_FAMOUS } from '@/content/tribe-famous';
import { closeMatchesFrom, type Longitudes } from '@/lib/connection-points';
import { famousChart, famousCharts, famousMatch } from '@/lib/famous';
import { WHEEL_BODIES } from '@/lib/chart-wheel';
import { SIGN_IDS } from '@/lib/keys';

// Famous charts (3r): deceased historical figures only (invariant 8's exception, David, Sep 24),
// rated AA or A, four per Tribe, each listed under the Tribe the engine gives them.
describe('the famous charts', () => {
  it('have unique, plain addresses', () => {
    const slugs = FAMOUS_CHARTS.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('are all people who have died, with a birth time rated AA or A', () => {
    for (const f of FAMOUS_CHARTS) {
      expect(f.died, f.name).toBeGreaterThan(f.born);
      expect(f.died, f.name).toBeLessThanOrEqual(new Date().getFullYear());
      expect(['AA', 'A'], f.name).toContain(f.rodden);
      expect(f.birth.time, f.name).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(f.birth.date, f.name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('hold four per Tribe', () => {
    for (const sign of SIGN_IDS) expect(FAMOUS_CHARTS.filter((f) => f.tribe === sign), sign).toHaveLength(4);
  });

  it('sit in the Tribe the engine gives them, with a Rising and houses', () => {
    for (const { chart, placements } of famousCharts()) {
      const sun = placements.find((row) => row.body === 'sun');
      expect(sun?.sign, chart.name).toBe(chart.tribe);
      expect(placements.some((row) => row.body === 'rising'), chart.name).toBe(true);
      expect(sun?.house, chart.name).not.toBeNull();
    }
  });

  it('each draw a full wheel, with every body, a Rising, and twelve houses (3s)', () => {
    for (const { chart, wheel, placements } of famousCharts()) {
      expect(wheel.bodies.map((b) => b.body), chart.name).toEqual([...WHEEL_BODIES]);
      expect(wheel.ascendant, chart.name).not.toBeNull();
      expect(wheel.cusps, chart.name).toHaveLength(12);
      const sun = wheel.bodies.find((b) => b.body === 'sun');
      expect(sun?.degree, chart.name).toBeTypeOf('number');
      expect(sun?.sign, chart.name).toBe(placements.find((row) => row.body === 'sun')?.sign);
    }
  });

  it('agree with the Tribe pages, where a name has a chart', () => {
    for (const sign of SIGN_IDS) {
      for (const name of TRIBE_FAMOUS[sign]) {
        const chart = famousByName(name);
        if (chart) expect(chart.tribe, name).toBe(sign);
      }
    }
  });

  it('say the birth time in words', () => {
    expect(longDate('1879-03-14')).toBe('March 14, 1879');
    expect(clockWords('11:30')).toBe('11:30 in the morning');
    expect(clockWords('12:00')).toBe('noon');
    expect(clockWords('00:30')).toBe('12:30 at night');
    expect(clockWords('18:17')).toBe('6:17 in the evening');
    expect(clockWords('13:34')).toBe('1:34 in the afternoon');
  });
});

describe('close matches against a famous chart', () => {
  const kinds = (a: Longitudes, b: Longitudes) => closeMatchesFrom(a, b).map((m) => `${m.mine}:${m.theirs}:${m.kind}`).sort();

  it('count a Sun on a Rising within 2 degrees as rising, never also as close', () => {
    expect(kinds({ sun: 10 }, { rising: 11.5 })).toEqual(['sun:rising:rising']);
    expect(kinds({ sun: 10 }, { rising: 12.5 })).toEqual(['sun:rising:close']);
  });

  it('count personal placements within 3 degrees, across 0 Aries too', () => {
    expect(kinds({ mercury: 359 }, { venus: 1.5 })).toEqual(['mercury:venus:close']);
    expect(kinds({ mercury: 100 }, { venus: 103.5 })).toEqual([]);
    expect(kinds({ uranus: 100 }, { uranus: 100 })).toEqual([]);
  });

  it('count a Sun or Moon on a node within 2 degrees', () => {
    expect(kinds({ moon: 50 }, { southNode: 51 })).toEqual(['moon:southNode:node']);
    expect(kinds({ northNode: 50 }, { sun: 52.5 })).toEqual([]);
  });

  it('count both born near a new moon, or both near a full moon, once', () => {
    expect(kinds({ sun: 10, moon: 12 }, { sun: 200, moon: 197 })).toContain('moon:moon:newMoon');
    expect(kinds({ sun: 10, moon: 188 }, { sun: 200, moon: 22 })).toContain('moon:moon:fullMoon');
    expect(kinds({ sun: 10, moon: 12 }, { sun: 200, moon: 22 }).filter((k) => k.startsWith('moon:moon'))).toEqual([]);
  });
});

describe('a member against a famous chart', () => {
  it('scores two copies of one chart as sharing every Key, with close matches', () => {
    const einstein = famousChart('albert-einstein')!;
    const viewer = { kind: 'member' as const, placements: einstein.placements, longitudes: einstein.longitudes };
    const match = famousMatch(viewer, einstein);
    expect(match.shared.length).toBe(28);
    expect(match.points.close.length).toBeGreaterThan(0);
    expect(match.points.bonuses.length).toBe(4);
  });

  it('falls back to signs and houses when the member has no degrees', () => {
    const [a, b] = [famousChart('marilyn-monroe')!, famousChart('john-f-kennedy')!];
    const viewer = { kind: 'member' as const, placements: a.placements, longitudes: {} };
    expect(famousMatch(viewer, b).points.close).toEqual([]);
  });
});

describe('the famous charts pages', () => {
  const text = (file: string) => readFileSync(path.join(process.cwd(), file), 'utf8');

  it('never read another member, and read birth details only through the owner chart', () => {
    for (const file of ['lib/famous.ts', 'app/(public)/famous/page.tsx', 'app/(public)/famous/[slug]/page.tsx']) {
      const source = text(file);
      expect(source, file).not.toMatch(/['"]birth_data['"]/);
      expect(source, file).not.toMatch(/supabase\/admin/);
      expect(source, file).not.toMatch(/from\(\s*['"]profiles['"]/);
    }
  });

  it('show no degree of the member on the page', () => {
    for (const file of ['app/(public)/famous/page.tsx', 'app/(public)/famous/[slug]/page.tsx', 'components/FamousCard.tsx']) {
      expect(text(file), file).not.toMatch(/\.longitude|\.degree|\.minute|longitudes\./);
    }
  });
});
