import { describe, expect, it } from 'vitest';
import { EngineError, computeChart } from '@/lib/engine';
import { localToInstant, parseDate, parseTime, zoneAt } from '@/lib/engine/time';

// Synthetic dates and places.
const utc = (date: string, time: string, lat: number, lon: number) => {
  const instant = localToInstant(parseDate(date), parseTime(time), lat, lon);
  return { iso: new Date(instant.utcMs).toISOString(), note: instant.localTime };
};

describe('local time to UTC', () => {
  it('reads an ordinary summer time', () => {
    expect(utc('2021-06-01', '12:00', 40.7, -74.0)).toEqual({ iso: '2021-06-01T16:00:00.000Z', note: undefined });
  });

  it('moves a time inside the spring-forward gap ahead by the gap', () => {
    // 02:30 never happened in New York on Mar 14, 2021; it reads as 03:30 EDT.
    expect(utc('2021-03-14', '02:30', 40.7, -74.0)).toEqual({
      iso: '2021-03-14T07:30:00.000Z',
      note: 'dst-gap-shifted',
    });
  });

  it('takes the first of a fall-back pair', () => {
    // 01:30 happened twice in New York on Nov 7, 2021; the first was EDT.
    expect(utc('2021-11-07', '01:30', 40.7, -74.0)).toEqual({
      iso: '2021-11-07T05:30:00.000Z',
      note: 'dst-overlap-first',
    });
  });

  it('uses the birthplace’s own mean time before its zone had standard time', () => {
    // Chicago before 1883: 87.65° west is 5 h 50 min 36 s behind Greenwich.
    expect(utc('1850-06-01', '12:00', 41.88, -87.65)).toEqual({
      iso: '1850-06-01T17:50:36.000Z',
      note: 'lmt',
    });
    // Munich before 1893: the tz database gives Berlin's +0:53:28; 11.58° east is +0:46:19.
    expect(utc('1880-01-01', '12:00', 48.14, 11.58)).toEqual({
      iso: '1880-01-01T11:13:41.000Z',
      note: 'lmt',
    });
  });

  it('uses the zone once it has standard time', () => {
    expect(utc('1900-01-01', '12:00', 48.14, 11.58)).toEqual({ iso: '1900-01-01T11:00:00.000Z', note: undefined });
  });

  it('finds the zone from coordinates, including Indiana and the open sea', () => {
    expect(zoneAt(39.77, -86.16)).toBe('America/Indiana/Indianapolis');
    expect(zoneAt(0, -160)).toBe('Etc/GMT+11');
    expect(utc('2021-06-01', '12:00', 0, -160)).toEqual({ iso: '2021-06-01T23:00:00.000Z', note: undefined });
  });
});

describe('input errors carry a code and never the input', () => {
  const place = { lat: 40.7, lon: -74.0 };
  it.each([
    ['1799-12-31', '12:00', place, 'out_of_range'],
    ['2400-01-01', '12:00', place, 'out_of_range'],
    ['2001-02-30', '12:00', place, 'invalid_input'],
    ['2001-13-01', '12:00', place, 'invalid_input'],
    ['2001-06-15', '24:00', place, 'invalid_input'],
    ['2001-06-15', '9:30', place, 'invalid_input'],
    ['2001-06-15', '12:00', { lat: 91, lon: 0 }, 'invalid_input'],
    ['2001-06-15', '12:00', { lat: 0, lon: 181 }, 'invalid_input'],
    ['2001-06-15', '12:00', { lat: Number.NaN, lon: 0 }, 'invalid_input'],
  ])('%s %s', (date, time, where, code) => {
    let caught: unknown;
    try {
      computeChart({ date, time, ...where });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(EngineError);
    const error = caught as EngineError;
    expect(error.code).toBe(code);
    for (const fragment of [date, date.slice(0, 4), time, String(where.lat), String(where.lon)]) {
      expect(error.message).not.toContain(fragment);
    }
  });
});
