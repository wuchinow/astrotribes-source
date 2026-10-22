// Vercel Web Analytics (1i): the page address is trimmed before any event leaves the browser.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scrubEvent } from '@/lib/analytics';

const view = (url: string) => scrubEvent({ type: 'pageview', url });

describe('beforeSend', () => {
  it('collapses /share/<sun>/<moon>/<rising> to /share, so no signs leave the site', () => {
    expect(view('https://astrotribes.vercel.app/share/leo/taurus/gemini')?.url).toBe('https://astrotribes.vercel.app/share');
    expect(view('https://astrotribes.vercel.app/share/leo/taurus/gemini/opengraph-image')?.url).toBe('https://astrotribes.vercel.app/share');
    expect(view('https://astrotribes.vercel.app/share?x=1')?.url).toBe('https://astrotribes.vercel.app/share');
  });

  it('drops the query string (and the fragment) from every address', () => {
    expect(view('https://astrotribes.vercel.app/preview?next=/chart')?.url).toBe('https://astrotribes.vercel.app/preview');
    expect(view('https://astrotribes.vercel.app/chart?date=1990-01-01&lat=1#x')?.url).toBe('https://astrotribes.vercel.app/chart');
  });

  it('sends nothing for any /api path', () => {
    expect(view('https://astrotribes.vercel.app/api/chart')).toBeNull();
    expect(view('https://astrotribes.vercel.app/api/place?text=x')).toBeNull();
    expect(view('https://astrotribes.vercel.app/api')).toBeNull();
    expect(scrubEvent({ type: 'event', url: 'https://astrotribes.vercel.app/api/preview' })).toBeNull();
  });

  it('passes other paths unchanged', () => {
    for (const p of ['/', '/oracle', '/oracle/consult', '/chart', '/sky', '/tribes/leo', '/privacy', '/apiary', '/shared']) {
      expect(view(`https://astrotribes.vercel.app${p}`)).toEqual({ type: 'pageview', url: `https://astrotribes.vercel.app${p}` });
    }
  });

  it('drops an address it cannot read', () => {
    expect(view('not a url')).toBeNull();
  });
});

describe('where birth details travel', () => {
  const read = (file: string) => readFileSync(path.join(process.cwd(), file), 'utf8');

  it('the free chart and the place search post their bodies, never a query string', () => {
    for (const [file, route] of [['components/FreeChart.tsx', '/api/chart'], ['components/PlaceCombobox.tsx', '/api/place']]) {
      const source = read(file);
      expect(source).toMatch(new RegExp(`fetch\\('${route.replace('/', '\\/')}', \\{\\s*method: 'POST'`));
      expect(source).not.toMatch(/URLSearchParams|searchParams|\?date=|\?text=/);
    }
  });

  it('the analytics component is in the root layout, with the scrubber', () => {
    expect(read('app/layout.tsx')).toMatch(/<SiteAnalytics \/>/);
    expect(read('components/SiteAnalytics.tsx')).toMatch(/beforeSend=\{scrubEvent\}/);
  });
});
