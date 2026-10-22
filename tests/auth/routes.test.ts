import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as callbackGET } from '@/app/auth/callback/route';
import { POST as signOutPOST } from '@/app/auth/sign-out/route';
import { GET as exportGET } from '@/app/api/account/export/route';
import { resetRateLimits } from '@/lib/rate-limit';

// Every member route checks for itself (invariant 5): no session, no data. Open to anyone since
// Oct 22, so no passcode. Synthetic values only; nothing here reaches the live project (a .test host).
const BASE = 'https://astrotribes.test';
const req = (path: string, { method = 'GET' } = {}) => new NextRequest(`${BASE}${path}`, { method });

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.test');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  resetRateLimits();
});
afterEach(() => vi.unstubAllEnvs());

describe('export my data', () => {
  it('refuses without a session', async () => {
    const response = await exportGET(req('/api/account/export'));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'signed_out' });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});

describe('the Google callback', () => {
  it('sends a missing code back to sign-in, never to the account page', async () => {
    const response = await callbackGET(req('/auth/callback'));
    expect(response.headers.get('location')).toBe(`${BASE}/sign-in?error=google`);
  });
});

describe('sign out', () => {
  it('is a POST that lands on the home page and clears the session cookies', async () => {
    const request = new NextRequest(`${BASE}/auth/sign-out`, {
      method: 'POST',
      headers: { cookie: 'sb-example-auth-token=synthetic' },
    });
    const response = await signOutPOST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${BASE}/`);
    expect(response.headers.get('set-cookie')).toMatch(/sb-example-auth-token=;/);
  });
});
