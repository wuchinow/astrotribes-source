import type { ReactNode } from 'react';

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  // No art here: the nav sits on plain paper, and the page clears its row.
  return <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">{children}</div>;
}
