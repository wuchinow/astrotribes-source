import { describe, expect, it } from 'vitest';
import { computeChart, keyPlacement } from '@/lib/engine';
import { KEY_LIST, needsBirthTime } from '@/lib/keys';

// Synthetic inputs: dates and places chosen for what the sky did, not people.
const LONDON = { lat: 51.5, lon: -0.1 };
const NEW_YORK = { lat: 40.7, lon: -74.0 };

describe('unknown birth time', () => {
  const chart = computeChart({ date: '2010-03-03', time: null, ...LONDON });

  it('marks the 14 house keys and Vibe unavailable, and nothing else', () => {
    const expected = KEY_LIST.filter(needsBirthTime).map((k) => k.id);
    expect(expected).toHaveLength(15);
    expect([...chart.unavailable].sort()).toEqual([...expected].sort());
    for (const key of KEY_LIST) {
      expect(keyPlacement(chart, key.id).kind === 'unavailable', key.id).toBe(needsBirthTime(key));
    }
  });

  it('has no houses, cusps, Ascendant, or Midheaven', () => {
    expect(chart.timeKnown).toBe(false);
    expect(chart.houseSystem).toBeNull();
    expect(chart.cusps).toBeNull();
    expect(chart.midheaven).toBeNull();
    expect(chart.placements.rising).toBeNull();
    for (const placement of Object.values(chart.placements)) {
      if (placement) expect(placement.house).toBeNull();
    }
  });

  it('computes positions at local noon', () => {
    const noon = computeChart({ date: '2010-03-03', time: '12:00', ...LONDON });
    expect(chart.placements.moon.longitude).toBeCloseTo(noon.placements.moon.longitude, 9);
    expect(chart.placements.sun.longitude).toBeCloseTo(noon.placements.sun.longitude, 9);
  });

  it('gives no candidates on a day the Moon stays in one sign', () => {
    expect(chart.placements.moon.signCandidates).toBeUndefined();
    expect(keyPlacement(chart, 'moonSign')).toEqual({ kind: 'sign', sign: 'libra' });
  });

  it('gives both Moon signs on a day the Moon changes sign', () => {
    const ingressDay = computeChart({ date: '2010-03-04', time: null, ...LONDON });
    expect(ingressDay.placements.moon.signCandidates).toEqual(['libra', 'scorpio']);
    const clan = keyPlacement(ingressDay, 'moonSign');
    expect(clan.kind === 'sign' && clan.candidates).toEqual(['libra', 'scorpio']);
    // The pair is the sign at the first and last minute of the local day.
    const first = computeChart({ date: '2010-03-04', time: '00:00', ...LONDON });
    const last = computeChart({ date: '2010-03-04', time: '23:59', ...LONDON });
    expect([first.placements.moon.sign, last.placements.moon.sign]).toEqual(['libra', 'scorpio']);
  });

  it('flags the Sun on an equinox date, so Tribe shows both signs', () => {
    // March equinox 2010: 17:32 UTC, still March 20 in New York.
    const equinox = computeChart({ date: '2010-03-20', time: null, ...NEW_YORK });
    expect(equinox.placements.sun.signCandidates).toEqual(['pisces', 'aries']);
  });

  it('flags any body that changes sign that day, not only the Moon', () => {
    // Venus entered Aries on Mar 7, 2010.
    const venusDay = computeChart({ date: '2010-03-07', time: null, ...LONDON });
    expect(venusDay.placements.venus.signCandidates).toEqual(['pisces', 'aries']);
    expect(venusDay.placements.moon.signCandidates).toBeUndefined();
  });

  it('flags the Moon on roughly two dates in five across a month', () => {
    let flagged = 0;
    for (let day = 1; day <= 30; day++) {
      const date = `2010-04-${String(day).padStart(2, '0')}`;
      if (computeChart({ date, time: null, ...LONDON }).placements.moon.signCandidates) flagged += 1;
    }
    expect(flagged).toBeGreaterThanOrEqual(10);
    expect(flagged).toBeLessThanOrEqual(14);
  });

  it('counts tallies without the Ascendant', () => {
    const total = Object.values(chart.tallies.element).reduce((a, b) => a + b, 0);
    expect(total).toBe(10);
  });
});
