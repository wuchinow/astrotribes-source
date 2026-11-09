import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MatesPage } from '@/components/MatesPage';
import { matesCopy } from '@/content/clans';
import { BODIES, SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';
import { isFamilyBody } from '@/lib/mates';

// A generational family's members (4r): everyone with Uranus, Neptune, or Pluto in one sign, whatever
// their Tribe (Dawa's punch list). See components/MatesPage.tsx.
const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

export async function generateMetadata({ params }: PageProps<'/members/family/[planet]/[sign]'>): Promise<Metadata> {
  const { planet, sign } = await params;
  if (!isFamilyBody(planet) || !isSign(sign)) return {};
  return { title: matesCopy.familyTitle(BODIES[planet].name, SIGNS[sign].name) };
}

export default async function Page({ params }: PageProps<'/members/family/[planet]/[sign]'>) {
  const { planet, sign } = await params;
  if (!isFamilyBody(planet) || !isSign(sign)) notFound();
  return <MatesPage body={planet} sign={sign} />;
}
