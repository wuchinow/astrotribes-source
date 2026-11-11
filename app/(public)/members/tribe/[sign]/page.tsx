import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MatesPage } from '@/components/MatesPage';
import { matesCopy } from '@/content/clans';
import { KEYS, SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';

// A Tribe's members, the Sun in one sign (5b): see components/MatesPage.tsx.
const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

export async function generateMetadata({ params }: PageProps<'/members/tribe/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  return { title: matesCopy.tribeTitle(SIGNS[sign].name, KEYS.sunSign.name) };
}

export default async function Page({ params }: PageProps<'/members/tribe/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();
  return <MatesPage body="sun" sign={sign} />;
}
