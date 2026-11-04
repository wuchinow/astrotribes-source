import type { SignId } from '@/lib/keys';
import { TRIBE_PAINTINGS, tribePaintingSet } from '@/lib/tribe-paintings';
import { cn } from '@/lib/cn';

interface TribePaintingProps {
  sign: SignId;
  /** The CSS width it renders at, for the browser's pick from the srcset. */
  sizes: string;
  className?: string;
  /** In the first screen (a Tribe page's hero): loaded at once, not lazily. */
  priority?: boolean;
}

/**
 * Kirstie Connon's painting for one Tribe, framed as the subject: whole, full strength, never hidden
 * by None, lazy-loaded unless it is in the first screen, never wider than its own pixels at 2x. Her
 * credit lives in the footer only, like Jane's, not under each image (David, Nov 4).
 */
export function TribePainting({ sign, sizes, className, priority = false }: TribePaintingProps) {
  const painting = TRIBE_PAINTINGS[sign];
  const set = tribePaintingSet(sign);
  return (
    <figure className={cn('w-full', className)} style={{ maxWidth: `${set.size / 2}px` }}>
      <picture className="block">
        <source type="image/avif" srcSet={set.avif} sizes={sizes} />
        <source type="image/webp" srcSet={set.webp} sizes={sizes} />
        <img
          src={set.fallback}
          alt={painting.alt}
          width={set.size}
          height={set.size}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          className="block aspect-square h-auto w-full rounded-md border border-ink-200 shadow-rest"
        />
      </picture>
    </figure>
  );
}
