import type { SignId } from '@/lib/keys';
import { TRIBE_PAINTINGS, TRIBE_PAINTING_CREDIT, TRIBE_PAINTING_YEAR, tribePaintingSet } from '@/lib/tribe-paintings';
import { cn } from '@/lib/cn';

interface TribePaintingProps {
  sign: SignId;
  /** The CSS width it renders at, for the browser's pick from the srcset. */
  sizes: string;
  className?: string;
}

/**
 * Kirstie Connon's painting for one Tribe, framed as the subject: whole, full strength, never hidden
 * by None, lazy-loaded, and credited under the image, because it is the subject (the art rule). Never
 * wider than its own pixels at 2x.
 */
export function TribePainting({ sign, sizes, className }: TribePaintingProps) {
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
          loading="lazy"
          decoding="async"
          className="block aspect-square h-auto w-full rounded-md border border-ink-200 shadow-rest"
        />
      </picture>
      <figcaption className="mt-3 type-caption text-ink-500">
        Painting by {TRIBE_PAINTING_CREDIT}, {TRIBE_PAINTING_YEAR}
      </figcaption>
    </figure>
  );
}
