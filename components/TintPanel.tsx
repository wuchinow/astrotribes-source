import type { ReactNode } from 'react';
import type { FramedId } from '@/lib/art';
import { framed, srcSets } from '@/lib/art-assets';
import { cn } from '@/lib/cn';

interface TintPanelProps {
  children: ReactNode;
  className?: string;
  /**
   * A painted edge: a framed piece at full strength in the panel's empty side (a band on top on a
   * phone), with no text over it. No caption: Jane's credit lives in the footer (1h).
   */
  art?: FramedId;
}

/** The pale surface-200 panel that holds a page's next step. */
export function TintPanel({ children, className, art }: TintPanelProps) {
  if (!art) {
    return (
      <div className={cn('rounded-[12px] border border-ink-200 bg-surface-200 p-6 md:p-8', className)}>{children}</div>
    );
  }
  const piece = framed(art);
  const set = srcSets(art);
  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-[12px] border border-ink-200 bg-surface-200 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]',
        className,
      )}
    >
      <div className="order-first flex flex-col md:order-last md:border-l md:border-ink-200">
        <picture className="block h-28 md:h-auto md:min-h-0 md:flex-1">
          <source type="image/avif" srcSet={set.avif} sizes="(width >= 48rem) 24rem, 100vw" />
          <source type="image/webp" srcSet={set.webp} sizes="(width >= 48rem) 24rem, 100vw" />
          <img
            src={set.fallback}
            alt={piece.alt}
            width={set.width}
            height={set.height}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </picture>
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
}
