// Who can see a member's chart (2f's first piece, built with 3g). The three levels are the ones
// 0001 checks in `profiles_visibility_check` and `private.can_view_member`: private is the owner
// only, tribe is a signed-in member with the same Sun sign, everyone is any signed-in member.
// Open decision 10 (the levels themselves) is Dawa's; a change there is a migration first.

export const VISIBILITY_LEVELS = ['private', 'tribe', 'everyone'] as const;
export type Visibility = (typeof VISIBILITY_LEVELS)[number];

/**
 * Every profile starts visible to all members during the team alpha (0006; 0001 started them
 * private). Before beta a new migration sets it back to private, and this with it (U54).
 */
export const DEFAULT_VISIBILITY: Visibility = 'everyone';

export const isVisibility = (value: unknown): value is Visibility =>
  typeof value === 'string' && (VISIBILITY_LEVELS as readonly string[]).includes(value);
