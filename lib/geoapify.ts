// Birthplace search through Geoapify (decisions, 13), called from /api/place only. The key stays on
// the server. Geoapify takes the typed text and the key in its URL, the one place a birthplace
// appears in a URL (CLAUDE.md): server to server, fetched with cache: 'no-store' so it never
// becomes a Data Cache key, never logged here, and an error is a code, never the URL.
import 'server-only';

export const PLACE_MIN_CHARS = 3;
export const PLACE_MAX_CHARS = 100;
export const PLACE_LIMIT = 5;
const TIMEOUT_MS = 3000;
const ENDPOINT = 'https://api.geoapify.com/v1/geocode/autocomplete';

export interface PlaceResult {
  /** "Ulm, Baden-Württemberg, Germany" */
  label: string;
  lat: number;
  lon: number;
}

export type PlaceError =
  | 'invalid_text'
  | 'not_configured'
  | 'upstream_refused'
  | 'upstream_error'
  | 'timeout';

export type PlaceOutcome = { ok: true; results: PlaceResult[] } | { ok: false; code: PlaceError };

/** Trims, folds whitespace, drops control characters; null when too short or too long. */
export const cleanPlaceText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length >= PLACE_MIN_CHARS && text.length <= PLACE_MAX_CHARS ? text : null;
};

/** About 11 m: more than a birthplace needs. */
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

interface GeoapifyResult {
  formatted?: unknown;
  lat?: unknown;
  lon?: unknown;
}

export const toPlaceResults = (payload: unknown): PlaceResult[] => {
  const results = (payload as { results?: unknown })?.results;
  if (!Array.isArray(results)) return [];
  const seen = new Set<string>();
  const places: PlaceResult[] = [];
  for (const item of results as GeoapifyResult[]) {
    const { formatted, lat, lon } = item ?? {};
    if (typeof formatted !== 'string' || typeof lat !== 'number' || typeof lon !== 'number') continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || seen.has(formatted)) continue;
    seen.add(formatted);
    places.push({ label: formatted.slice(0, 160), lat: round4(lat), lon: round4(lon) });
    if (places.length === PLACE_LIMIT) break;
  }
  return places;
};

export const searchPlaces = async (text: string, fetchImpl: typeof fetch = fetch): Promise<PlaceOutcome> => {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return { ok: false, code: 'not_configured' };

  // Cities, towns, and villages: birthplaces, never street addresses. No IP bias.
  const params = new URLSearchParams({
    text,
    type: 'city',
    limit: String(PLACE_LIMIT),
    lang: 'en',
    format: 'json',
    apiKey,
  });

  try {
    const response = await fetchImpl(`${ENDPOINT}?${params}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401 || response.status === 403) return { ok: false, code: 'upstream_refused' };
    if (!response.ok) return { ok: false, code: 'upstream_error' };
    return { ok: true, results: toPlaceResults(await response.json()) };
  } catch (error) {
    // The error may carry the URL; it goes no further than its name.
    const name = (error as { name?: unknown })?.name;
    return { ok: false, code: name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'upstream_error' };
  }
};
