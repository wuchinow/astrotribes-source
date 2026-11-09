// Clanmates and Vibemates (4l, Nov 8; Dawa's 2025 Clan docs): from the members a member may already
// see (lib/members.ts, decided by private.can_view_member alone), the ones with the Moon or the rising
// sign in one sign, with those who also share the viewer's Tribe, Vibe or Clan, or Hearth set apart.
// Generational families (4r, Dawa's punch list: "click-through to all members in each family regardless
// of Tribe"): the same, for Uranus, Neptune, or Pluto in one sign, with the viewer's Tribe set apart.
// Pure: no database, so it is tested on its own. It never widens who is visible, only narrows.
import type { HouseNumber, SignId } from './keys';
import type { PlacementRow } from './shared-keys';

/** The fewest people a group total is shown for, so a small group can't single anyone out (plan, Nov 8). */
export const MIN_TOTAL = 5;

export type MatesBody = 'moon' | 'rising' | FamilyBody;

/** The generational planets, whose sign makes a family. */
export const FAMILY_BODIES = ['uranus', 'neptune', 'pluto'] as const;
export type FamilyBody = (typeof FAMILY_BODIES)[number];
export const isFamilyBody = (value: string): value is FamilyBody => (FAMILY_BODIES as readonly string[]).includes(value);

interface WithPlacements {
  placements: readonly PlacementRow[];
}

const signOf = (rows: readonly PlacementRow[], body: PlacementRow['body']): SignId | null =>
  rows.find((row) => row.body === body)?.sign ?? null;
const houseOf = (rows: readonly PlacementRow[], body: PlacementRow['body']): HouseNumber | null =>
  rows.find((row) => row.body === body)?.house ?? null;

export interface MatesGroup<T> {
  /** Which of the viewer's own placements the group shares. */
  kind: 'tribe' | 'vibe' | 'clan' | 'hearth';
  /** The viewer's own sign (or house, for the Hearth). */
  value: SignId | HouseNumber;
  members: T[];
}

export interface Mates<T> {
  /** Everyone visible with the placement in the sign, in the order given. */
  all: T[];
  /** The groups set apart, each only when the viewer has that placement themselves and someone shares it. */
  groups: MatesGroup<T>[];
  /** How many in the sign, the viewer included when they belong; null under MIN_TOTAL. */
  total: number | null;
}

export function mates<T extends WithPlacements>(members: readonly T[], mine: readonly PlacementRow[], body: MatesBody, sign: SignId): Mates<T> {
  const all = members.filter((m) => signOf(m.placements, body) === sign);
  const groups: MatesGroup<T>[] = [];
  const add = (kind: MatesGroup<T>['kind'], value: SignId | HouseNumber | null, test: (m: T) => boolean) => {
    if (value === null) return;
    const list = all.filter(test);
    if (list.length > 0) groups.push({ kind, value, members: list });
  };
  const mySun = signOf(mine, 'sun');
  add('tribe', mySun, (m) => signOf(m.placements, 'sun') === mySun);
  if (body === 'moon') {
    const myRising = signOf(mine, 'rising');
    add('vibe', myRising, (m) => signOf(m.placements, 'rising') === myRising);
    // The Hearth is the Moon's house: shared only when both have a birth time.
    const myHearth = houseOf(mine, 'moon');
    add('hearth', myHearth, (m) => houseOf(m.placements, 'moon') === myHearth);
  } else if (body === 'rising') {
    const myMoon = signOf(mine, 'moon');
    add('clan', myMoon, (m) => signOf(m.placements, 'moon') === myMoon);
  }
  const count = all.length + (signOf(mine, body) === sign ? 1 : 0);
  return { all, groups, total: count >= MIN_TOTAL ? count : null };
}
