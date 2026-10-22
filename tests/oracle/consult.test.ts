// Consult (1c): coins to lines, the cast and its relating hexagram for every throw, and a check that
// the component keeps the cast to itself.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HEXAGRAMS, numberOfLines } from '@/lib/iching';
import { readCast, relatingLines, tossThree, valueOfHeads, type LineValue } from '@/lib/oracle-cast';

describe('the coins', () => {
  it('count heads 3 and tails 2', () => {
    expect([0, 1, 2, 3].map(valueOfHeads)).toEqual([6, 7, 8, 9]);
    expect(() => valueOfHeads(4)).toThrow();
  });

  it('are three bits of one random byte', () => {
    expect(tossThree(() => 0b000)).toEqual([false, false, false]);
    expect(tossThree(() => 0b101)).toEqual([true, false, true]);
    expect(tossThree(() => 0b111)).toEqual([true, true, true]);
    // The real generator gives each of the eight throws.
    const seen = new Set(Array.from({ length: 400 }, () => tossThree().join()));
    expect(seen.size).toBe(8);
  });
});

describe('every cast', () => {
  const VALUES: LineValue[] = [6, 7, 8, 9];
  const all: LineValue[][] = [];
  for (let i = 0; i < 4 ** 6; i++) all.push(Array.from({ length: 6 }, (_, k) => VALUES[Math.floor(i / 4 ** k) % 4]));

  it('reads the cast and, only when a line changes, the relating hexagram with those lines turned', () => {
    for (const values of all) {
      const cast = readCast(values);
      const primary = HEXAGRAMS.find((h) => h.number === cast.primary)!;
      expect(primary.lines).toEqual(values.map((v) => (v === 7 || v === 9 ? 1 : 0)));
      const moving = values.map((v) => v === 6 || v === 9);
      expect(cast.changing).toEqual(moving);
      if (!moving.some(Boolean)) {
        expect(cast.relating).toBeNull();
        continue;
      }
      const relating = HEXAGRAMS.find((h) => h.number === cast.relating)!;
      relating.lines.forEach((line, i) => expect(line).toBe(moving[i] ? 1 - primary.lines[i] : primary.lines[i]));
    }
  });

  it('turns 1 into 2 when all six change, and 2 into 1', () => {
    expect(readCast([9, 9, 9, 9, 9, 9])).toEqual({ primary: 1, relating: 2, changing: Array(6).fill(true) });
    expect(readCast([6, 6, 6, 6, 6, 6])).toEqual({ primary: 2, relating: 1, changing: Array(6).fill(true) });
    expect(numberOfLines(relatingLines([9, 7, 7, 7, 7, 7]))).toBe(44);
  });

  it('reaches every hexagram, as a cast and as a relating hexagram', () => {
    const casts = new Set(all.map((v) => readCast(v).primary));
    const relatings = new Set(all.map((v) => readCast(v).relating).filter(Boolean));
    expect(casts.size).toBe(64);
    expect(relatings.size).toBe(64);
  });
});

describe('the Consult component', () => {
  const source = ['components/oracle/Consult.tsx', 'lib/oracle-cast.ts', 'lib/iching.ts']
    .map((file) => readFileSync(path.join(process.cwd(), file), 'utf8'))
    .join('\n');

  it('never stores, logs, or sends the cast: no storage, cookies, URL, network, or console', () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|XMLHttpRequest|history\.|router\.|useRouter|searchParams|console\./);
  });

  it('uses the browser\'s cryptographic generator for the coins', () => {
    expect(source).toMatch(/crypto\.getRandomValues/);
    expect(source).not.toMatch(/Math\.random/);
  });
});
