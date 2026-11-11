import Link from 'next/link';
import { cn } from '@/lib/cn';
import {
  KEYS,
  SIGNS,
  glossSentence,
  houseOf,
  type HouseNumber,
  type KeyId,
  type SignId,
} from '@/lib/keys';

interface KeyChipProps {
  /** Which key. The name and gloss come from lib/keys.ts, never from the caller. */
  keyId: KeyId;
  /** A sign for a sign key, a house number for a house key. */
  value?: SignId | HouseNumber;
  /** Show Dawa's gloss under the chip: do this the first time a key appears on a screen. */
  showGloss?: boolean;
  /** The gloss a size smaller and closer to the chip, for a short card (Your chart, 5c). */
  compact?: boolean;
  href?: string;
  className?: string;
}

export function KeyChip({ keyId, value, showGloss = false, compact = false, href, className }: KeyChipProps) {
  const key = KEYS[keyId];
  const isHouse = key.dimension === 'house';
  const valueText =
    value === undefined ? null : typeof value === 'number' ? houseOf(value).roman : SIGNS[value].name;
  const gloss = glossSentence(key);

  // A chip that links is cobalt (design system .at-chip). One that links nowhere
  // yet is a quiet paper pill with the name in ink (.at-chip-static), because
  // cobalt means clickable.
  const chipClasses = cn(
    // Dawa, Nov 7: Key names much larger everywhere. 20px on a phone, 22px from md (was 16px).
    'inline-flex min-h-11 items-baseline gap-2 rounded-pill border px-4 py-2 font-body text-[1.25rem] leading-[1.25] text-ink-900 no-underline md:text-[1.375rem]',
    href
      ? 'relative border-transparent bg-cobalt-100 transition-colors duration-200 hover:border-cobalt-400'
      : 'border-ink-200 bg-surface-200',
  );

  const content = (
    <>
      <span className={cn('font-semibold', href ? 'text-cobalt-600' : 'text-ink-900')}>{key.name}</span>
      {valueText ? (
        <span className={cn('font-normal', isHouse && 'font-mono text-[1.125rem] md:text-[1.25rem]')}>{valueText}</span>
      ) : null}
      {showGloss ? null : <span className="sr-only">: {gloss}</span>}
    </>
  );

  return (
    <span className={cn('inline-flex flex-col items-start', className)}>
      {href ? (
        <Link href={href} className={chipClasses} title={showGloss ? undefined : gloss}>
          {content}
        </Link>
      ) : (
        <span className={chipClasses} title={showGloss ? undefined : gloss}>
          {content}
        </span>
      )}
      {showGloss ? (
        <span className={cn('text-ink-700', compact ? 'mt-1.5 type-body-sm' : 'mt-2 type-body')}>{gloss}</span>
      ) : null}
    </span>
  );
}
