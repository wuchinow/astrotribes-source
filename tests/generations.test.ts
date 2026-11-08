import { describe, expect, it } from "vitest";
import { skyNow } from "@/lib/engine";
import { familyOf, GENERATIONAL } from "@/lib/generations";

// Dawa's own examples in "Planetary Families" (Oct 23). His years are rounded; ours run from the
// planet's first entry into the sign to its last exit, so they agree within a year.
const DAWA = [
  {
    date: "1997-08-07",
    families: {
      uranus: ["aquarius", 1996, 2003],
      neptune: ["capricorn", 1984, 1998],
      pluto: ["sagittarius", 1995, 2008],
    },
  },
  {
    date: "1955-02-19",
    families: {
      uranus: ["cancer", 1949, 1956],
      neptune: ["libra", 1943, 1956],
      pluto: ["leo", 1939, 1957],
    },
  },
  {
    date: "2004-12-28",
    families: {
      uranus: ["pisces", 2003, 2011],
      neptune: ["aquarius", 1998, 2012],
      pluto: ["sagittarius", 1995, 2008],
    },
  },
] as const;

describe("generational families", () => {
  it.each(DAWA)("match Dawa’s example born $date", ({ date, families }) => {
    const sky = skyNow(new Date(`${date}T12:00:00Z`));
    for (const planet of GENERATIONAL) {
      const [sign, from, to] = families[planet];
      expect(sky.bodies[planet].sign, planet).toBe(sign);
      const family = familyOf(planet, sign, date);
      expect(family, planet).not.toBeNull();
      expect(
        Math.abs(family!.from - from),
        `${planet} from`,
      ).toBeLessThanOrEqual(2);
      expect(Math.abs(family!.to - to), `${planet} to`).toBeLessThanOrEqual(1);
    }
  });

  it("agree with the engine on the planet’s sign across the windows", () => {
    for (let year = 1900; year <= 2040; year += 7) {
      const date = `${year}-06-15`;
      const sky = skyNow(new Date(`${date}T12:00:00Z`));
      for (const planet of GENERATIONAL) {
        const family = familyOf(planet, sky.bodies[planet].sign, date);
        expect(family, `${planet} ${date}`).not.toBeNull();
        expect(family!.from).toBeLessThanOrEqual(year);
        expect(family!.to).toBeGreaterThanOrEqual(year);
      }
    }
  });

  it("has nothing for a sign the planet was not in that year", () => {
    expect(familyOf("pluto", "aries", "1990-01-01")).toBeNull();
  });
});
