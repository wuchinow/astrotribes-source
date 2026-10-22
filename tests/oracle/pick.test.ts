// The Oracle's pick (1c): date-seeded shuffles, no day repeating the day before, every cycle
// covering each entry once, the same pair for a date wherever and whenever it is computed.

import { describe, expect, it } from 'vitest';
import {
  CARD_KEYS,
  HEXAGRAMS,
  HEXAGRAM_KEYS,
  ORACLE_EPOCH,
  ORACLE_SEED,
  WINDOW_REACH,
  addDays,
  dateLabel,
  dayIndex,
  oracleFor,
  oracleWindow,
  pickCard,
  pickHexagram,
} from '@/lib/oracle';

const DAYS = 1000;
const dates = Array.from({ length: DAYS }, (_, i) => addDays(ORACLE_EPOCH, i));

describe('the pick over 1,000 days', () => {
  const hexes = dates.map(pickHexagram);
  const cards = dates.map(pickCard);

  it('never repeats the day before', () => {
    for (let i = 1; i < DAYS; i++) {
      expect(hexes[i], dates[i]).not.toBe(hexes[i - 1]);
      expect(cards[i], dates[i]).not.toBe(cards[i - 1]);
    }
  });

  it('covers each hexagram once in every 64-day cycle and each card once in every 78-day cycle', () => {
    for (let start = 0; start + 64 <= DAYS; start += 64) {
      expect(new Set(hexes.slice(start, start + 64)).size).toBe(64);
    }
    for (let start = 0; start + 78 <= DAYS; start += 78) {
      expect(new Set(cards.slice(start, start + 78)).size).toBe(78);
    }
  });

  it('is keyed by hexagram number and card id, so a change to a reading moves nothing', () => {
    expect(HEXAGRAM_KEYS).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
    expect(CARD_KEYS).toEqual([...CARD_KEYS].sort());
    // Rewrite every reading's words: the calendar stays exactly where it was.
    const before = dates.slice(0, 200).map((d) => [pickHexagram(d), pickCard(d)]);
    const saved = HEXAGRAMS.map((h) => h.reading.body[0].text);
    HEXAGRAMS.forEach((h) => ((h.reading.body[0] as { text: string }).text = 'replaced'));
    const after = dates.slice(0, 200).map((d) => [pickHexagram(d), pickCard(d)]);
    HEXAGRAMS.forEach((h, i) => ((h.reading.body[0] as { text: string }).text = saved[i]));
    expect(after).toEqual(before);
  });

  it('holds its epoch and seed (changing either reshuffles every future day)', () => {
    expect(ORACLE_EPOCH).toBe('2026-01-01');
    expect(ORACLE_SEED).toBe('at-oracle-v1');
    expect(dayIndex(ORACLE_EPOCH)).toBe(0);
    // A pinned stretch, so an accidental change to the shuffle shows up here.
    expect(dates.slice(268, 272).map((d) => [d, pickHexagram(d), pickCard(d)])).toMatchSnapshot();
  });
});

describe('a date gives one pair', () => {
  it('whenever and wherever it is computed', () => {
    // Two builds of the page a day apart share three dates; each gives the same pair for each.
    const a = oracleWindow(new Date('2026-09-25T03:00:00Z'));
    const b = oracleWindow(new Date('2026-09-26T21:00:00Z'));
    for (const day of a) {
      const other = b.find((d) => d.date === day.date);
      if (other) expect(other).toEqual(day);
    }
    expect(a.map((d) => d.date)).toEqual(['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27']);
    expect(a[WINDOW_REACH].label).toBe('Friday, September 25');
  });

  it('labels a date in words', () => {
    expect(dateLabel('2026-12-31')).toBe('Thursday, December 31');
  });
});

describe('never empty', () => {
  it('has a complete pair on every date from launch to 2029', () => {
    for (let d = '2026-09-01'; d <= '2029-12-31'; d = addDays(d, 1)) {
      expect(oracleFor(d).standIn, d).toBeNull();
    }
  });

  it('stands in the day before when an entry is missing, and says so', () => {
    const date = '2026-10-10';
    const h = HEXAGRAMS.find((x) => x.number === pickHexagram(date))!;
    (h.reading as { hidden?: boolean }).hidden = true;
    try {
      const day = oracleFor(date);
      expect(day.standIn).toBe('2026-10-09');
      expect(day.hexagram).toBe(pickHexagram('2026-10-09'));
      expect(day.date).toBe(date);
    } finally {
      delete (h.reading as { hidden?: boolean }).hidden;
    }
  });
});
