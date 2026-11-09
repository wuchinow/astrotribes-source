import { FLAMMARION } from '@/lib/flammarion';
import { zodiacJadeCredit } from '@/lib/zodiac-jade';

// PLACEHOLDER: our words, until Dawa's copy replaces them. The footer says only NASA (David, Nov 4:
// "simplify space photo creds"): every telescope image is a NASA release, not copyrighted (the sky test
// holds that), so no licence asks for more. Each image's full credit stays in lib/sky.ts and
// public/sky-images/credits.json.

// One credits block, the same on every page (David, Nov 9: "all attributions should appear in a footer
// that is the same for all pages"), one kind to a line (4q): the people who made art for AstroTribes,
// then the old public domain works, then the telescope images. Before that the footer named only what
// each page showed; SKY_PAGES in lib/sky.ts still records which page shows which telescope image.
const inkCredit = 'ink landscapes from museum collections';
const plateCredit = 'Urania’s Mirror star cards (1824)';
const cartoonCredit = 'J. J. Grandville’s engravings (1844)';
const flammarionCredit = `the Flammarion engraving (${FLAMMARION.credit.replace('The Flammarion engraving, ', '')})`;

export const footerCredits = {
  people: 'Glyphs by Lama Dawa. Tribe paintings by Kirstie Connon.',
  publicDomain: `Public domain: ${[inkCredit, plateCredit, cartoonCredit, flammarionCredit, zodiacJadeCredit].join('; ')}.`,
  space: 'Space photos: NASA.',
} as const;
