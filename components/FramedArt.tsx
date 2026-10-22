import type { FramedId } from '@/lib/art';
import { framed, srcSets } from '@/lib/art-assets';
import { cn } from '@/lib/cn';

interface FramedArtProps {
  id: FramedId;
  /** The CSS width it renders at, for the browser's pick from the srcset. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Load it with the page instead of on scroll. */
  eager?: boolean;
}

/**
 * One of Jane Kwan's pieces as the subject: full strength, whole (never cropped past the manifest),
 * no wider than half its pixels so it stays sharp at 2x. No caption under it: her credit lives in the
 * footer and in What stays true (David, Sep 25; 1h). Not governed by the wash setting and not hidden
 * by None.
 */
export function FramedArt({ id, sizes, className, imgClassName, eager = false }: FramedArtProps) {
  const piece = framed(id);
  const set = srcSets(id);
  return (
    <picture className={cn('block', className)} style={{ maxWidth: piece.maxCssWidth }}>
      <source type="image/avif" srcSet={set.avif} sizes={sizes} />
      <source type="image/webp" srcSet={set.webp} sizes={sizes} />
      <img
        src={set.fallback}
        alt={piece.alt}
        width={set.width}
        height={set.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('block h-auto w-full rounded-sm', imgClassName)}
      />
    </picture>
  );
}
