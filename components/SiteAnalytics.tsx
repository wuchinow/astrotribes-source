'use client';

import { Analytics } from '@vercel/analytics/next';
import { scrubEvent } from '@/lib/analytics';

/**
 * Vercel Web Analytics: page views only, no cookies, each address trimmed by scrubEvent before it
 * is sent. The package sends nothing in development; production and previews only.
 */
export function SiteAnalytics() {
  return <Analytics beforeSend={scrubEvent} />;
}
