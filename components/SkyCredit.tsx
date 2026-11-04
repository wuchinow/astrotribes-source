'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

/**
 * A footer credit line picked by path (David, Nov 4: credits in the footer, like the art, so nothing
 * sits under a picture). The footer is shared by every page, so the lines are worked out on the server
 * (lib/sky-credits.ts) and arrive as plain text; a page with no entry shows nothing. `sky` marks the
 * telescope line, which None hides with the images.
 */
export function SkyCredit({ lines, sky = true }: { lines: Readonly<Record<string, string>>; sky?: boolean }) {
  const line = lines[usePathname()];
  return line ? <p className={cn(sky && 'panel-sky-credit', 'mt-1 type-caption text-ink-500')}>{line}</p> : null;
}
