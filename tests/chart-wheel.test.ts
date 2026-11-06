import { describe, expect, it } from 'vitest';
import { MIN_GAP, WHEEL_BODIES, insideSign, norm, screenAngle, spread, wheelLayout } from '@/lib/chart-wheel';
import { BODY_IDS } from '@/lib/keys';

const gapBetween = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe('chart wheel geometry (3g)', () => {
  it('puts Rising at nine o\'clock, or 0 Aries without a time', () => {
    expect(screenAngle(123, 123)).toBe(180);
    expect(screenAngle(0, null)).toBe(180);
    // The signs run counterclockwise: 90 degrees of longitude later is 90 degrees further round.
    expect(screenAngle(90, null)).toBe(270);
  });

  it('draws every body but Rising, which is the horizon', () => {
    expect([...WHEEL_BODIES].sort()).toEqual(BODY_IDS.filter((b) => b !== 'rising').sort());
  });

  it('spreads a cluster so no two glyphs overlap, keeping their order', () => {
    const angles = [100, 101, 102, 103, 250];
    const out = spread(angles);
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) expect(gapBetween(out[i], out[j])).toBeGreaterThanOrEqual(MIN_GAP - 1e-9);
    expect(out[0]).toBeLessThan(out[1]);
    expect(out[2]).toBeLessThan(out[3]);
    // The cluster fans out round its middle, and the lone body stays put.
    expect((out[0] + out[3]) / 2).toBeCloseTo(101.5, 6);
    expect(out[4]).toBe(250);
  });

  it('spreads a cluster that straddles the seam at 0', () => {
    const out = spread([358, 359, 1, 2]);
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) expect(gapBetween(out[i], out[j])).toBeGreaterThanOrEqual(MIN_GAP - 1e-9);
  });

  it('keeps a picked sign: a midday position in the other sign moves just inside the picked one', () => {
    // Taurus is 30 to 60. A position at 29 (late Aries) with Taurus picked moves to its start.
    expect(insideSign(29, 'taurus')).toBeCloseTo(30.5, 6);
    expect(insideSign(61, 'taurus')).toBeCloseTo(59.5, 6);
    expect(insideSign(45, 'taurus')).toBe(45);
    expect(norm(insideSign(359.5, 'aries'))).toBeCloseTo(0.5, 6);
  });

  it('lays out twelve houses only with a birth time', () => {
    const bodies = [{ body: 'sun' as const, longitude: 10, sign: 'aries' as const, house: 1 as const }];
    expect(wheelLayout({ bodies, ascendant: null, midheaven: null, cusps: null }).cusps).toEqual([]);
    const cusps = Array.from({ length: 12 }, (_, i) => norm(5 + i * 30));
    const layout = wheelLayout({ bodies, ascendant: 5, midheaven: 275, cusps });
    expect(layout.cusps).toHaveLength(12);
    expect(layout.cusps[0].angle).toBe(180);
    expect(layout.signs).toHaveLength(12);
  });
});

describe('chart wheel words and tap panel (3t)', () => {
  it('writes degrees within the sign, and nothing when unknown', async () => {
    const { degreeText } = await import('@/lib/chart-wheel');
    expect(degreeText({ degree: 12, minute: 5 })).toBe('12°05′');
    expect(degreeText({ degree: 0, minute: 0 })).toBe('0°00′');
    expect(degreeText({ degree: null, minute: null })).toBeNull();
    expect(degreeText({})).toBeNull();
  });

  it('marks planets retrograde, never the nodes', async () => {
    const { showsRetrograde } = await import('@/lib/chart-wheel');
    expect(showsRetrograde({ body: 'mercury', retrograde: true })).toBe(true);
    expect(showsRetrograde({ body: 'mercury', retrograde: false })).toBe(false);
    expect(showsRetrograde({ body: 'northNode', retrograde: true })).toBe(false);
    expect(showsRetrograde({ body: 'southNode', retrograde: true })).toBe(false);
  });

  it("gives the panel Dawa's lines and the planet page, only where they exist", async () => {
    const { wheelDetails } = await import('@/lib/wheel-details');
    const details = wheelDetails({
      bodies: [
        { body: 'jupiter', longitude: 5, sign: 'aries', house: 9 },
        { body: 'chiron', longitude: 40, sign: 'taurus', house: 2 },
      ],
      ascendant: 0,
      midheaven: 270,
      cusps: null,
    });
    expect(details.jupiter?.href).toBe('/keys/jupiter');
    expect(details.jupiter?.signLine).toMatch(/Jupiter in Aries/);
    // Since Nov 6 Chiron has lines too (drafted for Dawa), and a one-line key takes the start of the
    // paragraph drafted after it.
    expect(details.chiron?.href).toBe('/keys/chiron');
    expect(details.chiron?.signLine).toMatch(/Chiron in Taurus/);
    expect(details.jupiter?.signLine).toMatch(/enthusiasm and courage\. Jupiter here grows by doing\./);
  });
});

describe('chart wheel house degrees and inner ring (3z)', () => {
  it('names where each house begins, by sign, degree and minute', async () => {
    const { cuspPlace } = await import('@/lib/chart-wheel');
    expect(cuspPlace(132.0833)).toEqual({ sign: 'leo', degree: 12, minute: 4 });
    expect(cuspPlace(0)).toEqual({ sign: 'aries', degree: 0, minute: 0 });
    expect(cuspPlace(359.99)).toEqual({ sign: 'pisces', degree: 29, minute: 59 });
    expect(cuspPlace(-30)).toEqual({ sign: 'pisces', degree: 0, minute: 0 });
    const { chartWheelCopy } = await import('@/content/chart-wheel');
    expect(chartWheelCopy.cuspAt('12°05′', 'Leo')).toBe('Begins at 12°05′ Leo');
    expect(chartWheelCopy.houseTitle('IV', 'Roots')).toBe('House IV, Roots');
  });

  it('keeps each cusp longitude, for the hover and tap', () => {
    const cusps = Array.from({ length: 12 }, (_, i) => norm(5 + i * 30));
    const layout = wheelLayout({ bodies: [], ascendant: 5, midheaven: 275, cusps });
    expect(layout.cusps.map((c) => c.longitude)).toEqual(cusps);
  });

  it('spreads the nodes on their own ring, never pushing a planet aside', async () => {
    const { ON_INNER_RING } = await import('@/lib/chart-wheel');
    expect([...ON_INNER_RING].sort()).toEqual(['northNode', 'southNode']);
    const bodies = [
      { body: 'sun' as const, longitude: 100, sign: 'cancer' as const, house: null },
      { body: 'northNode' as const, longitude: 101, sign: 'cancer' as const, house: null },
      { body: 'moon' as const, longitude: 200, sign: 'libra' as const, house: null },
      { body: 'southNode' as const, longitude: 281, sign: 'capricorn' as const, house: null },
    ];
    const placed = wheelLayout({ bodies, ascendant: null, midheaven: null, cusps: null }).bodies;
    // Alone on its ring, each keeps its true angle, though the Sun and the North Node are a degree apart.
    for (const b of placed) expect(b.placed).toBeCloseTo(b.angle, 9);
  });
});
