import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SIGN_IDS } from '@/lib/keys';
import { PLATES } from '@/lib/old-prints';
import { helloColumns, helloColumnsGap, type HelloColumnsInput } from '@/lib/tribe-columns';
import { tribeFacts, tribeHelloColumns, tribeHelloInput } from '@/lib/tribe-facts';

// The first section of a Tribe page (5f): where the star card and "Did you know?" stand, so the two
// columns end close together whatever the length of Dawa's words.

const text = (length: number) => 'word '.repeat(Math.ceil(length / 5)).slice(0, length);
const input = (over: Partial<HelloColumnsInput>): HelloColumnsInput => ({
  hello: text(300),
  story: [text(500)],
  facts: Array.from({ length: 9 }, (_, i) => ({ label: `Fact ${i}`, value: text(24) })),
  didYouKnow: [text(60)],
  caption: text(150),
  plate: [3600, 2500],
  ...over,
});

describe('where the star card and "Did you know?" stand', () => {
  it('moves both below the columns when the words are short', () => {
    expect(helloColumns(input({ hello: text(120), story: [text(200)] }))).toEqual({ plate: 'foot', didYouKnow: 'foot' });
  });

  it('keeps both under the facts, the card at full size, when the story is long', () => {
    expect(helloColumns(input({ story: [text(1600), text(600)] }))).toEqual({ plate: 24, didYouKnow: 'right' });
  });

  it('says none when there are no lines to place', () => {
    expect(helloColumns(input({ didYouKnow: [] })).didYouKnow).toBe('none');
  });

  it('sets only a portrait card small beside its words', () => {
    for (const hello of [120, 300, 600, 900]) {
      for (const story of [200, 600, 1000, 1400]) {
        expect(helloColumns(input({ hello: text(hello), story: [text(story)] })).plate).not.toBe('beside');
      }
    }
  });
});

describe('the twelve Tribe pages', () => {
  it.each(SIGN_IDS)('%s: the columns end closer than with everything under the facts', (sign) => {
    const words = tribeHelloInput(sign);
    const layout = tribeHelloColumns(sign);
    const before = helloColumnsGap(words, { plate: 24, didYouKnow: words.didYouKnow.length > 0 ? 'right' : 'none' });
    const after = helloColumnsGap(words, layout);
    expect(Math.abs(after.wide)).toBeLessThanOrEqual(Math.abs(before.wide));
    // Within about four lines of text, unless everything already stands under the facts and the story still runs longer.
    const full = layout.plate === 24 && layout.didYouKnow !== 'foot';
    if (!full) expect(Math.abs(after.wide)).toBeLessThanOrEqual(120);
    if (layout.plate === 'beside') expect(PLATES[sign].size[1]).toBeGreaterThan(PLATES[sign].size[0]);
  });

  it('lists nine facts for every Tribe, the ruling planet with its name above its line', () => {
    for (const sign of SIGN_IDS) {
      const facts = tribeFacts(sign);
      expect(facts).toHaveLength(9);
      expect(facts.filter((fact) => fact.lead)).toHaveLength(1);
    }
  });
});

describe('the Tribe page', () => {
  const page = readFileSync('app/(public)/tribes/[sign]/page.tsx', 'utf8');

  it('places the two blocks as lib/tribe-columns.ts picks', () => {
    expect(page).toContain('tribeHelloColumns(sign)');
    expect(page).toContain("columns.plate === 'foot'");
    expect(page).toContain("columns.plate === 'beside'");
  });

  it('keeps a phone in the old order: the facts, "Did you know?", then the star card', () => {
    // When only "Did you know?" moves below, a copy under the facts shows below lg and the row below hides there.
    expect(page).toContain("columns.didYouKnow === 'foot' && columns.plate !== 'foot' ? didYouKnow('lg:hidden')");
    expect(page).toMatch(/hidden border-t border-ink-200 pt-12 lg:block/);
  });

  it('keeps the facts in view beside a longer story from lg', () => {
    expect(page).toContain('lg:sticky lg:top-8 lg:self-start');
  });
});
