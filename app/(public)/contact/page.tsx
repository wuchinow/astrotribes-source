import type { Metadata } from 'next';
import { ArtWash } from '@/components/ArtWash';
import { Eyebrow, Headline } from '@/components/Section';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact' };

// Contact stands on Jane's gold collage (P7), so it sits outside the legal layout: the words go on a
// frosted panel over the wash.
export default function ContactPage() {
  return (
    <ArtWash piece="p7" top>
      <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <article className="panel-frost max-w-measure p-6 md:p-10">
          <Eyebrow>Contact</Eyebrow>
          <Headline as="h1" line="Write to us." accent="A person reads it." />
          <p className="type-body-lg text-ink-700">
            Questions, a correction, a credit, or a request to delete your data: one address reaches the
            AstroTribes team.
          </p>
          <p className="mt-6">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-touch items-center type-ui text-[1.25rem] break-all text-cobalt-600 underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-6 text-ink-700">
            Please do not send your birth date, time, or place by email. We never need them to answer
            you.
          </p>
        </article>
      </div>
    </ArtWash>
  );
}
