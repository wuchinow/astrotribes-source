import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'lockup' | 'mark';

/**
 * Approved tones: `mood` draws the crescent and wordmark in the logo token (deep plum on Paper,
 * gold on Night) and the rays in gold-500, so Night is all gold. `gold` is gold-300 for both,
 * only on a night-900 ground (merch).
 */
type Tone = 'mood' | 'gold';

interface LogoProps {
  variant?: Variant;
  tone?: Tone;
  /** Set the width; the height follows the artwork. Lockup at least 160px, mark at least 24px. */
  className?: string;
  label?: string;
}

// The sun and moon (David, Oct 21; drawn by scripts/brand-logo.py): two single-ink layers with
// the same viewBox, each a mask over its own color. Swapping the logo means rerunning the script.
const ART: Record<Variant, { ink: string; rays: string; ratio: string }> = {
  lockup: { ink: '/brand/logo-ink.svg', rays: '/brand/logo-rays.svg', ratio: '1733.5 / 448.2' },
  mark: { ink: '/brand/glyph-ink.svg', rays: '/brand/glyph-rays.svg', ratio: '1 / 1' },
};

export function Logo({ variant = 'lockup', tone = 'mood', className, label = 'AstroTribes' }: LogoProps) {
  const { ink, rays, ratio } = ART[variant];
  return (
    <span role="img" aria-label={label} className={cn('relative block', className)} style={{ aspectRatio: ratio }}>
      <span
        aria-hidden="true"
        className={cn('logo-mask absolute inset-0', tone === 'gold' ? 'text-gold-300' : 'text-gold-500')}
        style={{ '--logo-src': `url(${rays})` } as CSSProperties}
      />
      <span
        aria-hidden="true"
        className={cn('logo-mask absolute inset-0', tone === 'gold' ? 'text-gold-300' : 'text-logo')}
        style={{ '--logo-src': `url(${ink})` } as CSSProperties}
      />
    </span>
  );
}
