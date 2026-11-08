import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MatesPage } from '@/components/MatesPage';
import { matesCopy } from '@/content/clans';
import { KEYS, SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';

// The members with the Moon in one sign (4l): see components/MatesPage.tsx.
const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

export async function generateMetadata({ params }: PageProps<'/members/clan/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  return { title: matesCopy.clanTitle(SIGNS[sign].name, KEYS.moonSign.name) };
}

export default async function Page({ params }: PageProps<'/members/clan/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();
  return <MatesPage body="moon" sign={sign} />;
}
