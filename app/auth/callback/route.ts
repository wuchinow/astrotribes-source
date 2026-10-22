// Google's return trip (2b). Supabase sends the visitor here with a one-time code; we trade it for a
// session (PKCE, with the verifier cookie set when sign-in started) and go to the welcome steps
// (2c), which ask for whatever is missing and otherwise go on to the member's chart.
// The code is never logged and never forwarded.
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/env';
import { requestClient } from '@/lib/supabase/server';

const go = (request: NextRequest, path: string) => {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code || !supabaseConfigured()) return go(request, '/sign-in?error=google');

  const response = go(request, '/welcome');
  try {
    const { error } = await requestClient(request, response).auth.exchangeCodeForSession(code);
    if (error) return go(request, '/sign-in?error=google');
  } catch {
    return go(request, '/sign-in?error=google');
  }
  return response;
}
