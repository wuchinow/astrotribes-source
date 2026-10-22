// The Oracle's content (1c): the 64 hexagrams and 78 cards are complete, consistent, and carry
// their source, credit, and review flag; the art and the credits line up with them.

import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import credits from '@/content/oracle/credits.json';
import iching from '@/content/oracle/iching.json';
import tarot from '@/content/oracle/tarot.json';
import { consultCopy, oracleCopy } from '@/content/oracle/copy';
import { CARDS, HEXAGRAMS, TRIGRAMS, cardArt, type TrigramId } from '@/lib/oracle';

const pattern = (n: number) => HEXAGRAMS.find((h) => h.number === n)!.lines.join('');

describe('the 64 hexagrams', () => {
  it('are numbered 1 to 64, each with six lines and six line texts', () => {
    expect(HEXAGRAMS.map((h) => h.number)).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
    for (const h of HEXAGRAMS) {
      expect(h.lines, `${h.number}`).toHaveLength(6);
      expect(h.reading.lines, `${h.number}`).toHaveLength(6);
      h.reading.lines.forEach((text) => expect(text.trim().length, `${h.number}`).toBeGreaterThan(20));
    }
  });

  it("each hexagram's lines are its lower trigram, then its upper", () => {
    for (const h of HEXAGRAMS) {
      expect(h.lines, `${h.number}`).toEqual([...TRIGRAMS[h.lower].lines, ...TRIGRAMS[h.upper].lines]);
    }
  });

  it('makes 64 different figures, in the King Wen order', () => {
    expect(new Set(HEXAGRAMS.map((h) => h.lines.join(''))).size).toBe(64);
    expect(pattern(1)).toBe('111111'); // all solid
    expect(pattern(2)).toBe('000000'); // all broken
    expect(pattern(11)).toBe('111000'); // Heaven below Earth
    expect(pattern(12)).toBe('000111'); // Earth below Heaven
    expect(pattern(63)).toBe('101010'); // alternating from a solid bottom
    expect(pattern(64)).toBe('010101');
  });

  it('has the eight trigrams in pinyin with their images', () => {
    const images = Object.fromEntries((Object.keys(TRIGRAMS) as TrigramId[]).map((id) => [TRIGRAMS[id].pinyin, TRIGRAMS[id].image]));
    expect(images).toEqual({
      Qián: 'Heaven', Kūn: 'Earth', Zhèn: 'Thunder', Kǎn: 'Water', Gèn: 'Mountain', Xùn: 'Wind', Lí: 'Fire', Duì: 'Lake',
    });
  });

  it('gives every reading its judgment, its image, and the all-lines text for 1 and 2 only', () => {
    for (const h of HEXAGRAMS) {
      expect(h.reading.body.map((b) => b.heading)).toEqual([oracleCopy.judgment, oracleCopy.image]);
      h.reading.body.forEach((b) => expect(b.text.trim().length, `${h.number}`).toBeGreaterThan(20));
      expect(Boolean(h.reading.allLines), `${h.number}`).toBe(h.number <= 2);
      expect(h.reading.line.trim().length).toBeGreaterThan(3);
    }
  });

  it('names each in Traditional characters and modern pinyin with tone marks, using 71 characters', () => {
    expect(HEXAGRAMS.find((h) => h.number === 1)).toMatchObject({ chinese: '乾', pinyin: 'Qián' });
    expect(HEXAGRAMS.find((h) => h.number === 25)).toMatchObject({ chinese: '無妄', pinyin: 'Wú Wàng' });
    const chars = new Set(HEXAGRAMS.flatMap((h) => [...h.chinese]));
    expect(chars.size).toBe(71);
  });

  it('has the subset font beside the Oracle routes, with its licence', () => {
    const dir = path.join(process.cwd(), 'app', '(public)', 'oracle');
    expect(statSync(path.join(dir, 'hanzi-bold.woff2')).size).toBeLessThan(40_000);
    expect(readFileSync(path.join(dir, 'hanzi-bold-OFL.txt'), 'utf8')).toMatch(/SIL Open Font License/);
  });
});

describe('the 78 cards', () => {
  it('are the 22 Greater Arcana and four suits of 14', () => {
    expect(CARDS).toHaveLength(78);
    expect(CARDS.filter((c) => c.arcana === 'major').map((c) => c.id)).toEqual(
      Array.from({ length: 22 }, (_, i) => `major-${String(i).padStart(2, '0')}`),
    );
    for (const suit of ['wands', 'cups', 'swords', 'pentacles']) {
      expect(CARDS.filter((c) => c.id.startsWith(`${suit}-`))).toHaveLength(14);
    }
    expect(CARDS.find((c) => c.id === 'major-08')!.name).toBe('Strength');
    expect(CARDS.find((c) => c.id === 'wands-11')!.name).toBe('Page of Wands');
  });

  it("carry Waite's upright meaning, and his reversed one wherever he printed it", () => {
    for (const c of CARDS) {
      expect(c.reading.upright.trim().length, c.id).toBeGreaterThan(5);
      // The Two of Cups is printed with no reversed meaning (p. 222).
      if (c.id !== 'cups-02') expect(c.reading.reversed?.trim().length, c.id).toBeGreaterThan(3);
    }
    expect(CARDS.find((c) => c.id === 'cups-02')!.reading.reversed).toBeNull();
  });

  it('each has its art: one WebP, sized, on disk, and a Commons record with a public-domain tag', () => {
    const cards = credits.cards as Record<string, { commons: string; license: string[]; uploader: string; file: string }>;
    for (const c of CARDS) {
      const art = cardArt(c.id)!;
      expect(art, c.id).toBeDefined();
      expect(art.src).toMatch(new RegExp(`^/tarot/${c.id}\\.[0-9a-f]{8}\\.webp$`));
      expect(art.width).toBe(480);
      expect(existsSync(path.join(process.cwd(), 'public', art.src))).toBe(true);
      expect(cards[c.id].commons).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File%3ARWS1909_-_/);
      expect(cards[c.id].file).toMatch(/^RWS1909 - /);
      expect(cards[c.id].license.every((tag) => tag.startsWith('PD-'))).toBe(true);
      expect(cards[c.id].uploader.length).toBeGreaterThan(0);
    }
  });
});

describe('every reading', () => {
  it('has a source that resolves, a credit, and reviewed: false', () => {
    const sources = { ...iching.sources, ...tarot.sources } as Record<string, unknown>;
    for (const entry of [...HEXAGRAMS, ...CARDS]) {
      expect(sources[entry.reading.source.id], entry.reading.source.id).toBeDefined();
      expect(entry.reading.credit).toMatch(/^From /);
      expect(entry.reading.reviewed).toBe(false);
    }
  });

  it('names the real editions: Legge 1882, the illustrated Pictorial Key 1911, never Gutenberg #43548', () => {
    expect(iching.sources['legge-1882'].year).toBe(1882);
    expect(tarot.sources['waite-pkt'].firstEdition).toMatch(/^1911/);
    expect(JSON.stringify([iching, tarot])).not.toMatch(/43548|de Laurence/i);
  });
});

describe('our own words around the quoted text', () => {
  // Legge and Waite are quoted verbatim, dashes and all; the copy rules apply to ours.
  const ours = [
    ...Object.values(oracleCopy).flatMap((v) => (typeof v === 'string' ? [v] : typeof v === 'function' ? [v('Friday, September 25')] : Object.values(v).filter((x) => typeof x === 'string'))),
    ...Object.values(consultCopy).flatMap((v) => (typeof v === 'string' ? [v] : [])),
    ...CARDS.map((c) => c.alt),
  ] as string[];

  it('use no em-dashes, en-dashes, or exclamation marks', () => {
    for (const text of ours) expect(text, text).not.toMatch(/[—–!]/);
  });
});
