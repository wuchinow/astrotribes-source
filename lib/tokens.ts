// Reads the token layer (app/tokens.css) so tests and the styleguide check the
// values the site actually ships. Server and test use only.

import { readFileSync } from 'node:fs';
import path from 'node:path';

export type Theme = 'paper' | 'night';
export type TokenValues = Record<string, string>;

function blockAfter(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`tokens.css has no ${selector} block`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function variables(body: string): TokenValues {
  const values: TokenValues = {};
  for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) values[match[1]] = match[2].trim();
  // Resolve references within the mood, such as --highlight: var(--plum-700).
  for (const [name, value] of Object.entries(values)) {
    const ref = /^var\(--([\w-]+)\)$/.exec(value);
    if (ref && values[ref[1]]) values[name] = values[ref[1]];
  }
  return values;
}

export function readTokens(file = path.join(process.cwd(), 'app/tokens.css')): Record<Theme, TokenValues> {
  const css = readFileSync(file, 'utf8');
  return {
    paper: variables(blockAfter(css, '[data-theme="paper"]')),
    night: variables(blockAfter(css, '[data-theme="night"] {')),
  };
}

export interface ColorPair {
  fg: string;
  bg: string;
  /** 4.5 for text, 3 for rings and graphics. */
  min: number;
  use: string;
  /** The moods the pair appears in. Both when omitted. */
  moods?: readonly Theme[];
}

/**
 * Every foreground and background pair the components use. The frosted panel
 * is checked against surface-000, its base.
 */
export const COLOR_PAIRS: readonly ColorPair[] = [
  { fg: 'ink-900', bg: 'surface-100', min: 4.5, use: 'Headlines on the page' },
  { fg: 'ink-700', bg: 'surface-100', min: 4.5, use: 'Body text on the page' },
  { fg: 'ink-500', bg: 'surface-100', min: 4.5, use: 'Captions, eyebrows, credits' },
  { fg: 'ink-900', bg: 'surface-000', min: 4.5, use: 'Headline on a frosted panel' },
  { fg: 'ink-700', bg: 'surface-000', min: 4.5, use: 'Lede on a frosted panel' },
  { fg: 'ink-500', bg: 'surface-000', min: 4.5, use: 'Caption on a frosted panel' },
  { fg: 'ink-900', bg: 'surface-200', min: 4.5, use: 'Card titles' },
  { fg: 'ink-700', bg: 'surface-200', min: 4.5, use: 'Card body' },
  { fg: 'ink-500', bg: 'surface-200', min: 4.5, use: 'Card captions' },
  { fg: 'ink-900', bg: 'surface-band', min: 4.5, use: 'Headlines on a section band (v3.4)' },
  { fg: 'ink-700', bg: 'surface-band', min: 4.5, use: 'Body text on a section band and the footer' },
  { fg: 'ink-500', bg: 'surface-band', min: 4.5, use: 'Eyebrows, captions, and credits on a band' },
  { fg: 'highlight', bg: 'surface-band', min: 4.5, use: 'Headline accent on a band' },
  { fg: 'cobalt-600', bg: 'surface-band', min: 4.5, use: 'Links on a band and in the footer' },
  { fg: 'ember-500', bg: 'surface-band', min: 4.5, use: 'Category labels on a band' },
  { fg: 'cobalt-400', bg: 'surface-band', min: 3, use: 'Focus ring on a band' },
  { fg: 'logo', bg: 'surface-band', min: 3, use: 'Logo in the footer (graphic)' },
  { fg: 'highlight', bg: 'surface-000', min: 4.5, use: 'Headline accent on a frosted panel' },
  { fg: 'highlight', bg: 'surface-100', min: 4.5, use: 'Headline accent on the page' },
  { fg: 'plum-700', bg: 'surface-100', min: 4.5, use: 'Highlighted words on the page' },
  { fg: 'on-plum', bg: 'plum-fill', min: 4.5, use: 'Selected text and plum badges' },
  { fg: 'cobalt-600', bg: 'surface-100', min: 4.5, use: 'Links on the page' },
  { fg: 'cobalt-600', bg: 'surface-000', min: 4.5, use: 'Links on a panel' },
  { fg: 'cobalt-600', bg: 'surface-200', min: 4.5, use: 'Links in cards' },
  { fg: 'on-cobalt', bg: 'cobalt-600', min: 4.5, use: 'Label on a cobalt fill' },
  { fg: 'on-button-primary', bg: 'button-primary', min: 4.5, use: 'Primary button label (deep plum on Paper, cobalt on Night)' },
  { fg: 'on-button-primary', bg: 'button-primary-hover', min: 4.5, use: 'Primary button label on hover' },
  { fg: 'cobalt-600', bg: 'cobalt-100', min: 4.5, use: 'KeyChip key name' },
  { fg: 'ink-900', bg: 'cobalt-100', min: 4.5, use: 'KeyChip value' },
  { fg: 'ember-500', bg: 'surface-100', min: 4.5, use: 'Category labels and errors' },
  { fg: 'ember-500', bg: 'surface-200', min: 4.5, use: 'Draft for review label on a tinted note' },
  { fg: 'on-night', bg: 'night-900', min: 4.5, use: 'Text on the night band' },
  { fg: 'on-night-soft', bg: 'night-900', min: 4.5, use: 'Secondary text on the night band' },
  { fg: 'on-element', bg: 'fire', min: 4.5, use: 'Glyph or text on fire' },
  { fg: 'on-element', bg: 'earth', min: 4.5, use: 'Glyph or text on earth' },
  { fg: 'on-element', bg: 'air', min: 4.5, use: 'Glyph or text on air' },
  { fg: 'on-element', bg: 'water', min: 4.5, use: 'Glyph or text on water' },
  // The ring sits 2px off every control, so it meets the page or panel, never the fill: against the
  // deep plum button it would be 2.9:1, which is why the offset stays (1e).
  { fg: 'cobalt-400', bg: 'surface-100', min: 3, use: 'Focus and hover ring' },
  { fg: 'cobalt-400', bg: 'surface-000', min: 3, use: 'Focus ring on a frosted panel' },
  { fg: 'ink-500', bg: 'surface-000', min: 3, use: "A field's border on its panel (U6d)" },
  { fg: 'ink-500', bg: 'surface-100', min: 3, use: "A field's border on the page (U6d)" },
  { fg: 'ember-500', bg: 'surface-000', min: 4.5, use: 'Field errors on a frosted panel' },
  { fg: 'ink-900', bg: 'surface-000', min: 4.5, use: 'Text typed in a field' },
  { fg: 'ink-900', bg: 'cobalt-100', min: 4.5, use: 'The active place in the autocomplete list' },
  { fg: 'ink-900', bg: 'surface-200', min: 4.5, use: 'A place under the pointer in the autocomplete list' },
  { fg: 'logo', bg: 'surface-100', min: 3, use: 'Logo on the page (graphic): deep plum on Paper, gold on Night' },
  { fg: 'logo', bg: 'surface-000', min: 3, use: 'Logo on a panel or the share card (graphic)' },
  { fg: 'gold-300', bg: 'night-900', min: 3, use: 'Gold logo on night-900, merch (graphic)' },
  // The Oracle (1c). The numeral sits on the frosted panel above the lines, never over them.
  { fg: 'ember-500', bg: 'surface-000', min: 3, use: 'The hexagram number above the lines (large text)' },
  { fg: 'ink-900', bg: 'surface-000', min: 3, use: 'Hexagram lines and the hairline frame (graphic)' },
  { fg: 'cobalt-600', bg: 'surface-000', min: 4.5, use: 'The image and six lines disclosure on its panel' },
  // 1h. The footer's icon tooltip; the Tribe cards' compact element badge and the Keys cards.
  { fg: 'surface-000', bg: 'ink-900', min: 4.5, use: "An icon's name in its tooltip (footer)" },
  { fg: 'ink-900', bg: 'surface-100', min: 4.5, use: 'Element badge on a Tribe card' },
  { fg: 'ink-900', bg: 'surface-200', min: 3, use: "Dawa's Sun and Moon glyphs on a Keys card (graphic)" },
  { fg: 'ink-700', bg: 'surface-200', min: 4.5, use: 'A key gloss on a Keys card' },
];

export const pairApplies = (pair: ColorPair, theme: Theme): boolean =>
  !pair.moods || pair.moods.includes(theme);
