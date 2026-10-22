// Export my data (2b, invariant 7). Checks the session itself (invariant 5), then
// reads the member's profile and birth details as the member, under RLS, and their placements with
// degrees through the secret key, for the verified member id only (M53). Never cached, never logged.
import { NextResponse, type NextRequest } from 'next/server';
import { PLACEMENT_EXPORT_COLUMNS, buildExport } from '@/lib/account-export';
import { takeRateLimit } from '@/lib/rate-limit';
import { adminClient } from '@/lib/supabase/admin';
import { supabaseConfigured } from '@/lib/supabase/env';
import { requestClient } from '@/lib/supabase/server';

const refuse = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  if (!supabaseConfigured()) return refuse(503, 'unavailable');
  if (!takeRateLimit('account', request.headers).ok) return refuse(429, 'too_many');

  try {
    const supabase = requestClient(request);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return refuse(401, 'signed_out');

    const [profile, birth, placements] = await Promise.all([
      supabase.from('profiles').select('display_name, visibility, created_at').eq('id', user.id).maybeSingle(),
      supabase
        .from('birth_data')
        .select('birth_date, birth_time, time_known, place_label, latitude, longitude, timezone')
        .eq('user_id', user.id)
        .maybeSingle(),
      adminClient().from('placements').select(PLACEMENT_EXPORT_COLUMNS).eq('user_id', user.id),
    ]);
    if (profile.error || birth.error || placements.error) return refuse(500, 'export_failed');

    const body = buildExport({
      account: {
        email: user.email ?? null,
        createdAt: user.created_at,
        providers: (user.identities ?? []).map((identity) => identity.provider),
      },
      profile: profile.data,
      birthData: birth.data,
      placements: placements.data ?? [],
    });
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="astrotribes-export.json"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return refuse(500, 'export_failed');
  }
}
