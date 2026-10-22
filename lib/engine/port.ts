// The swap point. computeChart() and skyNow() only talk to an Ephemeris, so a hosted API
// replaces lib/engine/swisseph.ts with a second implementation and no caller changes.
import type { HouseSystem } from './types';

export const EPHEMERIS_BODIES = [
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
  'chiron',
  'northNode', // the true node
] as const;
export type EphemerisBody = (typeof EPHEMERIS_BODIES)[number];

export interface BodyPosition {
  /** Tropical, geocentric, apparent ecliptic longitude in degrees. */
  longitude: number;
  /** Degrees per day; negative when retrograde. */
  speed: number;
}

export interface HouseResult {
  /** 12 longitudes, cusps[0] is house I. */
  cusps: number[];
  ascendant: number;
  midheaven: number;
  system: HouseSystem;
  /** True when Placidus could not be computed and Porphyry was used instead. */
  fallback: boolean;
}

export interface Ephemeris {
  id: string;
  version: string;
  /** jdUt is the Julian day in Universal Time. */
  position(jdUt: number, body: EphemerisBody): BodyPosition;
  /** Placidus, or Porphyry where Placidus fails. */
  houses(jdUt: number, lat: number, lon: number): HouseResult;
  /** Longitude of the Galactic Center (Sgr A*) for that date. */
  galacticCenter(jdUt: number): number;
}

/** Years the ephemeris covers. Swiss Ephemeris files sepl_18 and semo_18 run 1800 to 2399. */
export const FIRST_YEAR = 1800;
export const LAST_YEAR = 2399;
