// What a member may read about other members (3g), always as the member under RLS. Who appears is
// decided by the database alone (private.can_view_member, 0001): this file never filters by
// visibility itself, so a page cannot show more than the owner allowed. Named columns only: no
// degree, no minute (not granted), and never birth_data, which is the owner's alone.
import 'server-only';
import type { memberClient } from './supabase/server';
import { connectionPoints, type ConnectionPoints } from './connection-points';
import { sharedKeys, splitShared, toPlacements, type PlacementRow, type SharedKey } from './shared-keys';

type Client = Awaited<ReturnType<typeof memberClient>>;

/** The columns a member reads from placements. Kept here so tests can hold it to the grant. */
export const PLACEMENT_COLUMNS = 'user_id, body, sign, house';
/** The columns a member reads from another member's profile. */
export const PROFILE_COLUMNS = 'id, display_name, is_demo';

/** The most members the list reads at once: plenty for the team alpha and beta invitations. */
export const MEMBER_LIMIT = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isMemberId = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

export interface MemberSummary {
  id: string;
  name: string;
  isDemo: boolean;
  placements: PlacementRow[];
  shared: SharedKey[];
  /** Shared keys that are not generational. */
  personalCount: number;
  /** Connection points (3p): what the list sorts by. */
  points: ConnectionPoints;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  is_demo: boolean;
}

/** The member's own placements, signs and houses only. */
export async function ownPlacements(supabase: Client, userId: string): Promise<PlacementRow[]> {
  const { data } = await supabase.from('placements').select(PLACEMENT_COLUMNS).eq('user_id', userId);
  return toPlacements(data);
}

const summarize = (profile: ProfileRow, rows: PlacementRow[], mine: PlacementRow[]): MemberSummary => {
  const shared = sharedKeys(mine, rows);
  return {
    id: profile.id,
    name: profile.display_name ?? '',
    isDemo: profile.is_demo,
    placements: rows,
    shared,
    personalCount: splitShared(shared).personal.length,
    points: connectionPoints(mine, rows, shared),
  };
};

/**
 * Every other member the database lets this member see, with a name and a chart, sorted by connection
 * points, then by how many personal keys they share, then by name. `null` when the read itself failed.
 */
export async function visibleMembers(supabase: Client, userId: string, mine: PlacementRow[]): Promise<MemberSummary[] | null> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .neq('id', userId)
    .not('display_name', 'is', null)
    .limit(MEMBER_LIMIT);
  if (error) return null;
  const people = (profiles ?? []) as ProfileRow[];
  if (people.length === 0) return [];

  const { data: rows, error: rowsError } = await supabase
    .from('placements')
    .select(PLACEMENT_COLUMNS)
    .in(
      'user_id',
      people.map((p) => p.id),
    );
  if (rowsError) return null;
  const byMember = new Map<string, PlacementRow[]>();
  for (const row of (rows ?? []) as { user_id: string; body: unknown; sign: unknown; house: unknown }[]) {
    const list = byMember.get(row.user_id) ?? [];
    list.push(...toPlacements([row]));
    byMember.set(row.user_id, list);
  }

  return people
    .filter((p) => (byMember.get(p.id) ?? []).some((row) => row.body === 'sun'))
    .map((p) => summarize(p, byMember.get(p.id) ?? [], mine))
    .sort((a, b) => b.points.total - a.points.total || b.personalCount - a.personalCount || a.name.localeCompare(b.name));
}

/** One member, or null when they do not exist, have no chart, or have not let this member see them. */
export async function visibleMember(supabase: Client, id: string, mine: PlacementRow[]): Promise<MemberSummary | null> {
  if (!isMemberId(id)) return null;
  const { data: profile } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle();
  if (!profile || !(profile as ProfileRow).display_name) return null;
  const { data: rows } = await supabase.from('placements').select(PLACEMENT_COLUMNS).eq('user_id', id);
  const placements = toPlacements(rows);
  if (!placements.some((row) => row.body === 'sun')) return null;
  return summarize(profile as ProfileRow, placements, mine);
}
