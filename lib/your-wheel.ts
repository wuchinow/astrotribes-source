// The member's own chart wheel (3g), server only. Reads the member's birth details as the member,
// under RLS (invariant 2: the owner only), runs the engine on the server (invariant 4), and returns
// longitudes for lib/chart-wheel.ts to place, with degrees for the list and the tap panel (3t, David,
// Nov 4). Nothing is stored, logged, or sent anywhere: the result is drawn into the owner's own page
// and discarded, and no other member's page ever shows a degree. On any failure the page shows no wheel.
import 'server-only';
import { computeChart, type Chart } from '@/lib/engine';
import type { SupabaseClient } from '@supabase/supabase-js';
import { WHEEL_BODIES, insideSign, type WheelInput } from './chart-wheel';
import type { SignId } from './keys';

/** The signs the member saved for the Sun and Moon, which win on a day either changed sign. */
export type SavedSigns = { sun: SignId; moon: SignId | null };

/**
 * The member's own chart from their own birth details, read as the member under RLS, or null on any
 * failure. Also used by famous charts (3r) for the member's side of a close match; the caller keeps
 * it in memory for that one page and stores, logs, and sends nothing.
 */
export async function ownBirthChart(supabase: SupabaseClient, userId: string): Promise<Chart | null> {
  try {
    const { data, error } = await supabase
      .from('birth_data')
      .select('birth_date, birth_time, latitude, longitude')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return computeChart({
      date: data.birth_date as string,
      time: data.birth_time ? (data.birth_time as string).slice(0, 5) : null,
      lat: Number(data.latitude),
      lon: Number(data.longitude),
    });
  } catch {
    return null;
  }
}

export async function memberWheel(supabase: SupabaseClient, userId: string, saved: SavedSigns): Promise<WheelInput | null> {
  try {
    const chart = await ownBirthChart(supabase, userId);
    if (!chart) return null;
    const picked: Partial<Record<string, SignId>> = { sun: saved.sun, moon: saved.moon ?? undefined };
    return {
      bodies: WHEEL_BODIES.map((body) => {
        const p = chart.placements[body];
        const sign = picked[body] ?? p.sign;
        // The degree shows only where the engine's place is close enough to stand behind (3t, David,
        // Nov 4: show degrees): not a Moon with no birth time, and not a body moved into a picked sign.
        const exact = sign === p.sign && !p.signCandidates && !(body === 'moon' && !chart.timeKnown);
        return {
          body,
          longitude: insideSign(p.longitude, sign),
          sign,
          house: p.house,
          degree: exact ? p.degree : null,
          minute: exact ? p.minute : null,
          retrograde: p.retrograde,
        };
      }),
      ascendant: chart.placements.rising?.longitude ?? null,
      midheaven: chart.midheaven?.longitude ?? null,
      cusps: chart.cusps,
    };
  } catch {
    return null;
  }
}
