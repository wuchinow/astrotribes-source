// JSON responses for the free chart's routes: never cached, anywhere.
export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export const tooMany = (retryAfter: number) =>
  json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });
