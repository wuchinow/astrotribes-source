import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MatesPage } from '@/components/MatesPage';
import { matesCopy } from '@/content/clans';
import { KEYS, SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';

// The members with the rising sign in one sign (4l): see components/MatesPage.tsx.
const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

export async function generateMetadata({ params }: PageProps<'/members/vibe/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  return { title: matesCopy.vibeTitle(SIGNS[sign].name, KEYS.risingSign.name) };
}

export default async function Page({ params }: PageProps<'/members/vibe/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();
  return <MatesPage body="rising" sign={sign} />;
}
