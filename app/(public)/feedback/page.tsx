import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ArtWash } from '@/components/ArtWash';
import { FeedbackForm } from '@/components/FeedbackForm';
import { Eyebrow, Headline } from '@/components/Section';
import { feedbackCopy } from '@/content/feedback';
import { pagePath } from '@/lib/feedback';

export const metadata: Metadata = { title: feedbackCopy.title };

// Feedback (Nov 9), laid out like Contact: a frosted panel over P7. The page the visitor came from rides
// along as a path on this site only (no query or fragment), so the team knows where a note began.
export default async function FeedbackPage() {
  const h = await headers();
  const page = pagePath(h.get('referer'), h.get('host'));
  return (
    <ArtWash piece="p7" top>
      <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <article className="panel-frost max-w-measure p-6 md:p-10">
          <Eyebrow>{feedbackCopy.eyebrow}</Eyebrow>
          <Headline as="h1" line={feedbackCopy.line} accent={feedbackCopy.accent} />
          <p className="type-body-lg text-ink-700">{feedbackCopy.lede}</p>
          <FeedbackForm page={page} />
        </article>
      </div>
    </ArtWash>
  );
}
