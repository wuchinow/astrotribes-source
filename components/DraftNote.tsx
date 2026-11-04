import type { ReactNode } from 'react';

/** The note at the top of a legal page that is still a draft, or around words drafted for Dawa. */
export function DraftNote({ children, label = 'Draft for review' }: { children: ReactNode; label?: string }) {
  return (
    <div role="note" className="rounded-md border border-ink-200 bg-surface-200 p-4 md:p-5">
      <p className="type-label text-ember-500">{label}</p>
      <div className="mt-2 type-body-sm text-ink-700">{children}</div>
    </div>
  );
}
