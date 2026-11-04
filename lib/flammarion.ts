// The Flammarion engraving (David, Nov 4): from Camille Flammarion's L'atmosphère: météorologie
// populaire (Paris, 1888), artist unknown; the 1888 engraving is in the public domain. This copy is
// a later hand coloring whose colorist is not yet confirmed (`sourceConfirmed: false`); confirm it,
// or swap in the black and white original, before launch. Cut by scripts/flammarion.mjs.
import files from './flammarion-files.json';

export const FLAMMARION = {
  alt: 'An old engraving: a traveler kneels at the edge of the starry sky and pushes his head through it, to see the wheels and fires beyond',
  credit: 'The Flammarion engraving, 1888, artist unknown, with later hand coloring',
  sourceConfirmed: false,
  width: files.width,
  height: files.height,
} as const;

type Cut = Record<'avif' | 'webp', { src: string; bytes: number }>;
const cuts = Object.entries(files.files as Record<string, Cut>);

export const flammarionSet = {
  avif: cuts.map(([w, f]) => `${f.avif.src} ${w}w`).join(', '),
  webp: cuts.map(([w, f]) => `${f.webp.src} ${w}w`).join(', '),
  fallback: cuts[0][1].webp.src,
};
