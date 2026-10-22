import type { ReactNode } from 'react';
import { OpenOnHash } from './OpenOnHash';

export interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}

/**
 * A short collapsible FAQ on native <details>, so it works with a keyboard and
 * without script. A link to an item's id opens it on arrival.
 */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="mt-8 max-w-measure border-b border-ink-200">
      {items.map((item) => (
        <details key={item.id} id={item.id} className="group scroll-mt-4 border-t border-ink-200">
          <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 py-4 type-ui text-[1.125rem] text-cobalt-600 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="text-[1.5rem] leading-none font-normal transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="pb-6 text-ink-700">{item.answer}</div>
        </details>
      ))}
      <OpenOnHash />
    </div>
  );
}
