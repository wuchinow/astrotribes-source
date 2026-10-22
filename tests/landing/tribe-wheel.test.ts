import { describe, expect, it } from 'vitest';
import { glyphPosition } from '@/components/TribeWheel';
import { SIGN_IDS } from '@/lib/keys';

// Dawa (Oct 2): Aries at the far left, the signs going round from there. The natural wheel runs
// counterclockwise, so Cancer is at the bottom, Libra at the right, and Capricorn at the top.
describe('the hero wheel of the 12 Tribes', () => {
  const at = (sign: (typeof SIGN_IDS)[number]) => glyphPosition(SIGN_IDS.indexOf(sign));

  it('puts Aries at the far left, just below the horizon', () => {
    const [x, y] = at('aries');
    expect(Math.min(...SIGN_IDS.map((s) => at(s)[0]))).toBe(x);
    expect(y).toBeGreaterThan(0);
  });

  it('runs counterclockwise: Cancer at the bottom, Libra at the right, Capricorn at the top', () => {
    const ys = SIGN_IDS.map((s) => at(s)[1]);
    const xs = SIGN_IDS.map((s) => at(s)[0]);
    expect(Math.max(...ys)).toBeCloseTo(Math.max(at('cancer')[1], at('leo')[1]));
    expect(at('cancer')[1]).toBeGreaterThan(0);
    expect(Math.max(...xs)).toBe(at('libra')[0]);
    expect(at('capricorn')[1]).toBeLessThan(0);
    expect(at('taurus')[1]).toBeGreaterThan(at('aries')[1]);
  });
});
