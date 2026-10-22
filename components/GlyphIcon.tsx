import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { GLYPHS, type GlyphId } from '@/lib/glyphs';

interface GlyphIconProps {
  glyph: GlyphId;
  /** Dawa's glyphs are drawn for 24, 48, and 96px. */
  size?: 24 | 48 | 96;
  /** Give a label only when the glyph stands alone; beside its name it is decorative. */
  label?: string;
  className?: string;
}

/**
 * One of Dawa's brush glyphs, in the current text color (ink-900 on Paper,
 * on-element inside a badge, paper-colored on Night). Until the vectorized SVG
 * exists, it renders the text symbol, outlined in development.
 */
export function GlyphIcon({ glyph, size = 24, label, className }: GlyphIconProps) {
  const def = GLYPHS[glyph];
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const);
  const turn: CSSProperties | undefined = def.rotate ? { transform: `rotate(${def.rotate}deg)` } : undefined;

  if (def.svg) {
    const scale = def.scale ?? 1;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        className={cn('inline-block shrink-0 fill-current', className)}
        style={{ ...turn, ...(scale !== 1 ? { scale: String(scale) } : null) }}
        {...a11y}
      >
        <use href={`${def.svg}#glyph`} />
      </svg>
    );
  }

  const isSymbol = def.symbol.endsWith('︎');
  return (
    <span
      data-placeholder=""
      className={cn(
        'inline-flex shrink-0 items-center justify-center leading-none',
        process.env.NODE_ENV !== 'production' && 'outline-1 outline-dashed outline-ink-200',
        className,
      )}
      style={{
        ...turn,
        width: size,
        height: size,
        fontSize: Math.round(size * (isSymbol ? 0.72 : 0.36)),
        fontFamily: '"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols", var(--font-body)',
      }}
      {...a11y}
    >
      {def.symbol}
    </span>
  );
}
