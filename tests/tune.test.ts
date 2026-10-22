import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import base from '@/lib/tune-base.json';
import { contrastRatio } from '@/lib/contrast';
import { readTokens } from '@/lib/tokens';
import {
  BASE,
  DEFAULT_TUNE,
  copyValues,
  inGamut,
  isDefaultTune,
  oklch,
  parseTune,
  resolveTune,
  serializeTune,
  suggestions,
  tuneCss,
  type TuneSettings,
} from '@/lib/tune';
import { TUNED, TUNE_COOKIE, TUNE_KEY, tuneScript } from '@/lib/tune-head';

const mirror = JSON.parse(readFileSync(path.join(process.cwd(), 'docs/design-system/tokens.json'), 'utf8')) as {
  version: string;
};

/** Run the Tune head script against a cookie string; return the style element it added, if any. */
function runHeadScript(cookie: string) {
  const appended: Array<{ id: string; textContent: string }> = [];
  const document = {
    cookie,
    createElement: () => ({ id: '', textContent: '' }),
    head: { appendChild: (el: { id: string; textContent: string }) => appended.push(el) },
  };
  new Function('document', tuneScript)(document);
  return appended;
}

const tuned: TuneSettings = { tp: 3, tn: -2, ap: 300, an: 120, nb: 'a' };

describe('the Tune base tokens', () => {
  it('match the token layer: run node scripts/tune-base.mjs after any change to app/tokens.css', () => {
    const tokens = readTokens();
    for (const t of base.tokens) {
      expect(t.paper, `${t.name} (paper)`).toBe(tokens.paper[t.name]);
      expect(t.night, `${t.name} (night)`).toBe(tokens.night[t.name]);
    }
    for (const name of TUNED) expect(base.tokens.some((t) => t.name === name), name).toBe(true);
    expect(base.version).toBe(String(mirror.version));
  });
});

describe('at the default settings Tune changes nothing', () => {
  it('resolves every tuned token to the design system exactly', () => {
    expect(isDefaultTune(DEFAULT_TUNE)).toBe(true);
    const v = resolveTune(DEFAULT_TUNE);
    for (const name of TUNED) {
      expect(v.paper[name], `${name} paper`).toBe(BASE.paper[name]);
      expect(v.night[name], `${name} night`).toBe(BASE.night[name]);
    }
  });

  it('starts from the design system accents: plum on Paper, star gold on Night', () => {
    expect(DEFAULT_TUNE.ap).toBe(Math.round(oklch(BASE.paper['plum-700'])[2]));
    expect(DEFAULT_TUNE.an).toBe(Math.round(oklch(BASE.night.highlight)[2]));
    expect(DEFAULT_TUNE.nb).toBe('c');
  });

  it('the head script does nothing without a cookie, or with only other cookies', () => {
    expect(runHeadScript('')).toEqual([]);
    expect(runHeadScript('at-appearance=v1|m:night|p:page|w:30|t:0; other=1')).toEqual([]);
  });
});

describe('temperature and accent', () => {
  it('temperature holds lightness and stays in sRGB, warm toward amber, cool toward blue', () => {
    for (const t of [-10, -5, 5, 10]) {
      const v = resolveTune({ ...DEFAULT_TUNE, tp: t, tn: t });
      for (const mood of ['paper', 'night'] as const) {
        for (const name of ['surface-000', 'surface-100', 'surface-200', 'surface-band', 'surface-hero', 'ink-900', 'ink-700', 'ink-500', 'ink-200'] as const) {
          const [L0] = oklch(BASE[mood][name]);
          const [L1] = oklch(v[mood][name]);
          expect(Math.abs(L1 - L0), `${mood} ${name} at ${t}`).toBeLessThan(0.004);
        }
      }
    }
    // Warmer paper turns toward amber (hue about 70), cooler toward blue.
    expect(oklch(resolveTune({ ...DEFAULT_TUNE, tp: 10 }).paper['surface-100'])[2]).toBeGreaterThan(60);
    expect(oklch(resolveTune({ ...DEFAULT_TUNE, tp: 10 }).paper['surface-100'])[2]).toBeLessThan(95);
    const cool = oklch(resolveTune({ ...DEFAULT_TUNE, tp: -10 }).paper['surface-100'])[2];
    expect(cool).toBeGreaterThan(200);
    expect(cool).toBeLessThan(260);
  });

  it('accent turns the Paper plum family and the Night highlight, holding each lightness', () => {
    const v = resolveTune({ ...DEFAULT_TUNE, ap: 142, an: 200 });
    for (const name of ['plum-700', 'plum-fill', 'highlight', 'button-primary', 'button-primary-hover'] as const) {
      expect(Math.abs(oklch(v.paper[name])[0] - oklch(BASE.paper[name])[0]), name).toBeLessThan(0.005);
      expect(Math.abs(oklch(v.paper[name])[2] - 142 - (oklch(BASE.paper[name])[2] - DEFAULT_TUNE.ap)), name).toBeLessThan(2);
    }
    expect(Math.abs(oklch(v.night.highlight)[2] - 200)).toBeLessThan(2);
    // The Night button, the logo's gold, and cobalt stay.
    expect(v.night['button-primary']).toBe(BASE.night['button-primary']);
  });

  it('the Night primary button: pale cobalt, follows the accent, or the parked plum', () => {
    expect(resolveTune({ ...DEFAULT_TUNE, nb: 'p' }).night['button-primary']).toBe('#8a4a8d');
    expect(resolveTune({ ...DEFAULT_TUNE, nb: 'p' }).night['on-button-primary']).toBe(BASE.night['on-plum']);
    const follows = resolveTune({ ...DEFAULT_TUNE, an: 300, nb: 'a' }).night['button-primary'];
    expect(Math.abs(oklch(follows)[2] - 300)).toBeLessThan(2);
    // Each choice keeps its label readable at the default accent (the button, not a readout).
    for (const nb of ['c', 'a', 'p'] as const) {
      const v = resolveTune({ ...DEFAULT_TUNE, nb }).night;
      for (const bg of ['button-primary', 'button-primary-hover'] as const) {
        expect(contrastRatio(v['on-button-primary'], v[bg]), `${nb} ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('every resolved color is a valid hex inside sRGB', () => {
    for (const s of [tuned, { ...DEFAULT_TUNE, tp: -10, tn: 10, ap: 0, an: 359, nb: 'p' as const }]) {
      const v = resolveTune(s);
      for (const mood of ['paper', 'night'] as const) for (const name of TUNED) expect(v[mood][name]).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(inGamut([0.5, 0, 0])).toBe(true);
  });

  it('suggestions are anchored on cobalt, with a Night partner of the same hue', () => {
    const cobalt = Math.round(oklch(BASE.paper['cobalt-600'])[2]);
    const list = suggestions();
    expect(list[0]).toMatchObject({ id: 'system', ap: DEFAULT_TUNE.ap, an: DEFAULT_TUNE.an });
    expect(list.find((s) => s.id === 'complementary')!.ap).toBe((cobalt + 180) % 360);
    for (const s of list.slice(1)) expect(s.an).toBe(s.ap);
    // Analogous to cobalt sits next to the links, and split at cobalt plus 150 next to ember: flagged.
    expect(list.find((s) => s.id === 'analogous-a')!.warn).toBe('cobalt');
    expect(list.find((s) => s.id === 'analogous-b')!.warn).toBe('cobalt');
    expect(list.find((s) => s.id === 'complementary')!.warn).toBeNull();
  });
});

describe('the at-tune cookie', () => {
  it('round-trips, and the head script paints exactly what the Tune section paints', () => {
    const value = serializeTune(tuned);
    expect(parseTune(value)).toEqual(tuned);
    const added = runHeadScript(`at-appearance=v1|m:paper|p:page|w:30|t:0; ${TUNE_COOKIE}=${value}`);
    expect(added).toHaveLength(1);
    expect(added[0].id).toBe('at-tune');
    expect(added[0].textContent).toBe(tuneCss(tuned));
    expect(value.length).toBeLessThan(260);
  });

  it('sets only the fixed list of custom properties', () => {
    const css = runHeadScript(`${TUNE_COOKIE}=${serializeTune(tuned)}`)[0].textContent;
    const names = [...css.matchAll(/--([\w-]+):#[0-9a-f]{6};/g)].map((m) => m[1]);
    expect(names).toEqual([...TUNED, ...TUNED]);
    expect(css.replace(/--[\w-]+:#[0-9a-f]{6};/g, '')).toBe('html[data-theme="paper"]{}html[data-theme="night"]{}');
  });

  it('ignores a tune made for older tokens, and anything malformed, whole', () => {
    const good = serializeTune(tuned);
    const bad = [
      good.replace(`k:${TUNE_KEY}`, 'k:00000000'),
      good.replace('|tp:3|', '|tp:x|'),
      good.replace('|nb:a|', '|nb:z|'),
      good.replace(/P:[0-9a-f]{6}/, 'P:zzzzzz'),
      good.replace(/P:([0-9a-f]{6})/, 'P:$1}body{display:none}'),
      good.slice(0, -6),
      `${good}ff`,
      good.replace('v1|', 'v2|'),
      `${good}|x:1`,
    ];
    for (const value of bad) {
      expect(parseTune(value), value.slice(0, 40)).toBeNull();
      expect(runHeadScript(`${TUNE_COOKIE}=${value}`), value.slice(0, 40)).toEqual([]);
    }
    // In range for the pattern but not for the sliders: the Tune section starts from the defaults.
    expect(parseTune(good.replace('|tp:3|', '|tp:11|'))).toBeNull();
    expect(parseTune(good.replace('|ap:300|', '|ap:360|'))).toBeNull();
  });
});

describe('Copy values', () => {
  it('writes a one-line summary, then the changed tokens in tokens.json list shape', () => {
    const text = copyValues(tuned, 'Summary line.');
    const [summary, rest] = text.split('\n\n');
    expect(summary).toBe('Summary line.');
    const json = JSON.parse(rest) as { tokens: Array<{ name: string; value: { paper: string; night: string }; usage: string }> };
    expect(json.tokens.length).toBeGreaterThan(0);
    const v = resolveTune(tuned);
    for (const t of json.tokens) {
      expect(TUNED).toContain(t.name);
      expect(t.value).toEqual({ paper: v.paper[t.name as (typeof TUNED)[number]], night: v.night[t.name as (typeof TUNED)[number]] });
      expect(t.value.paper !== BASE.paper[t.name] || t.value.night !== BASE.night[t.name]).toBe(true);
      expect(typeof t.usage).toBe('string');
    }
    expect(JSON.parse(copyValues(DEFAULT_TUNE, 'x').split('\n\n')[1])).toEqual({ tokens: [] });
  });
});

describe('the Tune section (1i)', () => {
  const section = readFileSync(path.join(process.cwd(), 'components/TuneSection.tsx'), 'utf8');
  const words = readFileSync(path.join(process.cwd(), 'content/tune.ts'), 'utf8');

  it('has no contrast readouts or warnings: David accepts the risk while tuning', () => {
    expect(section).not.toMatch(/readouts\(|copy\.contrast|aria-live/);
    expect(words).not.toMatch(/contrast:|Below \$\{min\}|pairs below AA/);
  });

  it('restores the defaults under the visitor panel\'s words, with a name that says it is Tune\'s', () => {
    expect(words).toMatch(/restore: 'Restore defaults'/);
    expect(words).toMatch(/restoreName: 'Restore defaults for Tune'/);
    expect(section).toMatch(/aria-label=\{copy\.restoreName\}/);
    // WCAG 2.5.3: the accessible name contains the visible label, at its start.
    expect('Restore defaults for Tune'.startsWith('Restore defaults')).toBe(true);
    expect(section).toMatch(/clearTune\(\)/);
    expect(words).not.toMatch(/Clear tune/);
  });
});
