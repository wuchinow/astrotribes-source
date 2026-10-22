// Tune (1f): the team's tuning of temperature and accent, turned into colors. Loaded only with the
// Tune section, after the server has confirmed the preview passcode, so visitors never download it.
//
// Temperature: every surface and ink moves along OKLab's warm and cool axis (toward amber at hue 70°,
// or the opposite way, toward blue) at constant lightness, surfaces by up to 0.03 and inks by up to
// 0.02. A color that would leave sRGB moves only as far as it stays inside. Accent: the Paper accent
// (the highlight, plum fill, and primary button) and the Night highlight turn to a new hue, each token
// keeping its own lightness and chroma (chroma drops only as far as sRGB requires). The Night primary
// button stays pale cobalt, follows the Night accent, or takes the parked plum (#8A4A8D, open 16).
// At the default settings every function returns the tokens exactly, untouched by the math.

import base from './tune-base.json';
import { clearTuneCookie } from './tune-cookie';
import { TUNED, TUNE_COOKIE, TUNE_KEY, TUNE_MAX_AGE, TUNE_PATTERN, TUNE_STYLE_ID, tuneRules, type TunedToken } from './tune-head';

export type Mood = 'paper' | 'night';
export type NightButton = 'c' | 'a' | 'p';

export interface TuneSettings {
  /** Temperature, -10 (cooler) to +10 (warmer). */
  tp: number;
  tn: number;
  /** Accent hue in degrees, 0 to 359. */
  ap: number;
  an: number;
  /** The Night primary button: pale cobalt, follows the accent, or plum. */
  nb: NightButton;
}

type Values = Record<string, string>;
export const BASE: Record<Mood, Values> = {
  paper: Object.fromEntries(base.tokens.map((t) => [t.name, t.paper])),
  night: Object.fromEntries(base.tokens.map((t) => [t.name, t.night])),
};
export const TOKENS_VERSION = base.version;
const USAGE = Object.fromEntries(base.tokens.map((t) => [t.name, t.usage]));

// OKLab, after Björn Ottosson's reference implementation.
type Lab = [number, number, number];
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToLab(hex: string): Lab {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function labToLinear([L, a, b]: Lab): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const EPS = 1e-4;
export const inGamut = (lab: Lab) => labToLinear(lab).every((v) => v >= -EPS && v <= 1 + EPS);

function labToHex(lab: Lab): string {
  return `#${labToLinear(lab)
    .map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Lightness, chroma, and hue in degrees. */
export function oklch(hex: string): [number, number, number] {
  const [L, a, b] = hexToLab(hex);
  return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
}

const polar = (L: number, C: number, h: number): Lab => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];

/** A color at a lightness, chroma, and hue, its chroma lowered only as far as sRGB requires. */
export function fromOklch(L: number, C: number, h: number): string {
  let c = C;
  while (c > 0 && !inGamut(polar(L, c, h))) c = Math.max(0, c - 0.001);
  return labToHex(polar(L, c, h));
}

const WARM_HUE = 70;
const SURFACE_SHIFT = 0.03;
const INK_SHIFT = 0.02;
const SURFACES: readonly TunedToken[] = ['surface-000', 'surface-100', 'surface-200', 'surface-band', 'surface-hero'];
const INKS: readonly TunedToken[] = ['ink-900', 'ink-700', 'ink-500', 'ink-200'];

/** Move a color along the warm and cool axis at constant lightness; t is -1 to 1. */
export function warm(hex: string, t: number, reach: number): string {
  if (t === 0) return hex;
  const [L, a, b] = hexToLab(hex);
  const da = t * reach * Math.cos((WARM_HUE * Math.PI) / 180);
  const db = t * reach * Math.sin((WARM_HUE * Math.PI) / 180);
  let k = 1;
  while (k > 0 && !inGamut([L, a + da * k, b + db * k])) k = Math.max(0, k - 0.02);
  return labToHex([L, a + da * k, b + db * k]);
}

/** Turn a color's hue by some degrees, keeping its lightness and (where sRGB allows) its chroma. */
export function turn(hex: string, degrees: number): string {
  if (degrees === 0) return hex;
  const [L, C, h] = oklch(hex);
  return fromOklch(L, C, (h + degrees + 360) % 360);
}

const hueOf = (hex: string) => Math.round(oklch(hex)[2]) % 360;

/** The default positions: no temperature, the design system's accents, the cobalt Night button. */
export const DEFAULT_TUNE: TuneSettings = {
  tp: 0,
  tn: 0,
  ap: hueOf(BASE.paper['plum-700']),
  an: hueOf(BASE.night['highlight']),
  nb: 'c',
};

export const isDefaultTune = (s: TuneSettings) =>
  s.tp === DEFAULT_TUNE.tp && s.tn === DEFAULT_TUNE.tn && s.ap === DEFAULT_TUNE.ap && s.an === DEFAULT_TUNE.an && s.nb === DEFAULT_TUNE.nb;

/** The parked plum Night button (design system v20, open 16), its hover, and its label color. */
const NIGHT_PLUM = '#8a4a8d';

/** Every tuned token's color in both moods. */
export function resolveTune(s: TuneSettings): Record<Mood, Record<TunedToken, string>> {
  const out = { paper: {}, night: {} } as Record<Mood, Record<TunedToken, string>>;
  for (const mood of ['paper', 'night'] as const) {
    const t = (mood === 'paper' ? s.tp : s.tn) / 10;
    for (const name of TUNED) out[mood][name] = BASE[mood][name];
    for (const name of SURFACES) out[mood][name] = warm(BASE[mood][name], t, SURFACE_SHIFT);
    for (const name of INKS) out[mood][name] = warm(BASE[mood][name], t, INK_SHIFT);
  }
  const paperTurn = s.ap - DEFAULT_TUNE.ap;
  for (const name of ['plum-700', 'plum-fill', 'highlight', 'button-primary', 'button-primary-hover'] as const) {
    out.paper[name] = turn(BASE.paper[name], paperTurn);
  }
  out.night.highlight = turn(BASE.night.highlight, s.an - DEFAULT_TUNE.an);
  if (s.nb === 'a') {
    const [L, C] = oklch(BASE.night['button-primary']);
    const [Lh, Ch] = oklch(BASE.night['button-primary-hover']);
    out.night['button-primary'] = fromOklch(L, C, s.an);
    out.night['button-primary-hover'] = fromOklch(Lh, Ch, s.an);
  } else if (s.nb === 'p') {
    out.night['button-primary'] = NIGHT_PLUM;
    out.night['button-primary-hover'] = BASE.night['plum-fill'];
    out.night['on-button-primary'] = BASE.night['on-plum'];
  }
  return out;
}

// The cookie.

const clampInt = (value: string, min: number, max: number): number | null => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/** The settings in a cookie value, or null when it is malformed, out of range, or for older tokens. */
export function parseTune(value: string | null | undefined): TuneSettings | null {
  const m = value ? TUNE_PATTERN.exec(value) : null;
  if (!m || m[1] !== TUNE_KEY) return null;
  const tp = clampInt(m[2], -10, 10);
  const tn = clampInt(m[3], -10, 10);
  const ap = clampInt(m[4], 0, 359);
  const an = clampInt(m[5], 0, 359);
  if (tp === null || tn === null || ap === null || an === null) return null;
  return { tp, tn, ap, an, nb: m[6] as NightButton };
}

const hexList = (values: Record<TunedToken, string>) => TUNED.map((name) => values[name].slice(1)).join('');

export function serializeTune(s: TuneSettings): string {
  const v = resolveTune(s);
  return `v1|k:${TUNE_KEY}|tp:${s.tp}|tn:${s.tn}|ap:${s.ap}|an:${s.an}|nb:${s.nb}|P:${hexList(v.paper)}|N:${hexList(v.night)}`;
}

/** The style element's text for these settings: the same rules the head script writes. */
export const tuneCss = (s: TuneSettings) => {
  const v = resolveTune(s);
  return tuneRules(hexList(v.paper), hexList(v.night));
};

// In the browser.

export function readTuneCookie(): TuneSettings | null {
  const m = new RegExp(`(?:^|;\\s*)${TUNE_COOKIE}=([^;]*)`).exec(document.cookie);
  return parseTune(m?.[1]);
}

const secure = () => window.location.protocol === 'https:';

/** Paint the tune and save it; at the default settings, remove both. */
export function applyTune(s: TuneSettings) {
  if (isDefaultTune(s)) {
    clearTune();
    return;
  }
  let style = document.getElementById(TUNE_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = TUNE_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = tuneCss(s);
  document.cookie = `${TUNE_COOKIE}=${serializeTune(s)}; Path=/; Max-Age=${TUNE_MAX_AGE}; SameSite=Lax${secure() ? '; Secure' : ''}`;
}

/** Clear tune: no cookie, no style element, the tokens exactly. */
export const clearTune = clearTuneCookie;

// Suggestions, anchored on cobalt, the one color that never moves.

export interface Suggestion {
  id: 'system' | 'complementary' | 'split-a' | 'split-b' | 'analogous-a' | 'analogous-b' | 'triadic-a' | 'triadic-b';
  ap: number;
  an: number;
  /** A reason to look twice: too near cobalt (reads as a link) or ember (the stamp). */
  warn: 'cobalt' | 'ember' | null;
}

const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

export function suggestions(): Suggestion[] {
  const cobalt = hueOf(BASE.paper['cobalt-600']);
  const ember = hueOf(BASE.paper['ember-500']);
  const at = (turnBy: number) => (cobalt + turnBy + 360) % 360;
  const make = (id: Suggestion['id'], hue: number): Suggestion => ({
    id,
    ap: hue,
    // The Night partner is the same hue at the Night highlight's lightness and chroma.
    an: hue,
    warn: hueGap(hue, cobalt) <= 35 ? 'cobalt' : hueGap(hue, ember) <= 20 ? 'ember' : null,
  });
  return [
    { id: 'system', ap: DEFAULT_TUNE.ap, an: DEFAULT_TUNE.an, warn: null },
    make('complementary', at(180)),
    make('split-a', at(150)),
    make('split-b', at(210)),
    make('analogous-a', at(-30)),
    make('analogous-b', at(30)),
    make('triadic-a', at(120)),
    make('triadic-b', at(-120)),
  ];
}

// Copy values: a one-line summary, then the changed tokens in tokens.json's list shape.

export function copyValues(s: TuneSettings, summary: string): string {
  const v = resolveTune(s);
  const tokens = TUNED.filter((name) => v.paper[name] !== BASE.paper[name] || v.night[name] !== BASE.night[name]).map(
    (name) => ({ name, value: { paper: v.paper[name], night: v.night[name] }, usage: USAGE[name] }),
  );
  return `${summary}\n\n${JSON.stringify({ tokens }, null, 2)}\n`;
}
