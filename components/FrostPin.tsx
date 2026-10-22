import Link from 'next/link';
import type { ReactNode } from 'react';

interface FrostPinProps {
  href: string;
  title: string;
  line: string;
  /** A small decorative mark on the left (1h): the hexagram lines, or a sign glyph. */
  mark?: ReactNode;
}

/**
 * A frosted card pinned over the art: a mark, a title (18px), one muted line (15px), and a cobalt
 * arrow. 300px wide from md (1h).
 */
export function FrostPin({ href, title, line, mark }: FrostPinProps) {
  return (
    <Link href={href} className="pin-frost group w-full md:w-[300px]">
      <span className="flex items-center gap-3">
        {mark ? (
          <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-ink-700">
            {mark}
          </span>
        ) : null}
        <span>
          <span className="block font-body text-[1.125rem] leading-snug font-semibold text-ink-900">{title}</span>
          <span className="block text-[0.9375rem] leading-snug text-ink-500">{line}</span>
        </span>
      </span>
      <span aria-hidden="true" className="text-[1.25rem] text-cobalt-600">
        →
      </span>
    </Link>
  );
}

/** Six hexagram lines as a 24px mark (the Oracle pin). Decorative: the pin's title names it. */
export function HexagramMark() {
  // Bottom line first, 1 unbroken: hexagram 63, lines alternating, so it reads as a hexagram at 24px.
  const lines = [1, 0, 1, 0, 1, 0];
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} className="fill-current" aria-hidden="true">
      {lines.map((line, i) => {
        const y = 20 - i * 3.6;
        return line ? (
          <rect key={i} x={2} y={y} width={20} height={2} rx={0.5} />
        ) : (
          <g key={i}>
            <rect x={2} y={y} width={8.5} height={2} rx={0.5} />
            <rect x={13.5} y={y} width={8.5} height={2} rx={0.5} />
          </g>
        );
      })}
    </svg>
  );
}
