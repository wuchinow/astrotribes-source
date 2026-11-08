import { describe, expect, it } from 'vitest';
import { TRIBE_DAWA } from '@/content/tribe-dawa';
import { TRIBE_WORDS } from '@/content/tribes';
import { KEY_LIST, RETIRED_KEY_NAMES, SIGN_IDS } from '@/lib/keys';

// The Tribe pages' per-sign words (3a): one entry per sign, and the copy rules the lint guard cannot
// see inside data (no em-dashes, no exclamation marks, no key name but Tribe).
const strings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : typeof value === 'object' && value ? Object.values(value).flatMap(strings) : [];

const keyNames = [...KEY_LIST.map((k) => k.name), ...RETIRED_KEY_NAMES].filter((name) => name !== 'Tribe');

describe('Tribe words', () => {
  it('has an entry for every sign', () => {
    expect(Object.keys(TRIBE_WORDS).sort()).toEqual([...SIGN_IDS].sort());
  });

  it.each(SIGN_IDS)('%s follows the copy rules', (sign) => {
    for (const text of strings(TRIBE_WORDS[sign])) {
      expect(text).not.toMatch(/—|!/);
      for (const name of keyNames) expect(text).not.toMatch(new RegExp(`\\b${name}\\b`));
    }
  });
});

describe('Dawa’s Tribe words', () => {
  it.each(SIGN_IDS)('%s has his hello, slogans, traits, and shadows, with no em-dash or key name but Tribe', (sign) => {
    const dawa = TRIBE_DAWA[sign];
    expect(dawa.hello.length, sign).toBeGreaterThan(80);
    expect(dawa.slogans.length).toBeGreaterThan(0);
    expect(dawa.traits.length).toBeGreaterThan(3);
    expect(dawa.shadows.length).toBeGreaterThan(3);
    expect(dawa.house).toBe(SIGN_IDS.indexOf(sign) + 1);
    for (const text of strings(dawa)) {
      expect(text).not.toMatch(/—/);
      for (const name of keyNames) expect(text).not.toMatch(new RegExp(`\\b${name}\\b`));
    }
  });
});
