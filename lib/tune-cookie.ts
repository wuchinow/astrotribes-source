// The names Tune (1f) shares between the head script, the Tune section, and the Appearance panel's
// loader. Kept apart from lib/tune-head.ts so the panel can clear a tune without loading the tokens.

export const TUNE_COOKIE = 'at-tune';
/** 30 days, in seconds: the preview passcode's lifetime. */
export const TUNE_MAX_AGE = 60 * 60 * 24 * 30;
export const TUNE_STYLE_ID = 'at-tune';

/** Remove a tune: the cookie and the style element. The site is the design system again. */
export function clearTuneCookie() {
  document.getElementById(TUNE_STYLE_ID)?.remove();
  document.cookie = `${TUNE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
}
