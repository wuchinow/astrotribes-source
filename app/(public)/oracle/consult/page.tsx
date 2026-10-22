import type { Metadata } from 'next';
import { FramedArt } from '@/components/FramedArt';
import { Consult } from '@/components/oracle/Consult';
import { consultCopy } from '@/content/oracle/copy';

export const metadata: Metadata = { title: consultCopy.metaTitle };

// Static. Before a cast, Jane Kwan's P8 is framed beside the coins, the page's one painting, with
// no wash; the result uses the Reading header with no wash or ring. The cast never leaves the page.
export default function ConsultPage() {
  return <Consult art={<FramedArt id="p8" sizes="(width >= 48rem) 14rem, 60vw" className="w-full" />} />;
}
