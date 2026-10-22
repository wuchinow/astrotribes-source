import { calc, constants as C } from 'sweph';
import { describe, expect, it } from 'vitest';
import { swissEphemeris } from '@/lib/engine/swisseph';
import { toJulianDay } from '@/lib/engine/time';
import { CALC_ET, HOUSES_PLACIDUS } from './fixtures/swisseph-reference';

// Loads the binding and the data files the way the engine does.
swissEphemeris.position(2451545, 'sun');

// t.exp was generated in Dec 2023 from the DE431-based files. Astrodienst rebuilt the files from
// DE441 in Apr and May 2026 (the ones shipped here), which moves positions by up to about 0.3″
// (Neptune in 1888). So positions are checked to 1e-4° (0.36″); houses do not use the files and
// match to 1e-7°. The Horizons check below confirms the files against DE441 directly.
const POSITION_TOLERANCE = 1e-4;

describe('Swiss Ephemeris reference values (setest/t.exp)', () => {
  it.each(CALC_ET)('$body at $date', ({ jdEt, ipl, longitude }) => {
    const result = calc(jdEt, ipl, C.SEFLG_SWIEPH);
    expect(result.flag & C.SEFLG_SWIEPH).toBe(C.SEFLG_SWIEPH);
    expect(Math.abs(result.data[0] - longitude)).toBeLessThan(POSITION_TOLERANCE);
  });

  it.each(HOUSES_PLACIDUS)('Placidus houses, case $id (lat $lat)', (ref) => {
    const houses = swissEphemeris.houses(ref.jdUt, ref.lat, ref.lon);
    expect(houses.system).toBe('placidus');
    expect(houses.fallback).toBe(false);
    houses.cusps.forEach((cusp, i) => expect(cusp).toBeCloseTo(ref.cusps[i], 7));
    expect(houses.ascendant).toBeCloseTo(ref.ascendant, 7);
    expect(houses.midheaven).toBeCloseTo(ref.midheaven, 7);
  });
});

// An independent source: JPL Horizons (DE441, and JPL#171 for Chiron), observer-centred
// ecliptic longitude of date, geocentre, queried Sep 24, 2026 (ssd.jpl.nasa.gov/api/horizons.api,
// COMMAND 10 and '2060;', QUANTITIES 31, TIME_TYPE UT).
const HORIZONS = [
  { body: 'sun', utc: '2000-01-01T12:00:00Z', longitude: 280.3689092 },
  { body: 'chiron', utc: '2000-01-01T12:00:00Z', longitude: 251.617609 },
  { body: 'chiron', utc: '1950-06-01T00:00:00Z', longitude: 259.2854977 },
  { body: 'chiron', utc: '2050-06-01T00:00:00Z', longitude: 248.4790886 },
] as const;

describe('JPL Horizons cross-check', () => {
  it.each(HORIZONS)('$body at $utc within 0.001°', ({ body, utc, longitude }) => {
    const { longitude: actual } = swissEphemeris.position(toJulianDay(Date.parse(utc)), body);
    expect(Math.abs(actual - longitude)).toBeLessThan(0.001);
  });
});

describe('Galactic Center', () => {
  it('sits at about 266.84° (26°50′ Sagittarius) at J2000', () => {
    expect(swissEphemeris.galacticCenter(2451545)).toBeCloseTo(266.84, 2);
  });

  it('moves about 1.4° a century, so it is computed per date', () => {
    const at1900 = swissEphemeris.galacticCenter(toJulianDay(Date.UTC(1900, 0, 1)));
    const at2000 = swissEphemeris.galacticCenter(toJulianDay(Date.UTC(2000, 0, 1)));
    expect(at2000 - at1900).toBeGreaterThan(1.3);
    expect(at2000 - at1900).toBeLessThan(1.5);
  });
});
