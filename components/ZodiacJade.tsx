import type { ChineseSign } from '@/lib/chinese-zodiac';
import { ZODIAC_JADE, zodiacJadeSet } from '@/lib/zodiac-jade';
import { cn } from '@/lib/cn';

interface ZodiacJadeProps {
  animal: ChineseSign['animal'];
  /** The CSS width it renders at, for the browser's pick from the srcset. */
  sizes: string;
  className?: string;
}

/**
 * One of the Met's jade zodiac animals (lib/zodiac-jade.ts), cut out on a transparent ground so it
 * stands on the page itself in both moods: whole, full strength, never hidden by None, lazy-loaded,
 * never wider than its own pixels at 2x. Credited in the footer only (David, Nov 4).
 */
export function ZodiacJade({ animal, sizes, className }: ZodiacJadeProps) {
  const set = zodiacJadeSet(animal);
  return (
    <picture className={cn('block w-full', className)} style={{ maxWidth: `${set.width / 2}px` }}>
      <source type="image/avif" srcSet={set.avif} sizes={sizes} />
      <source type="image/webp" srcSet={set.webp} sizes={sizes} />
      <img
        src={set.fallback}
        alt={ZODIAC_JADE[animal].alt}
        width={set.width}
        height={set.height}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full drop-shadow-[0_10px_14px_rgba(30,26,23,0.22)]"
      />
    </picture>
  );
}

/** The animal's character, large, in the zodiac font (the page loads it as --font-zodiac). */
export function ZodiacHanzi({ animal, className }: { animal: ChineseSign['animal']; className?: string }) {
  const { hanzi, pinyin } = ZODIAC_JADE[animal];
  return (
    <span aria-hidden="true" lang="zh-Hant" title={`${hanzi} (${pinyin})`} className={cn('zodiac-hanzi', className)}>
      {hanzi}
    </span>
  );
}
