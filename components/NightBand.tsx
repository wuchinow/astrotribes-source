import type { ReactNode } from 'react';
import type { FramedId } from '@/lib/art';
import { cn } from '@/lib/cn';
import { FramedArt } from './FramedArt';

export interface BandItem {
  title: string;
  body: ReactNode;
}

interface NightBandProps {
  id?: string;
  eyebrow: string;
  title: string;
  items: readonly BandItem[];
  /** A framed piece beside the heading and grid, at full strength. */
  art?: FramedId;
}

/**
 * The page's one night-900 band, for the thing worth remembering, with a 2 by 2 grid. A framed piece
 * sits beside the heading from md, spanning from the eyebrow down, so the band stays short (1h).
 */
export function NightBand({ id, eyebrow, title, items, art }: NightBandProps) {
  return (
    // On Night the band sits close to the page color, so it takes an ink-200 hairline (v3.2).
    <div
      className={cn(
        'rounded-[12px] bg-night-900 px-6 py-8 text-on-night night:border night:border-ink-200 md:px-10 md:py-10',
        art && 'grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start',
      )}
    >
      <div>
        <p className="mb-4 type-label text-on-night-soft">{eyebrow}</p>
        <h2
          id={id}
          className="mb-6 font-display text-[1.875rem] leading-tight font-normal tracking-[-0.015em] text-on-night"
        >
          {title}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.title}>
              <h3 className="font-body text-[1rem] font-semibold text-on-night">{item.title}</h3>
              <p className="mt-1 type-body-sm text-on-night-soft">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
      {art ? <FramedArt id={art} sizes="16rem" className="w-full max-md:max-w-[16rem]" /> : null}
    </div>
  );
}
