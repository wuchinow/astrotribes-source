import skyFiles from '@/public/sky-images/credits.json';
import { SKY_PAGES } from '@/lib/sky';

// PLACEHOLDER: our words around NASA's credit lines, until Dawa's copy replaces them.
export const skyCreditCopy = {
  one: (credit: string) => `Space photo: ${credit}.`,
  many: (credits: string) => `Space photos: ${credits}.`,
};

/** The footer's credit line for each page with telescope images, each credit once, in page order. */
export function skyCreditLines(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(SKY_PAGES).map(([path, ids]) => {
      const credits = [...new Set(ids.map((id) => skyFiles.images[id].credit))];
      return [path, credits.length === 1 ? skyCreditCopy.one(credits[0]) : skyCreditCopy.many(credits.join('; '))];
    }),
  );
}
