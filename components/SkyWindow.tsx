import type { CSSProperties } from 'react';
import skyFiles from '@/public/sky-images/credits.json';
import { cn } from '@/lib/cn';
import { SKY } from '@/lib/sky';

export type SkyWindowId = keyof typeof skyFiles.images;

interface SkyWindowProps {
  sky: SkyWindowId;
  /** The window's shape, as a Tailwind aspect class. */
  aspect?: string;
  /** The figure's size and place. */
  className?: string;
  /** Load it with the page (a hero) instead of on scroll. */
  eager?: boolean;
  /** How wide it shows, for the browser's pick among the cuts. */
  sizes?: string;
}

/**
 * One telescope image as a picture of its own (David, Nov 4: the Today's sky hero, the 28 Keys page):
 * a night-900 window, the image at its manifest strength scaled by the visitor's wash, no text on
 * it, and its credit as a caption under it. None hides the image and the credit; the window stays as
 * plain night. Every cut by scripts/ink-sky.mjs in a srcset, so a phone takes the small one and a wide screen the sharp one.
 */
export function SkyWindow({ sky, aspect = 'aspect-video', className, eager = false, sizes = '100vw' }: SkyWindowProps) {
  const image = skyFiles.images[sky];
  const files = Object.values(image.files) as Array<{ src: string; width: number; height: number }>;
  const file = files.reduce((a, b) => (b.width > a.width ? b : a));
  return (
    <figure className={cn('w-full', className)}>
      <div className={cn('panel-sky-window relative overflow-hidden rounded-md border border-ink-200 shadow-rest', aspect)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.src}
          srcSet={files.map((f) => `${f.src} ${f.width}w`).join(', ')}
          sizes={sizes}
          width={file.width}
          height={file.height}
          alt={SKY[sky].alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="panel-sky block size-full object-cover"
          style={{ '--sky-strength': image.strength } as CSSProperties}
        />
      </div>
      <figcaption className="panel-sky-credit mt-3 type-caption text-ink-500">Image: {image.credit}</figcaption>
    </figure>
  );
}
