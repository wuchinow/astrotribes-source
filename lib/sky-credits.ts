import { FLAMMARION } from '@/lib/flammarion';
import { SIGN_IDS } from '@/lib/keys';
import { SKY_PAGES } from '@/lib/sky';

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
const oldPrintsCredit =
  'Star card from Urania’s Mirror, London, 1824. Engraving by J. J. Grandville, from Un autre monde, Paris, 1844.';

/**
 * The Flammarion engraving's credit, in the footer of the landing page that shows it (David, Nov 4:
 * nothing under the picture). It is a framed picture, not a wash, so None never hides its line.
 */
export const pictureCreditLines: Readonly<Record<string, string>> = {
  '/': `${FLAMMARION.credit}.`,
  // The Tribe pages' old prints (4j, lib/old-prints.ts), both public domain.
  ...Object.fromEntries(SIGN_IDS.map((sign) => [`/tribes/${sign}`, oldPrintsCredit])),
};
