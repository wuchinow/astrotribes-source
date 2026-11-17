// The Moon's phase at birth (5h, Dawa's Nov 15 note 9: "the moon's phase from their birthchart ... with a
// brief explanation (using Dane Rudhyar's explanations of the lunation cycles)"). Pure: it takes the
// member's own Sun and Moon longitudes, which only the server holds (lib/your-wheel.ts), and returns
// a phase id; no degree leaves the server and nothing is stored, logged, or sent.
//
// Rudhyar's eight phases start at the New Moon and run 45 degrees each, counted from the moment the
// Moon passes the Sun: New 0 to 45, Crescent 45 to 90, First Quarter 90 to 135, Gibbous 135 to 180,
// Full 180 to 225, Disseminating 225 to 270, Last Quarter 270 to 315, Balsamic 315 to 360. That differs
// from Today's sky (lib/engine/zodiac.ts), whose eight bands sit centered on each quarter, as a
// calendar's phases do. The words for each phase are ours (content/birth-moon.ts): his book is under
// copyright.

export const BIRTH_PHASES = [
  'new',
  'crescent',
  'firstQuarter',
  'gibbous',
  'full',
  'disseminating',
  'lastQuarter',
  'balsamic',
] as const;
export type BirthPhase = (typeof BIRTH_PHASES)[number];

const norm360 = (degrees: number) => ((degrees % 360) + 360) % 360;

/** The phase for the Moon's distance ahead of the Sun along the zodiac, in degrees. */
export const phaseAt = (elongation: number): BirthPhase => BIRTH_PHASES[Math.floor(norm360(elongation) / 45) % 8];

/**
 * How far the Moon can gain on the Sun in half a day: the Moon moves up to about 15.4 degrees a day and
 * the Sun about 1, so 7.3 degrees covers any birth from midnight to midnight.
 */
export const HALF_DAY_GAIN = 7.3;

export interface BirthMoon {
  phase: BirthPhase;
  /** With no birth time, the other phase the Moon may have been in that day, when the day crossed a line. */
  or: BirthPhase | null;
}

/**
 * The phase from the Sun's and Moon's longitudes. With a birth time it is exact. Without one the
 * engine places the Moon at midday, so the phase at either end of the day is checked too, and where
 * the two differ both are named.
 */
export function birthMoon(sun: number, moon: number, timeKnown: boolean): BirthMoon {
  const elongation = norm360(moon - sun);
  const phase = phaseAt(elongation);
  if (timeKnown) return { phase, or: null };
  const before = phaseAt(elongation - HALF_DAY_GAIN);
  const after = phaseAt(elongation + HALF_DAY_GAIN);
  const or = before !== phase ? before : after !== phase ? after : null;
  return { phase, or };
}

/** The lit share of the disc, 0 to 1, for drawing it. */
export const litShare = (elongation: number) => (1 - Math.cos((norm360(elongation) * Math.PI) / 180)) / 2;

/**
 * Where to draw each phase's disc: its familiar shape (a dark New Moon, a half-lit quarter, a round
 * Full Moon), so neighbors look different. The drawing shows the phase, never the member's own degree.
 */
const LOOK: Record<BirthPhase, number> = {
  new: 0,
  crescent: 55,
  firstQuarter: 90,
  gibbous: 130,
  full: 180,
  disseminating: 230,
  lastQuarter: 270,
  balsamic: 305,
};
export const phaseLook = (phase: BirthPhase) => LOOK[phase];
