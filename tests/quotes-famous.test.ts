import { describe, expect, it } from 'vitest';
import { QUOTES, QUOTES_REVIEWED, quoteForDay } from '@/content/quotes';
import { TRIBE_FAMOUS } from '@/content/tribe-famous';
import { SIGN_IDS } from '@/lib/keys';

describe('famous Tribe members', () => {
  it('lists Dawa’s names for every Tribe, oldest first, each name once across all twelve, and no dates', () => {
    const all = SIGN_IDS.flatMap((sign) => TRIBE_FAMOUS[sign]);
    for (const sign of SIGN_IDS) expect(TRIBE_FAMOUS[sign].length, sign).toBeGreaterThanOrEqual(15);
    expect(new Set(all).size).toBe(all.length);
    for (const name of all) expect(name, 'names only, no dates').not.toMatch(/\d{3,}|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d/);
  });
});

describe('quotes', () => {
  it('are a placeholder set with unique ids, no em-dash or exclamation mark', () => {
    expect(QUOTES_REVIEWED).toBe(false);
    expect(new Set(QUOTES.map((q) => q.id)).size).toBe(QUOTES.length);
    for (const q of QUOTES) expect(`${q.text} ${q.by}`, q.id).not.toMatch(/[—!]/);
  });

  it('the Oracle shows each quote in turn, one a day, before and after day 0', () => {
    const n = QUOTES.length;
    expect(quoteForDay(0)).toBe(QUOTES[0]);
    expect(quoteForDay(n)).toBe(QUOTES[0]);
    expect(quoteForDay(-1)).toBe(QUOTES[n - 1]);
    expect(new Set(Array.from({ length: n }, (_, i) => quoteForDay(i))).size).toBe(n);
  });
});
