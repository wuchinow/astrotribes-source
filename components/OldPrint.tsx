import { oldPrintSet } from '@/lib/old-prints';
import { cn } from '@/lib/cn';

interface OldPrintProps {
  /** The cut's id in lib/old-prints-files.json: `plate-<sign>` or `cartoon-<id>`. */
  id: string;
  alt: string;
  /** The CSS width it renders at, for the browser's pick from the srcset. */
  sizes: string;
  className?: string;
}

/**
 * One of the Tribe pages' old prints (lib/old-prints.ts), framed as a picture of its own: whole, full
 * strength, never hidden by None, lazy-loaded, never wider than its own pixels at 2x. Credited in the
 * footer only (David, Nov 4).
 */
export function OldPrint({ id, alt, sizes, className }: OldPrintProps) {
  const set = oldPrintSet(id);
  return (
    <figure className={cn('w-full', className)} style={{ maxWidth: `${set.width / 2}px` }}>
      <picture className="block">
        <source type="image/avif" srcSet={set.avif} sizes={sizes} />
        <source type="image/webp" srcSet={set.webp} sizes={sizes} />
        <img
          src={set.fallback}
          alt={alt}
          width={set.width}
          height={set.height}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-md border border-ink-200 shadow-rest"
        />
      </picture>
    </figure>
  );
}
