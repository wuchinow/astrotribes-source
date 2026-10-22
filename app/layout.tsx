import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { washCss } from '@/lib/art-assets';
import { appearanceScript } from '@/lib/appearance';
import { tuneScript } from '@/lib/tune-head';
import { fraunces, nunitoSans, plexMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AstroTribes', template: '%s · AstroTribes' },
  description: 'Astrology gives people identity. AstroTribes gives them belonging.',
  // Until launch the placeholder stays out of search results (X-Robots-Tag in next.config.ts too).
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // The head script applies the visitor's appearance (mood, painting, wash, text size) to <html>
    // before first paint, so its attributes differ from the server render by design. The second
    // applies a team member's Tune (1f), and does nothing without a valid at-tune cookie.
    <html
      lang="en"
      className={`${fraunces.variable} ${nunitoSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
        <script dangerouslySetInnerHTML={{ __html: tuneScript }} />
        <style dangerouslySetInnerHTML={{ __html: washCss() }} />
      </head>
      <body>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
