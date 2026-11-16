'use server';
// Starts Google sign-in (2b). Checks the rate limit itself, then asks
// Supabase for Google's address and sends the visitor there. The PKCE verifier lands in a cookie
// for /auth/callback. A form may send `next`, the page to come back to (5k): checked by
// safeReturnTo and carried in a ten-minute cookie only /auth reads, never in Google's address, so
// Supabase's redirect allow-list is untouched. Nothing is logged.
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { takeRateLimit } from '@/lib/rate-limit';
import { RETURN_COOKIE, RETURN_MAX_AGE, safeReturnTo } from '@/lib/return-path';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

/** This deployment's own origin, from Vercel's headers. Supabase only honours allow-listed ones. */
const origin = (h: Headers): string => {
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
};

export async function startGoogleSignIn(form?: FormData): Promise<void> {
  const h = await headers();
  const next = safeReturnTo(form?.get('next'));
  const back = (error: string) => `/sign-in?error=${error}${next ? `&next=${encodeURIComponent(next)}` : ''}`;
  if (!supabaseConfigured()) redirect(back('off'));
  if (!takeRateLimit('signIn', h).ok) redirect(back('limit'));

  // Set, or cleared so an older sign-in's page never wins, before Google is asked.
  const store = await cookies();
  if (next) {
    store.set(RETURN_COOKIE, next, {
      path: '/auth',
      maxAge: RETURN_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: origin(h).startsWith('https:'),
    });
  } else {
    store.delete({ name: RETURN_COOKIE, path: '/auth' });
  }

  const supabase = await memberClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin(h)}/auth/callback` },
  });
  if (error || !data.url) redirect(back('google'));
  redirect(data.url);
}
