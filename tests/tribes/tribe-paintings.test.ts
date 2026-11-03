import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SIGN_IDS } from '@/lib/keys';
import files from '@/lib/tribe-paintings-files.json';
import { TRIBE_PAINTINGS, TRIBE_PAINTING_CREDIT, tribePaintingSet } from '@/lib/tribe-paintings';

const root = process.cwd();
const cuts = files as Record<string, { size: number; files: Record<string, Record<'avif' | 'webp', { src: string; bytes: number }>> }>;

describe("Kirstie Connon's Tribe paintings", () => {
  it('has one painting for each of the 12 signs, and no others', () => {
    expect(Object.keys(TRIBE_PAINTINGS).sort()).toEqual([...SIGN_IDS].sort());
    expect(Object.keys(cuts).sort()).toEqual([...SIGN_IDS].sort());
  });

  it('names its artist for the credit', () => {
    expect(TRIBE_PAINTING_CREDIT).toBe('Kirstie Connon');
  });

  it.each(SIGN_IDS)('%s: the square cut keeps at least 97% of each side, so her mark stays whole', (sign) => {
    const [w, h] = TRIBE_PAINTINGS[sign].size;
    expect(cuts[sign].size / Math.max(w, h)).toBeGreaterThanOrEqual(0.97);
  });

  it.each(SIGN_IDS)('%s: every cut is on disk at the size recorded, and never upscaled', (sign) => {
    for (const [width, variant] of Object.entries(cuts[sign].files)) {
      expect(Number(width)).toBeLessThanOrEqual(cuts[sign].size);
      for (const file of Object.values(variant)) {
        const onDisk = path.join(root, 'public', file.src);
        expect(existsSync(onDisk), file.src).toBe(true);
        expect(statSync(onDisk).size).toBe(file.bytes);
      }
    }
    expect(tribePaintingSet(sign).fallback).toMatch(/\.webp$/);
  });

  it.each(SIGN_IDS)('%s: its alt text is one plain sentence', (sign) => {
    const { alt } = TRIBE_PAINTINGS[sign];
    expect(alt).toMatch(/^[A-Z].*\.$/);
    expect(alt).not.toMatch(/[—!]/);
  });
});
