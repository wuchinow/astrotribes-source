// One chart read in Keys, for the 28 Keys page (1m): Albert Einstein's, the engine's reference chart
// (a deceased historical figure's public birth record, outside invariant 8 by David's decision of
// Sep 24). Signs and houses only, never a degree. tests/keys-example.test.ts runs the engine on his
// birth record and checks every placement here against it, so this file cannot drift from the engine.

import type { BodyId, HouseNumber, SignId } from '@/lib/keys';

export interface ExamplePlacement {
  sign: SignId;
  /** Null for Rising: the rising sign is where house I begins, and it has no house key. */
  house: HouseNumber | null;
}

export const EXAMPLE_CHART = {
  name: 'Albert Einstein',
  /** As the reference test gives it: Ulm, local mean time, Rodden AA from the birth certificate. */
  birth: { date: '1879-03-14', time: '11:30', lat: 48 + 24 / 60, lon: 10 },
  born: 'Born in Ulm, Germany, on March 14, 1879, at 11:30 in the morning',
  // From Dawa's "Slogans and Such" (Drive), a line he wants placed around the site.
  quote: 'Imagination is more important than knowledge.',
  placements: {
    sun: { sign: 'pisces', house: 10 },
    moon: { sign: 'sagittarius', house: 6 },
    rising: { sign: 'cancer', house: null },
    mercury: { sign: 'aries', house: 10 },
    venus: { sign: 'aries', house: 10 },
    mars: { sign: 'capricorn', house: 7 },
    jupiter: { sign: 'aquarius', house: 9 },
    saturn: { sign: 'aries', house: 10 },
    uranus: { sign: 'virgo', house: 3 },
    neptune: { sign: 'taurus', house: 11 },
    pluto: { sign: 'taurus', house: 11 },
    northNode: { sign: 'aquarius', house: 8 },
    southNode: { sign: 'leo', house: 2 },
    chiron: { sign: 'taurus', house: 11 },
    galacticCenter: { sign: 'sagittarius', house: 6 },
  } satisfies Record<BodyId, ExamplePlacement>,
};
