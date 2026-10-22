import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ComingSoon } from '@/components/ComingSoon';
import { comingSoon } from '@/content/landing';
import { hasPreviewAccess } from '@/lib/preview';

export const metadata: Metadata = { title: "Today's sky" };

// Behind the preview passcode from 1b (the engine page), checked again here (invariant 5).
export default async function SkyPage() {
  if (!hasPreviewAccess(await cookies())) redirect('/preview?next=/sky');
  // P10 on Paper until 1d brings a Webb sky wash.
  return <ComingSoon {...comingSoon.sky} wash="p10" />;
}
