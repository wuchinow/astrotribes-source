import { describe, expect, it } from 'vitest';
import { SKY_BODY_IDS, skyNow } from '@/lib/engine';

// Published events, checked against the engine.
describe('skyNow', () => {
  it('shows a new Moon at the Apr 8, 2024 eclipse (18:21 UTC)', () => {
    const sky = skyNow(new Date('2024-04-08T18:21:00Z'));
    expect(sky.moon.phase).toBe('new');
    expect(sky.moon.illumination).toBeLessThan(0.01);
    expect(sky.moon.sign).toBe('aries');
  });

  it('shows a full Moon on Apr 23, 2024 (23:49 UTC)', () => {
    const sky = skyNow(new Date('2024-04-23T23:49:00Z'));
    expect(sky.moon.phase).toBe('full');
    expect(sky.moon.illumination).toBeGreaterThan(0.99);
  });

  it('flags Mercury retrograde inside Apr 1 to 25, 2024, and direct after', () => {
    expect(skyNow(new Date('2024-04-10T12:00:00Z')).bodies.mercury.retrograde).toBe(true);
    expect(skyNow(new Date('2024-05-10T12:00:00Z')).bodies.mercury.retrograde).toBe(false);
  });

  it('finds the March 2024 equinox (Mar 20, 03:06 UTC) as the Sun entering Aries', () => {
    const sky = skyNow(new Date('2024-03-19T12:00:00Z'));
    const sun = sky.ingresses.find((i) => i.body === 'sun');
    expect(sun).toMatchObject({ from: 'pisces', to: 'aries' });
    const minutesOff = Math.abs(Date.parse(sun!.at) - Date.parse('2024-03-20T03:06:00Z')) / 60_000;
    expect(minutesOff).toBeLessThanOrEqual(2);
  });

  it('lists every planet, and ingresses in the next 24 hours in order', () => {
    const now = new Date('2026-09-24T21:00:00Z');
    const sky = skyNow(now);
    expect(Object.keys(sky.bodies).sort()).toEqual([...SKY_BODY_IDS].sort());
    const times = sky.ingresses.map((i) => Date.parse(i.at));
    expect(times).toEqual([...times].sort((a, b) => a - b));
    for (const t of times) {
      expect(t).toBeGreaterThan(now.getTime());
      expect(t).toBeLessThanOrEqual(now.getTime() + 24 * 3_600_000 + 60_000);
    }
  });

  it('times a Moon ingress to the minute', () => {
    // Over two days the Moon always changes sign at least once.
    const start = new Date('2026-09-24T21:00:00Z');
    const ingress = [skyNow(start), skyNow(new Date(start.getTime() + 24 * 3_600_000))]
      .flatMap((s) => s.ingresses)
      .find((i) => i.body === 'moon');
    expect(ingress).toBeDefined();
    const at = Date.parse(ingress!.at);
    expect(skyNow(new Date(at - 60_000)).bodies.moon.sign).toBe(ingress!.from);
    expect(skyNow(new Date(at + 60_000)).bodies.moon.sign).toBe(ingress!.to);
  });
});
