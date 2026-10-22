import type { CSSProperties, ReactNode } from 'react';
import skyFiles from '@/public/sky-images/credits.json';

const ring = skyFiles.images.ring;

/**
 * The Oracle's art region (design system v21, The three motifs, item 3; the pair, 1i). "Each page's
 * own" is Jane Kwan's calligraphy (P6) as the page wash on Paper, and nothing behind the pair on
 * Night but the inked Ring Nebula behind the hexagram card (HexagramSky). A painting the visitor
 * picks wins in both moods, and then there is no ring (a sky image never shares a screen with a
 * Jane wash); None removes both. Each image is a CSS background under its own mood selector
 * (app/globals.css), so Paper never downloads the ring and Night never downloads P6.
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
 * Behind the hexagram card. On Paper (or a picked painting): P6 cleared behind the card's header,
 * the hero ground painted over it at full strength within --clear-r and fading out over 120px, so
 * the painting is at zero there at every wash step. On Night, with each page's own painting: the
 * inked ring centred on the header, the day's characters faint in its dark center, and its credit on
 * a small panel on the part of the image that shows above the card.
 */
export function HexagramSky({ chinese }: { chinese: string }) {
  const vars = {
    '--sky-sm': `url("${ring.files['720'].src}")`,
    '--sky-lg': `url("${ring.files['1100'].src}")`,
    // The ring's own strength from the manifest (lib/sky.ts, 1h), in place of wash-sky.
    '--sky-strength': ring.strength,
  } as CSSProperties;
  return (
    <>
      <div aria-hidden="true" className="oracle-clearing" />
      <div aria-hidden="true" className="sky-clip">
        <div className="sky-layer" style={vars} />
        <div lang="zh-Hant" className={chinese.length > 1 ? 'oracle-mark oracle-mark-two' : 'oracle-mark'}>
          {chinese}
        </div>
      </div>
      <p className="sky-credit">{ring.credit}</p>
    </>
  );
}
