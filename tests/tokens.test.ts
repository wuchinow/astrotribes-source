import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/contrast';
import { COLOR_PAIRS, pairApplies, readTokens, type Theme } from '@/lib/tokens';

const tokens = readTokens();

// app/tokens.css is built from the design system's tokens.json v3.4 (design system v20, the 1f Night
// lift). The mirror at docs/design-system/tokens.json must match it; when a build runs ahead of the
// artifact, this check skips until the mirror catches up, and the PR says so.
const BUILT_FROM_VERSION = '3.4';
const mirror = JSON.parse(
  readFileSync(path.join(process.cwd(), 'docs/design-system/tokens.json'), 'utf8'),
) as {
  version: string | number;
  color: { tokens: Array<{ name: string; value: Record<Theme, string> }> };
  opacity: { tokens: Array<{ name: string; value: number | string }> };
};

/** The mirror writes references as {plum-700}; resolve them within the mood. */
function mirrorValue(name: string, theme: Theme): string | undefined {
  const token = mirror.color.tokens.find((t) => t.name === name);
  const value = token?.value[theme];
  const ref = value && /^\{([\w-]+)\}$/.exec(value);
  return ref ? mirrorValue(ref[1], theme) : value?.toLowerCase();
}

describe('token layer', () => {
  it('defines the same names in both moods', () => {
    expect(Object.keys(tokens.night).sort()).toEqual(Object.keys(tokens.paper).sort());
  });

  describe.each(['paper', 'night'] as const)('%s mood', (theme) => {
    const pairs = COLOR_PAIRS.filter((pair) => pairApplies(pair, theme));
    it.each(pairs.map((pair) => [`${pair.fg} on ${pair.bg}`, pair] as const))(
      '%s holds its contrast minimum',
      (_label, pair) => {
        const fg = tokens[theme][pair.fg];
        const bg = tokens[theme][pair.bg];
        expect(fg, pair.fg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(bg, pair.bg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(contrastRatio(fg, bg), pair.use).toBeGreaterThanOrEqual(pair.min);
      },
    );
  });

  it.skipIf(String(mirror.version) !== BUILT_FROM_VERSION)(
    `matches docs/design-system/tokens.json v${BUILT_FROM_VERSION}`,
    () => {
      for (const token of mirror.color.tokens) {
        for (const theme of ['paper', 'night'] as const) {
          expect(tokens[theme][token.name], `${token.name} (${theme})`).toBe(mirrorValue(token.name, theme));
        }
      }
    },
  );

  it.skipIf(String(mirror.version) !== BUILT_FROM_VERSION)(
    `opacities match docs/design-system/tokens.json v${BUILT_FROM_VERSION}`,
    () => {
      const css = readFileSync(path.join(process.cwd(), 'app/tokens.css'), 'utf8');
      for (const token of mirror.opacity.tokens) {
        const value = new RegExp(`--${token.name}:\\s*([\\d.]+);`).exec(css)?.[1];
        expect(Number(value), token.name).toBe(Number(token.value));
      }
    },
  );
});
