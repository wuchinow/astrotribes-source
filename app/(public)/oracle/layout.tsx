import localFont from 'next/font/local';
import type { ReactNode } from 'react';

// Noto Serif TC Bold, cut to the 71 characters of the hexagram and trigram names by
// scripts/hanzi-font.mjs (SIL Open Font License, hanzi-bold-OFL.txt beside it). Declared here, so
// only the /oracle routes load it.
const hanzi = localFont({
  src: './hanzi-bold.woff2',
  weight: '700',
  display: 'swap',
  variable: '--font-hanzi',
  fallback: ['Songti TC', 'PMingLiU', 'serif'],
  adjustFontFallback: false,
});

export default function OracleLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={hanzi.variable}>{children}</div>;
}
