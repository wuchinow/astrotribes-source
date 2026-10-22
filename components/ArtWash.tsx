import type { ReactNode } from 'react';
import type { WashId } from '@/lib/art';
import { cn } from '@/lib/cn';

interface ArtWashProps {
  children: ReactNode;
  /** The region's own painting. A visitor's pick in the Appearance panel replaces it; None hides it. */
  piece: WashId;
  /** A page wash at the visitor's strength, or a section wash at half of it. */
  kind?: 'page' | 'section';
  /** The wash opens the page, under the nav: add the soft fade that keeps the nav at AA. */
  top?: boolean;
  className?: string;
}

/**
 * One of Jane Kwan's washes as wallpaper behind a page or section. It is a CSS background chosen by
 * the region's data-wash and the visitor's data-art on <html> (lib/art-assets.ts), so a pre-built
 * page shows the right painting before first paint and None downloads nothing. Text goes on a
 * frosted panel, never on the art. As wallpaper, it is credited in the footer.
 */
export function ArtWash({ children, piece, kind = 'page', top = false, className }: ArtWashProps) {
  return (
    <div data-wash={piece} data-wash-kind={kind} className={cn('wash-region', top && 'hero-top', className)}>
      <div className="wash-layer" aria-hidden="true" />
      {children}
    </div>
  );
}
