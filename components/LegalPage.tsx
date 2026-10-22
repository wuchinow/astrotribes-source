import type { ReactNode } from 'react';
import { DraftNote } from './DraftNote';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: ReactNode;
  /** What is still open, shown in the Draft for review note. */
  draft: ReactNode;
  sections: readonly LegalSection[];
}

/** A legal page: the draft note, a title, and sections with a quiet contents list at desktop widths. */
export function LegalPage({ title, updated, intro, draft, sections }: LegalPageProps) {
  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-8">
          <p className="mb-3 type-label text-ink-500">On this page</p>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex min-h-9 items-center type-body-sm text-cobalt-600 underline-offset-4 hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <article className="max-w-measure">
        <DraftNote>{draft}</DraftNote>
        <h1 className="mt-8 type-heading-1 text-ink-900">{title}</h1>
        <p className="mt-2 type-data-sm text-ink-500">Last updated {updated}</p>
        <div className="mt-6 space-y-4">{intro}</div>
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="mt-10 scroll-mt-8"
          >
            <h2 id={`${section.id}-title`} className="type-heading-2 text-ink-900">
              {section.title}
            </h2>
            <div className="mt-3 space-y-4 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
              {section.body}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
