'use server';
// Starts Google sign-in (2b). Checks the rate limit itself, then asks
// Supabase for Google's address and sends the visitor there. The PKCE verifier lands in a cookie
// for /auth/callback. Nothing is logged.
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { takeRateLimit } from '@/lib/rate-limit';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

/** This deployment's own origin, from Vercel's headers. Supabase only honours allow-listed ones. */
const origin = (h: Headers): string => {
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
};

export async function startGoogleSignIn(): Promise<void> {
  const h = await headers();
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  if (!takeRateLimit('signIn', h).ok) redirect('/sign-in?error=limit');

  const supabase = await memberClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin(h)}/auth/callback` },
  });
  if (error || !data.url) redirect('/sign-in?error=google');
  redirect(data.url);
}
