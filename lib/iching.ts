// The I Ching half of the Daily Oracle (1c): the 64 hexagrams and the eight trigrams from
// content/oracle/iching.json, and the lookups Consult needs. Kept apart from lib/oracle.ts so the
// Consult chunk carries the hexagrams without the cards.

import iching from '@/content/oracle/iching.json';

export type TrigramId = 'qian' | 'kun' | 'zhen' | 'kan' | 'gen' | 'xun' | 'li' | 'dui';

export interface Trigram {
  chinese: string;
  pinyin: string;
  legge: string;
  image: string;
  /** Bottom line first; 1 is unbroken. */
  lines: readonly number[];
}

/** Words that stand in for a reading until a reviewed one replaces them, with where they came from. */
export interface SourceRef {
  id: string;
  pages?: Record<string, number | readonly number[]>;
  page?: number;
}

export interface HexagramReading {
  /** The italic line under the name. */
  line: string;
  lineFrom: string;
  body: ReadonlyArray<{ heading: string; text: string }>;
  /** The six line texts, bottom line first. */
  lines: readonly string[];
  /** Hexagrams 1 and 2: the text for when all six lines change. */
  allLines: string | null;
  source: SourceRef;
  credit: string;
  reviewed: boolean;
  hidden?: boolean;
}

export interface Hexagram {
  number: number;
  chinese: string;
  pinyin: string;
  legge: string;
  lines: readonly number[];
  upper: TrigramId;
  lower: TrigramId;
  reading: HexagramReading;
  plain: null | { text: string; author: string; reviewed: boolean };
}

export const TRIGRAMS = iching.trigrams as Record<TrigramId, Trigram>;
export const HEXAGRAMS = iching.hexagrams as unknown as readonly Hexagram[];

export const byNumber = new Map(HEXAGRAMS.map((h) => [h.number, h]));

export const hexagram = (n: number): Hexagram => {
  const h = byNumber.get(n);
  if (!h) throw new Error(`No hexagram ${n}`);
  return h;
};

const byPattern = new Map(HEXAGRAMS.map((h) => [h.lines.join(''), h.number]));

/** The hexagram with these lines (bottom first, 1 unbroken). */
export const numberOfLines = (lines: readonly number[]): number => {
  const n = byPattern.get(lines.join(''));
  if (!n) throw new Error(`No hexagram has the lines ${lines.join('')}`);
  return n;
};
