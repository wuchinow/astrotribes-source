import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as chartPOST } from '@/app/api/chart/route';
import { POST as placePOST } from '@/app/api/place/route';
import { GET as previewGET, POST as previewPOST } from '@/app/api/preview/route';
import {
  GATED_PREFIXES,
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

const passcodeForm = (passcode: string, next = '/chart') => {
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
  it('lists exactly the gated prefixes', () => {
    expect(config.matcher).toEqual(GATED_PREFIXES.map((p) => `${p}/:path*`));
  });

  it('leaves the public pages open', () => {
    for (const path of ['/', '/oracle', '/oracle/consult', '/privacy', '/tribes/leo', '/share/leo/taurus/gemini', '/preview', '/api/preview']) {
      expect(isGatedPath(path), path).toBe(false);
    }
    for (const path of ['/chart', '/sky', '/api/chart', '/api/place', '/chart/anything']) {
      expect(isGatedPath(path), path).toBe(true);
    }
  });
});

describe('the proxy', () => {
  it('sends a page without the cookie to /preview', () => {
    const response = proxy(req('/chart'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(`${BASE}/preview?next=%2Fchart`);
    expect(proxy(req('/sky')).headers.get('location')).toBe(`${BASE}/preview?next=%2Fsky`);
  });

  it('answers an API without the cookie with a 401', async () => {
    for (const path of ['/api/chart', '/api/place']) {
      const response = proxy(req(path, { method: 'POST' }));
      expect(response.status, path).toBe(401);
      expect(await response.json()).toEqual({ error: 'preview_required' });
    }
  });

  it('lets the right cookie through, uncached', () => {
    const response = proxy(req('/chart', { cookie: previewToken(PASS) }));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('refuses a wrong cookie, and a cookie from an old passcode', () => {
    expect(proxy(req('/chart', { cookie: 'nonsense' })).status).toBe(307);
    const old = previewToken('the old passcode');
    expect(proxy(req('/chart', { cookie: old })).status).toBe(307);
    vi.stubEnv('PREVIEW_PASSCODE', 'a new passcode');
    expect(proxy(req('/chart', { cookie: previewToken(PASS) })).status).toBe(307);
  });

  it('stays closed when PREVIEW_PASSCODE is unset or blank', () => {
    for (const value of [undefined, '', '   ']) {
      vi.stubEnv('PREVIEW_PASSCODE', value as string);
      expect(proxy(req('/chart', { cookie: previewToken(value ?? '') })).status).toBe(307);
      expect(passcodeMatches(value ?? '')).toBe(false);
    }
  });
});

describe('each gated route checks for itself (invariant 5)', () => {
  it('refuses /api/chart and /api/place without the cookie, even past the proxy', async () => {
    const body = JSON.stringify({ date: '2000-01-01', time: null, lat: 0, lon: 0 });
    const chart = await chartPOST(req('/api/chart', { method: 'POST', body }));
    expect(chart.status).toBe(401);
    const place = await placePOST(req('/api/place', { method: 'POST', body: JSON.stringify({ text: 'Somewhere' }) }));
    expect(place.status).toBe(401);
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
    expect(response.headers.get('location')).toBe(`${BASE}/preview?next=%2Fchart&error=wrong`);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('opens nothing when PREVIEW_PASSCODE is unset', async () => {
    vi.stubEnv('PREVIEW_PASSCODE', '');
    const response = await previewPOST(req('/api/preview', passcodeForm('')));
    expect(response.headers.get('location')).toContain('error=closed');
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('only ever returns to a gated page: no open redirect', async () => {
    for (const next of ['https://evil.example', '//evil.example', '/\\evil.example', '/chart?x=1', 'javascript:alert(1)', '/oracle']) {
      expect(safeReturnPath(next), next).toBe('/chart');
      const response = await previewPOST(req('/api/preview', passcodeForm(PASS, next)));
      expect(response.headers.get('location'), next).toBe(`${BASE}/chart`);
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
