// The free chart's shapes, shared by /api/chart, the /chart page, and the public share page.
// No engine import: the share page must not reach the engine (S4), and these are plain data.
import { SIGN_IDS, SIGNS, type SignId } from './keys';

/** A sign, or two when an unknown-time birth fell on the day it changed (engine signCandidates). */
export interface SignReading {
  sign: SignId;
  /** [sign at 00:00, sign at 23:59] of the local birth date. */
  candidates?: readonly [SignId, SignId];
}

/** What /api/chart returns: three signs, nothing about the birth itself. */
export interface FreeChart {
  timeKnown: boolean;
  sun: SignReading;
  moon: SignReading;
  /** Null when the time is unknown: the rising sign needs one. */
  rising: SignReading | null;
}

export const THREE = ['sun', 'moon', 'rising'] as const;
export type ThreeBody = (typeof THREE)[number];

const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

/** The sign after, in zodiac order (Pisces to Aries). */
export const nextSign = (sign: SignId): SignId => SIGN_IDS[(SIGN_IDS.indexOf(sign) + 1) % 12];

/** "Leo" or "Leo or Virgo". */
export const signText = (reading: SignReading): string =>
  reading.candidates
    ? `${SIGNS[reading.candidates[0]].name} or ${SIGNS[reading.candidates[1]].name}`
    : SIGNS[reading.sign].name;

// Share links carry signs only: /share/leo/taurus/gemini, /share/leo-or-virgo/taurus/unknown.
// Each segment is a sign slug, two adjacent signs joined by "-or-", or "unknown" for rising.
// Anything else is a 404, so no free text, and no birth detail, can ride in the URL.

export const UNKNOWN_RISING = 'unknown';

export const segmentFor = (reading: SignReading): string =>
  reading.candidates ? `${reading.candidates[0]}-or-${reading.candidates[1]}` : reading.sign;

export const sharePath = (chart: FreeChart): string =>
  `/share/${segmentFor(chart.sun)}/${segmentFor(chart.moon)}/${
    chart.rising ? segmentFor(chart.rising) : UNKNOWN_RISING
  }`;

export const parseSegment = (segment: string): SignReading | null => {
  if (isSign(segment)) return { sign: segment };
  const pair = /^([a-z]+)-or-([a-z]+)$/.exec(segment);
  if (!pair || !isSign(pair[1]) || !isSign(pair[2]) || nextSign(pair[1]) !== pair[2]) return null;
  return { sign: pair[1], candidates: [pair[1], pair[2]] };
};

/** Null for anything that is not a well-formed share path. */
export const parseShare = (sun: string, moon: string, rising: string): FreeChart | null => {
  const sunReading = parseSegment(sun);
  const moonReading = parseSegment(moon);
  if (!sunReading || !moonReading) return null;
  if (rising === UNKNOWN_RISING) {
    return { timeKnown: false, sun: sunReading, moon: moonReading, rising: null };
  }
  const risingReading = parseSegment(rising);
  // A known time settles every sign, so a rising sign never comes with a pair.
  if (!risingReading || risingReading.candidates || sunReading.candidates || moonReading.candidates) {
    return null;
  }
  return { timeKnown: true, sun: sunReading, moon: moonReading, rising: risingReading };
};
