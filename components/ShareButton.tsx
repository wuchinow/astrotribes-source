'use client';

import { useState } from 'react';
import { resultCopy } from '@/content/chart';
import { Button } from './Button';

/** Shares a /share link (signs only) through the device's share sheet, or copies it. */
export function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // The visitor closed the share sheet, or the clipboard said no: nothing to report.
    }
  };

  return (
    <span className="inline-flex items-center gap-3">
      <Button onClick={share}>{resultCopy.share}</Button>
      <span role="status" className="type-body-sm text-ink-700">
        {copied ? resultCopy.copied : ''}
      </span>
    </span>
  );
}
