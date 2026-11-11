// A Tribe's members for its Tribe page (5b). The Tribe pages are static and public, so a signed-in
// member's island asks here. Checks the session itself (invariant 5) and reads as the member under
// RLS through visibleMembers, the members list's own read: who appears is decided by
// private.can_view_member alone, and lib/mates.ts only narrows that list to one Sun sign. The first
// handful only, closest connections first, the same cards the members list shows. No degrees, no birth
// data, no admin client. Never cached, never logged.
import { NextResponse, type NextRequest } from 'next/server';
import { helloLinks, myHellos } from '@/lib/council';
import { SIGN_IDS, type SignId } from '@/lib/keys';
import { mates } from '@/lib/mates';
import { ownPlacements, visibleMembers } from '@/lib/members';
import { topShared } from '@/lib/shared-keys';
import { supabaseConfigured } from '@/lib/supabase/env';
import { requestClient } from '@/lib/supabase/server';
import { TRIBE_PAGE_HANDFUL, type TribeMembersResult } from '@/lib/tribe-members';

const NO_STORE = { 'Cache-Control': 'no-store' };
const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);
const answer = (body: TribeMembersResult | { error: string }, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });

export async function GET(request: NextRequest, { params }: RouteContext<'/api/members/tribe/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) return answer({ error: 'not_found' }, 404);
  if (!supabaseConfigured()) return answer({ error: 'unavailable' }, 503);

  try {
    const supabase = requestClient(request);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return answer({ error: 'signed_out' }, 401);

    const mine = await ownPlacements(supabase, user.id);
    if (!mine.some((row) => row.body === 'sun')) return answer({ state: 'no_chart' });
    const [members, hellos] = await Promise.all([visibleMembers(supabase, user.id, mine), myHellos(supabase)]);
    if (!members) return answer({ state: 'failed' });
    const helloAction = helloLinks(hellos, user.id);
    const found = mates(members, mine, 'sun', sign);
    return answer({
      state: 'ok',
      count: found.all.length,
      members: found.all.slice(0, TRIBE_PAGE_HANDFUL).map((member) => ({
        id: member.id,
        name: member.name,
        isDemo: member.isDemo,
        sun: sign,
        top: topShared(member.shared).map(({ key, value }) => ({ keyId: key.id, value })),
        personalCount: member.personalCount,
        points: member.points.total,
        hello: helloAction(member.id, member.name),
      })),
    });
  } catch {
    return answer({ state: 'failed' });
  }
}
