// The preview passcode. Since 1d it gates no page and only keeps Tune team-only: the free chart and
// sign-in opened on Oct 22 (David), once the site's code was public under the AGPL (the Source link)
// and the Vercel Firewall limited /api/chart and /api/place per IP, and Today's sky opened with 1d.
// Nothing in this file logs, and the passcode itself never leaves it: the cookie holds an HMAC.
import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const PREVIEW_COOKIE = 'at-preview';
export const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

/**
 * The member paths, open to anyone: proxy.ts refreshes the Supabase session on these. Its matcher
 * lists them (its config has to be a literal), and tests/preview/gate.test.ts checks that they agree.
 */
export const MEMBER_PREFIXES = ['/sign-in', '/auth', '/account', '/api/account', '/welcome', '/your-chart'] as const;

/** Where the passcode page may send someone back to: the home page only (no page is gated), never a full URL. */
export const RETURN_PATHS = ['/'] as const;
export type ReturnPath = (typeof RETURN_PATHS)[number];

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isMemberPath = (pathname: string): boolean => MEMBER_PREFIXES.some((prefix) => under(pathname, prefix));

export const safeReturnPath = (value: unknown): ReturnPath =>
  RETURN_PATHS.find((path) => path === value) ?? '/';

/** Null when PREVIEW_PASSCODE is unset or blank: then nothing opens. */
const passcode = (): string | null => {
  const value = process.env.PREVIEW_PASSCODE;
  return value && value.trim() !== '' ? value : null;
};

export const previewIsOpenable = (): boolean => passcode() !== null;

/**
 * The passcode itself, shown on the passcode page so anyone can open the preview (David, Oct 22).
 * It keeps out crawlers and passers-by, not people: Google's Testing mode limits who can sign in.
 */
export const publicPasscode = (): string | null => passcode()?.trim() ?? null;

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
