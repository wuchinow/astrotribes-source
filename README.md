# AstroTribes: website source

This is the source code of the AstroTribes website (astrotribes.vercel.app). It is published because the
chart engine uses the [Swiss Ephemeris](https://www.astro.com/swisseph/) under the GNU Affero
General Public License, version 3. The code here is offered under the same licence: see `LICENSE`.

It is a copy of the code running on the live site, refreshed after each release. Changes are not
accepted here.

## What is not covered by the licence

The licence covers the code. These are all rights reserved, and are not included or licensed here:

- Jane Kwan's paintings, Dawa's glyphs, and the AstroTribes name, logo, and icons.
- The words of the site: the names and descriptions of the 28 Keys, and the site copy in `content/`
  and `lib/keys.ts`, which the code needs in order to run.

The tarot card images are scans of the 1909 Rider-Waite-Smith deck, which is in the public domain. The
sky images are from NASA, ESA, and partner observatories, each credited in `public/sky-images/credits.json`.
The I Ching text is James Legge's 1882 translation, and the tarot text is A. E. Waite's 1911
*Pictorial Key to the Tarot*. Both are in the public domain.

## Running it

Use Node 22 (`.nvmrc`), then run `npm install` and `npm run dev`. Without the art files, the pages run with
blank image areas. The environment variable names are in `.env.example`. No values are included.

Contact: weareastrotribes@gmail.com
