// The generational families (4g, Dawa's "Planetary Families", Oct 23): everyone born while Uranus,
// Neptune, or Pluto was in the same sign as yours is in that planet's family. The windows come from
// scripts/generations.mjs (the Swiss Ephemeris, 1850 to 2050, first entry to last exit), so no
// engine runs here and nothing about anyone is stored: the member's own birth date picks the window.
import type { SignId } from "@/lib/keys";
import windows from "./generations.json";

export const GENERATIONAL = ["uranus", "neptune", "pluto"] as const;
export type GenerationalPlanet = (typeof GENERATIONAL)[number];

export interface Family {
  planet: GenerationalPlanet;
  sign: SignId;
  /** The years the planet's pass through the sign began and ended. */
  from: number;
  to: number;
}

const WINDOWS = windows as Record<
  GenerationalPlanet,
  { sign: SignId; from: string; to: string }[]
>;

/** The family a birth date ('YYYY-MM-DD') and a planet's sign belong to, or null outside 1850 to 2050. */
export function familyOf(
  planet: GenerationalPlanet,
  sign: SignId,
  birthDate: string,
): Family | null {
  const found = WINDOWS[planet].find(
    (w) => w.sign === sign && w.from <= birthDate && birthDate <= w.to,
  );
  return found
    ? {
        planet,
        sign,
        from: Number(found.from.slice(0, 4)),
        to: Number(found.to.slice(0, 4)),
      }
    : null;
}
