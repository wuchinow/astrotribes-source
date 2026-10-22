import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BODIES,
  BODY_GROUPS,
  BODY_IDS,
  ELEMENTS,
  HOUSES,
  KEY_LIST,
  KEYS,
  MODES,
  RETIRED_KEY_NAMES,
  SIGNS,
  SIGN_IDS,
  bodiesIn,
  isGenerational,
  keyFor,
  needsBirthTime,
  signDates,
  sunSeasonSign,
  type BodyId,
} from '@/lib/keys';

// Key names, Dawa's glosses, the houses, and their questions in keys.ts are
// checked against docs/brief.md, the mirrored source, so this file never types
// a key name itself.
const brief = readFileSync(path.join(process.cwd(), 'docs/brief.md'), 'utf8');

const cleanCell = (cell: string) =>
  cell === '(none)' ? undefined : cell.replace(/\s*\(generational\)$/, '');

function placementTable() {
  const start = brief.indexOf('| Placement | Sign key | House key |');
  expect(start, 'placement table in docs/brief.md').toBeGreaterThan(-1);
  const rows: Array<{ placement: string; sign?: string; house?: string }> = [];
  for (const line of brief.slice(start).split('\n').slice(2)) {
    if (!line.startsWith('|')) break;
    const [placement, sign, house] = line
      .split('|')
      .slice(1, 4)
      .map((cell) => cell.trim());
    rows.push({ placement, sign: cleanCell(sign), house: cleanCell(house) });
  }
  return rows;
}

/** "Tribe" -> "your Sun sign; ..." from the brief's gloss list for the revision of Dawa's doc in force. */
function briefGlosses() {
  const start = brief.indexOf("Dawa's glosses (Sep 29 doc)");
  expect(start, 'gloss list in docs/brief.md').toBeGreaterThan(-1);
  const glosses = new Map<string, string>();
  for (const line of brief.slice(start).split('\n').slice(2)) {
    const match = /^- (.+?): (.+)$/.exec(line);
    if (!match) break;
    glosses.set(match[1], match[2]);
  }
  return glosses;
}

function briefHouseQuestions() {
  return /one question per house: (.+?)\)/.exec(brief)?.[1].match(/[^?]+\?/g)?.map((q) => q.trim()) ?? [];
}

function briefHouseNames() {
  return /The twelve houses: (.+?)\. Dawa's/.exec(brief)?.[1].split(', ') ?? [];
}

const bodyByName = (name: string): BodyId => {
  const body = BODY_IDS.find((id) => BODIES[id].name === name);
  if (!body) throw new Error(`No body named ${name} in lib/keys.ts`);
  return body;
};

describe('the 28 Keys', () => {
  it('has 14 sign keys and 14 house keys with distinct ids and names', () => {
    expect(KEY_LIST).toHaveLength(28);
    expect(KEY_LIST.filter((k) => k.dimension === 'sign')).toHaveLength(14);
    expect(KEY_LIST.filter((k) => k.dimension === 'house')).toHaveLength(14);
    expect(new Set(KEY_LIST.map((k) => k.name)).size).toBe(28);
    for (const [id, key] of Object.entries(KEYS)) expect(key.id).toBe(id);
  });

  it('matches the placement table in docs/brief.md', () => {
    const rows = placementTable();
    expect(rows).toHaveLength(15);
    for (const row of rows) {
      const body = bodyByName(row.placement);
      expect(keyFor(body, 'sign')?.name, `${row.placement} sign key`).toBe(row.sign);
      expect(keyFor(body, 'house')?.name, `${row.placement} house key`).toBe(row.house);
    }
  });

  it("carries Dawa's gloss for every key, as the brief lists it", () => {
    const glosses = briefGlosses();
    expect(glosses.size).toBe(28);
    for (const key of KEY_LIST) {
      expect(key.gloss, key.id).toBe(glosses.get(key.name));
      expect(key.gloss.length, key.id).toBeGreaterThan(10);
      expect(key.gloss, key.id).not.toMatch(/[\u2014!\n]/);
    }
  });

  it("leaves unsettled only the keys whose names differ from Dawa's Sept 18 list (David, Sep 30)", () => {
    // Ids, not names: this file types no key name. The Sept 18 list is the 0a commit of lib/keys.ts.
    const changedSinceSept18 = [
      'sunHouse',
      'moonHouse',
      'mercuryHouse',
      'venusHouse',
      'jupiterSign',
      'jupiterHouse',
      'uranusSign',
      'neptuneHouse',
      'chironSign',
      'chironHouse',
      'galacticCenterHouse',
    ];
    expect(KEY_LIST.filter((k) => !k.settled).map((k) => k.id).sort()).toEqual(changedSinceSept18.sort());
  });

  it('delivers 13 keys without a birth time and marks 15 unavailable', () => {
    expect(KEY_LIST.filter((k) => !needsBirthTime(k))).toHaveLength(13);
    expect(KEY_LIST.filter(needsBirthTime)).toHaveLength(15);
  });

  it('has the Core Five and three generational keys', () => {
    expect(KEY_LIST.filter((k) => k.core).map((k) => k.id).sort()).toEqual(
      ['moonHouse', 'moonSign', 'risingSign', 'sunHouse', 'sunSign'].sort(),
    );
    expect(KEY_LIST.filter(isGenerational).map((k) => k.id).sort()).toEqual(
      ['neptuneSign', 'plutoSign', 'uranusSign'].sort(),
    );
  });

  it('groups every body once, in the design system order, with no group id named for a key', () => {
    expect(BODY_GROUPS.map((group) => group.id)).toEqual([
      'identity',
      'journey',
      'planets',
      'generational',
      'healing',
      'galacticCenter',
    ]);
    expect(BODY_GROUPS.flatMap((group) => bodiesIn(group.id))).toHaveLength(BODY_IDS.length);
    for (const body of BODY_IDS) expect(BODY_GROUPS.some((group) => group.id === BODIES[body].group), body).toBe(true);
    // Two group labels are also key names, and only these two: Chiron's group keeps the design
    // system's label, a retired key name; the Galactic Center's group reads its key's name.
    const names = (list: readonly string[]) => BODY_GROUPS.filter((group) => list.includes(group.name)).map((group) => group.id);
    expect(names(RETIRED_KEY_NAMES)).toEqual(['healing']);
    expect(names(KEY_LIST.map((key) => key.name))).toEqual(['galacticCenter']);
    expect(BODY_GROUPS.at(-1)?.name).toBe(KEYS.galacticCenterHouse.name);
  });

  it('gives Rising no house key and the Galactic Center no sign key', () => {
    expect(keyFor('rising', 'house')).toBeUndefined();
    expect(keyFor('galacticCenter', 'sign')).toBeUndefined();
    const resolved = BODY_IDS.flatMap((b) => [keyFor(b, 'sign'), keyFor(b, 'house')]).filter(Boolean);
    expect(resolved).toHaveLength(28);
  });
});

describe('houses, elements, and modes', () => {
  it("matches the twelve houses and Dawa's questions in docs/brief.md", () => {
    const names = briefHouseNames();
    const questions = briefHouseQuestions();
    expect(names).toHaveLength(12);
    expect(questions).toHaveLength(12);
    HOUSES.forEach((house, i) => {
      expect(house.number).toBe(i + 1);
      expect(`${house.roman} ${house.name}`).toBe(names[i]);
      expect(house.question, house.name).toBe(questions[i]);
    });
  });

  it('gives the signs usual Sun dates that cover the year once, in zodiac order', () => {
    const dayOfYear = ([month, day]: readonly [number, number]) =>
      Date.UTC(2025, month - 1, day) / 86_400_000 - Date.UTC(2025, 0, 1) / 86_400_000;
    const signs = Object.values(SIGNS);
    let days = 0;
    signs.forEach((sign, i) => {
      const start = dayOfYear(sign.dates.start);
      const end = dayOfYear(sign.dates.end);
      days += (end - start + 365) % 365 + 1;
      const next = signs[(i + 1) % 12];
      expect((dayOfYear(next.dates.start) - end + 365) % 365, `${sign.id} to ${next.id}`).toBe(1);
    });
    expect(days).toBe(365);
    expect(signDates('aries')).toBe('Mar 21 to Apr 19');
    expect(signDates('capricorn')).toBe('Dec 22 to Jan 19');
  });

  it('names the Sun season for any date, the year round', () => {
    expect(sunSeasonSign(new Date(Date.UTC(2026, 8, 30)))).toBe('libra');
    expect(sunSeasonSign(new Date(Date.UTC(2026, 11, 31)))).toBe('capricorn');
    expect(sunSeasonSign(new Date(Date.UTC(2027, 0, 19)))).toBe('capricorn');
    expect(sunSeasonSign(new Date(Date.UTC(2027, 0, 20)))).toBe('aquarius');
    expect(sunSeasonSign(new Date(Date.UTC(2027, 2, 21)))).toBe('aries');
    for (let day = 0; day < 366; day++) expect(SIGN_IDS).toContain(sunSeasonSign(new Date(Date.UTC(2028, 0, 1 + day))));
  });

  it('has three signs per element and four per mode', () => {
    const signs = Object.values(SIGNS);
    expect(signs).toHaveLength(12);
    for (const element of ELEMENTS) expect(signs.filter((s) => s.element === element)).toHaveLength(3);
    for (const mode of MODES) expect(signs.filter((s) => s.mode === mode)).toHaveLength(4);
  });
});
