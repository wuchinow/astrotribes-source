// Local birth date and time at a place, to Universal Time. No provider: the zone comes from
// the coordinates (geo-tz, the full historical dataset) and the offset from Node's tz database.
import { find } from 'geo-tz/all';
import { FIRST_YEAR, LAST_YEAR } from './port';
import { EngineError, type LocalTimeNote } from './types';

const MINUTE = 60_000;
const DAY = 86_400_000;

export interface CivilDate {
  year: number;
  month: number;
  day: number;
}

export interface Instant {
  /** Milliseconds since 1970 UTC. */
  utcMs: number;
  /** Julian day, Universal Time. */
  jdUt: number;
  localTime?: LocalTimeNote;
}

export const parseDate = (date: string): CivilDate => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new EngineError('invalid_input');
  const [year, month, day] = match.slice(1).map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  // Date.UTC rolls Feb 30 into March; a real date survives the round trip.
  if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw new EngineError('invalid_input');
  }
  if (year < FIRST_YEAR || year > LAST_YEAR) throw new EngineError('out_of_range');
  return { year, month, day };
};

/** Minutes after midnight. */
export const parseTime = (time: string): number => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new EngineError('invalid_input');
  const [hours, minutes] = [Number(match[1]), Number(match[2])];
  if (hours > 23 || minutes > 59) throw new EngineError('invalid_input');
  return hours * 60 + minutes;
};

export const checkPlace = (lat: number, lon: number) => {
  const ok =
    Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
  if (!ok) throw new EngineError('invalid_input');
};

export const toJulianDay = (utcMs: number): number => utcMs / DAY + 2440587.5;

export const zoneAt = (lat: number, lon: number): string => find(lat, lon)[0] ?? 'Etc/UTC';

const offsetFormats = new Map<string, Intl.DateTimeFormat>();

/** The zone's UTC offset at an instant, in seconds east of Greenwich (tz database, via Intl). */
export const offsetSeconds = (zone: string, utcMs: number): number => {
  let format = offsetFormats.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' });
    offsetFormats.set(zone, format);
  }
  const name = format.formatToParts(new Date(utcMs)).find((p) => p.type === 'timeZoneName')?.value;
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/.exec(name ?? '');
  if (!match) return 0; // "GMT" alone is UTC
  const [, sign, h, m = '0', s = '0'] = match;
  return (sign === '-' ? -1 : 1) * (Number(h) * 3600 + Number(m) * 60 + Number(s));
};

const EARLIEST = Date.UTC(FIRST_YEAR - 1, 0, 1);

/**
 * Before a zone's first recorded change, the tz database gives the local mean time of the zone's
 * main city (Berlin's +0:53:28 for every German birth before 1893). A birth elsewhere in the zone
 * then needs its own local mean time, taken from its longitude.
 */
const isLocalMeanTime = (zone: string, utcMs: number): boolean =>
  !zone.startsWith('Etc/') && offsetSeconds(zone, utcMs) === offsetSeconds(zone, EARLIEST);

/**
 * Wall-clock time at a place to UTC. A time that never happened (spring forward) moves ahead by
 * the gap; a time that happened twice (fall back) takes the first.
 */
export const localToInstant = (
  date: CivilDate,
  minutes: number,
  lat: number,
  lon: number,
): Instant => {
  const wall = Date.UTC(date.year, date.month - 1, date.day) + minutes * MINUTE;
  const zone = zoneAt(lat, lon);

  if (isLocalMeanTime(zone, wall - offsetSeconds(zone, wall) * 1000)) {
    const utcMs = wall - Math.round(lon * 240) * 1000; // 4 minutes of time per degree
    return { utcMs, jdUt: toJulianDay(utcMs), localTime: 'lmt' };
  }

  const offsets = new Set([offsetSeconds(zone, wall - DAY), offsetSeconds(zone, wall + DAY)]);
  const fits = [...offsets]
    .map((offset) => wall - offset * 1000)
    .filter((utcMs) => offsetSeconds(zone, utcMs) * 1000 === wall - utcMs)
    .sort((a, b) => a - b);

  if (fits.length === 1) return { utcMs: fits[0], jdUt: toJulianDay(fits[0]) };
  if (fits.length > 1) {
    return { utcMs: fits[0], jdUt: toJulianDay(fits[0]), localTime: 'dst-overlap-first' };
  }
  // In the gap: read the clock with the offset from before the change, which lands just after it.
  const utcMs = wall - offsetSeconds(zone, wall - DAY) * 1000;
  return { utcMs, jdUt: toJulianDay(utcMs), localTime: 'dst-gap-shifted' };
};
