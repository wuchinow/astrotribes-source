import { describe, expect, it } from 'vitest';
import { TALLY_BODIES, computeChart } from '@/lib/engine';
import { norm360 } from '@/lib/engine/zodiac';

// Seeded random synthetic inputs, 1900 to 2100, outside the polar circles. Not people.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const random = mulberry32(20260924);
const pad = (n: number) => String(n).padStart(2, '0');

const inputs = Array.from({ length: 200 }, () => {
  const ms = Date.UTC(1900, 0, 1) + random() * (Date.UTC(2100, 0, 1) - Date.UTC(1900, 0, 1));
  const d = new Date(ms);
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(Math.floor(random() * 24))}:${pad(Math.floor(random() * 60))}`,
    lat: Math.round((random() * 120 - 60) * 100) / 100,
    lon: Math.round((random() * 360 - 180) * 100) / 100,
  };
});

describe('chart properties over 200 synthetic inputs', () => {
  const charts = inputs.map((input) => computeChart(input));

  it('puts the South Node exactly opposite the North Node', () => {
    for (const { placements } of charts) {
      expect(norm360(placements.southNode.longitude - placements.northNode.longitude)).toBeCloseTo(180, 9);
      expect(placements.southNode.retrograde).toBe(placements.northNode.retrograde);
    }
  });

  it('gives every body a house from I to XII, and Rising none', () => {
    for (const { placements } of charts) {
      for (const placement of Object.values(placements)) {
        if (!placement) continue;
        if (placement.body === 'rising') expect(placement.house).toBeNull();
        else expect(placement.house).toBeGreaterThanOrEqual(1);
        if (placement.body !== 'rising') expect(placement.house).toBeLessThanOrEqual(12);
      }
    }
  });

  it('keeps the Galactic Center in late Sagittarius, at its dated position', () => {
    for (const { placements } of charts) {
      expect(placements.galacticCenter.sign).toBe('sagittarius');
      expect(placements.galacticCenter.longitude).toBeGreaterThan(265);
      expect(placements.galacticCenter.longitude).toBeLessThan(268.5);
    }
  });

  it('keeps degree and minute inside the sign', () => {
    for (const { placements } of charts) {
      for (const placement of Object.values(placements)) {
        if (!placement) continue;
        expect(placement.degree).toBeGreaterThanOrEqual(0);
        expect(placement.degree).toBeLessThanOrEqual(29);
        expect(placement.minute).toBeLessThanOrEqual(59);
      }
    }
  });

  it('tallies exactly the tally bodies', () => {
    for (const { tallies } of charts) {
      const elements = Object.values(tallies.element).reduce((a, b) => a + b, 0);
      const modes = Object.values(tallies.mode).reduce((a, b) => a + b, 0);
      expect(elements).toBe(TALLY_BODIES.length);
      expect(modes).toBe(TALLY_BODIES.length);
    }
  });

  it('uses Placidus everywhere outside the polar circles', () => {
    for (const chart of charts) expect(chart.houseSystem).toBe('placidus');
  });
});
