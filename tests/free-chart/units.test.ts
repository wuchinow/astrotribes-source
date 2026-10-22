import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseChartRequest } from '@/lib/chart-request';
import { parseShare, sharePath, signText } from '@/lib/free-chart';
import { cleanPlaceText, searchPlaces, toPlaceResults } from '@/lib/geoapify';
import { RATE_LIMITS, clientKey, resetRateLimits, takeRateLimit } from '@/lib/rate-limit';

describe('parseChartRequest', () => {
  const good = { date: '2000-01-01', time: '12:30', lat: 10.5, lon: -20.25 };
  const parse = (body: unknown) => parseChartRequest(typeof body === 'string' ? body : JSON.stringify(body));

  it('takes date, time or null, latitude, and longitude', () => {
    expect(parse(good)).toEqual({ ok: true, value: good });
    expect(parse({ ...good, time: null })).toEqual({ ok: true, value: { ...good, time: null } });
  });

  it('refuses anything else, with a code only', () => {
    expect(parse('{not json')).toEqual({ ok: false, code: 'invalid_body' });
    expect(parse([])).toEqual({ ok: false, code: 'invalid_body' });
    expect(parse({ ...good, place: 'Ulm' })).toEqual({ ok: false, code: 'invalid_body' });
    expect(parse({ date: good.date, lat: 1, lon: 1 })).toEqual({ ok: false, code: 'invalid_body' });
    expect(parse({ ...good, date: '1/1/2000' })).toEqual({ ok: false, code: 'invalid_date' });
    expect(parse({ ...good, time: '7pm' })).toEqual({ ok: false, code: 'invalid_time' });
    expect(parse({ ...good, lat: 91 })).toEqual({ ok: false, code: 'invalid_place' });
    expect(parse({ ...good, lon: '10' })).toEqual({ ok: false, code: 'invalid_place' });
    expect(parse('x'.repeat(600))).toEqual({ ok: false, code: 'invalid_body' });
  });
});

describe('share paths', () => {
  it('round-trips a known-time chart', () => {
    const chart = { timeKnown: true, sun: { sign: 'leo' }, moon: { sign: 'taurus' }, rising: { sign: 'gemini' } } as const;
    expect(sharePath(chart)).toBe('/share/leo/taurus/gemini');
    expect(parseShare('leo', 'taurus', 'gemini')).toEqual(chart);
  });

  it('round-trips an unknown-time chart with two candidate signs', () => {
    const chart = {
      timeKnown: false,
      sun: { sign: 'leo', candidates: ['leo', 'virgo'] },
      moon: { sign: 'pisces', candidates: ['pisces', 'aries'] },
      rising: null,
    } as const;
    expect(sharePath(chart)).toBe('/share/leo-or-virgo/pisces-or-aries/unknown');
    expect(parseShare('leo-or-virgo', 'pisces-or-aries', 'unknown')).toEqual(chart);
    expect(signText(chart.sun)).toBe('Leo or Virgo');
  });

  it('is a 404 for anything else', () => {
    const bad = [
      ['leo', 'taurus', ''],
      ['leo', 'taurus', 'Gemini'],
      ['leo', 'taurus', 'gemini-or-cancer'],
      ['leo-or-libra', 'taurus', 'unknown'],
      ['virgo-or-leo', 'taurus', 'unknown'],
      ['leo-or-virgo', 'taurus', 'gemini'],
      ['1911-11-11', 'taurus', 'gemini'],
      ['leo', 'unknown', 'gemini'],
      ['ophiuchus', 'taurus', 'gemini'],
    ];
    for (const [a, b, c] of bad) expect(parseShare(a, b, c), `${a}/${b}/${c}`).toBeNull();
  });
});

describe('rate limits', () => {
  beforeEach(resetRateLimits);
  const from = (ip: string) => new Headers({ 'x-real-ip': ip });

  it('sets the starting limits', () => {
    expect(RATE_LIMITS).toEqual({
      passcode: { limit: 5, windowMs: 900_000 },
      chart: { limit: 10, windowMs: 60_000 },
      place: { limit: 60, windowMs: 60_000 },
    });
  });

  it('counts per IP in a sliding window', () => {
    const t = 1_000_000;
    for (let i = 0; i < 10; i++) expect(takeRateLimit('chart', from('203.0.113.1'), t + i).ok).toBe(true);
    const blocked = takeRateLimit('chart', from('203.0.113.1'), t + 10);
    expect(blocked).toEqual({ ok: false, retryAfter: 60 });
    expect(takeRateLimit('chart', from('203.0.113.2'), t + 10).ok).toBe(true);
    expect(takeRateLimit('place', from('203.0.113.1'), t + 10).ok).toBe(true);
    expect(takeRateLimit('chart', from('203.0.113.1'), t + 60_001).ok).toBe(true);
  });

  it('keys on a salted hash, never the IP', () => {
    const key = clientKey(from('203.0.113.1'));
    expect(key).not.toContain('203');
    expect(key).toHaveLength(22);
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' }))).toBe(key);
  });
});

describe('Geoapify', () => {
  beforeEach(() => vi.stubEnv('GEOAPIFY_API_KEY', 'test-key'));
  afterEach(() => vi.unstubAllEnvs());

  it('cleans the typed text', () => {
    expect(cleanPlaceText('  Ulm \n ')).toBe('Ulm');
    expect(cleanPlaceText('Ul')).toBeNull();
    expect(cleanPlaceText('x'.repeat(101))).toBeNull();
    expect(cleanPlaceText(42)).toBeNull();
  });

  it('asks for cities only, 5 results, in English, with no IP bias, never cached', async () => {
    const fetchMock = vi.fn(async () => Response.json({ results: [] }));
    await searchPlaces('Ulm', fetchMock as unknown as typeof fetch);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const params = new URL(url).searchParams;
    expect(new URL(url).origin + new URL(url).pathname).toBe('https://api.geoapify.com/v1/geocode/autocomplete');
    expect(Object.fromEntries(params)).toEqual({
      text: 'Ulm',
      type: 'city',
      limit: '5',
      lang: 'en',
      format: 'json',
      apiKey: 'test-key',
    });
    expect(init.cache).toBe('no-store');
  });

  it('keeps only a label and coordinates, rounded', () => {
    const results = toPlaceResults({
      results: [
        { formatted: 'Ulm, Germany', lat: 48.398123456, lon: 9.991234, timezone: { name: 'Europe/Berlin' }, place_id: 'x' },
        { formatted: 'Ulm, Germany', lat: 1, lon: 1 },
        { formatted: 'No coordinates' },
      ],
    });
    expect(results).toEqual([{ label: 'Ulm, Germany', lat: 48.3981, lon: 9.9912 }]);
  });

  it('answers in codes: not configured, refused, down, timed out', async () => {
    vi.stubEnv('GEOAPIFY_API_KEY', '');
    expect(await searchPlaces('Ulm', vi.fn() as unknown as typeof fetch)).toEqual({ ok: false, code: 'not_configured' });
    vi.stubEnv('GEOAPIFY_API_KEY', 'test-key');
    const status = (code: number) => vi.fn(async () => new Response('', { status: code })) as unknown as typeof fetch;
    expect(await searchPlaces('Ulm', status(401))).toEqual({ ok: false, code: 'upstream_refused' });
    expect(await searchPlaces('Ulm', status(403))).toEqual({ ok: false, code: 'upstream_refused' });
    expect(await searchPlaces('Ulm', status(500))).toEqual({ ok: false, code: 'upstream_error' });
    const timeout = vi.fn(async () => {
      throw new DOMException('The operation timed out.', 'TimeoutError');
    }) as unknown as typeof fetch;
    expect(await searchPlaces('Ulm', timeout)).toEqual({ ok: false, code: 'timeout' });
  });
});
