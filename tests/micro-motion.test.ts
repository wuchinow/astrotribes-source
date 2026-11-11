import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LIFT } from '@/lib/motion';

// Micro motion (David, Nov 11: "feel responsive without creating lag"). Every piece answers a tap or
// a hover, moves only transform and opacity, and sits under no-preference, so reduced motion keeps
// the change and drops the movement (the 4z rule, CLAUDE.md, Design rules, Motion).
describe('micro motion', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  const start = css.indexOf(' * Micro motion');
  const block = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference)', start));

  it('lives in one no-preference block at the end of the stylesheet', () => {
    expect(start).toBeGreaterThan(0);
    expect(block.startsWith('@media (prefers-reduced-motion: no-preference)')).toBe(true);
    for (const name of ['.is-sending', '.motion-in', 'details[open] > .open-in', '.wheel-pick', '.consult-stack .consult-bar', '.menu-drop']) {
      expect(block).toContain(name);
    }
  });

  it('animates only transform and opacity', () => {
    const props = [...block.matchAll(/^\s+([a-z-]+):/gm)].map((m) => m[1]);
    const moving = new Set(props.filter((p) => !['animation', 'transition', 'transform-box', 'transform-origin'].includes(p)));
    expect([...moving].sort()).toEqual(['opacity', 'transform']);
  });

  it('lifts a linked card only where motion is welcome', () => {
    for (const cls of LIFT.split(' ').filter((c) => c.includes('translate-y'))) expect(cls.startsWith('motion-safe:')).toBe(true);
  });

  it('presses a button only where motion is welcome, and never a disabled one', () => {
    const button = readFileSync('components/Button.tsx', 'utf8');
    expect(button).toContain('motion-safe:active:not-disabled:not-aria-disabled:scale-[0.98]');
  });
});
