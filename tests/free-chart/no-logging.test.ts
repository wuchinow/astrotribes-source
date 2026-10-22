import { NextRequest } from 'next/server';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as chartPOST } from '@/app/api/chart/route';
import { POST as placePOST } from '@/app/api/place/route';
import { POST as previewPOST } from '@/app/api/preview/route';
import { PREVIEW_COOKIE, previewToken } from '@/lib/preview';
import { resetRateLimits } from '@/lib/rate-limit';

// Invariant 9, by experiment: synthetic canary birth details go through every path of the free
// chart's routes, success and failure, and none of them may appear in anything written to the
// console, stdout, or stderr, or in a response beyond the signs. The same canaries are searched
// for in the preview deployment's runtime logs (docs/ASSESSMENT.md, 1b).

const CANARY = {
  date: '1911-11-11',
  time: '11:11',
  lat: 11.1111,
  lon: -11.1111,
  place: 'Qzxv canary',
  passcode: 'canary passcode Qzxv',
};
const NEEDLES = [CANARY.date, CANARY.time, '11.1111', 'Qzxv', '1711-11-11', '1911-02-30'];

const PASS = 'test passcode, not the real one';
const BASE = 'https://astrotribes.test';

const captured: string[] = [];
const capture = (...args: unknown[]) => {
  captured.push(args.map((a) => (a instanceof Error ? `${a.message}\n${a.stack}` : String(a))).join(' '));
};

beforeAll(() => {
  for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace'] as const) {
    vi.spyOn(console, method).mockImplementation(capture);
  }
  for (const stream of [process.stdout, process.stderr]) {
    const write = stream.write.bind(stream);
    vi.spyOn(stream, 'write').mockImplementation(((chunk: unknown, ...rest: unknown[]) => {
      capture(chunk);
      return (write as (...a: unknown[]) => boolean)(chunk, ...rest);
    }) as typeof stream.write);
  }
});
afterAll(() => vi.restoreAllMocks());

beforeEach(() => {
  vi.stubEnv('PREVIEW_PASSCODE', PASS);
  vi.stubEnv('GEOAPIFY_API_KEY', 'test-key');
  resetRateLimits();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const post = (path: string, body: string, cookie = true) =>
  new NextRequest(`${BASE}${path}`, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      'x-real-ip': '198.51.100.7',
      ...(cookie ? { cookie: `${PREVIEW_COOKIE}=${previewToken(PASS)}` } : {}),
    },
  });

const birth = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ date: CANARY.date, time: CANARY.time, lat: CANARY.lat, lon: CANARY.lon, ...over });

/** The response as text, headers included, for the needle search. */
const dump = async (response: Response) =>
  `${response.status} ${[...response.headers].map(([k, v]) => `${k}: ${v}`).join('\n')}\n${await response.text()}`;

const seen: string[] = [];
const run = async (response: Promise<Response>) => {
  const text = await dump(await response);
  seen.push(text);
  return text;
};

const expectNoCanary = (label: string, text: string) => {
  for (const needle of NEEDLES) expect(text.includes(needle), `${label}: ${needle}`).toBe(false);
};

describe('/api/chart never logs or echoes birth details', () => {
  it('on success, known time and unknown time', async () => {
    const known = await run(chartPOST(post('/api/chart', birth())));
    expect(known).toMatch(/^200 /);
    expect(known).toMatch(/"sun":\{"sign":"[a-z]+"/);
    expectNoCanary('known', known);
    const unknown = await run(chartPOST(post('/api/chart', birth({ time: null }))));
    expect(unknown).toMatch(/"rising":null/);
    expectNoCanary('unknown', unknown);
  });

  it('on every failure', async () => {
    const cases = [
      post('/api/chart', `{"date":"${CANARY.date}","time":"${CANARY.time}",broken`),
      post('/api/chart', birth({ place: CANARY.place })),
      post('/api/chart', birth({ date: '1711-11-11' })),
      post('/api/chart', birth({ date: '1911-02-30' })),
      post('/api/chart', birth({ time: `${CANARY.time}pm` })),
      post('/api/chart', birth({ lat: 111.1111 })),
      post('/api/chart', birth(), false),
    ];
    for (const request of cases) expectNoCanary('failure', await run(chartPOST(request)));
  });

  it('when rate-limited', async () => {
    for (let i = 0; i < 10; i++) await chartPOST(post('/api/chart', birth()));
    const limited = await run(chartPOST(post('/api/chart', birth())));
    expect(limited).toMatch(/^429 /);
    expectNoCanary('limited', limited);
  });

  it('when the engine throws something unexpected', async () => {
    vi.resetModules();
    vi.doMock('@/lib/engine', async (original) => ({
      ...(await original<typeof import('@/lib/engine')>()),
      computeChart: () => {
        throw new Error(`boom ${CANARY.date} ${CANARY.lat}`);
      },
    }));
    const { POST } = await import('@/app/api/chart/route');
    const text = await run(POST(post('/api/chart', birth())));
    expect(text).toMatch(/^500 /);
    expectNoCanary('throw', text);
    vi.doUnmock('@/lib/engine');
    vi.resetModules();
  });
});

describe('/api/place never logs or echoes the typed place', () => {
  const placeBody = JSON.stringify({ text: CANARY.place });

  it('on success, with only a label and coordinates back', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ results: [{ formatted: 'Somewhere, Nowhere', lat: 1.5, lon: 2.5, timezone: {} }] }),
      ),
    );
    const text = await run(placePOST(post('/api/place', placeBody)));
    expect(text).toMatch(/^200 /);
    expect(text).toContain('{"results":[{"label":"Somewhere, Nowhere","lat":1.5,"lon":2.5}]}');
    expectNoCanary('place ok', text);
  });

  it('on every failure, including an error that carries the upstream URL', async () => {
    const failures: (() => Promise<Response>)[] = [
      async () => new Response('', { status: 500 }),
      async () => new Response('', { status: 401 }),
      async () => {
        throw new TypeError(`fetch failed: https://api.geoapify.com/v1/geocode/autocomplete?text=${CANARY.place}`);
      },
      async () => {
        throw new DOMException('The operation timed out.', 'TimeoutError');
      },
    ];
    for (const failure of failures) {
      vi.stubGlobal('fetch', vi.fn(failure));
      const text = await run(placePOST(post('/api/place', placeBody)));
      expect(text).toMatch(/^50[234] /);
      expectNoCanary('place failure', text);
    }
    vi.stubEnv('GEOAPIFY_API_KEY', '');
    expectNoCanary('not configured', await run(placePOST(post('/api/place', placeBody))));
    expectNoCanary('bad json', await run(placePOST(post('/api/place', `{"text":"${CANARY.place}",`))));
    expectNoCanary('no cookie', await run(placePOST(post('/api/place', placeBody, false))));
  });
});

describe('/api/preview never logs the passcode', () => {
  it('on a wrong attempt', async () => {
    const request = new NextRequest(`${BASE}/api/preview`, {
      method: 'POST',
      body: new URLSearchParams({ passcode: CANARY.passcode, next: '/chart' }).toString(),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    const text = await run(previewPOST(request));
    expect(text).not.toContain('Qzxv');
  });
});

describe('the console, stdout, and stderr', () => {
  it('carried none of the canaries through any of the paths above', () => {
    expect(seen.length).toBeGreaterThan(15);
    expectNoCanary('captured output', captured.join('\n'));
  });
});
