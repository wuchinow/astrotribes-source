import Link from 'next/link';
import type { ReactNode } from 'react';

export interface Step {
  category: string;
  title: string;
  body: ReactNode;
  /** A link to more: an FAQ item on the same page ("#id"), or another page ("/path"). */
  more?: { href: string; label: string };
}

const MORE = 'mt-2 inline-flex min-h-touch items-center gap-2 type-ui text-cobalt-600 underline-offset-4 hover:underline';

/** Numbered items: an italic serif numeral, an ember category label, a title, one line, a link. */
export function NumberedSteps({ steps }: { steps: readonly Step[] }) {
  return (
    // role="list" keeps list semantics in Safari once the markers are gone.
    <ol role="list" className="mt-8 border-b border-ink-200">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-ink-200 py-6 md:grid-cols-[4rem_1fr]"
        >
          <span aria-hidden="true" className="step-numeral">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="category-label">{step.category}</p>
            <h3 className="font-body text-[1.25rem] font-semibold leading-snug text-ink-900">
              {step.title}
            </h3>
            <p className="mt-1 max-w-[56ch] type-body-sm text-ink-700">{step.body}</p>
            {step.more?.href.startsWith('/') ? (
              <Link href={step.more.href} className={MORE}>
                {step.more.label}
                <span aria-hidden="true">{'\u2192'}</span>
              </Link>
            ) : step.more ? (
              // A plain anchor, so the hash change opens the FAQ item it points to.
              <a href={step.more.href} className={MORE}>
                {step.more.label}
                <span aria-hidden="true">+</span>
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
