// computeChart on any Ephemeris: the placements behind every one of the 28 Keys.
import { KEYS, KEY_LIST, needsBirthTime, type BodyId, type KeyId, type SignId } from '@/lib/keys';
import { EPHEMERIS_BODIES, type BodyPosition, type Ephemeris, type EphemerisBody } from './port';
import { checkPlace, localToInstant, parseDate, parseTime } from './time';
import type { BirthInput, Chart, KeyValue, Placement, Point } from './types';
import { TALLY_BODIES, degreeMinute, houseOf, norm360, signOf, tally } from './zodiac';

const NOON = 12 * 60;
const DAY_START = 0;
const DAY_END = 23 * 60 + 59;

type Positions = Record<Exclude<BodyId, 'rising'>, BodyPosition>;

const positionsAt = (ephemeris: Ephemeris, jdUt: number): Positions => {
  const bodies = Object.fromEntries(
    EPHEMERIS_BODIES.map((body) => [body, ephemeris.position(jdUt, body)]),
  ) as Record<EphemerisBody, BodyPosition>;
  const { northNode } = bodies;
  return {
    ...bodies,
    southNode: { longitude: norm360(northNode.longitude + 180), speed: northNode.speed },
    galacticCenter: { longitude: ephemeris.galacticCenter(jdUt), speed: 0 },
  };
};

const point = (longitude: number, speed = 0): Point => ({
  longitude: norm360(longitude),
  sign: signOf(longitude),
  ...degreeMinute(longitude),
  retrograde: speed < 0,
});

export const computeChartWith = (ephemeris: Ephemeris, birth: BirthInput): Chart => {
  checkPlace(birth.lat, birth.lon);
  const date = parseDate(birth.date);
  const timeKnown = birth.time !== null;
  const minutes = birth.time === null ? NOON : parseTime(birth.time);

  const instant = localToInstant(date, minutes, birth.lat, birth.lon);
  const positions = positionsAt(ephemeris, instant.jdUt);
  const houses = timeKnown ? ephemeris.houses(instant.jdUt, birth.lat, birth.lon) : null;

  // Unknown time: any body whose sign changes during the local day gets both signs.
  let candidates: Partial<Record<BodyId, readonly [SignId, SignId]>> = {};
  if (!timeKnown) {
    const start = positionsAt(ephemeris, localToInstant(date, DAY_START, birth.lat, birth.lon).jdUt);
    const end = positionsAt(ephemeris, localToInstant(date, DAY_END, birth.lat, birth.lon).jdUt);
    candidates = Object.fromEntries(
      (Object.keys(positions) as (keyof Positions)[])
        .map((body) => [body, signOf(start[body].longitude), signOf(end[body].longitude)] as const)
        .filter(([, first, last]) => first !== last)
        .map(([body, first, last]) => [body, [first, last] as const]),
    );
  }

  const bodyPlacements = Object.fromEntries(
    (Object.keys(positions) as (keyof Positions)[]).map((body) => {
      const { longitude, speed } = positions[body];
      const placement: Placement = {
        body,
        ...point(longitude, body === 'galacticCenter' ? 0 : speed),
        house: houses ? houseOf(longitude, houses.cusps) : null,
      };
      const pair = candidates[body];
      return [body, pair ? { ...placement, signCandidates: pair } : placement];
    }),
  ) as Record<keyof Positions, Placement>;

  const rising: Placement | null = houses
    ? { body: 'rising', ...point(houses.ascendant), house: null }
    : null;
  const placements = { ...bodyPlacements, rising };

  const tallied = TALLY_BODIES.map((body) => placements[body]).filter(
    (p): p is Placement => p !== null,
  );

  return {
    engine: { id: ephemeris.id, version: ephemeris.version },
    zodiac: 'tropical',
    timeKnown,
    houseSystem: houses?.system ?? null,
    houseSystemFallback: houses?.fallback ?? false,
    ...(instant.localTime ? { localTime: instant.localTime } : {}),
    placements,
    midheaven: houses ? point(houses.midheaven) : null,
    cusps: houses ? houses.cusps.map(norm360) : null,
    tallies: tally(tallied.map((p) => p.sign)),
    unavailable: timeKnown ? [] : KEY_LIST.filter(needsBirthTime).map((k) => k.id),
  };
};

/** The value behind one of the 28 Keys: a sign, a house, or unavailable without a birth time. */
export const keyPlacement = (chart: Chart, id: KeyId): KeyValue => {
  const key = KEYS[id];
  const placement = chart.placements[key.body];
  if (!placement) return { kind: 'unavailable' };
  if (key.dimension === 'sign') {
    return placement.signCandidates
      ? { kind: 'sign', sign: placement.sign, candidates: placement.signCandidates }
      : { kind: 'sign', sign: placement.sign };
  }
  return placement.house === null ? { kind: 'unavailable' } : { kind: 'house', house: placement.house };
};
