'use server';
// Saving birth details (2c). Checks the session itself (invariant 5), runs the
// engine on the server (invariant 4), writes birth_data as the member under RLS (invariant 2: the
// secret key has no grant on it), then the placements with the secret key for the verified id only,
// never an id from the form. Nothing is logged, and every failure is a code with no value in it.
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { birthZone, computeChart, EngineError } from '@/lib/engine';
import { choicesNeeded, parseBirthForm, placementRows, type BirthFormState } from '@/lib/birth-details';
import { takeRateLimit } from '@/lib/rate-limit';
import { adminClient } from '@/lib/supabase/admin';
import { memberClient } from '@/lib/supabase/server';

const fail = (code: Extract<BirthFormState, { status: 'error' }>['code'], ref?: string): BirthFormState =>
  ref ? { status: 'error', code, ref } : { status: 'error', code };
// A failed step's reference for support: the step and the database's error code (a class like
// 42501 or 23514), never its message, which can quote the row (Nov 4: saves failing unseen).
const refOf = (step: string, error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  return `${step}${/^[A-Za-z0-9_]{1,24}$/.test(code) ? `-${code}` : ''}`;
};

export async function saveBirthDetails(_previous: BirthFormState, form: FormData): Promise<BirthFormState> {
  if (!takeRateLimit('birth', await headers()).ok) return fail('limit');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/sign-in');
  const userId = data.user.id;

  const parsed = parseBirthForm(form);
  if (!parsed.ok) return fail(parsed.code);
  const birth = parsed.value;

  let chart;
  try {
    chart = computeChart({ date: birth.date, time: birth.time, lat: birth.lat, lon: birth.lon });
  } catch (error) {
    if (error instanceof EngineError) {
      if (error.code === 'out_of_range') return fail('out_of_range');
      if (error.code === 'invalid_input') return fail('invalid_date');
    }
    return fail('failed', refOf('chart', error));
  }

  // A day the Sun or the Moon changed sign, with no time: nothing is saved until the member picks.
  const choices = choicesNeeded(chart, birth.picks);
  if (Object.keys(choices).length > 0) return { status: 'choose', choices };

  // First the member's own row, which 0002 lets change once an hour: the gate on everything after.
  // Unchanged details are not written again, so a save that stopped before the placements can be
  // finished at once instead of hitting the hour.
  const row = {
    user_id: userId,
    birth_date: birth.date,
    birth_time: birth.time,
    time_known: birth.time !== null,
    place_label: birth.label,
    latitude: birth.lat,
    longitude: birth.lon,
    timezone: birthZone(birth.lat, birth.lon),
  };
  const { data: saved } = await supabase
    .from('birth_data')
    .select('birth_date, birth_time, place_label, latitude, longitude')
    .eq('user_id', userId)
    .maybeSingle();
  const unchanged =
    saved !== null &&
    saved.birth_date === row.birth_date &&
    (saved.birth_time?.slice(0, 5) ?? null) === (row.birth_time?.slice(0, 5) ?? null) &&
    saved.place_label === row.place_label &&
    Number(saved.latitude) === row.latitude &&
    Number(saved.longitude) === row.longitude;
  const { error: birthError } = unchanged
    ? { error: null }
    : await supabase.from('birth_data').upsert(row, { onConflict: 'user_id' });
  if (birthError) return birthError.message === 'birth_data_too_soon' ? fail('too_soon') : fail('failed', refOf('birth', birthError));

  // Then the placements, for the verified id. One upsert replaces every row the chart has; without
  // a time there is no rising row, so an old one goes.
  let admin;
  try {
    admin = adminClient();
  } catch {
    return fail('failed', 'admin');
  }
  const { error: rowsError } = await admin
    .from('placements')
    .upsert(placementRows(chart, birth.picks, userId), { onConflict: 'user_id,body' });
  if (rowsError) return fail('failed', refOf('rows', rowsError));
  if (!chart.placements.rising) {
    const { error } = await admin.from('placements').delete().eq('user_id', userId).eq('body', 'rising');
    if (error) return fail('failed', refOf('rising', error));
  }

  // The welcome steps decide what is next: the name if there is none yet, otherwise the chart.
  redirect('/welcome');
}
