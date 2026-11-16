// Where sign-in sends someone back to (5k, David, Nov 16: "lets sort the join the conversation flow
// based on best ux"). A visitor who presses Join the conversation, opens a member page, or signs in
// from the header comes back to the page they started from, through the welcome steps when their
// chart or name is still missing.
//
// The path is ours to check, never a full address: one leading slash, then only the characters our
// own paths use, so `//host`, `/\host`, `https:`, `..`, a query, and a fragment are all refused (an
// open redirect is the risk). Sign-in's own pages and the welcome steps are refused too, so nothing
// loops, and so is the home page, where everyone starts: signing in from it goes on to the member's
// chart as before.
// No query string ever rides along, so nothing typed into a page can reach the address bar this way.

/** The cookie that carries the path through Google and back, set by startGoogleSignIn for /auth only. */
export const RETURN_COOKIE = 'at-return';
/** Ten minutes: long enough to pick a Google account, short enough to be gone by the next visit. */
export const RETURN_MAX_AGE = 60 * 10;

const SHAPE = /^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\/?$/;
const NEVER = ['/sign-in', '/auth', '/api', '/chart', '/welcome'] as const;
const under = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

/** The path itself when it is one of ours and worth coming back to, otherwise null. */
export function safeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 200 || !SHAPE.test(value)) return null;
  const path = value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
  if (NEVER.some((prefix) => under(path, prefix))) return null;
  return path;
}

/** `/sign-in`, carrying the page a signed-out visitor tried to open. */
export const signInFor = (path: string): string => {
  const next = safeReturnTo(path);
  return next ? `/sign-in?next=${encodeURIComponent(next)}` : '/sign-in';
};

/**
 * Where a member goes once signed in: the welcome steps, which send a member with a name and a chart
 * straight on to `next` (or their chart) and otherwise ask for what is missing first.
 */
export const afterSignIn = (next: string | null): string =>
  next ? `/welcome?next=${encodeURIComponent(next)}` : '/welcome';
