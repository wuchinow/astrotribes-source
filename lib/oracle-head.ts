// The Oracle's day (1c, fixed in 1i). /oracle is built with five days in it (the UTC date and two
// either side, lib/oracle.ts); the visitor's own calendar date picks the one shown, and CSS hides
// the rest (display: none, so screen readers skip them too). Two things apply the choice:
//
// - oracleDayScript: an inline script first in the page, which runs on a full page load before any
//   day is parsed, the way the at-appearance head script sets the mood (App Router pages can't
//   add inline scripts to <head>).
// - applyOracleDay, from OracleDaySync's layout effect, which runs before paint on a client-side
//   navigation to /oracle too. React never executes an inline script it inserts on a client
//   navigation, so without it a visitor arriving from the nav got the no-JavaScript day, the UTC
//   one (1i, U26).
//
// Both read the browser's clock and set one attribute on <html>; they send and store nothing. If the
// local date is not among the built days (a clock far off, or a cache older than a day), the nearest
// built day shows with a note saying which day it is. Without JavaScript, the UTC day shows.

export const LOCAL_ATTR = 'data-oracle-day';
export const NEAREST_ATTR = 'data-oracle-nearest';

/** The calendar date on the visitor's clock, "YYYY-MM-DD". */
export function localDate(now: Date = new Date()): string {
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The day to show: the local date if it was built, else the nearest built day. `days` oldest first. */
export function chooseDay(days: readonly string[], local: string): { day: string; nearest: boolean } {
  if (days.includes(local)) return { day: local, nearest: false };
  return { day: local < days[0] ? days[0] : days[days.length - 1], nearest: true };
}

/** Put the choice on <html>. */
export function applyOracleDay(days: readonly string[], root: Element = document.documentElement, now = new Date()) {
  const { day, nearest } = chooseDay(days, localDate(now));
  root.setAttribute(LOCAL_ATTR, day);
  if (nearest) root.setAttribute(NEAREST_ATTR, '');
  else root.removeAttribute(NEAREST_ATTR);
}

/**
 * The inline script for one build of the page: the same choice as applyOracleDay, in a few lines of
 * ES5. tests/oracle/day-script.test.ts runs both against the same cases so they never drift.
 */
export function oracleDayScript(days: readonly string[]): string {
  const list = JSON.stringify(days);
  return `(function(){try{var d=new Date(),p=function(n){return(n<10?'0':'')+n},k=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()),s=${list},h=document.documentElement;if(s.indexOf(k)<0){h.setAttribute('${NEAREST_ATTR}','');k=k<s[0]?s[0]:s[s.length-1];}else{h.removeAttribute('${NEAREST_ATTR}');}h.setAttribute('${LOCAL_ATTR}',k);}catch(e){}})();`;
}

/** The CSS that shows one day: the local one once the script has run, else the UTC one. */
export function oracleDayCss(days: readonly string[], utc: string): string {
  const shown = days.map((day) => `html[${LOCAL_ATTR}="${day}"] [data-day="${day}"]`).join(',');
  return [
    '[data-day]{display:none}',
    `html:not([${LOCAL_ATTR}]) [data-day="${utc}"],${shown}{display:block}`,
    `.oracle-nearest{display:none}html[${NEAREST_ATTR}] .oracle-nearest{display:block}`,
  ].join('');
}
