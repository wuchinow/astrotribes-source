// skyNow on any Ephemeris: the facts behind Astro Weather.
import type { SignId } from '@/lib/keys';
import type { Ephemeris } from './port';
import { toJulianDay } from './time';
import { SKY_BODY_IDS, type Ingress, type Sky, type SkyBody, type SkyBodyId } from './types';
import { degreeMinute, moonIllumination, moonPhase, signOf } from './zodiac';

const HOUR = 3_600_000;
const HOURS_AHEAD = 24;

const signAt = (ephemeris: Ephemeris, body: SkyBodyId, utcMs: number): SignId =>
  signOf(ephemeris.position(toJulianDay(utcMs), body).longitude);

/** Narrow a sign change between two instants to within 5 seconds, then round to the minute. */
const ingressTime = (ephemeris: Ephemeris, body: SkyBodyId, from: SignId, lo: number, hi: number) => {
  while (hi - lo > 5_000) {
    const mid = (lo + hi) / 2;
    if (signAt(ephemeris, body, mid) === from) lo = mid;
    else hi = mid;
  }
  return new Date(Math.round(hi / 60_000) * 60_000).toISOString();
};

export const skyNowWith = (ephemeris: Ephemeris, date: Date = new Date()): Sky => {
  const now = date.getTime();
  const jdUt = toJulianDay(now);

  const positions = Object.fromEntries(
    SKY_BODY_IDS.map((body) => [body, ephemeris.position(jdUt, body)]),
  ) as Record<SkyBodyId, { longitude: number; speed: number }>;

  const bodies = Object.fromEntries(
    SKY_BODY_IDS.map((body): [SkyBodyId, SkyBody] => {
      const { longitude, speed } = positions[body];
      return [body, { sign: signOf(longitude), ...degreeMinute(longitude), retrograde: speed < 0 }];
    }),
  ) as Record<SkyBodyId, SkyBody>;

  // Hourly samples catch every change; a retrograde body can cross back, and that is caught too.
  const ingresses: Ingress[] = [];
  for (const body of SKY_BODY_IDS) {
    let previous = bodies[body].sign;
    for (let h = 1; h <= HOURS_AHEAD; h++) {
      const at = now + h * HOUR;
      const sign = signAt(ephemeris, body, at);
      if (sign !== previous) {
        ingresses.push({ body, from: previous, to: sign, at: ingressTime(ephemeris, body, previous, at - HOUR, at) });
        previous = sign;
      }
    }
  }
  ingresses.sort((a, b) => a.at.localeCompare(b.at));

  const sun = positions.sun.longitude;
  const moon = positions.moon.longitude;
  return {
    at: date.toISOString(),
    moon: { sign: bodies.moon.sign, phase: moonPhase(sun, moon), illumination: moonIllumination(sun, moon) },
    bodies,
    ingresses,
  };
};
