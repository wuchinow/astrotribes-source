import { describe, expect, it } from 'vitest';
import { MEMBER_ATTR, MEMBER_COOKIE, memberHintScript } from '@/lib/member-hint';

/** Run the head script against a cookie string; return the attributes it put on <html>. */
function runHeadScript(cookie: string) {
  const attrs: Record<string, string> = {};
  const documentElement = { setAttribute: (name: string, value: string) => (attrs[name] = value) };
  new Function('document', memberHintScript)({ cookie, documentElement });
  return attrs;
}

describe('the member hint (5a)', () => {
  it('marks a visitor who holds the sign-in cookie, whole or in parts', () => {
    expect(runHeadScript('sb-abcdefghij0123456789-auth-token=base64-x')).toHaveProperty(MEMBER_ATTR);
    expect(runHeadScript('at-appearance=v1|m:night; sb-abc123-auth-token.0=base64-x; sb-abc123-auth-token.1=y')).toHaveProperty(MEMBER_ATTR);
  });

  it('leaves everyone else alone', () => {
    expect(runHeadScript('')).toEqual({});
    expect(runHeadScript('at-appearance=v1|m:night; at-preview=x')).toEqual({});
    // A visitor in the middle of signing in holds only the flow's own cookie.
    expect(runHeadScript('sb-abc123-auth-token-code-verifier=x')).toEqual({});
    expect(runHeadScript('notsb-abc123-auth-token=x')).toEqual({});
  });

  it('reads no value from the cookie, only its name', () => {
    expect(MEMBER_COOKIE.source.endsWith('=')).toBe(true);
    expect(memberHintScript).not.toMatch(/JSON|atob|decodeURI|split/);
  });

  it('never throws where cookies are blocked', () => {
    const blocked = { get cookie(): string { throw new Error('blocked'); }, documentElement: {} };
    expect(() => new Function('document', memberHintScript)(blocked)).not.toThrow();
  });
});
