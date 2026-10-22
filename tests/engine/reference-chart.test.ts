import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/engine';
import { SIGN_IDS, type SignId } from '@/lib/keys';

// Albert Einstein, a deceased historical figure with a public birth record (Rodden AA, from the
// birth certificate): Ulm, 14 Mar 1879, 11:30 local mean time, 48°24' N, 10°00' E as Astro-Databank
// gives them (LMT meridian 10e0). Outside invariant 8 by David's decision of Sep 24 (CLAUDE.md,
// Security invariants).
const EINSTEIN = { date: '1879-03-14', time: '11:30', lat: 48 + 24 / 60, lon: 10 };

interface Expected {
  sign: SignId;
  degree: number;
  minute: number;
}

// From Astro-Databank (astro.com/astro-databank/Einstein,_Albert, Rodden AA), pasted by David on
// Sep 24. The engine gives Sun 23°30' Pisces, Moon 14°31' Sagittarius, Ascendant 11°38' Cancer:
// the Moon and Ascendant sit 1' under, since the engine truncates to the minute.
const ASTRO_DATABANK: { sun: Expected; moon: Expected; ascendant: Expected } | null = {
  sun: { sign: 'pisces', degree: 23, minute: 30 },
  moon: { sign: 'sagittarius', degree: 14, minute: 32 },
  ascendant: { sign: 'cancer', degree: 11, minute: 39 },
};

const arcminutes = (e: Expected) => (SIGN_IDS.indexOf(e.sign) * 30 + e.degree) * 60 + e.minute;

describe('reference chart: Albert Einstein', () => {
  const chart = computeChart(EINSTEIN);

  it("reads Ulm's own local mean time, not Berlin's", () => {
    // The tz database gives Berlin's +0:53:28 for all of Germany before 1893; Ulm at 10°E is +0:40:00.
    expect(chart.localTime).toBe('lmt');
  });

  it.skipIf(ASTRO_DATABANK === null)('matches Astro-Databank for the Sun, Moon, and Ascendant within 2′', () => {
    const expected = ASTRO_DATABANK!;
    const actual = {
      sun: chart.placements.sun,
      moon: chart.placements.moon,
      ascendant: chart.placements.rising!,
    };
    for (const point of ['sun', 'moon', 'ascendant'] as const) {
      expect(actual[point].sign, point).toBe(expected[point].sign);
      const diff = Math.abs(arcminutes(actual[point]) - arcminutes(expected[point]));
      expect(diff, point).toBeLessThanOrEqual(2);
    }
  });
});
