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
