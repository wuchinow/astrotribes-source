import type { ReactNode } from 'react';
import { chartWheelCopy } from '@/content/chart-wheel';
import { pointAt, wheelLayout, type WheelBodyId, type WheelInput } from '@/lib/chart-wheel';
import { GLYPHS, type GlyphId } from '@/lib/glyphs';
import { BODIES, HOUSES, SIGNS } from '@/lib/keys';

// The member's chart as a line-drawn wheel (3g, David, Nov 4): thin rings in ink, the twelve sign
// glyphs on the outer ring, each body at its place in the sky, and the twelve houses when there is
// a birth time. No degree numbers (a Sun degree gives away a birthday), no aspect lines, no fills.
// A server component: the drawing is plain SVG, so the page ships no script for it.
// The wheel is aria-hidden; the list beside it carries the same in words.

const R_OUT = 99;
const R_SIGN = 84;
const R_SIGN_GLYPH = (R_OUT + R_SIGN) / 2;
const R_BODY = 71;
const R_INNER = 46;
const R_HOUSE_NUM = 38;
const SIGN_GLYPH = 9.5;
const BODY_GLYPH = 9.5;

const f = (n: number) => n.toFixed(2);

/**
 * Dawa's glyph where he drew one, and the brush stand-in where he has not yet (David, Nov 4:
 * the wheel reads as one set). Only Rising, which the wheel draws as the horizon, has neither.
 */
function Glyph({ id, x, y, size, className }: { id: GlyphId; x: number; y: number; size: number; className: string }) {
  const def = GLYPHS[id];
  const turn = def.rotate ? `rotate(${def.rotate} ${f(x)} ${f(y)})` : undefined;
  if (def.svg) {
    const s = size * (def.scale ?? 1);
    // The turn sits on a group: a transform on a nested <svg> is SVG 2, and not every browser has it.
    return (
      <g transform={turn}>
        <svg x={f(x - s / 2)} y={f(y - s / 2)} width={f(s)} height={f(s)} viewBox="0 0 96 96" className={className}>
          <use href={`${def.svg}#glyph`} />
        </svg>
      </g>
    );
  }
  const two = def.symbol.replace('︎', '').length > 1;
  return (
    <text
      x={f(x)}
      y={f(y)}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={f(two ? size * 0.55 : size * 1.1)}
      fontFamily='"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols", var(--font-body)'
      className={className}
      transform={turn}
    >
      {def.symbol}
    </text>
  );
}

const line = (r0: number, r1: number, deg: number) => {
  const [x0, y0] = pointAt(r0, deg);
  const [x1, y1] = pointAt(r1, deg);
  return { x1: f(x0), y1: f(y0), x2: f(x1), y2: f(y1) };
};

/** `header` is the page's own eyebrow and headline: on Your chart the wheel leads the page (David, Nov 4). */
/** The words beside the wheel. Your chart's by default; a famous chart (3s) passes its own. */
export type WheelWords = Pick<typeof chartWheelCopy, 'body' | 'houses' | 'noTime' | 'figure'>;

export function ChartWheel({ wheel, header, words = chartWheelCopy }: { wheel: WheelInput; header: ReactNode; words?: WheelWords }) {
  const layout = wheelLayout(wheel);
  const timeKnown = layout.cusps.length > 0;
  const axes = new Set([1, 4, 7, 10]);
  const name = (body: WheelBodyId) => BODIES[body].name;

  return (
    // The headline comes first on a phone; from lg the wheel stands at the left of both, centered
    // against them so neither side leaves a gap.
    <div className="grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12">
      <div className="lg:col-start-2 lg:row-start-1">{header}</div>
      <figure className="mx-auto w-full max-w-[34rem] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
        <svg viewBox="-100 -100 200 200" className="block w-full" aria-hidden="true">
          <g fill="none" className="stroke-ink-500" strokeWidth="0.5">
            <circle r={R_OUT} />
            <circle r={R_SIGN} />
            <circle r={R_INNER} />
          </g>
          {/* Sign boundaries, and a tick every five degrees on the inner edge of the sign ring. */}
          <g className="stroke-ink-200" strokeWidth="0.4">
            {layout.signs.map((s) => (
              <line key={s.sign} {...line(R_SIGN, R_OUT, s.start)} />
            ))}
            {layout.signs.flatMap((s) =>
              [5, 10, 15, 20, 25].map((d) => <line key={`${s.sign}-${d}`} {...line(R_SIGN - (d === 15 ? 2.4 : 1.4), R_SIGN, s.start + d)} />),
            )}
          </g>
          {layout.signs.map((s) => {
            const [x, y] = pointAt(R_SIGN_GLYPH, s.mid);
            return <Glyph key={s.sign} id={s.sign} x={x} y={y} size={SIGN_GLYPH} className="fill-ink-700" />;
          })}

          {timeKnown ? (
            <g>
              {layout.cusps.map((c) => (
                <g
                  key={c.house}
                  className={axes.has(c.house) ? 'stroke-ink-700' : 'stroke-ink-200'}
                  strokeWidth={axes.has(c.house) ? 0.8 : 0.4}
                >
                  {/* Broken around the planet ring, so the glyphs stand clear of the lines. */}
                  <line {...line(R_INNER, R_BODY - 7, c.angle)} />
                  <line {...line(R_BODY + 7, R_SIGN, c.angle)} />
                </g>
              ))}
              {layout.cusps.map((c) => {
                const [x, y] = pointAt(R_HOUSE_NUM, c.mid);
                return (
                  <text
                    key={c.house}
                    x={f(x)}
                    y={f(y)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="5.5"
                    fontFamily="var(--font-body)"
                    className="fill-ink-500"
                  >
                    {HOUSES[c.house - 1].roman}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Each body: a tick at its true place on the sign ring, a leader if it was moved apart, and its glyph. */}
          <g className="stroke-ink-700" strokeWidth="0.5">
            {layout.bodies.map((b) => {
              const [tx, ty] = pointAt(R_SIGN - 4, b.angle);
              const [gx, gy] = pointAt(R_BODY + BODY_GLYPH * 0.62, b.placed);
              return (
                <g key={b.body}>
                  <line {...line(R_SIGN - 3.5, R_SIGN, b.angle)} />
                  {Math.abs(((b.placed - b.angle + 540) % 360) - 180) > 0.5 ? (
                    <line x1={f(tx)} y1={f(ty)} x2={f(gx)} y2={f(gy)} className="stroke-ink-200" strokeWidth="0.4" />
                  ) : null}
                </g>
              );
            })}
          </g>
          {layout.bodies.map((b) => {
            const [x, y] = pointAt(R_BODY, b.placed);
            return <Glyph key={b.body} id={b.body} x={x} y={y} size={BODY_GLYPH} className="fill-ink-900" />;
          })}
        </svg>
        <figcaption className="sr-only">{words.figure}</figcaption>
      </figure>

      <div className="lg:col-start-2 lg:row-start-2">
        <p className="text-ink-700">{words.body}</p>
        <p className="mt-2 type-body-sm text-ink-700">{timeKnown ? words.houses : words.noTime}</p>
        <ul aria-label={chartWheelCopy.listLabel} className="mt-5 grid gap-x-4 gap-y-2 sm:grid-cols-3 sm:gap-y-3 lg:grid-cols-2">
          {layout.bodies.map((b) => (
            <li key={b.body} className="flex items-start gap-2.5 type-body-sm text-ink-700">
              <svg viewBox="-6 -6 12 12" className="mt-0.5 size-6 shrink-0" aria-hidden="true">
                <Glyph id={b.body} x={0} y={0} size={11} className="fill-ink-900" />
              </svg>
              <span className="leading-snug">
                {/* One line on a phone, two from sm where the list runs in columns. */}
                <span className="font-semibold text-ink-900 sm:block">{name(b.body)}</span>
                <span className="sm:hidden">, </span>
                <span className="sm:block sm:type-caption sm:text-ink-500">
                  {SIGNS[b.sign].name}
                  {b.house ? `, ${chartWheelCopy.house(HOUSES[b.house - 1].roman)}` : null}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
