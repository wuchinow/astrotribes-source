// The Keys two members share (3g): the same body in the same sign (a sign key) or the same house
// (a house key). Pure, with no database and no engine, so it is tested on its own.
// Only signs and houses are compared. No member reads another member's degrees (0001's column
// grant), so closeness by degree waits for step 2 on the server. The points are lib/connection-points.ts.
import {
  BODY_GROUPS,
  BODY_IDS,
  KEY_LIST,
  bodiesIn,
  SIGN_IDS,
  isGenerational,
  type BodyId,
  type HouseNumber,
  type KeyDef,
  type SignId,
} from './keys';

/** One placement as a member may read it: no degree, no minute. */
export interface PlacementRow {
  body: BodyId;
  sign: SignId;
  house: HouseNumber | null;
}

export interface SharedKey {
  key: KeyDef;
  /** The sign for a sign key, the house for a house key. */
  value: SignId | HouseNumber;
}

const isBody = (value: unknown): value is BodyId =>
  typeof value === 'string' && (BODY_IDS as readonly string[]).includes(value);
const isSign = (value: unknown): value is SignId =>
  typeof value === 'string' && (SIGN_IDS as readonly string[]).includes(value);
const isHouse = (value: unknown): value is HouseNumber =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12;

/** Rows from the Data API, checked: anything that is not a known body and sign is dropped. */
export function toPlacements(rows: readonly { body: unknown; sign: unknown; house: unknown }[] | null): PlacementRow[] {
  return (rows ?? []).flatMap((row) =>
    isBody(row.body) && isSign(row.sign) ? [{ body: row.body, sign: row.sign, house: isHouse(row.house) ? row.house : null }] : [],
  );
}

/**
 * Every Key both charts hold, in KEY_LIST order (the Core Five first). A house key counts only when
 * both members have that house, so with no birth time on either side the house keys are left out.
 * Where a member picked the Sun's or the Moon's sign on a day it changed, `sign` is the pick.
 */
export function sharedKeys(mine: readonly PlacementRow[], theirs: readonly PlacementRow[]): SharedKey[] {
  const a = new Map(mine.map((row) => [row.body, row]));
  const b = new Map(theirs.map((row) => [row.body, row]));
  return KEY_LIST.flatMap((key): SharedKey[] => {
    const x = a.get(key.body);
    const y = b.get(key.body);
    if (!x || !y) return [];
    if (key.dimension === 'sign') return x.sign === y.sign ? [{ key, value: x.sign }] : [];
    return x.house !== null && x.house === y.house ? [{ key, value: x.house }] : [];
  });
}

/** The outer planets' sign keys go apart: most people born within a few years share them. */
export function splitShared(shared: readonly SharedKey[]): { personal: SharedKey[]; generational: SharedKey[] } {
  return {
    personal: shared.filter((s) => !isGenerational(s.key)),
    generational: shared.filter((s) => isGenerational(s.key)),
  };
}

/**
 * The personal keys in the body groups a member's page lists them under (BODY_GROUPS order). Every
 * personal key lands in exactly one group, so the count and the list always agree (audit, Nov 11:
 * an outer planet's house key, such as Channel, was counted and never shown).
 */
export function groupShared(personal: readonly SharedKey[]): { group: (typeof BODY_GROUPS)[number]; list: SharedKey[] }[] {
  return BODY_GROUPS.map((group) => {
    const bodies = new Set<string>(bodiesIn(group.id));
    return { group, list: personal.filter((s) => bodies.has(s.key.body)) };
  }).filter(({ list }) => list.length > 0);
}

/** The first few personal keys for a member's card, the Core Five first. */
export function topShared(shared: readonly SharedKey[], count = 2): SharedKey[] {
  const { personal } = splitShared(shared);
  return [...personal.filter((s) => s.key.core), ...personal.filter((s) => !s.key.core)].slice(0, count);
}

/** Whether a chart has a birth time: only then does it hold a rising row and houses. */
export const hasBirthTime = (rows: readonly PlacementRow[]): boolean => rows.some((row) => row.body === 'rising');
