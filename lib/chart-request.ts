// The body /api/chart accepts: date, time or null, latitude, longitude. Nothing else, and no place
// name. Errors are codes only; nothing here echoes, logs, or keeps what it was sent.

export interface ChartRequest {
  /** 'YYYY-MM-DD' */
  date: string;
  /** 'HH:MM', or null when the time is unknown */
  time: string | null;
  lat: number;
  lon: number;
}

export type ChartRequestError = 'invalid_body' | 'invalid_date' | 'invalid_time' | 'invalid_place';

/** Bytes. A real body is under 80. */
export const MAX_CHART_BODY = 512;

const FIELDS = ['date', 'time', 'lat', 'lon'];

export const parseChartRequest = (
  raw: string,
): { ok: true; value: ChartRequest } | { ok: false; code: ChartRequestError } => {
  if (raw.length > MAX_CHART_BODY) return { ok: false, code: 'invalid_body' };
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    // V8's message quotes the input, so the error is dropped, never passed on.
    return { ok: false, code: 'invalid_body' };
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, code: 'invalid_body' };
  }
  const keys = Object.keys(body);
  if (keys.length !== FIELDS.length || !FIELDS.every((f) => keys.includes(f))) {
    return { ok: false, code: 'invalid_body' };
  }
  const { date, time, lat, lon } = body as Record<string, unknown>;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, code: 'invalid_date' };
  }
  if (time !== null && (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time))) {
    return { ok: false, code: 'invalid_time' };
  }
  const place =
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;
  if (!place) return { ok: false, code: 'invalid_place' };
  return { ok: true, value: { date, time, lat, lon } };
};
