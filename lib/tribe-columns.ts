/**
 * Where the star card and "Did you know?" stand in a Tribe page's first section (5f; David, Nov 11:
 * "some white space here").
 *
 * The section is two columns from lg: Dawa's hello and story at the left, the facts at the right.
 * His words run from six lines to forty, so with the star card and the "Did you know?" lines always
 * under the facts, the right column ended up to 750px below the left one, or 200px above it. Nothing
 * in CSS can even that out, so the page decides per Tribe, from the words themselves: each of the two
 * blocks stands under the facts or in a row of its own below both columns, and a star card under the
 * facts takes the width that brings the columns' ends closest.
 *
 * The heights are estimates in CSS pixels, from the type sizes and how many characters fit a line at
 * each column's width (measured on the rendered pages, Nov 11: within two lines per Tribe). The left
 * column is 624px wide from 1168px up and 528px at 1024px, so the pick weighs both. Pure: no DOM.
 */

export type PlateWidth = 24 | 20 | 16 | 14 | 12;

export interface HelloColumnsInput {
  hello: string;
  story: readonly string[];
  /** Each fact's label and value; `lead` is a short line of its own above the value (the ruling planet's name). */
  facts: readonly { label: string; value: string; lead?: string }[];
  didYouKnow: readonly string[];
  caption: string;
  /** The star card's pixel size. */
  plate: readonly [number, number];
}

export interface HelloColumns {
  /** The star card under the facts at this width in rem; small beside its own words there; or in the row below. */
  plate: PlateWidth | 'beside' | 'foot';
  didYouKnow: 'right' | 'foot' | 'none';
}

const REM = 16;
const GAP = 40;
/** Characters per line: Dawa's hello and story at the wide and the narrow left column; the right column never changes. */
const PER_LINE = { wide: { hello: 44, story: 76 }, narrow: { hello: 37, story: 64 }, fact: 30, didYouKnow: 51.5, caption: 50.5, captionBeside: 29 };
/** The star card's width in rem when it stands beside its words. */
export const PLATE_BESIDE = 9;
const LINE = { hello: 41.25, body: 28.8, small: 24, label: 18.2 };

const lines = (text: string, perLine: number) => Math.max(1, Math.ceil(text.length / perLine));

function leftHeight(input: HelloColumnsInput, width: 'wide' | 'narrow') {
  const per = PER_LINE[width];
  const story = input.story.reduce((sum, paragraph) => sum + 12 + lines(paragraph, per.story) * LINE.body, 0);
  return 34 + lines(input.hello, per.hello) * LINE.hello + 40 + LINE.label + story;
}

function factsHeight(input: HelloColumnsInput) {
  return input.facts.reduce((sum, fact) => {
    const label = (fact.label.length > 13 ? 2 : 1) * LINE.label;
    const value = lines(fact.value, PER_LINE.fact) * LINE.small + (fact.lead ? LINE.small + 4 : 0);
    return sum + 25 + Math.max(label, value);
  }, 1);
}

function didYouKnowHeight(input: HelloColumnsInput) {
  if (input.didYouKnow.length === 0) return 0;
  return input.didYouKnow.reduce((sum, fact) => sum + lines(fact, PER_LINE.didYouKnow) * LINE.small, LINE.label + 8) + 12 * (input.didYouKnow.length - 1);
}

function plateHeight(input: HelloColumnsInput, width: PlateWidth | 'beside') {
  const [w, h] = input.plate;
  const words = (perLine: number) => LINE.label + 8 + lines(input.caption, perLine) * LINE.small;
  if (width === 'beside') return Math.max((PLATE_BESIDE * REM * h) / w + 2, words(PER_LINE.captionBeside));
  return words(PER_LINE.caption) + 16 + (width * REM * h) / w + 2;
}

/** How far the left column ends below the right one (negative: above), at the wide and the narrow layout. */
export function helloColumnsGap(input: HelloColumnsInput, layout: HelloColumns) {
  let right = factsHeight(input);
  if (layout.didYouKnow === 'right') right += GAP + didYouKnowHeight(input);
  if (layout.plate !== 'foot') right += GAP + plateHeight(input, layout.plate);
  return { wide: leftHeight(input, 'wide') - right, narrow: leftHeight(input, 'narrow') - right };
}

const WIDTHS: readonly PlateWidth[] = [24, 20, 16, 14, 12];

export function helloColumns(input: HelloColumnsInput): HelloColumns {
  const portrait = input.plate[1] > input.plate[0];
  // A landscape card stays readable down to 14rem; a portrait one is tall, so it may go to 12rem.
  // Beside its words the card is 9rem wide: a portrait card still reads at that size, a landscape one does not.
  const plates: readonly HelloColumns['plate'][] = [...WIDTHS.filter((w) => portrait || w >= 14), ...(portrait ? (['beside'] as const) : []), 'foot'];
  const facts: readonly HelloColumns['didYouKnow'][] = input.didYouKnow.length > 0 ? ['right', 'foot'] : ['none'];
  let best: { layout: HelloColumns; cost: number } | undefined;
  for (const plate of plates) {
    for (const didYouKnow of facts) {
      const layout = { plate, didYouKnow };
      const gap = helloColumnsGap(input, layout);
      // Most windows are wide, so the wide layout counts in full and the narrowest at half; then a
      // small lean toward the simpler page: both blocks under the facts, and the card at its full size.
      const cost =
        Math.max(Math.abs(gap.wide), Math.abs(gap.narrow) / 2) +
        (plate === 'foot' ? 24 : plate === 'beside' ? 30 : (24 - plate) * 2) +
        (didYouKnow === 'foot' ? 24 : 0);
      if (!best || cost < best.cost) best = { layout, cost };
    }
  }
  return best!.layout;
}
