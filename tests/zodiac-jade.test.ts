import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import files from '@/lib/zodiac-jade-files.json';
import { ANIMALS } from '@/lib/chinese-zodiac';
import { footerCredits } from '@/lib/sky-credits';
import { ZODIAC_JADE, zodiacJadeCredit, zodiacJadeSet } from '@/lib/zodiac-jade';

const root = path.join(__dirname, '..');

describe('the Chinese zodiac jade animals (4p)', () => {
  it('has a figure and a character for each of the twelve animals', () => {
    expect(Object.keys(ZODIAC_JADE).sort()).toEqual([...ANIMALS].sort());
    const characters = ANIMALS.map((animal) => ZODIAC_JADE[animal].hanzi);
    expect(new Set(characters).size).toBe(12);
    expect(characters.join('')).toBe('鼠牛虎兔龍蛇馬羊猴雞狗豬');
  });

  it('cuts every figure, and every cut is on disk', () => {
    expect(Object.keys(files).sort()).toEqual(ANIMALS.map((animal) => animal.toLowerCase()).sort());
    for (const animal of ANIMALS) {
      const set = zodiacJadeSet(animal);
      expect(set.width).toBeGreaterThan(0);
      for (const src of [...set.avif.split(', '), ...set.webp.split(', ')].map((entry) => entry.split(' ')[0])) {
        expect(existsSync(path.join(root, 'public', src))).toBe(true);
      }
    }
  });

  it('loads the twelve characters from their own small font', () => {
    const font = path.join(root, 'app', '(public)', 'your-chart', 'zodiac-hanzi.woff2');
    expect(statSync(font).size).toBeLessThan(20_000);
    expect(existsSync(path.join(root, 'app', '(public)', 'your-chart', 'zodiac-hanzi-OFL.txt'))).toBe(true);
  });

  it('credits the Met in the footer', () => {
    expect(footerCredits.publicDomain).toContain(zodiacJadeCredit);
    expect(zodiacJadeCredit).toMatch(/The Met\b/);
  });
});
