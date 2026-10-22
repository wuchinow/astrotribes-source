// The visitor's display settings: mood, painting, wash strength, and text size, in one functional
// cookie (at-appearance). It is set only when the visitor changes a setting, holds nothing but these
// four, and the server never reads it, so every page stays pre-built. A tiny script in <head>
// applies it to <html> before first paint, so nothing flashes.
//
// With no cookie: Paper (every first visit, whatever the device's dark mode; decisions, Sep 25),
// each page's own painting, the wash at 30%, and the base text size.

import { WASH_IDS, type WashId } from './art';

export const APPEARANCE_COOKIE = 'at-appearance';
/** The 0a to 1b mood cookie. Read once so a Night choice carries over, then deleted. */
export const LEGACY_MOOD_COOKIE = 'at-mood';
/** One year, in seconds. */
export const APPEARANCE_MAX_AGE = 60 * 60 * 24 * 365;

export const MOODS = ['paper', 'night', 'device'] as const;
export type MoodChoice = (typeof MOODS)[number];
export type Mood = 'paper' | 'night';

/** `page`: each page's own painting. `none`: no washes. Or one wash everywhere. */
export type ArtChoice = 'page' | 'none' | WashId;
export const ART_CHOICES: readonly ArtChoice[] = ['page', 'none', ...WASH_IDS];

export const WASH_STEPS = [0, 5, 10, 15, 20, 25, 30] as const;
export type WashStep = (typeof WASH_STEPS)[number];

/** Text size steps: +0, +2, +4, +6px on body, lede, body-sm, and caption (18 to 24px on desktop). */
export const TEXT_STEPS = [0, 1, 2, 3] as const;
export type TextStep = (typeof TEXT_STEPS)[number];

export interface Appearance {
  mood: MoodChoice;
  art: ArtChoice;
  wash: WashStep;
  text: TextStep;
}

export const DEFAULT_APPEARANCE: Appearance = { mood: 'paper', art: 'page', wash: 30, text: 0 };

const MAX_LENGTH = 64;

/** The cookie value: `v1|m:paper|p:page|w:30|t:0`. `|` and `:` are legal cookie characters. */
export function serializeAppearance(a: Appearance): string {
  return `v1|m:${a.mood}|p:${a.art}|w:${a.wash}|t:${a.text}`;
}

/** Strict: each field is checked against its list, and anything unknown falls back to its default. */
export function parseAppearance(value: string | undefined | null): Appearance {
  const result = { ...DEFAULT_APPEARANCE };
  if (!value || value.length > MAX_LENGTH) return result;
  const parts = value.split('|');
  if (parts[0] !== 'v1') return result;
  for (const part of parts.slice(1)) {
    const [key, raw] = part.split(':');
    if (key === 'm' && (MOODS as readonly string[]).includes(raw)) result.mood = raw as MoodChoice;
    if (key === 'p' && (ART_CHOICES as readonly string[]).includes(raw)) result.art = raw as ArtChoice;
    if (key === 'w' && (WASH_STEPS as readonly number[]).includes(Number(raw)) && /^\d+$/.test(raw)) {
      result.wash = Number(raw) as WashStep;
    }
    if (key === 't' && /^\d$/.test(raw) && (TEXT_STEPS as readonly number[]).includes(Number(raw))) {
      result.text = Number(raw) as TextStep;
    }
  }
  return result;
}

export const cookieString = (value: string, secure: boolean) =>
  `${APPEARANCE_COOKIE}=${value}; Path=/; Max-Age=${APPEARANCE_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;

export const expiredCookie = (name: string, secure: boolean) =>
  `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`;

// The head script. It repeats the parse above in a few lines of ES5, since it runs before any
// bundle; tests/appearance.test.ts runs it against the same cases as parseAppearance so the two
// never drift. It sets:
//   data-theme       paper or night (device resolves through matchMedia, and keeps following it)
//   data-mood        the choice itself: paper, night, or device
//   data-art         page, none, or a wash id
//   --wash           the wash strength as a fraction (0 to 0.3); absent means the token default
//   --text-step      0 to 3
const list = (values: readonly (string | number)[]) => values.join('|');

export const appearanceScript = `(function(){try{var d=document,h=d.documentElement,c=d.cookie,o={m:'paper',p:'page',w:null,t:0};var v=c.match(/(?:^|;\\s*)${APPEARANCE_COOKIE}=([^;]{1,${MAX_LENGTH}})/);if(v&&v[1].split('|')[0]==='v1'){var s=v[1].split('|');for(var i=1;i<s.length;i++){var k=s[i].split(':');if(k[0]==='m'&&/^(${list(MOODS)})$/.test(k[1]))o.m=k[1];if(k[0]==='p'&&/^(${list(ART_CHOICES)})$/.test(k[1]))o.p=k[1];if(k[0]==='w'&&/^(${list(WASH_STEPS)})$/.test(k[1]))o.w=+k[1];if(k[0]==='t'&&/^(${list(TEXT_STEPS)})$/.test(k[1]))o.t=+k[1];}}else{var l=c.match(/(?:^|;\\s*)${LEGACY_MOOD_COOKIE}=(paper|night)(?:;|$)/);if(l)o.m=l[1];}var q=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');var set=function(){h.setAttribute('data-theme',o.m==='device'?(q&&q.matches?'night':'paper'):o.m);};set();if(o.m==='device'&&q&&q.addEventListener)q.addEventListener('change',function(){if(h.getAttribute('data-mood')==='device'){o.m='device';set();}});h.setAttribute('data-mood',o.m);h.setAttribute('data-art',o.p);if(o.w!==null)h.style.setProperty('--wash',String(o.w/100));h.style.setProperty('--text-step',String(o.t));}catch(e){}})();`;

// Client side: the panel and the sun and moon toggle read the settings back from <html> (the one
// source of truth once the head script has run) and write them with applyAppearance.

export function readAppearance(): Appearance {
  const h = document.documentElement;
  const wash = h.style.getPropertyValue('--wash');
  return parseAppearance(
    serializeAppearance({
      mood: (h.getAttribute('data-mood') as MoodChoice) ?? 'paper',
      art: (h.getAttribute('data-art') as ArtChoice) ?? 'page',
      wash: (wash ? Math.round(Number(wash) * 100) : DEFAULT_APPEARANCE.wash) as WashStep,
      text: Number(h.style.getPropertyValue('--text-step') || 0) as TextStep,
    }),
  );
}

let deviceQuery: MediaQueryList | null = null;
function followDevice() {
  const h = document.documentElement;
  if (h.getAttribute('data-mood') === 'device') {
    h.setAttribute('data-theme', deviceQuery?.matches ? 'night' : 'paper');
  }
}

/** Put the settings on <html> as the head script would. */
export function paintAppearance(a: Appearance) {
  const h = document.documentElement;
  if (!deviceQuery && window.matchMedia) {
    deviceQuery = window.matchMedia('(prefers-color-scheme: dark)');
    deviceQuery.addEventListener('change', followDevice);
  }
  h.setAttribute('data-mood', a.mood);
  h.setAttribute('data-theme', a.mood === 'device' ? (deviceQuery?.matches ? 'night' : 'paper') : a.mood);
  h.setAttribute('data-art', a.art);
  h.style.setProperty('--wash', String(a.wash / 100));
  h.style.setProperty('--text-step', String(a.text));
}

const secure = () => window.location.protocol === 'https:';

/** A setting changed: apply it and write the cookie (dropping the old mood cookie). */
export function applyAppearance(a: Appearance) {
  paintAppearance(a);
  document.cookie = cookieString(serializeAppearance(a), secure());
  document.cookie = expiredCookie(LEGACY_MOOD_COOKIE, secure());
}

/** Reset: back to the defaults, and no cookie at all. */
export function resetAppearance() {
  paintAppearance(DEFAULT_APPEARANCE);
  document.documentElement.style.removeProperty('--wash');
  document.cookie = expiredCookie(APPEARANCE_COOKIE, secure());
  document.cookie = expiredCookie(LEGACY_MOOD_COOKIE, secure());
}

/** Subscribe to changes on <html>, for useSyncExternalStore. */
export function subscribeAppearance(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-mood', 'data-art', 'style'],
  });
  return () => observer.disconnect();
}
