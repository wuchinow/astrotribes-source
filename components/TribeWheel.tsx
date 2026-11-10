'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { GlyphIcon } from '@/components/GlyphIcon';
import { wheel } from '@/content/landing';
import { cn } from '@/lib/cn';
import { SIGN_IDS, SIGNS, signDates, type SignId } from '@/lib/keys';

// The hero's wheel of the 12 Tribes (1l), from lg up, after the prototype's ring
// (claude.ai/artifact/MJw7ZVFfGi2iRS6yCB9bpV) and Dawa's notes on it (Oct 2 call):
// the glyphs much larger, and Aries at the far left, the signs going round from there.
// It is the natural wheel: Aries just below the horizon at nine o'clock, then
// counterclockwise, so Cancer sits at the bottom, Libra at the right, Capricorn at the top.
//
// Each glyph is a link to its Tribe. The centre shows the Sun's season (the sign the
// landing already marks) and, while a glyph is hovered or focused, that sign instead.
// Segments are equal: no member counts until there are members to count.
//
// Motion (4z, David, Nov 10: "a subtle animation of the hero wheel to start"). The wheel is whole
// at first paint and never waits on motion. A first try drew the ring in as the page loaded; it
// played differently on every load (missed, stalled, or rushed, David the same day), because an
// animation that starts with the page competes with the page loading. So the motion starts only
// once the page has settled (`useSettled`): a wave, one light going round the ring from Aries,
// then the drift, the same light at rest pace, one turn per `duration-drift`. The light is a second
// ring over the first, so it never touches the season's or the hovered sign's highlight, and it
// rests while a sign is hovered or focused. The styles are in app/globals.css (`.wheel-*`), off
// under reduced motion. The glyphs come from the page's own sprite (`SignGlyphSprite`, rendered
// before the wheel), so no disc is ever empty while a glyph file is on its way.

const SPAN = 30;
const ARIES_MID = 195; // degrees, counterclockwise from three o'clock
const GAP = 1.6;
const R_IN = 73;
const R_OUT = 86;
const R_GLYPH = (R_IN + R_OUT) / 2; // on the coloured ring, in viewBox units (-100 to 100)

const angleOf = (i: number) => ARIES_MID + i * SPAN;
const rad = (deg: number) => (deg * Math.PI) / 180;
// Screen y runs down, so a visual counterclockwise angle takes -sin.
const point = (r: number, deg: number) => [r * Math.cos(rad(deg)), -r * Math.sin(rad(deg))].map((n) => n.toFixed(2));

/** A glyph's centre, in percent of the wheel's box from its middle (x right, y down). */
export const glyphPosition = (i: number) => point(R_GLYPH / 2, angleOf(i)).map(Number) as [number, number];

function segmentPath(i: number) {
  const a0 = angleOf(i) - SPAN / 2 + GAP / 2;
  const a1 = angleOf(i) + SPAN / 2 - GAP / 2;
  const [x0, y0] = point(R_IN, a0);
  const [x1, y1] = point(R_IN, a1);
  const [x2, y2] = point(R_OUT, a1);
  const [x3, y3] = point(R_OUT, a0);
  // Inner arc visually counterclockwise (sweep 0), outer arc back (sweep 1).
  return `M${x0} ${y0} A${R_IN} ${R_IN} 0 0 0 ${x1} ${y1} L${x2} ${y2} A${R_OUT} ${R_OUT} 0 0 1 ${x3} ${y3}Z`;
}

/** A piece's place in the order, Aries first, for the stagger in app/globals.css. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;

const ELEMENT_FILL = {
  fire: 'fill-fire',
  earth: 'fill-earth',
  air: 'fill-air',
  water: 'fill-water',
} as const;

/** How long after the page has loaded the motion waits, so it never competes with loading. */
const SETTLE_MS = 400;

/**
 * True once the page has finished loading, the tab is showing, and a quiet moment has passed, on
 * a painted frame. Until then, and without scripts, the wheel simply stands whole.
 */
function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let timer = 0;
    let frame = 0;
    let waiting = true;
    const ready = () => document.readyState === 'complete' && document.visibilityState === 'visible';
    const check = () => {
      if (!waiting || !ready()) return;
      waiting = false;
      timer = window.setTimeout(() => {
        // A tab hidden during the wait starts over when it shows again.
        if (!ready()) {
          waiting = true;
          return;
        }
        frame = requestAnimationFrame(() => setSettled(true));
      }, SETTLE_MS);
    };
    check();
    window.addEventListener('load', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('load', check);
      document.removeEventListener('visibilitychange', check);
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);
  return settled;
}

export function TribeWheel({ season }: { season: SignId }) {
  const [focus, setFocus] = useState<SignId | null>(null);
  const awake = useSettled();
  const shown = focus ?? season;
  const name = SIGNS[shown].name;

  return (
    <nav
      aria-label={wheel.label}
      className={cn('wheel relative mx-auto aspect-square w-full max-w-[30rem]', awake && 'wheel-awake')}
      onMouseLeave={() => setFocus(null)}
    >
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        {SIGN_IDS.map((sign, i) => (
          <path
            key={sign}
            d={segmentPath(i)}
            className={cn(
              ELEMENT_FILL[SIGNS[sign].element],
              'transition-opacity duration-200 motion-reduce:transition-none',
              sign === shown ? 'opacity-100' : 'opacity-50',
            )}
          />
        ))}
        {/* The light: each segment again in its own color, lit in turn. */}
        <g className={cn('transition-opacity duration-200 motion-reduce:transition-none', focus && 'opacity-0')}>
          {SIGN_IDS.map((sign, i) => (
            <path
              key={sign}
              d={segmentPath(i)}
              style={order(i)}
              className={cn(ELEMENT_FILL[SIGNS[sign].element], 'wheel-light')}
            />
          ))}
        </g>
      </svg>

      <ul>
        {SIGN_IDS.map((sign, i) => {
          const [x, y] = glyphPosition(i);
          return (
            <li key={sign}>
              <Link
                href={`/tribes/${sign}`}
                aria-label={wheel.link(SIGNS[sign].name, signDates(sign))}
                onMouseEnter={() => setFocus(sign)}
                onFocus={() => setFocus(sign)}
                onBlur={() => setFocus(null)}
                style={{ left: `${50 + x}%`, top: `${50 + y}%`, ...order(i) }}
                className={cn(
                  'wheel-glyph absolute grid size-[16%] min-h-touch min-w-touch -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-ink-900',
                  'bg-surface-000/85 shadow-rest backdrop-blur-sm transition-colors duration-200 motion-reduce:transition-none',
                  'hover:text-cobalt-600 focus-visible:text-cobalt-600',
                  sign === shown ? 'border-2 border-cobalt-600' : 'border-cobalt-600/60',
                )}
              >
                <GlyphIcon glyph={sign} size={48} sprite className="size-[68%]" />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* The centre: a frosted disc, because it is text over the art. */}
      <div className="absolute inset-[27%] grid place-content-center rounded-full border border-ink-200 bg-surface-000/90 px-2 text-center shadow-rest backdrop-blur-sm">
        <p className="type-label text-ink-500">{focus ? wheel.focus : wheel.season}</p>
        <p className="mt-1 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none text-ink-900">{name}</p>
        <p className="mt-1 type-caption text-ink-500">{signDates(shown)}</p>
        <Link
          href={`/tribes/${shown}`}
          className="mt-2 inline-flex min-h-touch items-center justify-center text-[0.9375rem] font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4"
        >
          {wheel.visit(name)}
        </Link>
      </div>
    </nav>
  );
}
