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

const fail = (code: Extract<BirthFormState, { status: 'error' }>['code']): BirthFormState => ({ status: 'error', code });

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
    return fail('failed');
  }

  // A day the Sun or the Moon changed sign, with no time: nothing is saved until the member picks.
  const choices = choicesNeeded(chart, birth.picks);
  if (Object.keys(choices).length > 0) return { status: 'choose', choices };

  // First the member's own row, which 0002 lets change once an hour: the gate on everything after.
  const { error: birthError } = await supabase.from('birth_data').upsert(
    {
      user_id: userId,
      birth_date: birth.date,
      birth_time: birth.time,
      time_known: birth.time !== null,
      place_label: birth.label,
      latitude: birth.lat,
      longitude: birth.lon,
      timezone: birthZone(birth.lat, birth.lon),
    },
    { onConflict: 'user_id' },
  );
  if (birthError) return fail(birthError.message === 'birth_data_too_soon' ? 'too_soon' : 'failed');

  // Then the placements, for the verified id. One upsert replaces every row the chart has; without
  // a time there is no rising row, so an old one goes.
  const admin = adminClient();
  const { error: rowsError } = await admin
    .from('placements')
    .upsert(placementRows(chart, birth.picks, userId), { onConflict: 'user_id,body' });
  if (rowsError) return fail('failed');
  if (!chart.placements.rising) {
    const { error } = await admin.from('placements').delete().eq('user_id', userId).eq('body', 'rising');
    if (error) return fail('failed');
  }

  redirect('/your-chart?saved=1');
}
