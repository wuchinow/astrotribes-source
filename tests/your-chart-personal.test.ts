// Your chart as the member's personal page (5h, Dawa's Nov 15 notes): the name top and center, the Core
// Five, the Moon's phase at birth, what the Chinese animal and element mean, and the card fix (note 5).
// The page needs a session and a database, so its promises are held as text and data here.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { birthMoonCopy } from '@/content/birth-moon';
import { chartWheelCopy } from '@/content/chart-wheel';
import { ANIMAL_MEANINGS, ELEMENT_MEANINGS } from '@/content/chinese-meanings';
import { yourChartCopy } from '@/content/welcome';
import { BIRTH_PHASES, HALF_DAY_GAIN, birthMoon, phaseAt, phaseLook, litShare } from '@/lib/birth-moon';
import { ANIMALS, ELEMENTS } from '@/lib/chinese-zodiac';
import { computeChart } from '@/lib/engine';

const read = (file: string) => readFileSync(path.join(process.cwd(), file), 'utf8');
const page = read('app/(public)/your-chart/page.tsx');
const LONDON = { lat: 51.5074, lon: -0.1278 };

describe("the Moon's phase at birth (note 9)", () => {
  it("follows Rudhyar's eight phases, 45 degrees each from the New Moon", () => {
    expect(phaseAt(0)).toBe('new');
    expect(phaseAt(44.9)).toBe('new');
    expect(phaseAt(45)).toBe('crescent');
    expect(phaseAt(90)).toBe('firstQuarter');
    expect(phaseAt(179.9)).toBe('gibbous');
    expect(phaseAt(180)).toBe('full');
    expect(phaseAt(225)).toBe('disseminating');
    expect(phaseAt(270)).toBe('lastQuarter');
    expect(phaseAt(359.9)).toBe('balsamic');
    expect(phaseAt(-10)).toBe('balsamic');
  });

  it('is exact with a birth time, and names both phases when a day without one crossed a line', () => {
    expect(birthMoon(100, 100 + 46, true)).toEqual({ phase: 'crescent', or: null });
    expect(birthMoon(100, 100 + 46, false)).toEqual({ phase: 'crescent', or: 'new' });
    expect(birthMoon(100, 100 + 180 - HALF_DAY_GAIN / 2, false)).toEqual({ phase: 'gibbous', or: 'full' });
    expect(birthMoon(100, 100 + 70, false)).toEqual({ phase: 'crescent', or: null });
  });

  it('agrees with the engine on a known full and new Moon (January 2026)', async () => {
    // Full Moon Jan 3, 2026 about 10:03 UTC; New Moon Jan 18 about 19:52 UTC.
    const full = await computeChart({ date: '2026-01-03', time: '14:00', ...LONDON });
    expect(birthMoon(full.placements.sun.longitude, full.placements.moon.longitude, true).phase).toBe('full');
    const fresh = await computeChart({ date: '2026-01-19', time: '02:00', ...LONDON });
    expect(birthMoon(fresh.placements.sun.longitude, fresh.placements.moon.longitude, true).phase).toBe('new');
  });

  it('draws each phase in a shape its neighbors do not share', () => {
    const shares = BIRTH_PHASES.map((phase) => litShare(phaseLook(phase)));
    expect(shares[0]).toBe(0);
    expect(shares[4]).toBe(1);
    for (let i = 1; i < 8; i++) expect(Math.abs(shares[i] - shares[i - 1]), BIRTH_PHASES[i]).toBeGreaterThan(0.1);
  });

  it('has a name and a short paragraph for every phase, in the copy rules', () => {
    for (const phase of BIRTH_PHASES) {
      const words = [birthMoonCopy.names[phase], birthMoonCopy.lines[phase]];
      for (const text of words) {
        expect(text, phase).toBeTruthy();
        expect(text).not.toMatch(/[—!]/);
      }
      expect(birthMoonCopy.lines[phase].split(/\s+/).length, phase).toBeLessThan(50);
    }
  });

  it('runs the engine once on the server and sends only the phase to the page', () => {
    expect(page).toMatch(/const chart = await ownBirthChart\(supabase, user\.id\);/);
    expect(page).toMatch(/wheelFrom\(chart, /);
    expect(page).not.toMatch(/memberWheel\(/);
    // The disc is drawn from the phase, never from the member's own longitudes.
    expect(page).toMatch(/illumination=\{litShare\(phaseLook\(phase\)\)\}/);
    expect(page).not.toMatch(/litShare\(chart/);
  });
});

describe('the name, top and center (notes 2, 3, and 15)', () => {
  it("greets the member in Dawa's words over their own name, the page's one h1", () => {
    expect(yourChartCopy.greeting).toBe('Welcome, fellow space and time traveler');
    // One heading: the greeting over the name, at one size (David, Nov 17).
    expect(page).toMatch(/<h1 className="[^"]*type-display-lg[^"]*">\s*<span[^>]*>\{yourChartCopy\.greeting\}<\/span>\s*\{displayName \?/);
    expect(page.match(/<h1\b/g)).toHaveLength(1);
    expect(page).not.toMatch(/as="h1"/);
  });
});

describe('Your Core Five (note 6, D1) with the three paintings (note 7)', () => {
  it('shows each of the three signs beside its own painting, and the two houses as equals', () => {
    expect(yourChartCopy.core.title).toBe('Your Core Five');
    expect(page).toMatch(/coreSigns\.map\(\(body\) =>[\s\S]*?<TribePainting sign=\{row\.sign\}/);
    expect(page).toMatch(/keyId: body === 'sun' \? \('sunHouse' as const\) : \('moonHouse' as const\)/);
    // Each house beside its mark: twelve slices, its own filled (David, Nov 17).
    expect(page).toMatch(/<HouseMark house=\{house\} sign=\{sign\}/);
    // Drawn like the chart wheel (5m, David, Nov 17): its ink lines, its element tints, its body font.
    const mark = read('components/HouseMark.tsx');
    expect(mark).toContain('fontFamily="var(--font-body)"');
    expect(mark).toMatch(/className="stroke-ink-500"/);
    expect(mark).toMatch(/fill-fire/);
    expect(mark).not.toMatch(/fill-highlight|font-display/);
    expect(page).not.toMatch(/yourChartCopy\.three/);
  });
});

describe("what the Chinese animal and element mean (note 1)", () => {
  it('has a line for each of the 12 animals and 5 elements', () => {
    expect(Object.keys(ANIMAL_MEANINGS).sort()).toEqual([...ANIMALS].sort());
    expect(Object.keys(ELEMENT_MEANINGS).sort()).toEqual([...ELEMENTS].sort());
    for (const text of [...Object.values(ANIMAL_MEANINGS), ...Object.values(ELEMENT_MEANINGS)]) expect(text).not.toMatch(/[—!]/);
  });

  it("shows them on the member's own chart only: another member's page never learns the element", () => {
    expect(page).toMatch(/ELEMENT_MEANINGS\[chinese\.element\]/);
    expect(read('app/(public)/members/[id]/page.tsx')).not.toMatch(/chinese-meanings/);
  });
});

describe('cards that never overlap (note 5)', () => {
  it("lets a long Key wrap inside its pill instead of running into the next column", () => {
    expect(read('components/KeyChip.tsx')).toMatch(/'inline-flex min-h-11 max-w-full flex-wrap /);
  });

  it("gives the wheel's planet panel two columns only where both have room", () => {
    const wheel = read('components/ChartWheel.tsx');
    expect(wheel).toContain('grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))]');
    expect(wheel).not.toMatch(/mt-4 grid gap-5 sm:grid-cols-2/);
  });

  it('never leaves a house number alone on a line', () => {
    expect(chartWheelCopy.house('7')).toBe('house 7');
  });
});
