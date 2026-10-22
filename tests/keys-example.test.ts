// The 28 Keys page's example chart (1m) against the engine: content/keys-example.ts types Albert
// Einstein's signs and houses so the page needs no engine at runtime, and this runs the engine on
// his birth record and checks every one of them.

import { describe, expect, it } from 'vitest';
import { EXAMPLE_CHART } from '@/content/keys-example';
import { computeChart } from '@/lib/engine';
import { BODY_IDS } from '@/lib/keys';

describe('the example chart', () => {
  const chart = computeChart(EXAMPLE_CHART.birth);

  it('has every body, and Rising alone without a house', () => {
    expect(Object.keys(EXAMPLE_CHART.placements).sort()).toEqual([...BODY_IDS].sort());
    for (const body of BODY_IDS) {
      expect(EXAMPLE_CHART.placements[body].house === null, body).toBe(body === 'rising');
    }
  });

  it("matches the engine's sign and house for every body", () => {
    for (const body of BODY_IDS) {
      const placement = chart.placements[body]!;
      const typed = EXAMPLE_CHART.placements[body];
      expect(typed.sign, body).toBe(placement.sign);
      if (typed.house !== null) expect(typed.house, body).toBe(placement.house);
    }
  });
});
