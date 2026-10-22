// Tune (1f), the team's tuning section in the Appearance panel, applied before first paint. This file
// holds only what the head script needs: the fixed list of custom properties Tune may set, the
// cookie's name and shape, and a key for the base tokens. The math lives in lib/tune.ts, which loads
// with the Tune section only after the server confirms the preview passcode.
//
// The cookie, at-tune, is team-only: it is written only by the Tune section, lasts 30 days like
// at-preview, and is cleared whenever the server check says no. It holds the slider positions and
// the resolved colors, so the head script does no math:
//   v1|k:<key>|tp:<-10..10>|tn:<-10..10>|ap:<0..359>|an:<0..359>|nb:<c|a|p>|P:<hex…>|N:<hex…>
// P and N are TUNED's colors in order for Paper and Night, six hex digits each. The head script
// accepts the cookie only whole: one pattern for the entire value, the current key, and nothing
// but hex digits in the color lists. Anything else is ignored and the site renders from the tokens.

import base from './tune-base.json';
import { TUNE_COOKIE, TUNE_STYLE_ID } from './tune-cookie';

export { TUNE_COOKIE, TUNE_MAX_AGE, TUNE_STYLE_ID } from './tune-cookie';

/** The custom properties Tune may set, in the cookie's order. Nothing else is ever written. */
export const TUNED = [
  'surface-000',
  'surface-100',
  'surface-200',
  'surface-band',
  'surface-hero',
  'ink-900',
  'ink-700',
  'ink-500',
  'ink-200',
  'plum-700',
  'plum-fill',
  'highlight',
  'button-primary',
  'button-primary-hover',
  'on-button-primary',
] as const;
export type TunedToken = (typeof TUNED)[number];

const HEX_LENGTH = TUNED.length * 6;

/** FNV-1a over the tuned tokens' base values, so a tune made for older tokens is ignored. */
function fnv(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const byName = new Map(base.tokens.map((t) => [t.name, t]));
export const TUNE_KEY = fnv(TUNED.map((name) => `${name}:${byName.get(name)!.paper}:${byName.get(name)!.night}`).join('|'));

/** The whole cookie value, strictly. Groups: key, tp, tn, ap, an, nb, P, N. */
export const TUNE_PATTERN = new RegExp(
  `^v1\\|k:([0-9a-f]{8})\\|tp:(-?\\d{1,2})\\|tn:(-?\\d{1,2})\\|ap:(\\d{1,3})\\|an:(\\d{1,3})\\|nb:([cap])\\|P:([0-9a-f]{${HEX_LENGTH}})\\|N:([0-9a-f]{${HEX_LENGTH}})$`,
);

/** The style element's text for two lists of colors, in TUNED order. */
export function tuneRules(paper: string, night: string): string {
  const decls = (hex: string) => TUNED.map((name, i) => `--${name}:#${hex.slice(i * 6, i * 6 + 6)};`).join('');
  return `html[data-theme="paper"]{${decls(paper)}}html[data-theme="night"]{${decls(night)}}`;
}

// The head script, in ES5, run right after the appearance script. With no at-tune cookie it does one
// failed match and nothing else. tests/tune.test.ts runs it against good, stale, and malformed cookies.
export const tuneScript = `(function(){try{var d=document,m=d.cookie.match(/(?:^|;\\s*)${TUNE_COOKIE}=([^;]{1,${HEX_LENGTH * 2 + 120}})/);if(!m)return;var v=m[1].match(${TUNE_PATTERN.toString()});if(!v||v[1]!=='${TUNE_KEY}')return;var n=${JSON.stringify(TUNED)},a='',b='',i;for(i=0;i<n.length;i++){a+='--'+n[i]+':#'+v[7].substr(i*6,6)+';';b+='--'+n[i]+':#'+v[8].substr(i*6,6)+';';}var s=d.createElement('style');s.id='${TUNE_STYLE_ID}';s.textContent='html[data-theme="paper"]{'+a+'}html[data-theme="night"]{'+b+'}';d.head.appendChild(s);}catch(e){}})();`;
