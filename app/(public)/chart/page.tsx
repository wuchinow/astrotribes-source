import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FreeChart } from '@/components/FreeChart';
import { hasPreviewAccess } from '@/lib/preview';

export const metadata: Metadata = { title: 'Your free chart' };

// Behind the preview passcode (proxy.ts), checked again here (invariant 5). The page itself never
// touches the engine: the form posts to /api/chart.
export default async function ChartPage() {
  if (!hasPreviewAccess(await cookies())) redirect('/preview?next=/chart');
  return <FreeChart />;
}
