// Vercel Web Analytics (1i): what a page-view event may carry. The script sends the page address
// (its only URL), a route template such as /share/[sun]/[moon]/[rising], and the referrer only when
// it is another site's. Before anything leaves, this trims the address: no query string or
// fragment, /share/<sun>/<moon>/<rising> collapsed to /share so no signs leave the site, and
// nothing at all for an /api path. Birth details never reach an address in the first place: the
// free chart and the place search post their bodies (CLAUDE.md, invariant 9).

export interface AnalyticsEvent {
  type: string;
  url: string;
}

export function scrubEvent<T extends AnalyticsEvent>(event: T): T | null {
  let url: URL;
  try {
    url = new URL(event.url);
  } catch {
    return null;
  }
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return null;
  url.search = '';
  url.hash = '';
  if (url.pathname === '/share' || url.pathname.startsWith('/share/')) url.pathname = '/share';
  return { ...event, url: url.toString() };
}
