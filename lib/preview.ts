// The preview passcode. The engine runs on Swiss Ephemeris's AGPL licence, so the pages and APIs
// that reach it stay behind a passcode until Dawa settles the licence (decisions, 1). proxy.ts
// turns visitors away at the door, and every gated page and route checks again here (invariant 5).
// Nothing in this file logs, and the passcode itself never leaves it: the cookie holds an HMAC.
import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const PREVIEW_COOKIE = 'at-preview';
export const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

/**
 * Every path behind the passcode. proxy.ts's matcher must list the same prefixes (its config has
 * to be a literal), and tests/preview/gate.test.ts checks that they agree.
 */
export const GATED_PREFIXES = ['/chart', '/sky', '/api/chart', '/api/place'] as const;

/** Where the passcode page may send someone back to: gated pages only, never a full URL. */
export const RETURN_PATHS = ['/chart', '/sky'] as const;
export type ReturnPath = (typeof RETURN_PATHS)[number];

export const isGatedPath = (pathname: string): boolean =>
  GATED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export const safeReturnPath = (value: unknown): ReturnPath =>
  RETURN_PATHS.find((path) => path === value) ?? '/chart';

/** Null when PREVIEW_PASSCODE is unset or blank: then nothing opens. */
const passcode = (): string | null => {
  const value = process.env.PREVIEW_PASSCODE;
  return value && value.trim() !== '' ? value : null;
};

export const previewIsOpenable = (): boolean => passcode() !== null;

/** The cookie value for a passcode. Changing PREVIEW_PASSCODE changes it, which signs everyone out. */
export const previewToken = (secret: string): string =>
  createHmac('sha256', secret).update('at-preview:v1').digest('base64url');

const sameText = (a: string, b: string): boolean => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** True when a cookie value was made from the current passcode. */
export const isPreviewToken = (value: string | undefined): boolean => {
  const secret = passcode();
  if (secret === null || !value) return false;
  return sameText(value, previewToken(secret));
};

/** Compares HMACs, so the two sides are always the same length and the time says nothing. */
export const passcodeMatches = (attempt: string): boolean => {
  const secret = passcode();
  if (secret === null) return false;
  return sameText(previewToken(attempt), previewToken(secret));
};

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

/** For pages (`await cookies()`) and route handlers (`request.cookies`). */
export const hasPreviewAccess = (cookies: CookieReader): boolean =>
  isPreviewToken(cookies.get(PREVIEW_COOKIE)?.value);

export const previewCookie = (value: string) =>
  ({
    name: PREVIEW_COOKIE,
    value,
    httpOnly: true,
    // Secure everywhere but `next dev` on http://localhost.
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
    maxAge: PREVIEW_MAX_AGE,
  }) as const;
