import type { HouseNumber } from '@/lib/keys';
import { cn } from '@/lib/cn';

/**
 * A house's mark (5h, David, Nov 17: "show me in preview"): Dawa draws no glyph for a house (Nov 7), so
 * a house Key on the Core Five stands beside a circle cut into twelve slices, its own slice filled and
 * its number in the middle. The slices run as on the chart wheel: house 1 just below the left (the
 * Rising), then on round counterclockwise, so house 4 starts at the foot and house 10 at the top.
 * Decorative: the house is always said in words beside it.
 */
export function HouseMark({ house, className }: { house: HouseNumber; className?: string }) {
  const R = 46;
  const r = 20;
  const xy = (radius: number, degrees: number) => {
    const t = (degrees * Math.PI) / 180;
    return [Number((radius * Math.cos(t)).toFixed(2)), Number((radius * Math.sin(t)).toFixed(2))] as const;
  };
  const at = (radius: number, degrees: number) => xy(radius, degrees).join(' ');
  // Screen angles (y down): the left is 180, and counterclockwise on the page runs down from there.
  const from = 180 - 30 * (house - 1);
  const to = from - 30;
  const slice = `M${at(r, from)} L${at(R, from)} A${R} ${R} 0 0 0 ${at(R, to)} L${at(r, to)} A${r} ${r} 0 0 1 ${at(r, from)} Z`;
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true" className={cn('block aspect-square h-auto w-full', className)}>
      <circle r={R} className="fill-surface-100 stroke-ink-500" strokeWidth="1" />
      <path d={slice} className="fill-highlight" />
      <g className="stroke-ink-500" strokeWidth="0.75">
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = xy(r, 180 - 30 * i);
          const [x2, y2] = xy(R, 180 - 30 * i);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <circle r={r} className="fill-surface-000 stroke-ink-500" strokeWidth="1" />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink-900 font-display"
        fontSize="22"
      >
        {house}
      </text>
    </svg>
  );
}
