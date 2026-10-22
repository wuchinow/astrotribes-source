// The engine's public shapes. Placements are keyed by the body ids in lib/keys.ts,
// so every key there can be filled from a Chart (tests/engine/keys-coverage.test.ts).
import type { BodyId, Element, HouseNumber, KeyId, Mode, SignId } from '@/lib/keys';

export interface BirthInput {
  /** 'YYYY-MM-DD', the local civil date at the birthplace. */
  date: string;
  /** 'HH:MM', the local wall-clock time; null when the time is unknown. */
  time: string | null;
  /** -90 to 90, north positive. */
  lat: number;
  /** -180 to 180, east positive. */
  lon: number;
}

export interface Placement {
  body: BodyId;
  /** Tropical ecliptic longitude, 0 to 360. */
  longitude: number;
  sign: SignId;
  /** 0 to 29 within the sign. */
  degree: number;
  /** 0 to 59. */
  minute: number;
  /** Always false for rising and galacticCenter. */
  retrograde: boolean;
  /** Null for rising, and for every body when the time is unknown. */
  house: HouseNumber | null;
  /** Unknown time only: the sign changed during the local day. [sign at 00:00, sign at 23:59]. */
  signCandidates?: readonly [SignId, SignId];
}

export type Point = Omit<Placement, 'body' | 'house' | 'signCandidates'>;

export type HouseSystem = 'placidus' | 'porphyry';

/** How the local time was read: moved past a spring-forward gap, the first of a fall-back pair, or local mean time. */
export type LocalTimeNote = 'dst-gap-shifted' | 'dst-overlap-first' | 'lmt';

export interface Chart {
  /** Stored on every placement row from 2a, so old and new engine output never mix. */
  engine: { id: string; version: string };
  zodiac: 'tropical';
  timeKnown: boolean;
  /** Null when the time is unknown. */
  houseSystem: HouseSystem | null;
  /** True when Placidus failed (inside the polar circles) and Porphyry was used. */
  houseSystemFallback: boolean;
  localTime?: LocalTimeNote;
  /** All 15 bodies, always. Rising is null when the time is unknown: it has no position without one. */
  placements: Record<Exclude<BodyId, 'rising'>, Placement> & { rising: Placement | null };
  midheaven: Point | null;
  /** 12 longitudes; cusps[0] is house I. Null when the time is unknown. */
  cusps: readonly number[] | null;
  tallies: { element: Record<Element, number>; mode: Record<Mode, number> };
  /** The keys that need a birth time, when it is unknown. */
  unavailable: readonly KeyId[];
}

export type KeyValue =
  | { kind: 'sign'; sign: SignId; candidates?: readonly [SignId, SignId] }
  | { kind: 'house'; house: HouseNumber }
  | { kind: 'unavailable' };

export type MoonPhase =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export const SKY_BODY_IDS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;
export type SkyBodyId = (typeof SKY_BODY_IDS)[number];

export interface SkyBody {
  sign: SignId;
  degree: number;
  minute: number;
  retrograde: boolean;
}

export interface Ingress {
  body: SkyBodyId;
  from: SignId;
  to: SignId;
  /** ISO UTC instant, to the minute. */
  at: string;
}

export interface Sky {
  /** ISO UTC instant. */
  at: string;
  moon: { sign: SignId; phase: MoonPhase; illumination: number };
  bodies: Record<SkyBodyId, SkyBody>;
  /** Sign changes in the next 24 hours, soonest first. */
  ingresses: Ingress[];
}

export type EngineErrorCode = 'invalid_input' | 'out_of_range' | 'ephemeris_unavailable';

/** Carries a code only. Birth details never appear in an error message (CLAUDE.md, invariants). */
export class EngineError extends Error {
  readonly code: EngineErrorCode;
  constructor(code: EngineErrorCode) {
    super(`chart engine: ${code}`);
    this.name = 'EngineError';
    this.code = code;
  }
}
