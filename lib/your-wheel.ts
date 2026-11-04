// The member's own chart wheel (3g), server only. Reads the member's birth details as the member,
// under RLS (invariant 2: the owner only), runs the engine on the server (invariant 4), and returns
// longitudes for lib/chart-wheel.ts to place. Nothing is stored, logged, or sent anywhere: the
// result is drawn into the owner's own page and discarded. On any failure the page shows no wheel.
import 'server-only';
import { computeChart } from '@/lib/engine';
import type { SupabaseClient } from '@supabase/supabase-js';
import { WHEEL_BODIES, insideSign, type WheelInput } from './chart-wheel';
import type { SignId } from './keys';

/** The signs the member saved for the Sun and Moon, which win on a day either changed sign. */
export type SavedSigns = { sun: SignId; moon: SignId | null };

export async function memberWheel(supabase: SupabaseClient, userId: string, saved: SavedSigns): Promise<WheelInput | null> {
  try {
    const { data, error } = await supabase
      .from('birth_data')
      .select('birth_date, birth_time, latitude, longitude')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const chart = computeChart({
      date: data.birth_date as string,
      time: data.birth_time ? (data.birth_time as string).slice(0, 5) : null,
      lat: Number(data.latitude),
      lon: Number(data.longitude),
    });
    const picked: Partial<Record<string, SignId>> = { sun: saved.sun, moon: saved.moon ?? undefined };
    return {
      bodies: WHEEL_BODIES.map((body) => {
        const p = chart.placements[body];
        const sign = picked[body] ?? p.sign;
        return { body, longitude: insideSign(p.longitude, sign), sign, house: p.house };
      }),
      ascendant: chart.placements.rising?.longitude ?? null,
      midheaven: chart.midheaven?.longitude ?? null,
      cusps: chart.cusps,
    };
  } catch {
    return null;
  }
}
