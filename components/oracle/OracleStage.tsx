import type { ReactNode } from 'react';

/**
 * The Oracle's art region (design system v21, The three motifs, item 3; the pair, 1i). "Each page's
 * own" is Bian Wenyu's autumn mist (P6) as the page wash in both moods, at the visitor's wash (0.6 of
 * it on Night), with no sky image (David, Nov 4: the hexagram card takes no space picture). A painting
 * the visitor picks wins; None removes it.
 */
export function OracleStage({ children }: { children: ReactNode }) {
  return (
    <div data-wash="p6" data-wash-kind="page" className="wash-region hero-top oracle-stage">
      <div aria-hidden="true" className="wash-layer" />
      {children}
    </div>
  );
}

/**
 * Behind the hexagram card: the painting cleared behind the card's header,
 * the hero ground painted over it at full strength within --clear-r and fading out over 120px, so
 * the painting is at zero there at every wash step.
 */
export function HexagramSky() {
  return <div aria-hidden="true" className="oracle-clearing" />;
}

