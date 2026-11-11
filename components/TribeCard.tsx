import { LIFT } from '@/lib/motion';
import Link from 'next/link';
import { SIGNS, signDates, type SignId } from '@/lib/keys';
import { tribePaintingSet } from '@/lib/tribe-paintings';
import { ElementDisc, TribeBadge } from './TribeBadge';

/** The cards' widths: two a row on a phone, up to four on a wide screen. */
const TRIBE_CARD_SIZES = '(width >= 75rem) 18rem, (width >= 64rem) 22rem, 50vw';

const ELEMENT_NAME = { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' } as const;

interface TribeCardProps {
  sign: SignId;
  /** Draw the glyph from the page's own sprite (`SignGlyphSprite`), on a page that renders one. */
  sprite?: boolean;
}

/**
 * One of the 12 Tribes: Kirstie Connon's painting of the sign on top (David, Nov 4: her paintings
 * belong to the Tribes, the ink landscapes to the backgrounds), square so her glyph and signature stay whole,
 * then the name and dates, with the glyph above the element badge on the right from 40rem, stacked
 * under them on a phone. The image is decorative here (the link names the sign) and lazy; the list
 * that holds the cards carries her credit. No text touches the image.
 */
export function TribeCard({ sign, sprite = false }: TribeCardProps) {
  const def = SIGNS[sign];
  const dates = signDates(sign);
  const element = ELEMENT_NAME[def.element];
  const set = tribePaintingSet(sign);
  return (
    <Link
      href={`/tribes/${sign}`}
      aria-label={`${def.name}, ${element.toLowerCase()} sign, ${dates}`}
      className={`group flex h-full flex-col overflow-hidden rounded-md border border-ink-200 bg-surface-200 no-underline shadow-rest ${LIFT}`}
    >
      <picture className="block">
        <source type="image/avif" srcSet={set.avif} sizes={TRIBE_CARD_SIZES} />
        <source type="image/webp" srcSet={set.webp} sizes={TRIBE_CARD_SIZES} />
        <img
          src={set.fallback}
          alt=""
          width={set.size}
          height={set.size}
          loading="lazy"
          decoding="async"
          className="block aspect-square h-auto w-full"
        />
      </picture>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="type-heading-3 text-cobalt-600 underline-offset-4 group-hover:underline">{def.name}</h3>
          <p className="mt-1 type-data-sm whitespace-nowrap text-ink-500">{dates}</p>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          {/* The glyph lifts with the card, as the hero wheel's glyphs do (micro motion, Nov 11). */}
          <ElementDisc
            sign={sign}
            element={def.element}
            sprite={sprite}
            className="transition-[scale] duration-200 motion-safe:group-hover:scale-[1.08]"
          />
          <TribeBadge sign={sign} element={def.element} label={element} glyph={false} compact />
        </div>
      </div>
    </Link>
  );
}
