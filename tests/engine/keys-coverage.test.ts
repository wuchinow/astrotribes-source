import { describe, expect, it } from 'vitest';
import { computeChart, keyPlacement } from '@/lib/engine';
import { BODY_IDS, HOUSES, KEY_LIST, SIGN_IDS, needsBirthTime } from '@/lib/keys';

// Every placement id in lib/keys.ts must be fillable from computeChart output. A key added there
// that the engine cannot fill fails here.
const known = computeChart({ date: '1994-11-03', time: '06:45', lat: -23.5, lon: -46.6 }); // synthetic
const unknown = computeChart({ date: '1994-11-03', time: null, lat: -23.5, lon: -46.6 });

describe('lib/keys.ts coverage', () => {
  it('returns a placement for every body id', () => {
    expect(Object.keys(known.placements).sort()).toEqual([...BODY_IDS].sort());
    expect(Object.keys(unknown.placements).sort()).toEqual([...BODY_IDS].sort());
  });

  it.each(KEY_LIST.map((k) => [k.id, k] as const))('%s resolves with a known time', (_, key) => {
    const value = keyPlacement(known, key.id);
    if (key.dimension === 'sign') {
      expect(value.kind).toBe('sign');
      if (value.kind === 'sign') expect(SIGN_IDS).toContain(value.sign);
    } else {
      expect(value.kind).toBe('house');
      if (value.kind === 'house') expect(HOUSES.map((h) => h.number)).toContain(value.house);
    }
  });

  it('resolves the 13 time-independent keys, and only those, without a time', () => {
    const resolved = KEY_LIST.filter((k) => keyPlacement(unknown, k.id).kind !== 'unavailable');
    expect(resolved.map((k) => k.id).sort()).toEqual(
      KEY_LIST.filter((k) => !needsBirthTime(k))
        .map((k) => k.id)
        .sort(),
    );
    expect(resolved).toHaveLength(13);
  });
});
