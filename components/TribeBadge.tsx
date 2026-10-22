import { cn } from '@/lib/cn';
import { GLYPHS } from '@/lib/glyphs';
import type { Element, SignId } from '@/lib/keys';
import { GlyphIcon } from './GlyphIcon';

const DISC: Record<Element, string> = {
  fire: 'bg-fire',
  earth: 'bg-earth',
  air: 'bg-air',
  water: 'bg-water',
};

/** The sign's glyph in its element-colored disc, 32px. Nothing until the sign has a glyph. */
export function ElementDisc({ sign, element, className }: { sign: SignId; element: Element; className?: string }) {
  if (GLYPHS[sign].svg === null) return null;
  return (
    <span className={cn('grid size-8 shrink-0 place-items-center rounded-pill text-on-element', DISC[element], className)}>
      <GlyphIcon glyph={sign} size={24} />
    </span>
  );
}

interface TribeBadgeProps {
  sign: SignId;
  element: Element;
  /** The words on the pill, such as the element name. */
  label: string;
  /** Put the glyph's disc inside the pill (the default), or leave it to the caller (the Tribe cards). */
  glyph?: boolean;
  /** 32px tall with 15px words, for the words alone beside a separate disc (the Tribe cards). */
  compact?: boolean;
  className?: string;
}

/**
 * A pill with the sign's glyph in an element-colored disc. Until a sign has an
 * approved glyph, the disc is left out and the pill carries the words alone.
 */
export function TribeBadge({ sign, element, label, glyph = true, compact = false, className }: TribeBadgeProps) {
  const withDisc = glyph && GLYPHS[sign].svg !== null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border border-ink-200 bg-surface-100 font-body font-semibold text-ink-900',
        compact ? 'h-8 px-3 text-[0.9375rem]' : 'h-10 pr-4 text-[1rem]',
        !compact && (withDisc ? 'pl-1' : 'pl-4'),
        className,
      )}
    >
      {withDisc ? <ElementDisc sign={sign} element={element} /> : null}
      {label}
    </span>
  );
}
