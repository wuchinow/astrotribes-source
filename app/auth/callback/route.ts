// Google's return trip (2b). Supabase sends the visitor here with a one-time code; we trade it for a
// session (PKCE, with the verifier cookie set when sign-in started) and go to the welcome steps
// (2c), which ask for whatever is missing and otherwise go on to the member's chart, or to the page
// the visitor started from (5k: the `at-return` cookie startGoogleSignIn set, checked again here and
// removed on the way out). The code is never logged and never forwarded.
import { NextResponse, type NextRequest } from 'next/server';
import { afterSignIn, RETURN_COOKIE, safeReturnTo } from '@/lib/return-path';
import { supabaseConfigured } from '@/lib/supabase/env';
import { requestClient } from '@/lib/supabase/server';

const go = (request: NextRequest, path: string) => {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set('Cache-Control', 'no-store');
  if (request.cookies.has(RETURN_COOKIE)) response.cookies.delete({ name: RETURN_COOKIE, path: '/auth' });
  return response;
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeReturnTo(request.cookies.get(RETURN_COOKIE)?.value);
  const retry = `/sign-in?error=google${next ? `&next=${encodeURIComponent(next)}` : ''}`;
  if (!code || !supabaseConfigured()) return go(request, retry);

  const response = go(request, afterSignIn(next));
  try {
    const { error } = await requestClient(request, response).auth.exchangeCodeForSession(code);
    if (error) return go(request, retry);
  } catch {
    return go(request, retry);
  }
  return response;
}
