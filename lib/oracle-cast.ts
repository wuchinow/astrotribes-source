// Consult (1c): casting a hexagram with three coins, six times, bottom line first. Heads count 3
// and tails 2, so a toss makes 6 (three tails: a broken line, changing), 7 (an unbroken line),
// 8 (a broken line), or 9 (three heads: an unbroken line, changing). The changing lines turn into
// their opposites to give the relating hexagram. Pure functions: the throw lives only in the
// visitor's browser, and nothing here stores, logs, or sends it.

import { numberOfLines } from './iching';

export type LineValue = 6 | 7 | 8 | 9;

export const valueOfHeads = (heads: number): LineValue => {
  if (!Number.isInteger(heads) || heads < 0 || heads > 3) throw new Error('A toss has 0 to 3 heads');
  return (heads * 3 + (3 - heads) * 2) as LineValue;
};

export const isUnbroken = (value: LineValue) => value === 7 || value === 9;
export const isChanging = (value: LineValue) => value === 6 || value === 9;

/** The cast hexagram's lines: 1 unbroken, 0 broken, bottom first. */
export const primaryLines = (values: readonly LineValue[]) => values.map((v) => (isUnbroken(v) ? 1 : 0));

/** The relating hexagram's lines: every changing line turned into its opposite. */
export const relatingLines = (values: readonly LineValue[]) =>
  values.map((v) => (v === 9 ? 0 : v === 6 ? 1 : isUnbroken(v) ? 1 : 0));

export interface Cast {
  primary: number;
  /** The relating hexagram, or null when no line changes. */
  relating: number | null;
  /** Bottom first. */
  changing: boolean[];
}

export function readCast(values: readonly LineValue[]): Cast {
  if (values.length !== 6) throw new Error('A cast has six lines');
  const changing = values.map(isChanging);
  return {
    primary: numberOfLines(primaryLines(values)),
    relating: changing.some(Boolean) ? numberOfLines(relatingLines(values)) : null,
    changing,
  };
}

/**
 * Three coins, from the browser's cryptographic generator: three bits of one random byte, each
 * equally likely heads or tails. `bytes` is injectable for tests.
 */
export function tossThree(bytes: () => number = () => crypto.getRandomValues(new Uint8Array(1))[0]): [boolean, boolean, boolean] {
  const byte = bytes();
  return [Boolean(byte & 1), Boolean(byte & 2), Boolean(byte & 4)];
}
