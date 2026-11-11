import { describe, expect, it } from 'vitest';
import { KEY_LIST } from '@/lib/keys';
import { groupShared, hasBirthTime, sharedKeys, splitShared, toPlacements, topShared, type PlacementRow } from '@/lib/shared-keys';

// Synthetic charts only (invariant 8): signs and houses typed by hand, no birth details.
const chart = (rows: [string, string, number | null][]): PlacementRow[] =>
  toPlacements(rows.map(([body, sign, house]) => ({ body, sign, house })));

const a = chart([
  ['sun', 'leo', 5],
  ['moon', 'pisces', 12],
  ['rising', 'gemini', null],
  ['mercury', 'leo', 5],
  ['uranus', 'aquarius', 11],
  ['neptune', 'capricorn', 10],
  ['pluto', 'scorpio', 8],
]);

describe('the keys two members share', () => {
  it('matches a sign key on the same sign and a house key on the same house', () => {
    const b = chart([
      ['sun', 'leo', 7],
      ['moon', 'aries', 12],
      ['rising', 'gemini', null],
      ['mercury', 'virgo', 5],
    ]);
    expect(sharedKeys(a, b).map((s) => [s.key.id, s.value])).toEqual([
      ['sunSign', 'leo'],
      ['moonHouse', 12],
      ['risingSign', 'gemini'],
      ['mercuryHouse', 5],
    ]);
  });

  it('skips every house key when either chart has no birth time', () => {
    const noTime = chart([
      ['sun', 'leo', null],
      ['moon', 'pisces', null],
      ['mercury', 'leo', null],
    ]);
    expect(hasBirthTime(noTime)).toBe(false);
    expect(hasBirthTime(a)).toBe(true);
    const ids = sharedKeys(a, noTime).map((s) => s.key.id);
    expect(ids).toEqual(['sunSign', 'moonSign', 'mercurySign']);
    expect(sharedKeys(noTime, noTime).every((s) => s.key.dimension === 'sign')).toBe(true);
  });

  it('is the same both ways round', () => {
    const b = chart([
      ['sun', 'leo', 5],
      ['moon', 'pisces', 3],
      ['pluto', 'scorpio', 8],
    ]);
    expect(sharedKeys(a, b).map((s) => s.key.id)).toEqual(sharedKeys(b, a).map((s) => s.key.id));
  });

  it('sets the outer planets apart and keeps them off the card', () => {
    const b = chart([
      ['sun', 'aries', 1],
      ['uranus', 'aquarius', 2],
      ['neptune', 'capricorn', 3],
      ['pluto', 'scorpio', 4],
    ]);
    const shared = sharedKeys(a, b);
    const { personal, generational } = splitShared(shared);
    expect(personal).toEqual([]);
    expect(generational.map((s) => s.key.id)).toEqual(['uranusSign', 'neptuneSign', 'plutoSign']);
    expect(topShared(shared)).toEqual([]);
  });

  it('puts the Core Five first on the card', () => {
    const b = chart([
      ['sun', 'aries', 1],
      ['moon', 'cancer', 12],
      ['mercury', 'leo', 2],
    ]);
    expect(topShared(sharedKeys(a, b)).map((s) => s.key.id)).toEqual(['moonHouse', 'mercurySign']);
  });

  it('drops rows that are not a known body and sign', () => {
    expect(toPlacements([{ body: 'vulcan', sign: 'leo', house: 1 }, { body: 'sun', sign: 'ophiuchus', house: 1 }, { body: 'sun', sign: 'leo', house: 13 }])).toEqual([
      { body: 'sun', sign: 'leo', house: null },
    ]);
    expect(toPlacements(null)).toEqual([]);
  });
});

describe('the groups a member page lists shared Keys under', () => {
  it('hold every personal Key exactly once, an outer planet\'s house Key included, so the count and the list agree', () => {
    // Every Key at once: as if two charts shared everything.
    const everything = KEY_LIST.map((key) => ({ key, value: key.dimension === 'sign' ? ('aries' as const) : (11 as const) }));
    const { personal } = splitShared(everything);
    const listed = groupShared(personal).flatMap(({ list }) => list.map((s) => s.key.id));
    expect([...listed].sort()).toEqual(personal.map((s) => s.key.id).sort());
    expect(listed).toContain('uranusHouse');
  });
});
