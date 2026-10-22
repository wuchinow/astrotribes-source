import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as previewGET, POST as previewPOST } from '@/app/api/preview/route';
import {
  GATED_PREFIXES,
  MEMBER_PREFIXES,
  PREVIEW_COOKIE,
  PREVIEW_MAX_AGE,
  isGatedPath,
  passcodeMatches,
  previewToken,
  safeReturnPath,
} from '@/lib/preview';
import { resetRateLimits } from '@/lib/rate-limit';
import { config, proxy } from '@/proxy';

// Synthetic passcode, for tests only.
const PASS = 'test passcode, not the real one';
const BASE = 'https://astrotribes.test';

const req = (path: string, init: { cookie?: string; method?: string; body?: BodyInit; headers?: Record<string, string> } = {}) =>
  new NextRequest(`${BASE}${path}`, {
    method: init.method ?? 'GET',
    body: init.body,
    headers: {
      ...(init.cookie ? { cookie: `${PREVIEW_COOKIE}=${init.cookie}` } : {}),
      ...init.headers,
    },
  });

const passcodeForm = (passcode: string, next = '/sky') => {
  const form = new URLSearchParams({ passcode, next });
  return {
    method: 'POST',
    body: form.toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  };
};

beforeEach(() => {
  vi.stubEnv('PREVIEW_PASSCODE', PASS);
  resetRateLimits();
});
afterEach(() => vi.unstubAllEnvs());

describe('the proxy matcher', () => {
  it('lists exactly the gated and member prefixes', () => {
    expect(config.matcher).toEqual([...GATED_PREFIXES, ...MEMBER_PREFIXES].map((p) => `${p}/:path*`));
  });

  it('gates only /sky: the free chart and sign-in are open (Oct 22)', () => {
    const open = ['/', '/oracle', '/privacy', '/tribes/leo', '/share/leo/taurus/gemini', '/preview', '/api/preview',
      '/chart', '/api/chart', '/api/place', '/sign-in', '/auth/callback', '/account', '/api/account/export', '/welcome', '/your-chart'];
    for (const path of open) expect(isGatedPath(path), path).toBe(false);
    for (const path of ['/sky', '/sky/anything']) expect(isGatedPath(path), path).toBe(true);
  });
});

describe('the proxy', () => {
  it('sends /sky without the cookie to /preview', async () => {
    const response = await proxy(req('/sky'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(`${BASE}/preview?next=%2Fsky`);
  });

  it('lets the right cookie through, uncached', async () => {
    const response = await proxy(req('/sky', { cookie: previewToken(PASS) }));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('refuses a wrong cookie, and a cookie from an old passcode', async () => {
    expect((await proxy(req('/sky', { cookie: 'nonsense' }))).status).toBe(307);
    const old = previewToken('the old passcode');
    expect((await proxy(req('/sky', { cookie: old }))).status).toBe(307);
    vi.stubEnv('PREVIEW_PASSCODE', 'a new passcode');
    expect((await proxy(req('/sky', { cookie: previewToken(PASS) }))).status).toBe(307);
  });

  it('lets the member paths through without a passcode, uncached', async () => {
    for (const path of ['/sign-in', '/auth/callback?code=x', '/account', '/api/account/export', '/welcome', '/your-chart']) {
      const response = await proxy(req(path));
      expect(response.headers.get('x-middleware-next'), path).toBe('1');
      expect(response.headers.get('cache-control'), path).toBe('private, no-store');
    }
  });

  it('stays closed when PREVIEW_PASSCODE is unset or blank', async () => {
    for (const value of [undefined, '', '   ']) {
      vi.stubEnv('PREVIEW_PASSCODE', value as string);
      expect((await proxy(req('/sky', { cookie: previewToken(value ?? '') }))).status).toBe(307);
      expect(passcodeMatches(value ?? '')).toBe(false);
    }
  });
});

describe('/api/preview', () => {
  it('sets an httpOnly, Secure, SameSite=Lax cookie for 30 days on the right passcode', async () => {
    const response = await previewPOST(req('/api/preview', passcodeForm(PASS, '/sky')));
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${BASE}/sky`);
    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toContain(`${PREVIEW_COOKIE}=${previewToken(PASS)}`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=lax/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toContain(`Max-Age=${PREVIEW_MAX_AGE}`);
    // The cookie is an HMAC, never the passcode.
    expect(cookie).not.toContain(encodeURIComponent(PASS));
  });

  it('sends a wrong passcode back with an error and no cookie', async () => {
    const response = await previewPOST(req('/api/preview', passcodeForm('wrong')));
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${BASE}/preview?next=%2Fsky&error=wrong`);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('opens nothing when PREVIEW_PASSCODE is unset', async () => {
    vi.stubEnv('PREVIEW_PASSCODE', '');
    const response = await previewPOST(req('/api/preview', passcodeForm('')));
    expect(response.headers.get('location')).toContain('error=closed');
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('only ever returns to a gated page: no open redirect', async () => {
    for (const next of ['https://evil.example', '//evil.example', '/\\evil.example', '/sky?x=1', 'javascript:alert(1)', '/oracle']) {
      expect(safeReturnPath(next), next).toBe('/sky');
      const response = await previewPOST(req('/api/preview', passcodeForm(PASS, next)));
      expect(response.headers.get('location'), next).toBe(`${BASE}/sky`);
      resetRateLimits();
    }
  });

  it('allows 5 tries per 15 minutes, then a 429 with a plain message', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await previewPOST(req('/api/preview', passcodeForm('wrong')))).status).toBe(303);
    }
    const blocked = await previewPOST(req('/api/preview', passcodeForm(PASS)));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBeTruthy();
    expect(blocked.headers.get('set-cookie')).toBeNull();
    expect(await blocked.text()).toMatch(/^Too many tries/);
  });
});

describe('GET /api/preview: may this visitor see Tune (1f)', () => {
  it('says yes only with a valid at-preview cookie, never cached, and sets nothing', async () => {
    const yes = previewGET(req('/api/preview', { cookie: previewToken(PASS) }));
    expect(await yes.json()).toEqual({ tune: true });
    expect(yes.headers.get('cache-control')).toBe('private, no-store');
    expect(yes.headers.get('set-cookie')).toBeNull();

    for (const cookie of [undefined, 'forged', previewToken('another passcode')]) {
      const no = previewGET(req('/api/preview', { cookie }));
      expect(await no.json(), String(cookie)).toEqual({ tune: false });
      expect(no.headers.get('cache-control')).toBe('private, no-store');
      expect(no.headers.get('set-cookie')).toBeNull();
    }
  });

  it('says no when PREVIEW_PASSCODE is unset, whatever the cookie', async () => {
    const token = previewToken(PASS);
    vi.stubEnv('PREVIEW_PASSCODE', '');
    expect(await previewGET(req('/api/preview', { cookie: token })).json()).toEqual({ tune: false });
  });
});
