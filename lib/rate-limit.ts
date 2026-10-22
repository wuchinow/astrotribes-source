// Per-IP limits for the free chart's routes, held in this instance's memory (no database in layer 1).
// Known limit, recorded in docs/ASSESSMENT.md: each warm instance counts on its own, and a cold one
// starts empty. Enough behind the passcode; a durable limit gates the engine routes going public.
// Keys are salted hashes of the IP, never the IP, and nothing here logs.
import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

export const RATE_LIMITS = {
  passcode: { limit: 5, windowMs: 15 * 60_000 },
  chart: { limit: 10, windowMs: 60_000 },
  place: { limit: 60, windowMs: 60_000 },
} as const;
export type RateLimitName = keyof typeof RATE_LIMITS;

const MAX_KEYS = 10_000;
const salt = randomBytes(16);
const hits = new Map<string, number[]>();

/** Vercel sets x-real-ip and x-forwarded-for itself; locally both are absent and everyone shares one bucket. */
export const clientKey = (headers: Headers): string => {
  const ip =
    headers.get('x-real-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  return createHash('sha256').update(salt).update(ip).digest('base64url').slice(0, 22);
};

const sweep = (now: number) => {
  const longest = Math.max(...Object.values(RATE_LIMITS).map((r) => r.windowMs));
  for (const [key, times] of hits) {
    if (times.length === 0 || now - times[times.length - 1] > longest) hits.delete(key);
  }
  // Still full: drop the oldest keys (a Map keeps insertion order).
  for (const key of hits.keys()) {
    if (hits.size <= MAX_KEYS) break;
    hits.delete(key);
  }
};

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

/** Counts one request against a limit. A sliding window: the last `limit` requests within `windowMs`. */
export const takeRateLimit = (
  name: RateLimitName,
  headers: Headers,
  now = Date.now(),
): RateLimitResult => {
  const { limit, windowMs } = RATE_LIMITS[name];
  const key = `${name}:${clientKey(headers)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
  }
  recent.push(now);
  hits.delete(key);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) sweep(now);
  return { ok: true };
};

/** Tests only. */
export const resetRateLimits = () => hits.clear();
