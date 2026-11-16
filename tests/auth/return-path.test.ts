import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as callbackGET } from '@/app/auth/callback/route';
import { afterSignIn, RETURN_COOKIE, safeReturnTo, signInFor } from '@/lib/return-path';

// Sign-in comes back to the page it started from (5k). The path is the open-redirect risk, so every
// odd shape is refused here, and the callback reads it only from its own cookie.
describe('safeReturnTo', () => {
  it('keeps our own paths', () => {
    for (const path of ['/members/council', '/members/tribe/aries', '/tribes/scorpio', '/members/family/uranus/aquarius', '/your-chart', '/account']) {
      expect(safeReturnTo(path)).toBe(path);
    }
    expect(safeReturnTo('/members/council/')).toBe('/members/council');
    expect(safeReturnTo('/members/3f1c9a1e-0000-4000-8000-000000000000')).toBe('/members/3f1c9a1e-0000-4000-8000-000000000000');
  });

  it('refuses anything that could leave the site, or carry more than a path', () => {
    for (const value of [
      '//evil.example',
      '/\\evil.example',
      '\\\\evil.example',
      'https://evil.example',
      'evil.example',
      '/%2F%2Fevil.example',
      '/members/../../evil',
      '/members/./council',
      '/members//council',
      '/members/council?x=1',
      '/members/council#top',
      '/members/council\n',
      ' /members/council',
      '/members/council%0d%0a',
      'javascript:alert(1)',
      '',
      `/${'a'.repeat(250)}`,
      null,
      undefined,
      42,
      ['/members/council'],
    ]) {
      expect(safeReturnTo(value), String(value)).toBeNull();
    }
  });

  it('refuses sign-in’s own pages, the welcome steps, and the home page, so nothing loops', () => {
    for (const path of ['/', '/sign-in', '/auth/callback', '/auth/sign-out', '/api/account/export', '/chart', '/welcome']) {
      expect(safeReturnTo(path), path).toBeNull();
    }
  });

  it('builds the sign-in and welcome addresses', () => {
    expect(signInFor('/members/council')).toBe('/sign-in?next=%2Fmembers%2Fcouncil');
    expect(signInFor('//evil.example')).toBe('/sign-in');
    expect(afterSignIn('/members/council')).toBe('/welcome?next=%2Fmembers%2Fcouncil');
    expect(afterSignIn(null)).toBe('/welcome');
  });
});

describe('the Google callback and the return cookie', () => {
  const BASE = 'https://astrotribes.test';
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  });
  afterEach(() => vi.unstubAllEnvs());

  const withCookie = (value: string) =>
    new NextRequest(`${BASE}/auth/callback`, { headers: { cookie: `${RETURN_COOKIE}=${encodeURIComponent(value)}` } });

  it('keeps the page on a retry, and removes the cookie', async () => {
    const response = await callbackGET(withCookie('/members/council'));
    expect(response.headers.get('location')).toBe(`${BASE}/sign-in?error=google&next=%2Fmembers%2Fcouncil`);
    expect(response.headers.get('set-cookie')).toMatch(new RegExp(`${RETURN_COOKIE}=;.*Path=/auth`, 'i'));
  });

  it('drops a cookie that is not one of our paths', async () => {
    const response = await callbackGET(withCookie('//evil.example'));
    expect(response.headers.get('location')).toBe(`${BASE}/sign-in?error=google`);
  });
});

describe('where each sign-in starts (source checks)', () => {
  const read = (path: string) => readFileSync(path, 'utf8');

  it('the Tribe page’s Join the conversation goes straight to Google for a visitor and back to the Council', () => {
    const page = read('app/(public)/tribes/[sign]/page.tsx');
    expect(page).toMatch(/<form action=\{startGoogleSignIn\} className="guest-only[^"]*">\s*<input type="hidden" name="next" value="\/members\/council" \/>/);
    expect(page).toMatch(/<div className="member-only[^"]*">\s*<Button href="\/members\/council"/);
  });

  it('the header’s Sign in carries the page it was pressed on', () => {
    expect(read('components/HeaderAccount.tsx')).toMatch(/<input type="hidden" name="next" value=\{pathname\} \/>/);
  });

  it('no member page sends a visitor to a bare sign-in', () => {
    for (const path of [
      'app/(public)/account/page.tsx',
      'app/(public)/account/delete/page.tsx',
      'app/(public)/members/page.tsx',
      'app/(public)/members/[id]/page.tsx',
      'app/(public)/members/council/page.tsx',
      'app/(public)/members/messages/page.tsx',
      'app/(public)/members/messages/[id]/page.tsx',
      'app/(public)/your-chart/page.tsx',
      'components/MatesPage.tsx',
    ]) {
      const source = read(path);
      expect(source, path).not.toMatch(/redirect\('\/sign-in'\)/);
      expect(source, path).toMatch(/redirect\(signInFor\(/);
    }
  });
});
