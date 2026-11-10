import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { glyphPosition } from '@/components/TribeWheel';
import { signGlyphSpriteId } from '@/lib/glyphs';
import { SIGN_IDS } from '@/lib/keys';
import sprite from '@/lib/sign-glyph-sprite.json';

// Dawa (Oct 2): Aries at the far left, the signs going round from there. The natural wheel runs
// counterclockwise, so Cancer is at the bottom, Libra at the right, and Capricorn at the top.
describe('the hero wheel of the 12 Tribes', () => {
  const at = (sign: (typeof SIGN_IDS)[number]) => glyphPosition(SIGN_IDS.indexOf(sign));

  it('puts Aries at the far left, just below the horizon', () => {
    const [x, y] = at('aries');
    expect(Math.min(...SIGN_IDS.map((s) => at(s)[0]))).toBe(x);
    expect(y).toBeGreaterThan(0);
  });

  it('runs counterclockwise: Cancer at the bottom, Libra at the right, Capricorn at the top', () => {
    const ys = SIGN_IDS.map((s) => at(s)[1]);
    const xs = SIGN_IDS.map((s) => at(s)[0]);
    expect(Math.max(...ys)).toBeCloseTo(Math.max(at('cancer')[1], at('leo')[1]));
    expect(at('cancer')[1]).toBeGreaterThan(0);
    expect(Math.max(...xs)).toBe(at('libra')[0]);
    expect(at('capricorn')[1]).toBeLessThan(0);
    expect(at('taurus')[1]).toBeGreaterThan(at('aries')[1]);
  });
});

// 4z: the wheel is whole at first paint and its motion is added only once the page has settled
// (David, Nov 10: a draw-in tied to page load played differently on every load). The drift loops
// over `duration-drift`, and none of it runs under reduced motion (the light's ring stays hidden).
describe("the hero wheel's motion", () => {
  const css = readFileSync('app/globals.css', 'utf8');
  const start = css.indexOf('.wheel-light {');
  const motion = css.indexOf('@media (prefers-reduced-motion: no-preference)', start);
  const end = css.indexOf('@media (prefers-reduced-motion: reduce)', motion);
  const block = css.slice(motion, end);

  it('keeps every wheel animation inside the no-preference block', () => {
    expect(start).toBeGreaterThan(-1);
    expect(motion).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(motion);
    const outside = css.slice(0, motion) + css.slice(end);
    expect(outside).not.toMatch(/\.wheel[^{]*\{[^}]*animation/);
    expect(outside).not.toContain('@keyframes wheel-');
    expect(css.slice(start, motion)).toMatch(/\.wheel-light \{\s*opacity: 0;/);
  });

  it('starts no animation with the page: every one waits for .wheel-awake', () => {
    const animated = [...block.matchAll(/([^{}]+)\{[^{}]*animation:/g)].map((m) => m[1].trim());
    expect(animated.length).toBeGreaterThan(0);
    for (const selector of animated) expect(selector).toMatch(/^\.wheel-awake /);
    // Nothing hides the wheel while it waits: the only resting opacity is the light's own ring.
    expect(block).not.toMatch(/from \{\s*opacity: 0/);
    const wheel = readFileSync('components/TribeWheel.tsx', 'utf8');
    expect(wheel).toContain("document.readyState === 'complete'");
    expect(wheel).toContain("document.visibilityState === 'visible'");
  });

  it('drifts over the design system token', () => {
    expect(block).toContain('wheel-light var(--duration-drift) ease-in-out infinite');
    expect(block).toContain('wheel-lift var(--duration-drift) ease-in-out infinite');
  });
});

// 4z: the wheel draws its glyphs from the page's own sprite, so a first visit never shows an empty
// disc. The sprite's data is a copy of the traced files; after a sign glyph changes, run
// `node scripts/sign-glyph-sprite.mjs`.
describe("the hero wheel's glyph sprite", () => {
  it.each(SIGN_IDS)('holds the drawing in public/glyphs/%s.svg, whole', (sign) => {
    const { transform, paths } = sprite[sign] as { transform: string | null; paths: { d: string; evenodd?: boolean }[] };
    const group = transform === null ? '<g id="glyph">' : `<g id="glyph" transform="${transform}">`;
    const drawn = paths.map((p) => `<path${p.evenodd ? ' fill-rule="evenodd"' : ''} d="${p.d}"/>`).join('');
    const file = readFileSync(`public/glyphs/${sign}.svg`, 'utf8').trim();
    expect(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${group}${drawn}</g></svg>`).toBe(file);
  });

  it('gives each sign its own id, and the landing page renders the sprite before the wheel', () => {
    expect(new Set(SIGN_IDS.map(signGlyphSpriteId)).size).toBe(12);
    const page = readFileSync('app/(public)/page.tsx', 'utf8');
    expect(page.indexOf('<SignGlyphSprite />')).toBeGreaterThan(-1);
    expect(page.indexOf('<SignGlyphSprite />')).toBeLessThan(page.indexOf('<TribeWheel'));
  });
});
