// Connection points (3p): how strongly two members connect, step 1 of the plan of Nov 4
// (claude.ai/artifact/MUmfZR6CBpX2KyirUYum88; David: "build step 1"). Pure, with no database and
// no engine, and signs and houses only, the same rows lib/shared-keys.ts compares. Closeness by
// degree is step 2 and needs the server, because no member reads a degree (0001's column grant).
//
// The values follow Dawa's "AstroTribes Point System" (Drive, edited Oct 23), with the plan's calls
// where it is silent or overlaps; they are his to change (open 3), and every value is here, typed once.
// Key names are never typed here: points are keyed by placement-based key id.
import type { BodyId, Dimension, HouseNumber, KeyId, SignId } from './keys';
import { sharedKeys, type PlacementRow, type SharedKey } from './shared-keys';

/** Points for sharing a Key: the same body in the same sign, or the same house. */
export const KEY_POINTS: Readonly<Record<KeyId, number>> = {
  // The Core Five: 5 each in both of Dawa's lists.
  sunSign: 5,
  sunHouse: 5,
  moonSign: 5,
  moonHouse: 5,
  risingSign: 5,
  // The North Node: 4 each in both lists.
  northNodeSign: 4,
  northNodeHouse: 4,
  // The South Node always sits opposite the North Node, so sharing one means sharing the other.
  // Shown, never scored, so one fact is not counted twice (plan, call E).
  southNodeSign: 0,
  southNodeHouse: 0,
  // The personal planets: 3 each in the Oct 23 list (plan, call A).
  mercurySign: 3,
  mercuryHouse: 3,
  venusSign: 3,
  venusHouse: 3,
  marsSign: 3,
  marsHouse: 3,
  jupiterSign: 3,
  jupiterHouse: 3,
  saturnSign: 3,
  saturnHouse: 3,
  // The outer planets' signs are shared by whole age groups: 2, the Sep 28 list's value (call D).
  // Their houses are personal: 3.
  uranusSign: 2,
  uranusHouse: 3,
  neptuneSign: 2,
  neptuneHouse: 3,
  plutoSign: 2,
  plutoHouse: 3,
  // Chiron is in neither list: its sign lasts years, like the outer planets' (call D).
  chironSign: 2,
  chironHouse: 3,
  // The Galactic Center has a house key only: 3 in the Oct 23 list.
  galacticCenterHouse: 3,
};

/** Your Sun, Moon, or Rising in the sign (or house) of a different one of theirs (call B). */
export const CROSS_POINTS = 5;
/** Their Sun, Moon, or Rising in your North Node's sign, or their Sun or Moon in its house. */
export const NODE_CROSS_POINTS = 2;
/** Two of the same Sun, Moon, and Rising signs (Sep 28 list; call H). */
export const PAIR_BONUS = 5;
/** All three, on top of the three pair bonuses (call H). */
export const ALL_THREE_BONUS = 7;

const LIGHTS = ['sun', 'moon', 'rising'] as const satisfies readonly BodyId[];
/** Rising has no house: it is the first house's edge. */
const HOUSED_LIGHTS = ['sun', 'moon'] as const satisfies readonly BodyId[];

export interface KeyPoints {
  shared: SharedKey;
  points: number;
}

/** One of your placements in the sign or house of a different one of theirs. */
export interface CrossMatch {
  mine: BodyId;
  theirs: BodyId;
  dimension: Dimension;
  value: SignId | HouseNumber;
  points: number;
}

/** Two or three of the same Sun, Moon, and Rising signs. */
export interface Bonus {
  bodies: readonly BodyId[];
  points: number;
}

export interface ConnectionPoints {
  total: number;
  keys: KeyPoints[];
  cross: CrossMatch[];
  bonuses: Bonus[];
}

/**
 * The points two charts share. The same both ways round: each cross match is checked from both
 * sides and every pairing counts once (call C). A house rule counts only when both charts have that
 * house, so with no birth time on either side the house rules and Rising drop out, never counted as
 * misses (call F). `shared` may be passed when the caller already has it.
 */
export function connectionPoints(
  mine: readonly PlacementRow[],
  theirs: readonly PlacementRow[],
  shared: readonly SharedKey[] = sharedKeys(mine, theirs),
): ConnectionPoints {
  const a = new Map(mine.map((row) => [row.body, row]));
  const b = new Map(theirs.map((row) => [row.body, row]));

  const keys = shared.map((s) => ({ shared: s, points: KEY_POINTS[s.key.id] }));

  const cross: CrossMatch[] = [];
  const match = (
    x: BodyId,
    y: BodyId,
    dimension: Dimension,
    points: number,
  ): void => {
    const p = a.get(x);
    const q = b.get(y);
    if (!p || !q) return;
    if (dimension === 'sign') {
      if (p.sign === q.sign) cross.push({ mine: x, theirs: y, dimension, value: p.sign, points });
    } else if (p.house !== null && p.house === q.house) {
      cross.push({ mine: x, theirs: y, dimension, value: p.house, points });
    }
  };
  for (const x of LIGHTS) for (const y of LIGHTS) if (x !== y) match(x, y, 'sign', CROSS_POINTS);
  for (const x of HOUSED_LIGHTS) for (const y of HOUSED_LIGHTS) if (x !== y) match(x, y, 'house', CROSS_POINTS);
  for (const x of LIGHTS) {
    match(x, 'northNode', 'sign', NODE_CROSS_POINTS);
    match('northNode', x, 'sign', NODE_CROSS_POINTS);
  }
  for (const x of HOUSED_LIGHTS) {
    match(x, 'northNode', 'house', NODE_CROSS_POINTS);
    match('northNode', x, 'house', NODE_CROSS_POINTS);
  }

  const same = new Set(shared.filter((s) => s.key.dimension === 'sign').map((s) => s.key.body));
  const bonuses: Bonus[] = [];
  const pairs: [BodyId, BodyId][] = [
    ['sun', 'moon'],
    ['sun', 'rising'],
    ['moon', 'rising'],
  ];
  for (const pair of pairs) if (pair.every((body) => same.has(body))) bonuses.push({ bodies: pair, points: PAIR_BONUS });
  if (LIGHTS.every((body) => same.has(body))) bonuses.push({ bodies: LIGHTS, points: ALL_THREE_BONUS });

  const total =
    keys.reduce((sum, k) => sum + k.points, 0) +
    cross.reduce((sum, c) => sum + c.points, 0) +
    bonuses.reduce((sum, b) => sum + b.points, 0);
  return { total, keys, cross, bonuses };
}
