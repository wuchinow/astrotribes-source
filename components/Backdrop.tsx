import type { CSSProperties } from 'react';
import skyFiles from '@/public/sky-images/credits.json';
import { BACKDROP_ART, type BackdropArtId } from '@/lib/art';
import { imageSet } from '@/lib/art-assets';
import { oldPrintSet, type OldPrintId } from '@/lib/old-prints';

export type BackdropSkyId = keyof typeof skyFiles.images;

/** Where a backdrop picture stands, and how it is cut into the section. */
interface Placement {
  side?: 'left' | 'right';
  /** Where the picture starts, as a share of the content width (from xl). */
  from?: number;
  /** Its CSS background position. */
  pos?: string;
  /** A band at the section's foot at every width, for a section whose text spans two columns. */
  foot?: true;
}

/**
 * A section's backdrop (4m, David, Nov 8): an ink landscape (`art`), a NASA photo (`sky`), an old print
 * (`print`: a Urania's Mirror star card or a Grandville engraving, David, Nov 9: "engraving beside words,
 * star card beside words ... all good"), or the soft gradient. The pictures stand beside the text from xl
 * and as a band at the section's foot below it, never under text (app/globals.css, .backdrop-layer).
 * Credited in the footer like every picture.
 */
export type Backdrop =
  | ({ art: BackdropArtId } & Placement)
  | ({ sky: BackdropSkyId } & Placement)
  | ({ print: OldPrintId } & Placement)
  | { gradient: true };

/** The CSS image for a backdrop picture at phone and desktop widths. */
export function backdropImages(backdrop: Exclude<Backdrop, { gradient: true }>): { sm: string; lg: string } {
  if ('print' in backdrop) {
    const url = `url("${oldPrintSet(backdrop.print).fallback}")`;
    return { sm: url, lg: url };
  }
  if ('art' in backdrop) {
    const cuts = BACKDROP_ART[backdrop.art];
    return { sm: imageSet(backdrop.art, cuts.sm, 720), lg: imageSet(backdrop.art, cuts.lg, 1440) };
  }
  const files = Object.values(skyFiles.images[backdrop.sky].files) as Array<{ src: string; width: number }>;
  const sorted = [...files].sort((a, b) => a.width - b.width);
  const small = sorted.find((f) => f.width >= 720) ?? sorted[sorted.length - 1];
  const large = sorted[sorted.length - 1];
  return { sm: `url("${small.src}")`, lg: `url("${large.src}")` };
}

/** The picture layer of a backdrop, inside a `.backdrop-region`. */
export function BackdropLayer({
  backdrop,
  reach,
}: {
  backdrop: Exclude<Backdrop, { gradient: true }>;
  /** `screen`: on a long page, the first screen only (from lg). */
  reach?: 'screen';
}) {
  const { sm, lg } = backdropImages(backdrop);
  const style = {
    '--bd-sm': sm,
    '--bd-lg': lg,
    ...(backdrop.from !== undefined ? { '--bd-from': backdrop.from } : {}),
    ...(backdrop.pos ? { '--bd-pos': backdrop.pos } : {}),
  } as CSSProperties;
  return (
    <div
      aria-hidden="true"
      data-kind={'sky' in backdrop ? 'sky' : 'art'}
      data-side={backdrop.side ?? 'right'}
      data-place={backdrop.foot ? 'foot' : undefined}
      data-reach={reach}
      className="backdrop-layer"
      style={style}
    />
  );
}
