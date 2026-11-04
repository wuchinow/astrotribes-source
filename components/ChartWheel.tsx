'use client';

import Link from 'next/link';
import { useId, useRef, useState, type ReactNode } from 'react';
import { chartWheelCopy } from '@/content/chart-wheel';
import {
  degreeText,
  pointAt,
  showsRetrograde,
  wheelLayout,
  type WheelBodyId,
  type WheelDetails,
  type WheelInput,
} from '@/lib/chart-wheel';
import { cn } from '@/lib/cn';
import { GLYPHS, type GlyphId } from '@/lib/glyphs';
import { BODIES, HOUSES, SIGNS, keyFor } from '@/lib/keys';
import { KeyChip } from './KeyChip';

// A chart as a line-drawn wheel (3g, David, Nov 4): thin rings in ink, the twelve sign glyphs on an
// outer ring tinted by element (3t, David, Nov 4: add color; the same element colors as the homepage's
// Tribe wheel), each body at its place in the sky, and the twelve houses when there is a birth time.
// No aspect lines. Clickable (3t, Dawa's Sep 30 ask): tap a planet on the wheel or in the list beside
// it, and a panel under the wheel shows its sign and house as Keys, with Dawa's lines and a link to its
// page. Planets are cobalt because they are clickable. Degrees and the retrograde mark show in the list
// and the panel (David, Nov 4: "I say we turn it on"); the wheel itself stays uncluttered.
// The drawing is aria-hidden; the list's buttons carry the same in words and open the same panel.

const R_OUT = 99;
const R_SIGN = 84;
const R_SIGN_GLYPH = (R_OUT + R_SIGN) / 2;
const R_BODY = 71;
const R_INNER = 46;
const R_HOUSE_NUM = 38;
const SIGN_GLYPH = 9.5;
const BODY_GLYPH = 12;

const f = (n: number) => n.toFixed(2);

const ELEMENT_FILL = { fire: 'fill-fire', earth: 'fill-earth', air: 'fill-air', water: 'fill-water' } as const;

/** One sign's band of the outer ring, counterclockwise from `start` on screen. */
function band(start: number) {
  const [x0, y0] = pointAt(R_SIGN, start);
  const [x1, y1] = pointAt(R_SIGN, start + 30);
  const [x2, y2] = pointAt(R_OUT, start + 30);
  const [x3, y3] = pointAt(R_OUT, start);
  return `M${f(x0)} ${f(y0)} A${R_SIGN} ${R_SIGN} 0 0 0 ${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} A${R_OUT} ${R_OUT} 0 0 1 ${f(x3)} ${f(y3)}Z`;
}

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

/** The words beside the wheel. Your chart's by default; a famous chart (3s) passes its own. */
export type WheelWords = Pick<typeof chartWheelCopy, 'body' | 'houses' | 'noTime' | 'figure'>;

interface ChartWheelProps {
  wheel: WheelInput;
  /** The page's own eyebrow and headline: on Your chart the wheel leads the page (David, Nov 4). */
  header: ReactNode;
  words?: WheelWords;
  /** Dawa's lines and planet pages for the tap panel, from lib/wheel-details.ts on the server. */
  details?: WheelDetails;
}

export function ChartWheel({ wheel, header, words = chartWheelCopy, details = {} }: ChartWheelProps) {
  const layout = wheelLayout(wheel);
  const timeKnown = layout.cusps.length > 0;
  const axes = new Set([1, 4, 7, 10]);
  const name = (body: WheelBodyId) => BODIES[body].name;
  const [selected, setSelected] = useState<WheelBodyId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const chosen = layout.bodies.find((b) => b.body === selected) ?? null;

  const pick = (body: WheelBodyId, fromList: boolean) => {
    setSelected((current) => (current === body ? null : body));
    // From the list on a phone the panel sits above, out of sight: bring it into view.
    if (fromList) requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  return (
    // The headline comes first on a phone; from lg the wheel and its panel stand at the left of both.
    <div className="grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12">
      <div className="lg:col-start-2 lg:row-start-1">{header}</div>
      <div className="mx-auto w-full max-w-[34rem] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <figure>
          <svg viewBox="-100 -100 200 200" className="block w-full" aria-hidden="true">
            {/* The sign ring, each band in its element's color, lightly. */}
            <g>
              {layout.signs.map((s) => (
                <path key={s.sign} d={band(s.start)} className={ELEMENT_FILL[SIGNS[s.sign].element]} fillOpacity={0.2} />
              ))}
            </g>
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
              return <Glyph key={s.sign} id={s.sign} x={x} y={y} size={SIGN_GLYPH} className="fill-ink-900" />;
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
                    <line {...line(R_INNER, R_BODY - 8.5, c.angle)} />
                    <line {...line(R_BODY + 8.5, R_SIGN, c.angle)} />
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
                const [gx, gy] = pointAt(R_BODY + BODY_GLYPH * 0.55, b.placed);
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
              const on = b.body === selected;
              return (
                <g key={b.body} onClick={() => pick(b.body, false)} className="cursor-pointer">
                  {/* A larger, invisible target than the glyph, and a tinted disc when chosen. */}
                  <circle
                    cx={f(x)}
                    cy={f(y)}
                    r={7.5}
                    className={on ? 'fill-cobalt-100 stroke-cobalt-600' : 'fill-transparent'}
                    strokeWidth={on ? 0.6 : 0}
                  />
                  <Glyph id={b.body} x={x} y={y} size={BODY_GLYPH} className="fill-cobalt-600" />
                  {showsRetrograde(b) ? (
                    <text
                      x={f(x + 6.2)}
                      y={f(y + 5.2)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="4.2"
                      fontFamily='"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols", var(--font-body)'
                      className="fill-ink-700"
                    >
                      ℞
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          <figcaption className="sr-only">{words.figure}</figcaption>
        </figure>

        <div ref={panelRef} id={panelId} aria-live="polite" className="mt-4 scroll-mt-28">
          {chosen ? <WheelPanel body={chosen} detail={details[chosen.body]} onClose={() => setSelected(null)} /> : (
            <p className="text-center type-body-sm text-ink-500">{chartWheelCopy.hint}</p>
          )}
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-start-2">
        <p className="text-ink-700">{words.body}</p>
        <p className="mt-2 type-body-sm text-ink-700">{timeKnown ? words.houses : words.noTime}</p>
        <ul aria-label={chartWheelCopy.listLabel} className="mt-5 grid gap-x-3 gap-y-1 sm:grid-cols-2">
          {layout.bodies.map((b) => {
            const on = b.body === selected;
            const degrees = degreeText(b);
            const keys = [keyFor(b.body, 'sign'), keyFor(b.body, 'house')].filter(Boolean);
            return (
              <li key={b.body}>
                <button
                  type="button"
                  onClick={() => pick(b.body, true)}
                  aria-expanded={on}
                  aria-controls={panelId}
                  className={cn(
                    'flex min-h-touch w-full items-start gap-2.5 rounded-sm px-2 py-2 text-left type-body-sm text-ink-700 transition-colors duration-200 hover:bg-cobalt-100',
                    on && 'bg-cobalt-100',
                  )}
                >
                  <svg viewBox="-6 -6 12 12" className="mt-0.5 size-6 shrink-0" aria-hidden="true">
                    <Glyph id={b.body} x={0} y={0} size={11} className="fill-cobalt-600" />
                  </svg>
                  <span className="leading-snug">
                    <span className="block font-semibold text-cobalt-600">
                      {name(b.body)}
                      {showsRetrograde(b) ? <span className="font-normal text-ink-700"> ℞</span> : null}
                    </span>
                    <span className="block">
                      {SIGNS[b.sign].name}
                      {degrees ? ` ${degrees}` : null}
                      {b.house ? `, ${chartWheelCopy.house(HOUSES[b.house - 1].roman)}` : null}
                    </span>
                    <span className="block type-caption text-ink-500">{keys.map((k) => k!.name).join(' · ')}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** One body, chosen: where it stood, its Keys with Dawa's glosses and lines, and its page. */
function WheelPanel({
  body: b,
  detail,
  onClose,
}: {
  body: ReturnType<typeof wheelLayout>['bodies'][number];
  detail?: WheelDetails[WheelBodyId];
  onClose: () => void;
}) {
  const planet = BODIES[b.body].name;
  const signKey = keyFor(b.body, 'sign');
  const houseKey = keyFor(b.body, 'house');
  const degrees = degreeText(b);
  return (
    <div className="rounded-md border border-ink-200 bg-surface-200 p-4 shadow-rest md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="type-heading-3 text-ink-900">{planet}</h3>
          <p className="mt-1 type-body-sm text-ink-700">
            {SIGNS[b.sign].name}
            {degrees ? ` ${degrees}` : null}
            {b.house ? `, ${chartWheelCopy.house(HOUSES[b.house - 1].roman)}` : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-touch shrink-0 items-center px-2 type-ui font-semibold text-cobalt-600 underline-offset-4 hover:underline"
        >
          {chartWheelCopy.close}
        </button>
      </div>
      {showsRetrograde(b) ? <p className="mt-2 type-body-sm text-ink-700">{chartWheelCopy.retrograde(planet)}</p> : null}
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {signKey ? (
          <div>
            <KeyChip keyId={signKey.id} value={b.sign} showGloss />
            {detail?.signLine ? <p className="mt-2 text-ink-900">{detail.signLine}</p> : null}
          </div>
        ) : null}
        {houseKey ? (
          <div>
            {b.house ? <KeyChip keyId={houseKey.id} value={b.house} showGloss /> : <KeyChip keyId={houseKey.id} showGloss />}
            {b.house ? (
              detail?.houseLine ? <p className="mt-2 text-ink-900">{detail.houseLine}</p> : null
            ) : (
              <p className="mt-2 type-body-sm text-ink-700">{chartWheelCopy.noHouse}</p>
            )}
          </div>
        ) : null}
      </div>
      {detail?.href ? (
        <Link
          href={detail.href}
          className="mt-4 inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
        >
          {chartWheelCopy.more(planet)}
        </Link>
      ) : null}
    </div>
  );
}
