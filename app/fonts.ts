import { Fraunces, IBM_Plex_Mono, Nunito_Sans } from 'next/font/google';

// next/font downloads these at build time and serves them from this site's own
// origin: no visitor's browser ever calls Google.

/** Display: variable weight (400 to 600 in use) with the opsz and SOFT axes. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces',
});

/** Body and UI. latin-ext covers names and birthplaces with diacritics. */
export const nunitoSans = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-nunito-sans',
});

/** Degrees, dates, and counts. Not needed for first paint, so not preloaded. */
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-plex-mono',
});
