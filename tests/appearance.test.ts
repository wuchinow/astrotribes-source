import { describe, expect, it } from 'vitest';
import {
  DEFAULT_APPEARANCE,
  appearanceScript,
  cookieString,
  parseAppearance,
  serializeAppearance,
  type Appearance,
} from '@/lib/appearance';

/** Run the head script against a cookie string and a device setting; return what it put on <html>. */
function runHeadScript(cookie: string, deviceDark = false) {
  const attrs: Record<string, string> = {};
  const style: Record<string, string> = {};
  const listeners: Array<() => void> = [];
  const query = {
    matches: deviceDark,
    addEventListener: (_: string, fn: () => void) => listeners.push(fn),
  };
  const documentElement = {
    setAttribute: (name: string, value: string) => (attrs[name] = value),
    getAttribute: (name: string) => attrs[name] ?? null,
    style: { setProperty: (name: string, value: string) => (style[name] = value) },
  };
  const window = { matchMedia: () => query };
  new Function('document', 'window', appearanceScript)({ cookie, documentElement }, window);
  return {
    attrs,
    style,
    /** Flip the device setting and fire its change event. */
    flip(dark: boolean) {
      query.matches = dark;
      listeners.forEach((fn) => fn());
    },
  };
}

describe('the at-appearance cookie', () => {
  it('round-trips every field', () => {
    const a: Appearance = { mood: 'device', art: 'p7', wash: 15, text: 3 };
    expect(serializeAppearance(a)).toBe('v1|m:device|p:p7|w:15|t:3');
    expect(parseAppearance(serializeAppearance(a))).toEqual(a);
  });

  it('falls back to the defaults for anything unknown', () => {
    expect(parseAppearance(undefined)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance('v2|m:night')).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance('v1|m:dusk|p:p11|w:35|t:4')).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance('v1|m:night|w:12|t:1')).toEqual({ ...DEFAULT_APPEARANCE, mood: 'night', text: 1 });
    expect(parseAppearance(`v1|m:night|${'x'.repeat(80)}`)).toEqual(DEFAULT_APPEARANCE);
  });

  it('defaults to Paper, the page’s own painting, 30%, and the base text size', () => {
    expect(DEFAULT_APPEARANCE).toEqual({ mood: 'paper', art: 'page', wash: 30, text: 0 });
  });

  it('is a year-long, Lax, path-wide cookie, Secure on https, never HttpOnly', () => {
    const cookie = cookieString('v1|m:night|p:page|w:30|t:0', true);
    expect(cookie).toBe('at-appearance=v1|m:night|p:page|w:30|t:0; Path=/; Max-Age=31536000; SameSite=Lax; Secure');
    expect(cookie).not.toMatch(/HttpOnly/i);
  });
});

describe('the head script', () => {
  it('opens on Paper with no cookie, even on a dark-mode device', () => {
    const { attrs, style } = runHeadScript('', true);
    expect(attrs['data-theme']).toBe('paper');
    expect(attrs['data-mood']).toBe('paper');
    expect(attrs['data-art']).toBe('page');
    expect(style['--wash']).toBeUndefined();
    expect(style['--text-step']).toBe('0');
  });

  it('carries a returning at-mood Night choice over', () => {
    expect(runHeadScript('at-mood=night').attrs['data-theme']).toBe('night');
    expect(runHeadScript('other=1; at-mood=paper').attrs['data-theme']).toBe('paper');
  });

  it('prefers at-appearance over at-mood', () => {
    expect(runHeadScript('at-mood=night; at-appearance=v1|m:paper').attrs['data-theme']).toBe('paper');
  });

  it('applies every setting', () => {
    const { attrs, style } = runHeadScript('a=b; at-appearance=v1|m:night|p:p9|w:15|t:2; c=d');
    expect(attrs).toMatchObject({ 'data-theme': 'night', 'data-mood': 'night', 'data-art': 'p9' });
    expect(style).toEqual({ '--wash': '0.15', '--text-step': '2' });
  });

  it('follows the device live when the visitor chose Match my device', () => {
    const run = runHeadScript('at-appearance=v1|m:device', false);
    expect(run.attrs['data-theme']).toBe('paper');
    run.flip(true);
    expect(run.attrs['data-theme']).toBe('night');
  });

  it.each([
    'v1|m:dusk|p:p11|w:35|t:4',
    'v2|m:night|p:none',
    'v1|m:night|w:12|t:1',
    'v1|m:paper|p:none|w:0|t:3',
    'v1|p:p7|w:5',
  ])('reads %s exactly as parseAppearance does', (value) => {
    const expected = parseAppearance(value);
    const { attrs, style } = runHeadScript(`at-appearance=${value}`);
    expect(attrs['data-mood']).toBe(expected.mood);
    expect(attrs['data-art']).toBe(expected.art);
    expect(style['--text-step']).toBe(String(expected.text));
    if (style['--wash'] !== undefined) expect(Number(style['--wash'])).toBe(expected.wash / 100);
    else expect(expected.wash).toBe(DEFAULT_APPEARANCE.wash);
  });
});
