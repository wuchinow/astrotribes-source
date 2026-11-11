// A Tribe's members on its Tribe page (5b, David, Nov 11: "i should see dawa in aries, right?"): the
// shape the members route sends and the page's island reads. Signs, houses, and names only, the same
// as a member card on the members list: never a degree, never birth data.
import type { HouseNumber, KeyId, SignId } from './keys';

/** How many members the Tribe page shows before its link to the full list (/members/tribe/[sign]). */
export const TRIBE_PAGE_HANDFUL = 6;

export interface TribeMemberCard {
  id: string;
  name: string;
  isDemo: boolean;
  sun: SignId;
  /** The first shared personal Keys (topShared), by id. */
  top: { keyId: KeyId; value: SignId | HouseNumber }[];
  personalCount: number;
  points: number;
  hello?: { href?: string; text: string; label?: string };
}

export type TribeMembersResult =
  | { state: 'ok'; count: number; members: TribeMemberCard[] }
  | { state: 'no_chart' }
  | { state: 'failed' };
