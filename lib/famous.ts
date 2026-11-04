// Famous charts (3r): the charts of well-known people who have died, from public birth records
// (content/famous-charts.ts), and how a member's chart meets each one. Server only. The famous
// charts are worked out by the engine once and kept in memory. The member's own side comes two ways:
// signs and houses from their placements as they may read them (the same rows the members pages
// use), and their degrees from the chart wheel's ownBirthChart, which runs the engine on their own
// birth details, read as the member under RLS (invariant 2: the owner only). Those degrees are used for the
// close matches and dropped: nothing is stored, logged, or sent, and no degree reaches the page.
import 'server-only';
import { FAMOUS_CHARTS, type FamousChart } from '@/content/famous-charts';
import { computeChart } from '@/lib/engine';
import type { Chart } from '@/lib/engine';
import type { memberClient } from './supabase/server';
import { WHEEL_BODIES, type WheelInput } from './chart-wheel';
import { BODY_IDS } from './keys';
import { closeMatchesFrom, connectionPoints, type ConnectionPoints, type Longitudes } from './connection-points';
import { ownPlacements } from './members';
import { sharedKeys, splitShared, type PlacementRow, type SharedKey } from './shared-keys';
import { supabaseConfigured } from './supabase/env';
import { ownBirthChart } from './your-wheel';

type Client = Awaited<ReturnType<typeof memberClient>>;

export interface WorkedChart {
  chart: FamousChart;
  placements: PlacementRow[];
  longitudes: Longitudes;
  /** Their chart wheel (3s). A public record, so it is drawn for anyone, as Your chart draws a member's own. */
  wheel: WheelInput;
}

const rows = (chart: Chart): PlacementRow[] =>
  BODY_IDS.flatMap((body) => {
    const p = chart.placements[body];
    return p ? [{ body, sign: p.sign, house: p.house }] : [];
  });

const longitudesOf = (chart: Chart, skip: (body: string) => boolean = () => false): Longitudes => {
  const out: Longitudes = {};
  for (const body of BODY_IDS) {
    const p = chart.placements[body];
    if (p && !skip(body)) out[body] = p.longitude;
  }
  return out;
};

const wheelOf = (chart: Chart): WheelInput => ({
  bodies: WHEEL_BODIES.map((body) => {
    const p = chart.placements[body];
    return { body, longitude: p.longitude, sign: p.sign, house: p.house };
  }),
  ascendant: chart.placements.rising?.longitude ?? null,
  midheaven: chart.midheaven?.longitude ?? null,
  cusps: chart.cusps,
});

let worked: WorkedChart[] | null = null;

/** Every famous chart, worked out once. Each has a birth time, so each has a Rising and houses. */
export function famousCharts(): WorkedChart[] {
  worked ??= FAMOUS_CHARTS.map((chart) => {
    const result = computeChart(chart.birth);
    return { chart, placements: rows(result), longitudes: longitudesOf(result), wheel: wheelOf(result) };
  });
  return worked;
}

export const famousChart = (slug: string): WorkedChart | undefined => famousCharts().find((w) => w.chart.slug === slug);

/** Who is looking: a visitor, a member with no chart yet, or a member with one. */
export type Viewer =
  | { kind: 'visitor' }
  | { kind: 'noChart' }
  | { kind: 'member'; placements: PlacementRow[]; longitudes: Longitudes };

/**
 * The member's own degrees, for close matches only. Read as the member (RLS: the owner only). A
 * Moon with no birth time could sit anywhere in a 13 degree day, and a body whose sign changed on
 * the birth day holds a guess, so both are left out, as 0005 leaves them out. Empty on any failure,
 * so the points fall back to signs and houses.
 */
async function ownLongitudes(supabase: Client, userId: string): Promise<Longitudes> {
  const chart = await ownBirthChart(supabase, userId);
  if (!chart) return {};
  return longitudesOf(
    chart,
    (body) => (body === 'moon' && !chart.timeKnown) || Boolean(chart.placements[body as keyof Chart['placements']]?.signCandidates),
  );
}

/** The viewer, checking the session itself (invariant 5). */
export async function famousViewer(supabase: Client | null): Promise<Viewer> {
  if (!supabase || !supabaseConfigured()) return { kind: 'visitor' };
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { kind: 'visitor' };
  const placements = await ownPlacements(supabase, user.id);
  if (!placements.some((row) => row.body === 'sun')) return { kind: 'noChart' };
  return { kind: 'member', placements, longitudes: await ownLongitudes(supabase, user.id) };
}

export interface FamousMatch {
  worked: WorkedChart;
  shared: SharedKey[];
  personalCount: number;
  points: ConnectionPoints;
}

/** How the member's chart meets one famous chart: shared Keys and connection points, steps 1 and 2. */
export function famousMatch(viewer: Extract<Viewer, { kind: 'member' }>, worked: WorkedChart): FamousMatch {
  const shared = sharedKeys(viewer.placements, worked.placements);
  const close = closeMatchesFrom(viewer.longitudes, worked.longitudes);
  return {
    worked,
    shared,
    personalCount: splitShared(shared).personal.length,
    points: connectionPoints(viewer.placements, worked.placements, shared, close),
  };
}

/** Every famous chart against the member's, most connection points first. */
export function famousMatches(viewer: Extract<Viewer, { kind: 'member' }>): FamousMatch[] {
  return famousCharts()
    .map((worked) => famousMatch(viewer, worked))
    .sort(
      (a, b) =>
        b.points.total - a.points.total || b.personalCount - a.personalCount || a.worked.chart.name.localeCompare(b.worked.chart.name),
    );
}
