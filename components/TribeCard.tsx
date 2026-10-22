import Link from 'next/link';
import type { CSSProperties } from 'react';
import { FRAMED, TRIBE_CROPS } from '@/lib/art';
import { SIGNS, signDates, type SignId } from '@/lib/keys';
import { ElementDisc, TribeBadge } from './TribeBadge';

const ELEMENT_NAME = { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' } as const;

/** Where a window [x, y, w, h] sits in P2's cut, as CSS background size and position (percentages). */
export function windowBoxStyle([x, y, w, h]: readonly [number, number, number, number]): CSSProperties {
  const [, , cutW, cutH] = FRAMED.p2.cuts.crop.box;
  return {
    backgroundSize: `${(cutW / w) * 100}% auto`,
    backgroundPosition: `${(x / (cutW - w)) * 100}% ${(y / (cutH - h)) * 100}%`,
  };
}

/** The card's own window of P2. */
const windowStyle = (sign: SignId): CSSProperties => windowBoxStyle(TRIBE_CROPS[sign]);

/**
 * One of the 12 Tribes (1h): the top half its own window of Jane's P2 (TRIBE_CROPS, until her sign
 * paintings), the bottom half the name and dates, with the glyph above the element badge on the
 * right from 40rem, stacked under them on a phone. The painting's image set comes from
 * .tribe-cards on the list. No text touches the image.
 */
export function TribeCard({ sign }: { sign: SignId }) {
  const def = SIGNS[sign];
  const dates = signDates(sign);
  const element = ELEMENT_NAME[def.element];
  return (
    <Link
      href={`/tribes/${sign}`}
      aria-label={`${def.name}, ${element.toLowerCase()} sign, ${dates}`}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-ink-200 bg-surface-200 no-underline shadow-rest transition-shadow duration-200 hover:shadow-warm"
    >
      <div aria-hidden="true" className="tribe-window aspect-[2/1]" style={windowStyle(sign)} />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="type-heading-3 text-cobalt-600 underline-offset-4 group-hover:underline">{def.name}</h3>
          <p className="mt-1 type-data-sm whitespace-nowrap text-ink-500">{dates}</p>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <ElementDisc sign={sign} element={def.element} />
          <TribeBadge sign={sign} element={def.element} label={element} glyph={false} compact />
        </div>
      </div>
    </Link>
  );
}
