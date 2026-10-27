// Today's sky (1d): what /sky shows, built on the server from skyNow alone, so the engine is unchanged.
// Nothing here is about a visitor: no birth details, nothing stored, nothing sent. The page rebuilds
// hourly, so every date below is the UTC calendar date of the build; the page shows times in the
// visitor's own zone (components/sky/LocalWhen.tsx).
import 'server-only';
import { skyNow, type MoonPhase, type Sky, type SkyBody, type SkyBodyId } from '@/lib/engine';
import { SIGN_IDS, type SignId } from '@/lib/keys';

export type { MoonPhase, SkyBody } from '@/lib/engine';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** The Moon strip's length, and how far ahead "Changing soon" looks. */
export const MOON_DAYS = 10;
export const SOON_DAYS = 7;
/** How far the search for the next full and new Moon runs: more than one lunar month. */
const LUNATION_SEARCH_DAYS = 32;

/** Mercury to Pluto, in the order of the list. */
export const PLANET_IDS = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const satisfies readonly SkyBodyId[];
export type PlanetId = (typeof PLANET_IDS)[number];

export interface MoonDay {
  /** 'YYYY-MM-DD', UTC. */
  date: string;
  phase: MoonPhase;
  illumination: number;
  /** Past full: the lit side is on the left (seen from the north). */
  waning: boolean;
  sign: SignId;
  today: boolean;
}

export interface Lunation {
  kind: 'full' | 'new';
  /** ISO UTC, to the hour. */
  at: string;
  sign: SignId;
}

export type Change =
  | { kind: 'ingress'; body: SkyBodyId; from: SignId; to: SignId; at: string }
  | { kind: 'station'; body: SkyBodyId; turns: 'retrograde' | 'direct'; sign: SignId; at: string };

export interface TodaySky {
  /** ISO UTC instant the page was built for. */
  at: string;
  /** 'YYYY-MM-DD', UTC. */
  date: string;
  sun: SkyBody;
  moon: SkyBody & { phase: MoonPhase; illumination: number; waning: boolean };
  planets: { id: PlanetId; body: SkyBody }[];
  /** MOON_DAYS + 2 days, from the day before the UTC date; `today` marks the UTC date. */
  moonDays: MoonDay[];
  /** The next full and the next new Moon, soonest first. */
  lunations: Lunation[];
  /** Sign changes (the Sun and the planets; the Moon has its own strip) and stations in the next seven days, soonest first. */
  changes: Change[];
}

const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const startOfUtcDay = (ms: number) => Math.floor(ms / DAY) * DAY;
const toHour = (ms: number) => new Date(Math.round(ms / HOUR) * HOUR).toISOString();

/** A body's longitude, 0 to 360, to the arcminute: all the precision the page needs. */
const longitude = ({ sign, degree, minute }: SkyBody) => SIGN_IDS.indexOf(sign) * 30 + degree + minute / 60;

/** The Moon's distance ahead of the Sun, 0 to 360: 0 is new, 180 is full, past 180 it wanes. */
const elongation = (s: Sky) => (((longitude(s.bodies.moon) - longitude(s.bodies.sun)) % 360) + 360) % 360;

/**
 * The next full and new Moon after `from`. The elongation only grows, so each is the moment it
 * crosses 180 or wraps past 360, found in 6-hour steps and narrowed to the hour by halving.
 */
function nextLunations(sky: (ms: number) => Sky, from: number): Lunation[] {
  const step = 6 * HOUR;
  const found: Lunation[] = [];
  const crossed = (a: number, b: number, kind: Lunation['kind']) =>
    kind === 'full' ? a < 180 && b >= 180 : b < a;
  for (let t = from; t < from + LUNATION_SEARCH_DAYS * DAY && found.length < 2; t += step) {
    const [a, b] = [elongation(sky(t)), elongation(sky(t + step))];
    for (const kind of ['full', 'new'] as const) {
      if (found.some((l) => l.kind === kind) || !crossed(a, b, kind)) continue;
      let [lo, hi] = [t, t + step];
      while (hi - lo > 5 * 60_000) {
        const mid = Math.round((lo + hi) / 2 / 60_000) * 60_000;
        if (crossed(a, elongation(sky(mid)), kind)) hi = mid;
        else lo = mid;
      }
      found.push({
        kind,
        at: toHour(hi),
        sign: sky(hi).moon.sign,
      });
    }
  }
  return found.sort((a, b) => a.at.localeCompare(b.at));
}

/** A planet that turns retrograde or direct within a day: narrowed to the hour by halving. */
function stationTime(sky: (ms: number) => Sky, body: SkyBodyId, lo: number, hi: number): number {
  const before = sky(lo).bodies[body].retrograde;
  while (hi - lo > 5 * 60_000) {
    const mid = (lo + hi) / 2;
    if (sky(mid).bodies[body].retrograde === before) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** Everything /sky shows, for the instant `now`. */
export function todaySky(now: Date = new Date()): TodaySky {
  // One sky per instant, however often the steps below ask for it.
  const cache = new Map<number, Sky>();
  const sky = (ms: number): Sky => {
    let s = cache.get(ms);
    if (!s) cache.set(ms, (s = skyNow(new Date(ms))));
    return s;
  };

  const t0 = now.getTime();
  const today = sky(t0);
  const midnight = startOfUtcDay(t0);

  // The strip: each day at noon UTC, from the day before the UTC date to the day after the tenth, so
  // a visitor whose own date is a day either side still gets ten days from their today.
  const moonDays = Array.from({ length: MOON_DAYS + 2 }, (_, i): MoonDay => {
    const noon = midnight + (i - 1) * DAY + 12 * HOUR;
    const s = sky(noon);
    return {
      date: isoDate(noon),
      phase: s.moon.phase,
      illumination: s.moon.illumination,
      waning: elongation(s) > 180,
      sign: s.moon.sign,
      today: i === 1,
    };
  });

  // Sign changes: each day's skyNow lists the next 24 hours' ingresses to the minute.
  const ingresses: Change[] = Array.from({ length: SOON_DAYS }, (_, i) => sky(t0 + i * DAY).ingresses)
    .flat()
    .filter((ingress) => ingress.body !== 'moon')
    .map((ingress) => ({ kind: 'ingress', ...ingress }));

  // Stations: a change in the retrograde flag between daily samples, narrowed to the hour.
  const stations: Change[] = [];
  for (const body of PLANET_IDS) {
    for (let i = 0; i < SOON_DAYS; i++) {
      const [a, b] = [t0 + i * DAY, t0 + (i + 1) * DAY];
      const was = sky(a).bodies[body].retrograde;
      if (sky(b).bodies[body].retrograde !== was) {
        const at = stationTime(sky, body, a, b);
        stations.push({
          kind: 'station',
          body,
          turns: was ? 'direct' : 'retrograde',
          sign: sky(at).bodies[body].sign,
          at: toHour(at),
        });
      }
    }
  }

  return {
    at: today.at,
    date: isoDate(t0),
    sun: today.bodies.sun,
    moon: { ...today.bodies.moon, phase: today.moon.phase, illumination: today.moon.illumination, waning: elongation(today) > 180 },
    planets: PLANET_IDS.map((id) => ({ id, body: today.bodies[id] })),
    moonDays,
    lunations: nextLunations(sky, t0),
    changes: [...ingresses, ...stations].sort((a, b) => a.at.localeCompare(b.at)),
  };
}
