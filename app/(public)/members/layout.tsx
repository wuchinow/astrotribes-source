import type { ReactNode } from 'react';
import { BackdropLayer } from '@/components/Backdrop';

/**
 * The member pages (the Council, Members, Messages, a conversation, a member's page, and the lists
 * by sign) read down the left of a wide window, on the bare page tone (David, Nov 11: "council info
 * sets to left of page. no bg for main section. perhaps an image or bg with fade?"). So, as on the
 * legal pages, an ink landscape (P8, moonlight, used nowhere else) stands at the right, below the
 * nav, fading in from the words and out below. Here it starts at lg (`data-from="lg"` through the
 * wrapper, app/globals.css), is 44rem tall at most, so it stays with the top of a long page on a
 * tall screen, and is left out below lg, where a band at the page's foot would sit on the footer's
 * own horizon. Never under text: each page keeps its words to the left of it or on a card. Display
 * only; every page still checks the session itself.
 */
export default function MembersLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-backdrop-from="lg" className="backdrop-region">
      <BackdropLayer backdrop={{ art: 'p8', from: 0.66 }} reach="screen" />
      {children}
    </div>
  );
}
