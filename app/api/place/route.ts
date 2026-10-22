// Birthplace autocomplete for the /chart form, behind the passcode. The browser posts the typed
// text (never in our URL); the server asks Geoapify and answers {results: [{label, lat, lon}]}.
// Nothing is kept or logged; errors are codes.
import type { NextRequest } from 'next/server';
import { cleanPlaceText, searchPlaces, type PlaceError } from '@/lib/geoapify';
import { json, tooMany } from '@/lib/json';
import { hasPreviewAccess } from '@/lib/preview';
import { takeRateLimit } from '@/lib/rate-limit';

const MAX_BODY = 512;

const STATUS: Record<PlaceError, number> = {
  invalid_text: 400,
  not_configured: 503,
  upstream_refused: 502,
  upstream_error: 502,
  timeout: 504,
};

export async function POST(request: NextRequest) {
  try {
    if (!hasPreviewAccess(request.cookies)) return json({ error: 'preview_required' }, 401);

    const limit = takeRateLimit('place', request.headers);
    if (!limit.ok) return tooMany(limit.retryAfter);

    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) {
      return json({ error: 'invalid_text' }, 413);
    }
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ error: 'invalid_text' }, 413);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'invalid_text' }, 400);
    }
    const text = cleanPlaceText((body as { text?: unknown } | null)?.text);
    if (text === null) return json({ error: 'invalid_text' }, 400);

    const outcome = await searchPlaces(text);
    if (!outcome.ok) return json({ error: outcome.code }, STATUS[outcome.code]);
    return json({ results: outcome.results });
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
