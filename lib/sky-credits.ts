import { FLAMMARION } from '@/lib/flammarion';
import { SIGN_IDS } from '@/lib/keys';
import { SKY_PAGES } from '@/lib/sky';
import { zodiacJadeCredit } from '@/lib/zodiac-jade';

// PLACEHOLDER: our words, until Dawa's copy replaces them. The footer says only NASA (David, Nov 4:
// "simplify space photo creds"): every telescope image is a NASA release, not copyrighted (the sky test
// holds that), so no licence asks for more. Each image's full credit stays in lib/sky.ts and
// public/sky-images/credits.json.
export const skyCreditCopy = {
  one: 'Space photo: NASA.',
  many: 'Space photos: NASA.',
};

/** The footer's credit line for each page with telescope images: one image or several. */
export function skyCreditLines(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(SKY_PAGES).map(([path, ids]) => [path, ids.length === 1 ? skyCreditCopy.one : skyCreditCopy.many]),
  );
}

/** The Tribe pages' star card and engraving. */
const plateCredit = 'Star card from Urania’s Mirror, London, 1824.';
const cartoonCredit = 'Engraving by J. J. Grandville, from Un autre monde, Paris, 1844.';
const oldPrintsCredit = `${plateCredit} ${cartoonCredit}`;

/**
 * The Flammarion engraving's credit, in the footer of the landing page that shows it (David, Nov 4:
 * nothing under the picture). It is a framed picture, not a wash, so None never hides its line.
 */
export const pictureCreditLines: Readonly<Record<string, string>> = {
  '/': `${FLAMMARION.credit}.`,
  // The Tribe pages' old prints (4j, lib/old-prints.ts), both public domain.
  ...Object.fromEntries(SIGN_IDS.map((sign) => [`/tribes/${sign}`, oldPrintsCredit])),
  // The Clan pages' Grandville Moon and the Vibe pages' star cards, as backdrops (4m, David, Nov 9).
  ...Object.fromEntries(SIGN_IDS.map((sign) => [`/clans/${sign}`, cartoonCredit])),
  ...Object.fromEntries(SIGN_IDS.map((sign) => [`/vibes/${sign}`, plateCredit])),
  // Your chart (4o, Nov 9): the Sun's star card, the planets' cards in the gaps, and a Grandville engraving;
  // since 4p the member's Chinese zodiac animal, one of the Met's jade figures.
  '/your-chart': `${oldPrintsCredit} ${zodiacJadeCredit}`,
  // The old prints trial page (4m, previews only).
  '/trials/old-prints': oldPrintsCredit,
};
