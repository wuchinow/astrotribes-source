// A hint, before first paint, that the visitor is a signed-in member (5a, David, Nov 10: "the how it
// works section is not needed once signed in"). The public pages are static, so they cannot know who
// is looking; the header's account slot finds out once the browser has read the session, which is a
// moment after the page shows. This head script sets `data-member` on <html> when the sign-in cookie
// is there, so a member's page hides what is only for visitors (`.guest-only` in app/globals.css)
// without a flash or a jump. The header's account slot then sets or clears it from the real session
// (`syncMemberHint`), so a stale cookie hides nothing for long.
//
// It is display only. It reads no value from the cookie, only that one by that name exists, and it
// decides nothing about access: every member page, action, and route still checks the session itself
// (invariant 5). It sets no cookie and stores nothing.

export const MEMBER_ATTR = 'data-member';

/**
 * Supabase's session cookie, `sb-<project>-auth-token`, whole or in numbered parts (`.0`, `.1`). Not
 * the sign-in flow's own `…-auth-token-code-verifier`, which a visitor holds while signing in.
 */
export const MEMBER_COOKIE = /(?:^|;\s*)sb-[a-z0-9]+-auth-token(?:\.\d+)?=/;

export const memberHintScript = `(function(){try{if(${MEMBER_COOKIE.toString()}.test(document.cookie))document.documentElement.setAttribute('${MEMBER_ATTR}','');}catch(e){}})();`;

/** The header's account slot calls this once the session is read: the hint follows the real answer. */
export function syncMemberHint(signedIn: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.toggleAttribute(MEMBER_ATTR, signedIn);
}
