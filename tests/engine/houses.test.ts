import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/engine';
import { norm360 } from '@/lib/engine/zodiac';

// Synthetic places and a fixed synthetic moment.
const at = (lat: number, lon: number) => computeChart({ date: '2012-12-21', time: '10:15', lat, lon });

describe('houses', () => {
  it('uses Placidus at mid latitudes', () => {
    const chart = at(60, 10.7);
    expect(chart.houseSystem).toBe('placidus');
    expect(chart.houseSystemFallback).toBe(false);
  });

  it('falls back to Porphyry, labelled, inside the polar circle', () => {
    const chart = at(78.2, 15.6);
    expect(chart.houseSystem).toBe('porphyry');
    expect(chart.houseSystemFallback).toBe(true);
    expect(chart.cusps).toHaveLength(12);
    expect(chart.placements.rising?.sign).toBeDefined();
  });

  it.each([
    ['northern', 40.7, -74.0],
    ['southern', -33.9, 151.2],
    ['equator', 0.3, 32.6],
    ['east of the antimeridian', -17.7, 179.9],
    ['west of the antimeridian', -13.8, -179.9],
    ['polar', 78.2, 15.6],
  ])('%s: cusps run in zodiac order, house I is the Ascendant, house X the Midheaven', (_, lat, lon) => {
    const chart = at(lat, lon);
    const cusps = chart.cusps!;
    const spans = cusps.map((c, i) => norm360(cusps[(i + 1) % 12] - c));
    expect(spans.reduce((a, b) => a + b, 0)).toBeCloseTo(360, 6);
    spans.forEach((span) => expect(span).toBeGreaterThan(0));
    expect(cusps[0]).toBeCloseTo(chart.placements.rising!.longitude, 9);
    expect(cusps[9]).toBeCloseTo(chart.midheaven!.longitude, 9);
    for (const placement of Object.values(chart.placements)) {
      if (placement && placement.body !== 'rising') expect(placement.house).toBeGreaterThanOrEqual(1);
    }
  });
});
