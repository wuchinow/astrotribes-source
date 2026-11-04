'use client';

import { usePathname } from 'next/navigation';

/**
 * The footer's line for the telescope images on this page (David, Nov 4: credits in the footer, like
 * the art, so nothing sits under a picture). The footer is shared by every page, so it picks the line
 * by path; the lines are worked out on the server (`skyCreditLines` in lib/sky-credits.ts) and arrive
 * as plain text. A page with no telescope image shows nothing. None hides it with the images.
 */
export function SkyCredit({ lines }: { lines: Readonly<Record<string, string>> }) {
  const line = lines[usePathname()];
  return line ? <p className="panel-sky-credit mt-1 type-caption text-ink-500">{line}</p> : null;
}
