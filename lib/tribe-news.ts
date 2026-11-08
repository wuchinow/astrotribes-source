// The News Flash on each Tribe page (4f, Dawa's Nov 6 "Tribe page content": a monthly blog of what's
// significant for each Tribe, and a ruling planet tracker). Until he writes his, it is filled from
// Today's sky (lib/today-sky.ts), so it never goes stale and needs no writing: where the Tribe's
// ruling planet is, who is visiting the sign, and what changes there this week. Nothing about a
// visitor: the same for everyone, rebuilt hourly with the page.
import "server-only";
import type { SignId } from "@/lib/keys";
import {
  todaySky,
  type Change,
  type Lunation,
  type SkyBody,
  type SkyBodyId,
  type TodaySky,
} from "@/lib/today-sky";

/** Each Tribe's ruling planet, the modern one where there are two (content/tribes.ts says both). */
export const RULER: Record<SignId, SkyBodyId> = {
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "pluto",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "uranus",
  pisces: "neptune",
};

export interface TribeNews {
  /** ISO UTC instant the news was built for. */
  at: string;
  ruler: { body: SkyBodyId; sign: SignId; retrograde: boolean };
  /** The Sun, Moon, and planets in the sign now, in that order. */
  visiting: SkyBodyId[];
  /** Sign changes into or out of the sign, and stations in it, in the next seven days. */
  changes: Change[];
  /** The Moon's next day in the sign, 'YYYY-MM-DD' UTC, within ten days, when it is not there now. */
  moonVisit: string | null;
  /** A full or new Moon in the sign before the next of each. */
  lunations: Lunation[];
}

export function tribeNewsFrom(sky: TodaySky, sign: SignId): TribeNews {
  const bodies = Object.fromEntries([
    ["sun", sky.sun],
    ["moon", sky.moon],
    ...sky.planets.map(({ id, body }) => [id, body] as const),
  ]) as Record<SkyBodyId, SkyBody>;
  const order: SkyBodyId[] = ["sun", "moon", ...sky.planets.map((p) => p.id)];
  const ruler = RULER[sign];
  return {
    at: sky.at,
    ruler: {
      body: ruler,
      sign: bodies[ruler].sign,
      retrograde: bodies[ruler].retrograde,
    },
    visiting: order.filter((id) => bodies[id].sign === sign),
    changes: sky.changes.filter((c) =>
      c.kind === "ingress" ? c.to === sign || c.from === sign : c.sign === sign,
    ),
    moonVisit:
      sky.moon.sign === sign
        ? null
        : (sky.moonDays.find((d) => d.date > sky.date && d.sign === sign)
            ?.date ?? null),
    lunations: sky.lunations.filter((l) => l.sign === sign),
  };
}

export const tribeNews = (sign: SignId, now?: Date): TribeNews =>
  tribeNewsFrom(todaySky(now), sign);
