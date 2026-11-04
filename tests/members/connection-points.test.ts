import { describe, expect, it } from 'vitest';
import {
  ALL_THREE_BONUS,
  CROSS_POINTS,
  KEY_POINTS,
  NODE_CROSS_POINTS,
  PAIR_BONUS,
  connectionPoints,
} from '@/lib/connection-points';
import { KEY_LIST, isGenerational } from '@/lib/keys';
import { toPlacements, type PlacementRow } from '@/lib/shared-keys';

// Synthetic charts only (invariant 8): signs and houses typed by hand, no birth details.
const chart = (rows: [string, string, number | null][]): PlacementRow[] =>
  toPlacements(rows.map(([body, sign, house]) => ({ body, sign, house })));

describe('the points table', () => {
  it('has a value for every one of the 28 Keys', () => {
    expect(Object.keys(KEY_POINTS).sort()).toEqual(KEY_LIST.map((k) => k.id).sort());
  });

  it('gives the Core Five 5, and a generational sign less than a personal planet', () => {
    for (const key of KEY_LIST.filter((k) => k.core)) expect(KEY_POINTS[key.id]).toBe(5);
    for (const key of KEY_LIST.filter(isGenerational)) expect(KEY_POINTS[key.id]).toBeLessThan(KEY_POINTS.venusSign);
  });

  it('never scores the South Node, which mirrors the North Node', () => {
    expect(KEY_POINTS.southNodeSign).toBe(0);
    expect(KEY_POINTS.southNodeHouse).toBe(0);
  });
});

describe('connection points', () => {
  it('adds up the worked example from the plan to 25', () => {
    // Same Sun sign, one Moon on the other's Rising, Mercury sign, Venus house, Saturn sign,
    // and the three outer planets' signs.
    const a = chart([
      ['sun', 'leo', 10],
      ['moon', 'scorpio', 1],
      ['rising', 'libra', null],
      ['mercury', 'virgo', 11],
      ['venus', 'cancer', 7],
      ['saturn', 'taurus', 4],
      ['uranus', 'aquarius', 2],
      ['neptune', 'capricorn', 3],
      ['pluto', 'scorpio', 1],
    ]);
    const b = chart([
      ['sun', 'leo', 3],
      ['moon', 'aries', 9],
      ['rising', 'scorpio', null],
      ['mercury', 'virgo', 4],
      ['venus', 'libra', 7],
      ['saturn', 'taurus', 10],
      ['uranus', 'aquarius', 6],
      ['neptune', 'capricorn', 8],
      ['pluto', 'scorpio', 5],
    ]);
    const points = connectionPoints(a, b);
    expect(points.keys.map((k) => [k.shared.key.id, k.points])).toEqual([
      ['sunSign', 5],
      ['mercurySign', 3],
      ['venusHouse', 3],
      ['saturnSign', 3],
      ['uranusSign', 2],
      ['neptuneSign', 2],
      ['plutoSign', 2],
    ]);
    expect(points.cross).toEqual([{ mine: 'moon', theirs: 'rising', dimension: 'sign', value: 'scorpio', points: CROSS_POINTS }]);
    expect(points.bonuses).toEqual([]);
    expect(points.total).toBe(25);
  });

  it('is the same total both ways round', () => {
    const a = chart([
      ['sun', 'aries', 5],
      ['moon', 'leo', 8],
      ['rising', 'gemini', null],
      ['northNode', 'leo', 3],
    ]);
    const b = chart([
      ['sun', 'leo', 8],
      ['moon', 'aries', 5],
      ['rising', 'aries', null],
      ['northNode', 'gemini', 2],
    ]);
    const ab = connectionPoints(a, b);
    const ba = connectionPoints(b, a);
    expect(ab.total).toBe(ba.total);
    expect(ab.cross.length).toBe(ba.cross.length);
    // Sun and Moon swapped in sign and in house, their Rising on my Sun, and a Node cross each way.
    expect(ab.cross.filter((c) => c.points === CROSS_POINTS)).toHaveLength(5);
    expect(ab.cross.filter((c) => c.points === NODE_CROSS_POINTS)).toHaveLength(2);
  });

  it('counts a cross match in houses only when both charts have the house', () => {
    const timed = chart([
      ['sun', 'aries', 4],
      ['moon', 'taurus', 9],
      ['rising', 'cancer', null],
    ]);
    const noTime = chart([
      ['sun', 'virgo', null],
      ['moon', 'libra', null],
    ]);
    const points = connectionPoints(timed, noTime);
    expect(points.cross).toEqual([]);
    expect(points.total).toBe(0);
  });

  it('gives the rare combinations their bonus, all three on top of the pairs', () => {
    const a = chart([
      ['sun', 'pisces', null],
      ['moon', 'cancer', null],
      ['rising', 'virgo', null],
    ]);
    const twin = chart([
      ['sun', 'pisces', null],
      ['moon', 'cancer', null],
      ['rising', 'virgo', null],
    ]);
    const points = connectionPoints(a, twin);
    expect(points.bonuses.map((b) => b.points)).toEqual([PAIR_BONUS, PAIR_BONUS, PAIR_BONUS, ALL_THREE_BONUS]);
    expect(points.total).toBe(5 * 3 + PAIR_BONUS * 3 + ALL_THREE_BONUS);
  });

  it('lists a shared South Node with no points', () => {
    const a = chart([
      ['sun', 'aries', null],
      ['northNode', 'leo', null],
      ['southNode', 'aquarius', null],
    ]);
    const b = chart([
      ['sun', 'taurus', null],
      ['northNode', 'leo', null],
      ['southNode', 'aquarius', null],
    ]);
    const points = connectionPoints(a, b);
    expect(points.keys.map((k) => [k.shared.key.id, k.points])).toEqual([
      ['northNodeSign', KEY_POINTS.northNodeSign],
      ['southNodeSign', 0],
    ]);
    expect(points.total).toBe(KEY_POINTS.northNodeSign);
  });
});
