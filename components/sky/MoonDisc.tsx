import { cn } from '@/lib/cn';

interface MoonDiscProps {
  /** The lit fraction, 0 to 1. */
  illumination: number;
  /** Past full: lit on the left, as seen from the northern hemisphere. */
  waning: boolean;
  size?: number;
  className?: string;
}

/**
 * The Moon's phase drawn as a disc: the lit part in the current text color, the dark part as a
 * hairline outline. The terminator is a half ellipse whose width follows the lit fraction.
 * Decorative: the phase is always said in words beside it.
 */
export function MoonDisc({ illumination, waning, size = 32, className }: MoonDiscProps) {
  const r = 10;
  const k = Math.min(1, Math.max(0, illumination));
  const rx = Math.abs(1 - 2 * k) * r;
  // The lit limb is a half circle on the lit side. The terminator bulges toward the lit side while
  // less than half is lit (a crescent), and toward the dark side once more is (gibbous).
  const limb = waning ? 0 : 1;
  const terminator = k < 0.5 ? 1 - limb : limb;
  const d = `M12 2 A${r} ${r} 0 0 ${limb} 12 22 A${rx.toFixed(2)} ${r} 0 0 ${terminator} 12 2 Z`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('inline-block shrink-0', className)}
    >
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
      {k > 0.005 ? <path d={d} fill="currentColor" /> : null}
    </svg>
  );
}
