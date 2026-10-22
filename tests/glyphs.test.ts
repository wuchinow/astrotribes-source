import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GLYPHS } from '@/lib/glyphs';
import { BODY_IDS, SIGN_IDS } from '@/lib/keys';

describe('glyph registry', () => {
  it('has an entry for every sign and body', () => {
    for (const id of [...SIGN_IDS, ...BODY_IDS]) {
      expect(GLYPHS[id], id).toBeDefined();
      expect(GLYPHS[id].symbol.length, id).toBeGreaterThan(0);
    }
  });

  it('forces text presentation on single-character symbols, so no emoji appears', () => {
    for (const glyph of Object.values(GLYPHS)) {
      const symbol = [...glyph.symbol].filter((c) => c !== '︎');
      if (symbol.length === 1) expect(glyph.symbol.endsWith('︎'), glyph.id).toBe(true);
    }
  });

  it('turns the North Node glyph for the South Node', () => {
    expect(GLYPHS.southNode.rotate).toBe(180);
    expect(GLYPHS.southNode.symbol).toBe(GLYPHS.northNode.symbol);
  });

  it('points only at glyph files that exist', () => {
    for (const glyph of Object.values(GLYPHS)) {
      if (glyph.svg)
        expect(existsSync(path.join(process.cwd(), 'public', glyph.svg)), glyph.id).toBe(true);
    }
  });

  it('has a traced glyph for every sign', () => {
    for (const id of SIGN_IDS) expect(GLYPHS[id].svg, id).toBe(`/glyphs/${id}.svg`);
  });

  it("flags the image-tool placeholders and keeps them out of Dawa's credit", () => {
    for (const id of ['uranus', 'pluto', 'chiron'] as const) {
      expect(GLYPHS[id].svg, id).toBe(`/glyphs/${id}.svg`);
      expect(GLYPHS[id].placeholder, id).toBe(true);
      expect(GLYPHS[id].reviewed, id).toBe(false);
      expect(GLYPHS[id].credit, id).toBeNull();
    }
    for (const glyph of Object.values(GLYPHS)) {
      if (glyph.credit === 'Lama Dawa') expect(glyph.placeholder, glyph.id).toBe(false);
      if (!glyph.svg) expect(glyph.reviewed, glyph.id).toBe(false);
    }
  });

  it('keeps every traced glyph single-ink, in the 96 box GlyphIcon expects, and small', () => {
    for (const glyph of Object.values(GLYPHS)) {
      if (!glyph.svg) continue;
      const file = path.join(process.cwd(), 'public', glyph.svg);
      const svg = readFileSync(file, 'utf8');
      expect(svg, glyph.id).toContain('viewBox="0 0 96 96"');
      expect(svg, glyph.id).toContain('<g id="glyph"');
      // No fill or color of its own, so GlyphIcon's currentColor comes through.
      expect(svg, glyph.id).not.toMatch(/fill=|stroke=|style=|#[0-9a-f]{3,6}\b/i);
      expect(statSync(file).size, glyph.id).toBeLessThan(30 * 1024);
    }
  });
});
