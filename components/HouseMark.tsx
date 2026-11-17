import type { HouseNumber, SignId } from '@/lib/keys';
import { SIGNS } from '@/lib/keys';
import { cn } from '@/lib/cn';

const ELEMENT_FILL = { fire: 'fill-fire', earth: 'fill-earth', air: 'fill-air', water: 'fill-water' } as const;

/**
 * A house's mark (5h, David, Nov 17): Dawa draws no glyph for a house (Nov 7), so a house Key on the Core
 * Five stands beside a circle cut into twelve slices, its own slice filled and its number in the middle.
 * Drawn in the chart wheel's own language (5m, David, Nov 17: "styled more like the chart - colors line
 * weights fonts"): no ground of its own, the wheel's ink-500 rings and house lines, its own house edged in
 * ink-900 at the weight of the wheel's axes, the slice tinted in the element color of the planet's sign (a
 * little stronger than the wheel's sign ring, 0.3 to its 0.2, since one slice carries it alone), and the
 * number in the wheel's body font and ink. Line widths match the wheel's on screen: its 200-unit box shows
 * about 3.4 times this mark's width, so each unit here is about 0.6 of one there. The slices run as on the wheel: house 1 just below the left (the Rising), then on
 * round counterclockwise, so house 4 starts at the foot and house 10 at the top. Decorative: the house is
 * always said in words beside it.
 */
export function HouseMark({ house, sign, className }: { house: HouseNumber; sign?: SignId; className?: string }) {
  const R = 47;
  const r = 26;
  const xy = (radius: number, degrees: number) => {
    const t = (degrees * Math.PI) / 180;
    return [Number((radius * Math.cos(t)).toFixed(2)), Number((radius * Math.sin(t)).toFixed(2))] as const;
  };
  const at = (radius: number, degrees: number) => xy(radius, degrees).join(' ');
  // Screen angles (y down): the left is 180, and counterclockwise on the page runs down from there.
  const from = 180 - 30 * (house - 1);
  const to = from - 30;
  const slice = `M${at(r, from)} L${at(R, from)} A${R} ${R} 0 0 0 ${at(R, to)} L${at(r, to)} A${r} ${r} 0 0 1 ${at(r, from)} Z`;
  const edge = (degrees: number) => {
    const [x1, y1] = xy(r, degrees);
    const [x2, y2] = xy(R, degrees);
    return { x1, y1, x2, y2 };
  };
  const tint = sign ? ELEMENT_FILL[SIGNS[sign].element] : 'fill-ink-200';
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true" className={cn('block aspect-square h-auto w-full', className)}>
      <path d={slice} className={tint} fillOpacity={0.3} />
      <g fill="none" className="stroke-ink-500" strokeWidth="0.9">
        <circle r={R} />
        <circle r={r} />
      </g>
      <g className="stroke-ink-500" strokeWidth="1">
        {Array.from({ length: 12 }, (_, i) => 180 - 30 * i)
          .filter((degrees) => degrees !== from && degrees !== to && degrees !== to + 360)
          .map((degrees) => (
            <line key={degrees} {...edge(degrees)} />
          ))}
      </g>
      <g className="stroke-ink-900" strokeWidth="1.5" strokeLinecap="round">
        <line {...edge(from)} />
        <line {...edge(to)} />
      </g>
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontFamily="var(--font-body)"
        className="fill-ink-700"
      >
        {house}
      </text>
    </svg>
  );
}
