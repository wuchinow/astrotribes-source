// The web files for each piece (lib/art-files.json, written by scripts/art.mjs) turned into what the
// pages need: the wash CSS, srcsets for framed pieces, and CSS image sets for strips and swatches.

import files from './art-files.json';
import {
  ART,
  FRAMED,
  TEXTURE_CROPS,
  WASHES,
  WASH_IDS,
  cutIsFree,
  type ArtId,
  type FramedId,
  type TextureCrop,
  type WashId,
  type WashPiece,
} from './art';

interface WebFile {
  h: number;
  avif: { src: string; bytes: number };
  webp: { src: string; bytes: number };
}
interface CutFiles {
  ratio: number;
  files: Record<string, WebFile>;
}

const FILES = files as unknown as Record<ArtId, Record<string, CutFiles>>;

export function cutFiles(id: ArtId, cut: string): CutFiles {
  const entry = FILES[id]?.[cut];
  if (!entry) throw new Error(`No web files for ${id} ${cut}: run node scripts/art.mjs`);
  return entry;
}

const widthsOf = (entry: CutFiles) =>
  Object.keys(entry.files)
    .map(Number)
    .sort((a, b) => a - b);

/** The file for a width: the narrowest at least that wide, else the widest there is. */
function fileFor(entry: CutFiles, width: number): { width: number; file: WebFile } {
  const widths = widthsOf(entry);
  const pick = widths.find((w) => w >= width) ?? widths[widths.length - 1];
  return { width: pick, file: entry.files[pick] };
}

/** A CSS image-set, AVIF first, WebP as the fallback the browser takes when it cannot read AVIF. */
export function imageSet(id: ArtId, cut: string, width: number): string {
  const { file } = fileFor(cutFiles(id, cut), width);
  return `image-set(url("${file.avif.src}") type("image/avif"), url("${file.webp.src}") type("image/webp"))`;
}

/** srcSet strings for a <picture>, one per format. */
export function srcSets(id: ArtId, cut = 'crop') {
  const entry = cutFiles(id, cut);
  const widths = widthsOf(entry).filter((w) => w > 160);
  const list = (format: 'avif' | 'webp') => widths.map((w) => `${entry.files[w][format].src} ${w}w`).join(', ');
  const widest = entry.files[widths[widths.length - 1]];
  return {
    avif: list('avif'),
    webp: list('webp'),
    fallback: widest.webp.src,
    width: widths[widths.length - 1],
    height: widest.h,
  };
}

/** The 160px swatch for the Appearance panel. */
export function swatch(id: WashId) {
  const piece = WASHES[id] as WashPiece;
  const file = cutFiles(id, piece.use.thumb).files[160];
  return { avif: file.avif.src, webp: file.webp.src, width: 160, height: file.h };
}

/** The washes as the Appearance panel offers them, in its order. */
export const swatchList = () =>
  WASH_IDS.map((id) => ({ id, name: WASHES[id].name, alt: WASHES[id].alt, ...swatch(id) }));

export const framed = (id: FramedId) => FRAMED[id];

/**
 * How a wash cut fills its region. A cut with no mark inside may be cropped by `cover`. A cut that
 * holds a seal or signature is laid across the full width and never cropped: the region grows to
 * at least the image's height, and the image fades out at its foot if the region runs longer.
 */
function fill(id: WashId, cut: string, width: number) {
  const piece = WASHES[id] as WashPiece;
  const box = piece.cuts[cut as keyof WashPiece['cuts']]!.box;
  const entry = cutFiles(id, cut);
  if (cutIsFree(piece, box)) {
    return { image: imageSet(id, cut, width), size: 'cover', pos: 'center', h: '0px', mask: 'none' };
  }
  const h = `calc(100vw / ${entry.ratio})`;
  return {
    image: imageSet(id, cut, width),
    size: '100% auto',
    pos: 'center top',
    h,
    mask: `linear-gradient(to bottom, #000 calc(${h} * 0.8), transparent ${h})`,
  };
}

/** The custom properties that paint one piece into a wash region, a card strip, or a texture. */
function washVars(id: WashId): string {
  const piece = WASHES[id] as WashPiece;
  const sm = fill(id, piece.use.sm, 720);
  const lg = fill(id, piece.use.lg, 1440);
  const strip = imageSet(id, piece.use.strip, 720);
  // The texture cut holds no mark, so it is laid with cover and zoomed. At the widths the hero uses,
  // a texture of the page's own painting loads the very same files.
  const textureSm = imageSet(id, piece.use.texture, 720);
  const textureLg = imageSet(id, piece.use.texture, 1440);
  return `--wash-sm:${sm.image};--wash-sm-size:${sm.size};--wash-sm-pos:${sm.pos};--wash-sm-h:${sm.h};--wash-sm-mask:${sm.mask};--wash-lg:${lg.image};--wash-lg-size:${lg.size};--wash-lg-pos:${lg.pos};--wash-lg-h:${lg.h};--wash-lg-mask:${lg.mask};--wash-strip:${strip};--texture-sm:${textureSm};--texture-lg:${textureLg}`;
}

/**
 * The wash CSS: one rule per wash, matched by a region's own piece (data-wash) or by the visitor's
 * pick on <html data-art>, which wins. A piece with a Night alternate (lib/art.ts, `night`) swaps to
 * it on Night only while the visitor keeps each page's own painting. Then the texture crops. Rendered
 * once in the root layout's head.
 */
export function washCss(): string {
  const ids = Object.keys(WASHES) as WashId[];
  const pieces = ids.map((id) => `[data-wash="${id}"],html[data-art="${id}"] [data-wash]{${washVars(id)}}`);
  const night = ids.flatMap((id) => {
    const alt = (WASHES[id] as WashPiece).night;
    return alt ? [`html[data-theme="night"][data-art="page"] [data-wash="${id}"]{${washVars(alt)}}`] : [];
  });
  const crops = (Object.keys(TEXTURE_CROPS) as TextureCrop[]).map((crop) => {
    const { scale, origin } = TEXTURE_CROPS[crop];
    return `.texture-layer[data-crop="${crop}"]{transform:scale(${scale});transform-origin:${origin[0]}% ${origin[1]}%}`;
  });
  return [...pieces, ...night, ...crops].join('\n');
}

/** Every piece id, for tests. */
export const ALL_ART_IDS = Object.keys(ART) as ArtId[];
