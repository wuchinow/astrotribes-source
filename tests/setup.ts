// Tests run offline: Dawa's Substack feed (lib/substack.ts) is never fetched, so pages fall back to
// content/articles.ts unless a test hands them the feed itself.
import { vi } from 'vitest';

const realFetch = globalThis.fetch;
vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('https://docdawa.substack.com/')) return Promise.reject(new Error('offline in tests'));
  return realFetch(input, init);
});
