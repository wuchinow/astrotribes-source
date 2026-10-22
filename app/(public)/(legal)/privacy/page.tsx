import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { privacy } from '@/content/legal/privacy';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function PrivacyPage() {
  return <LegalPage {...privacy} />;
}
