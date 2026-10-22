import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { terms } from '@/content/legal/terms';

export const metadata: Metadata = { title: 'Terms of service' };

export default function TermsPage() {
  return <LegalPage {...terms} />;
}
