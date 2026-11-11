'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChartRailProps {
  /** The list's name, for screen readers and shown above it. */
  label: string;
  /** Each place on the page: the id of its heading, and its words. */
  items: ReadonlyArray<{ id: string; label: string }>;
  /** Under the list (Open all). */
  children?: ReactNode;
  className?: string;
}

/**
 * Your chart's side list (5d, David, Nov 11: "keys has side nav. should your chart or other pages?"):
 * the page's parts, in view at the left from lg while the Keys scroll by, with the part being read
 * marked. A panel, because it passes over the pictures at the sections' feet. The mark follows
 * the scroll: the last heading that has passed the upper part of the window. No motion of its own.
 */
export function ChartRail({ label, items, children, className }: ChartRailProps) {
  // Two headings that stand side by side (the last two groups, from lg) are marked together.
  const [current, setCurrent] = useState<readonly string[]>([]);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const tops = items.flatMap((item) => {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top;
        return top !== undefined && top <= line ? [{ id: item.id, top }] : [];
      });
      const last = Math.max(...tops.map((entry) => entry.top));
      const next = tops.filter((entry) => last - entry.top < 4).map((entry) => entry.id);
      setCurrent((before) => (before.join() === next.join() ? before : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // A card that opens or closes moves everything under it (`toggle` does not bubble).
    document.addEventListener('toggle', onScroll, true);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('toggle', onScroll, true);
    };
  }, [items]);

  return (
    <nav aria-label={label} data-chart-rail="" className={cn('panel-frost p-4', className)}>
      <p className="mb-1 type-label text-ink-500">{label}</p>
      <ul role="list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current.includes(item.id) ? 'location' : undefined}
              className="-ml-4 flex min-h-touch items-center border-l-2 border-transparent pl-[calc(1rem-2px)] type-body-sm text-cobalt-600 underline-offset-4 hover:underline aria-[current=location]:border-gold-500 aria-[current=location]:font-semibold"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {children ? <div className="mt-3">{children}</div> : null}
    </nav>
  );
}
