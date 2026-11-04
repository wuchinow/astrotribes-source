// Connection points (3p): how strongly two members connect, from the plan of Nov 4
// (claude.ai/artifact/MUmfZR6CBpX2KyirUYum88; David: "build step 1", then "build step two"). Pure,
// with no database and no engine. Step 1 scores signs and houses, the same rows lib/shared-keys.ts
// compares. Step 2 (3q) adds closeness by degree: no member reads a degree (0001's column grant),
// so the database works those out (0005, close_matches) and hands back only which placements sit
// close and how; the points for them are here, with the rest.
//
// The values follow Dawa's "AstroTribes Point System" (Drive, edited Oct 23), with the plan's calls
// where it is silent or overlaps; they are his to change (open 3), and every value is here, typed once.
// Key names are never typed here: points are keyed by placement-based key id.
import { BODY_IDS, type BodyId, type Dimension, type HouseNumber, type KeyId, type SignId } from './keys';
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

/** Kinds of close match the database reports (0005). */
export const CLOSE_KINDS = ['close', 'rising', 'node', 'newMoon', 'fullMoon'] as const;
export type CloseKind = (typeof CLOSE_KINDS)[number];

/** Points for each kind (Sep 28 list; the plan's call I gives the open 3 degree rule 3). */
export const CLOSE_POINTS: Readonly<Record<CloseKind, number>> = {
  // A personal placement of yours within 3 degrees of one of theirs.
  close: 3,
  // Your Sun or Moon within 2 degrees of their Rising, or the other way.
  rising: 7,
  // Your Sun or Moon within 2 degrees of their North or South Node, or the other way.
  node: 7,
  // Both born within 4 degrees of a new moon, or both of a full moon.
  newMoon: 3,
  fullMoon: 3,
};

/** One close match as the database reports it, from the viewer's side. */
export interface CloseMatch {
  mine: BodyId;
  theirs: BodyId;
  kind: CloseKind;
}

const isBody = (value: unknown): value is BodyId =>
  typeof value === 'string' && (BODY_IDS as readonly string[]).includes(value);
const isKind = (value: unknown): value is CloseKind =>
  typeof value === 'string' && (CLOSE_KINDS as readonly string[]).includes(value);

/** Rows from close_matches, checked and grouped by member: anything unknown is dropped. */
export function toCloseMatches(
  rows: readonly { member: unknown; mine: unknown; theirs: unknown; kind: unknown }[] | null,
): Map<string, CloseMatch[]> {
  const byMember = new Map<string, CloseMatch[]>();
  for (const row of rows ?? []) {
    if (typeof row.member !== 'string' || !isBody(row.mine) || !isBody(row.theirs) || !isKind(row.kind)) continue;
    const list = byMember.get(row.member) ?? [];
    list.push({ mine: row.mine, theirs: row.theirs, kind: row.kind });
    byMember.set(row.member, list);
  }
  return byMember;
}

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

export interface ClosePoints {
  match: CloseMatch;
  points: number;
}

export interface ConnectionPoints {
  total: number;
  keys: KeyPoints[];
  cross: CrossMatch[];
  bonuses: Bonus[];
  close: ClosePoints[];
}

/**
 * The points two charts share. The same both ways round: each cross match is checked from both
 * sides and every pairing counts once (call C). A house rule counts only when both charts have that
 * house, so with no birth time on either side the house rules and Rising drop out, never counted as
 * misses (call F). `shared` may be passed when the caller already has it. `close` is what the
 * database reported for this pair (step 2); with none, the score is step 1's alone.
 */
export function connectionPoints(
  mine: readonly PlacementRow[],
  theirs: readonly PlacementRow[],
  shared: readonly SharedKey[] = sharedKeys(mine, theirs),
  closeMatches: readonly CloseMatch[] = [],
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

  const close = closeMatches.map((match) => ({ match, points: CLOSE_POINTS[match.kind] }));

  const total =
    keys.reduce((sum, k) => sum + k.points, 0) +
    cross.reduce((sum, c) => sum + c.points, 0) +
    bonuses.reduce((sum, b) => sum + b.points, 0) +
    close.reduce((sum, c) => sum + c.points, 0);
  return { total, keys, cross, bonuses, close };
}
