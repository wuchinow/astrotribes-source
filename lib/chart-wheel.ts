// The chart wheel's geometry (3g): pure, so tests/chart-wheel.test.ts can hold it. No engine import:
// lib/your-wheel.ts runs the engine on the server and hands this module longitudes only.
//
// The wheel is drawn the usual way: Rising at nine o'clock, the signs going counterclockwise from
// there. Without a birth time there is no Rising, so 0 degrees Aries sits at nine o'clock, the
// natural wheel the homepage's Tribe wheel uses.
import { SIGN_IDS, type BodyId, type HouseNumber, type SignId } from './keys';

/** The bodies drawn on the wheel, in order. Rising is the horizon line, not a glyph. */
export const WHEEL_BODIES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'northNode',
  'southNode',
  'galacticCenter',
] as const satisfies readonly Exclude<BodyId, 'rising'>[];
export type WheelBodyId = (typeof WHEEL_BODIES)[number];

export interface WheelBody {
  body: WheelBodyId;
  /** Tropical longitude, 0 to 360. */
  longitude: number;
  sign: SignId;
  house: HouseNumber | null;
  /** Within the sign, 0 to 29 and 0 to 59, or null where the place is not known closely enough (3t). */
  degree?: number | null;
  minute?: number | null;
  retrograde?: boolean;
}

/** What the tap panel shows beyond the Keys (3t): Dawa's lines and the planet's page, from the server. */
export interface WheelDetail {
  signLine?: string;
  houseLine?: string;
  href?: string;
}
export type WheelDetails = Partial<Record<WheelBodyId, WheelDetail>>;

/** The nodes always move backward, and the Sun, Moon, and Galactic Center never do, so only planets and Chiron carry the mark. */
export const showsRetrograde = (b: Pick<WheelBody, 'body' | 'retrograde'>): boolean =>
  Boolean(b.retrograde) && b.body !== 'northNode' && b.body !== 'southNode';

/** "12°05′" within the sign, or null. */
export const degreeText = (b: Pick<WheelBody, 'degree' | 'minute'>): string | null =>
  b.degree == null || b.minute == null ? null : `${b.degree}°${String(b.minute).padStart(2, '0')}′`;

export interface WheelInput {
  bodies: WheelBody[];
  /** Rising's longitude, or null when the time is unknown. */
  ascendant: number | null;
  midheaven: number | null;
  /** 12 cusp longitudes, house I first, or null. */
  cusps: readonly number[] | null;
}

/** The smallest gap between two glyphs on the planet ring, in degrees of the wheel. */
export const MIN_GAP = 10;

export const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** Screen angle, counterclockwise from three o'clock, of a longitude: Rising (or 0 Aries) at 180. */
export const screenAngle = (longitude: number, ascendant: number | null) => norm(180 + longitude - (ascendant ?? 0));

/** A point at radius r and screen angle deg, in a viewBox centered on 0 (y runs down). */
export const pointAt = (r: number, deg: number): [number, number] => {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.cos(rad), -r * Math.sin(rad)];
};

/**
 * Spreads angles so no two sit closer than `gap`, moving each as little as it can: clusters are
 * fanned out evenly around their middle, repeated until nothing overlaps. Order round the circle is kept.
 */
export function spread(angles: readonly number[], gap = MIN_GAP): number[] {
  const n = angles.length;
  if (n < 2) return angles.map(norm);
  if (n * gap > 360) gap = 360 / n;
  // Sort, unwrapping so the largest empty arc is the seam.
  const order = angles.map((a, i) => ({ a: norm(a), i })).sort((x, y) => x.a - y.a);
  let seam = 0;
  let widest = -1;
  for (let k = 0; k < n; k++) {
    const next = k === n - 1 ? order[0].a + 360 : order[k + 1].a;
    if (next - order[k].a > widest) {
      widest = next - order[k].a;
      seam = (k + 1) % n;
    }
  }
  const line = [...order.slice(seam), ...order.slice(0, seam)];
  const base = line[0].a;
  const pos = line.map((p) => (p.a - base + 360) % 360);

  // Merge into clusters until every cluster is spaced by at least `gap` from the next.
  const clusters = pos.map((p) => ({ start: p, items: [p] }));
  const centered = (c: { items: number[] }) => {
    const mid = c.items.reduce((s, v) => s + v, 0) / c.items.length;
    return mid - ((c.items.length - 1) * gap) / 2;
  };
  let merged = true;
  while (merged) {
    merged = false;
    for (let k = 0; k < clusters.length - 1; k++) {
      const a = clusters[k];
      const b = clusters[k + 1];
      if (a.start + (a.items.length - 1) * gap + gap > b.start) {
        const items = [...a.items, ...b.items];
        clusters.splice(k, 2, { start: 0, items });
        clusters[k].start = centered(clusters[k]);
        merged = true;
        break;
      }
    }
  }
  const placed = clusters.flatMap((c) => c.items.map((_, j) => c.start + j * gap));
  const out = new Array<number>(n);
  line.forEach((p, k) => {
    out[p.i] = norm(placed[k] + base);
  });
  return out;
}

export interface WheelLayout {
  signs: { sign: SignId; start: number; mid: number }[];
  /** Screen angles of the 12 cusps (house I first), or empty. */
  cusps: { house: HouseNumber; angle: number; mid: number }[];
  ascendant: number | null;
  midheaven: number | null;
  bodies: (WheelBody & { angle: number; placed: number })[];
}

export function wheelLayout(input: WheelInput): WheelLayout {
  const asc = input.ascendant;
  const signs = SIGN_IDS.map((sign, i) => ({
    sign,
    start: screenAngle(i * 30, asc),
    mid: screenAngle(i * 30 + 15, asc),
  }));
  const cusps = input.cusps
    ? input.cusps.map((c, i) => {
        const next = input.cusps![(i + 1) % 12];
        const width = norm(next - c);
        return { house: (i + 1) as HouseNumber, angle: screenAngle(c, asc), mid: screenAngle(c + width / 2, asc) };
      })
    : [];
  const angles = input.bodies.map((b) => screenAngle(b.longitude, asc));
  const placed = spread(angles);
  return {
    signs,
    cusps,
    ascendant: asc === null ? null : 180,
    midheaven: input.midheaven === null ? null : screenAngle(input.midheaven, asc),
    bodies: input.bodies.map((b, i) => ({ ...b, angle: angles[i], placed: placed[i] })),
  };
}

/**
 * Keeps a body inside the sign the member picked on a day it changed sign (no birth time): the
 * midday position may sit in the other sign, so it moves just inside the picked one's nearer edge.
 */
export function insideSign(longitude: number, sign: SignId): number {
  const start = SIGN_IDS.indexOf(sign) * 30;
  const offset = norm(longitude - start);
  if (offset < 30) return longitude;
  // Before the sign (the end of the one before) or past it (the start of the next).
  return norm(offset > 195 ? start + 0.5 : start + 29.5);
}
