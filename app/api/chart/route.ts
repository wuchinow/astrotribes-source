// The free chart (invariant 9). Takes date, time or null, latitude, longitude; returns three signs.
// Nothing is stored, and nothing is logged: no console call, every error answered as a code, and
// the body read once and dropped. The only file that imports the engine (S4, and behind the
// passcode: proxy.ts, then hasPreviewAccess here, invariant 5).
import type { NextRequest } from 'next/server';
import { computeChart, EngineError, type Chart, type Placement } from '@/lib/engine';
import { MAX_CHART_BODY, parseChartRequest } from '@/lib/chart-request';
import type { FreeChart, SignReading } from '@/lib/free-chart';
import { json, tooMany } from '@/lib/json';
import { hasPreviewAccess } from '@/lib/preview';
import { takeRateLimit } from '@/lib/rate-limit';

const reading = (placement: Placement): SignReading =>
  placement.signCandidates
    ? { sign: placement.sign, candidates: placement.signCandidates }
    : { sign: placement.sign };

const toFreeChart = (chart: Chart): FreeChart => ({
  timeKnown: chart.timeKnown,
  sun: reading(chart.placements.sun),
  moon: reading(chart.placements.moon),
  rising: chart.placements.rising ? reading(chart.placements.rising) : null,
});

export async function POST(request: NextRequest) {
  try {
    if (!hasPreviewAccess(request.cookies)) return json({ error: 'preview_required' }, 401);

    const limit = takeRateLimit('chart', request.headers);
    if (!limit.ok) return tooMany(limit.retryAfter);

    if (Number(request.headers.get('content-length') ?? 0) > MAX_CHART_BODY) {
      return json({ error: 'invalid_body' }, 413);
    }
    const parsed = parseChartRequest(await request.text());
    if (!parsed.ok) return json({ error: parsed.code }, 400);

    return json(toFreeChart(computeChart(parsed.value)));
  } catch (error) {
    if (error instanceof EngineError) {
      if (error.code === 'ephemeris_unavailable') return json({ error: error.code }, 503);
      return json({ error: error.code }, 422);
    }
    return json({ error: 'server_error' }, 500);
  }
}
