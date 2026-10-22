// Pure geometry on longitudes: signs, degrees, houses, the Moon's phase, and the tallies.
import {
  ELEMENTS,
  MODES,
  SIGN_IDS,
  elementOf,
  modeOf,
  type BodyId,
  type Element,
  type HouseNumber,
  type Mode,
  type SignId,
} from '@/lib/keys';
import type { MoonPhase } from './types';

export const norm360 = (degrees: number): number => ((degrees % 360) + 360) % 360;

export const signOf = (longitude: number): SignId => SIGN_IDS[Math.floor(norm360(longitude) / 30)];

/** Degree and minute within the sign, truncated, so 29°59.9' never shows as 30°0'. */
export const degreeMinute = (longitude: number): { degree: number; minute: number } => {
  const within = norm360(longitude) % 30;
  const degree = Math.floor(within);
  return { degree, minute: Math.floor((within - degree) * 60) };
};

/** The house a longitude falls in, by the cusps (cusps[0] is house I). */
export const houseOf = (longitude: number, cusps: readonly number[]): HouseNumber => {
  for (let i = 0; i < 12; i++) {
    const span = norm360(cusps[(i + 1) % 12] - cusps[i]);
    if (norm360(longitude - cusps[i]) < span) return (i + 1) as HouseNumber;
  }
  return 12; // unreachable with 12 ascending cusps; kept for the type
};

const PHASES: readonly MoonPhase[] = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
];

/** Eight 45° bands of the Moon's elongation from the Sun, centred on 0, 45, 90, and so on. */
export const moonPhase = (sunLongitude: number, moonLongitude: number): MoonPhase => {
  const elongation = norm360(moonLongitude - sunLongitude);
  return PHASES[Math.floor(norm360(elongation + 22.5) / 45) % 8];
};

/** Lit fraction of the disc, 0 to 1, from the ecliptic elongation (good to about 1%). */
export const moonIllumination = (sunLongitude: number, moonLongitude: number): number => {
  const elongation = (norm360(moonLongitude - sunLongitude) * Math.PI) / 180;
  return Math.round(((1 - Math.cos(elongation)) / 2) * 100) / 100;
};

/**
 * The bodies counted in the element and mode tallies: Sun to Pluto, and the Ascendant when the
 * birth time is known. Nodes, Chiron, and the Galactic Center are left out. Dawa confirms on Sep 30.
 */
export const TALLY_BODIES: readonly BodyId[] = [
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
  'rising',
];

export const tally = (
  signs: readonly SignId[],
): { element: Record<Element, number>; mode: Record<Mode, number> } => {
  const element = Object.fromEntries(ELEMENTS.map((e) => [e, 0])) as Record<Element, number>;
  const mode = Object.fromEntries(MODES.map((m) => [m, 0])) as Record<Mode, number>;
  for (const sign of signs) {
    element[elementOf(sign)] += 1;
    mode[modeOf(sign)] += 1;
  }
  return { element, mode };
};
