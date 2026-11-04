// The admin members page (0003): the shape of what private.admin_members() returns, read
// defensively, and the pure helpers the page and its list use. No birth detail is ever in it:
// the function returns only whether birth details were saved (invariant 2).

export interface AdminStats {
  total: number;
  totalWeekAgo: number;
  joinedWeek: number;
  joinedWeekBefore: number;
  finished: number;
  finishedWeekAgo: number;
}

export interface AdminMember {
  id: string;
  email: string | null;
  name: string | null;
  joined: string;
  lastSignIn: string | null;
  birthDetails: boolean;
  isDemo: boolean;
}

export interface AdminView {
  who: string | null;
  at: string;
}

export interface AdminData {
  stats: AdminStats;
  demo: number;
  members: AdminMember[];
  views: AdminView[];
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0);
const text = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Reads the function's JSON. Anything missing or malformed reads as empty, never as a crash. */
export function parseAdminData(raw: unknown): AdminData {
  const root = record(raw);
  const stats = record(root.stats);
  return {
    stats: {
      total: count(stats.total),
      totalWeekAgo: count(stats.total_week_ago),
      joinedWeek: count(stats.joined_week),
      joinedWeekBefore: count(stats.joined_week_before),
      finished: count(stats.finished),
      finishedWeekAgo: count(stats.finished_week_ago),
    },
    demo: count(root.demo),
    members: list(root.members).flatMap((item) => {
      const m = record(item);
      const id = text(m.id);
      const joined = text(m.joined);
      if (!id || !joined) return [];
      return [
        {
          id,
          email: text(m.email),
          name: text(m.name),
          joined,
          lastSignIn: text(m.last_sign_in),
          birthDetails: m.birth_details === true,
          isDemo: m.is_demo === true,
        },
      ];
    }),
    views: list(root.views).flatMap((item) => {
      const v = record(item);
      const at = text(v.at);
      return at ? [{ who: text(v.who), at }] : [];
    }),
  };
}

/** A whole-number percentage, or null when there is nothing to divide by. */
export const percent = (part: number, whole: number): number | null =>
  whole > 0 ? Math.round((part / whole) * 100) : null;

export type MemberSort = 'joined' | 'signedIn' | 'name';
export const MEMBER_SORTS: readonly MemberSort[] = ['joined', 'signedIn', 'name'];

const time = (iso: string | null): number => (iso ? Date.parse(iso) || 0 : 0);
const label = (m: AdminMember): string => (m.name ?? m.email ?? '').toLocaleLowerCase('en');

/**
 * The list as the admin asks for it: a search over name and email (any case, any part), then one
 * of three orders. Newest first for the dates, A to Z for names; ties keep the newest first.
 */
export function viewMembers(members: readonly AdminMember[], query: string, sort: MemberSort): AdminMember[] {
  const q = query.trim().toLocaleLowerCase('en');
  const found = q
    ? members.filter((m) => (m.name ?? '').toLocaleLowerCase('en').includes(q) || (m.email ?? '').toLocaleLowerCase('en').includes(q))
    : [...members];
  const byJoined = (a: AdminMember, b: AdminMember) => time(b.joined) - time(a.joined);
  const order: Record<MemberSort, (a: AdminMember, b: AdminMember) => number> = {
    joined: byJoined,
    signedIn: (a, b) => time(b.lastSignIn) - time(a.lastSignIn) || byJoined(a, b),
    name: (a, b) => label(a).localeCompare(label(b), 'en') || byJoined(a, b),
  };
  return found.sort(order[sort]);
}

/** Dates as the team reads them, in Eastern time, where the admin is (David, Asheville). */
export const ADMIN_TIME_ZONE = 'America/New_York';

export function formatDay(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: ADMIN_TIME_ZONE }).format(date);
}

export function formatMoment(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: ADMIN_TIME_ZONE,
  }).format(date);
}
