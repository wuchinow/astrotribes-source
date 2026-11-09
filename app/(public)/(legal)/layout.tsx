import type { ReactNode } from 'react';
import { BackdropLayer } from '@/components/Backdrop';

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  // The nav sits on plain paper, and the page clears its row. Since 4m (David, Nov 8: break up the
  // text-heavy pages) an ink landscape (P4) stands beside the article from xl, below the nav, over
  // the first screen; under xl it is a band at the page's foot, under extra padding.
  return (
    <div className="backdrop-region">
      <BackdropLayer backdrop={{ art: 'p4', from: 0.9, pos: 'center 25%' }} reach="screen" />
      <div className="mx-auto max-w-content px-4 pt-31 pb-60 md:px-6 md:pt-38 xl:pb-16">{children}</div>
    </div>
  );
}
