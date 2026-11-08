import type { CSSProperties, ReactNode } from 'react';
import skyFiles from '@/public/sky-images/credits.json';
import type { FramedId } from '@/lib/art';
import { framed, srcSets } from '@/lib/art-assets';
import { cn } from '@/lib/cn';
import { SKY } from '@/lib/sky';

interface TintPanelProps {
  children: ReactNode;
  className?: string;
  /**
   * A painted edge: a framed piece at full strength in the panel's empty side (a band on top on a
   * phone), with no text over it. No caption: the painters' credit lives in the footer (1h).
   */
  art?: FramedId;
  /**
   * A sky edge instead (David, Nov 4, on the landing's next step): a telescope image in a night-900
   * window on the same side, at its manifest strength scaled by the visitor's wash, never under text,
   * credited in the footer like the art (David, Nov 4). None hides the image.
   */
  sky?: keyof typeof skyFiles.images;
}

/** The pale surface-200 panel that holds a page's next step. */
export function TintPanel({ children, className, art, sky }: TintPanelProps) {
  if (sky) {
    const image = skyFiles.images[sky];
    const files = Object.values(image.files) as Array<{ src: string; width: number; height: number }>;
    const file = files.reduce((a, b) => (b.width > a.width ? b : a));
    return (
      <div
        className={cn(
          'grid overflow-hidden rounded-[12px] border border-ink-200 bg-surface-200 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]',
          className,
        )}
      >
        <div className="panel-sky-window relative order-first h-40 md:order-last md:h-auto md:min-h-64">
          {/* WebP cuts by scripts/ink-sky.mjs; lazy like the Keys cards' images. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.src}
            srcSet={files.map((f) => `${f.src} ${f.width}w`).join(', ')}
            sizes="(width >= 48rem) 24rem, 100vw"
            width={file.width}
            height={file.height}
            alt={SKY[sky].alt}
            loading="lazy"
            decoding="async"
            className="panel-sky absolute inset-0 size-full object-cover"
            style={{ '--sky-strength': image.strength } as CSSProperties}
          />
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    );
  }
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
        {/* The picture fills the side without setting its height (4l, Nov 8): since the ink landscapes came in
            (4i), several are tall scrolls, and a tall image stretched the panel far past its words. */}
        <picture className="relative block h-28 md:h-auto md:min-h-48 md:flex-1">
          <source type="image/avif" srcSet={set.avif} sizes="(width >= 48rem) 24rem, 100vw" />
          <source type="image/webp" srcSet={set.webp} sizes="(width >= 48rem) 24rem, 100vw" />
          <img
            src={set.fallback}
            alt={piece.alt}
            width={set.width}
            height={set.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </picture>
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
}
