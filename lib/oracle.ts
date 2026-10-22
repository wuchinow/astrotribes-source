// The Daily Oracle (1c): one I Ching hexagram and one tarot card a day, the same for every visitor on
// the same local date. Static and date-seeded (decisions, Sep 23): the words are JSON in
// content/oracle/, and the day's pair comes from the date alone, so there is nothing to store.
//
// The pick. Day 0 is ORACLE_EPOCH. The hexagrams follow a seeded shuffle of 1 to 64, one shuffle per
// 64-day cycle; the cards a seeded shuffle of the 78, one per 78-day cycle. Each shuffle is keyed by
// hexagram number and card id, never by array order or text, so replacing a reading never moves
// the calendar. Where a cycle would open with the entry that closed the one before, its first two
// entries swap, so no day repeats the day before. Changing ORACLE_EPOCH or ORACLE_SEED reshuffles
// every future day (CLAUDE.md says so).

import tarot from '@/content/oracle/tarot.json';
import tarotFiles from '@/lib/tarot-files.json';
import { HEXAGRAMS, byNumber, type Hexagram, type SourceRef } from './iching';

export * from './iching';

export const ORACLE_EPOCH = '2026-01-01';
export const ORACLE_SEED = 'at-oracle-v1';
/** The built window: the UTC date and this many days either side (a local date is at most one away). */
export const WINDOW_REACH = 2;

export interface CardReading {
  upright: string;
  reversed: string | null;
  source: SourceRef;
  credit: string;
  reviewed: boolean;
  hidden?: boolean;
}

export interface Card {
  id: string;
  arcana: 'major' | 'minor';
  name: string;
  alt: string;
  reading: CardReading;
  plain: null | { text: string; author: string; reviewed: boolean };
}

export interface CardArt {
  src: string;
  width: number;
  height: number;
  bytes: number;
}

export const CARDS = tarot.cards as unknown as readonly Card[];
const ART = tarotFiles as Record<string, CardArt>;

const byCard = new Map(CARDS.map((c) => [c.id, c]));

export const card = (id: string): Card => {
  const c = byCard.get(id);
  if (!c) throw new Error(`No card ${id}`);
  return c;
};
export const cardArt = (id: string): CardArt | undefined => ART[id];

// Dates are calendar dates, "YYYY-MM-DD", counted in whole days with no time zone.
const DAY = 86_400_000;
const epochMs = Date.parse(`${ORACLE_EPOCH}T00:00:00Z`);

export const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
export const dayIndex = (date: string) => Math.round((Date.parse(`${date}T00:00:00Z`) - epochMs) / DAY);
export const dateOf = (index: number) => new Date(epochMs + index * DAY).toISOString().slice(0, 10);
export const addDays = (date: string, days: number) => dateOf(dayIndex(date) + days);
export const utcDate = (now: Date) => now.toISOString().slice(0, 10);

/** "Friday, September 25", for a calendar date. */
export const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** "Fri, Sep 25": the date line on a phone, so it fits on one line. */
export const dateShort = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

// A small seeded generator: FNV-1a to seed, mulberry32 to draw. Deterministic everywhere.
function hash32(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}
function shuffled<T>(keys: readonly T[], seed: string): T[] {
  const out = [...keys];
  const random = mulberry32(hash32(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The keys a deck is shuffled from, in a fixed order that no content edit can change. */
export const HEXAGRAM_KEYS: readonly number[] = HEXAGRAMS.map((h) => h.number).sort((a, b) => a - b);
export const CARD_KEYS: readonly string[] = CARDS.map((c) => c.id).sort();

const cycles = new Map<string, readonly (number | string)[]>();
function cycleOrder<T extends number | string>(kind: 'hexagram' | 'card', keys: readonly T[], cycle: number): readonly T[] {
  const cacheKey = `${kind}:${cycle}`;
  const hit = cycles.get(cacheKey);
  if (hit) return hit as readonly T[];
  const order = shuffled(keys, `${ORACLE_SEED}:${kind}:${cycle}`);
  // The previous cycle's last entry: the swap below only ever touches positions 0 and 1, so the
  // unswapped shuffle's last entry is the one that closed that cycle.
  const previousLast = shuffled(keys, `${ORACLE_SEED}:${kind}:${cycle - 1}`)[keys.length - 1];
  if (order[0] === previousLast) [order[0], order[1]] = [order[1], order[0]];
  cycles.set(cacheKey, order);
  return order;
}

function pickFrom<T extends number | string>(kind: 'hexagram' | 'card', keys: readonly T[], day: number): T {
  const cycle = Math.floor(day / keys.length);
  return cycleOrder(kind, keys, cycle)[day - cycle * keys.length];
}

export const pickHexagram = (date: string) => pickFrom('hexagram', HEXAGRAM_KEYS, dayIndex(date));
export const pickCard = (date: string) => pickFrom('card', CARD_KEYS, dayIndex(date));

/** An entry can be shown when its words are there, it isn't pulled, and (for a card) its art is. */
export const hexagramReady = (h: Hexagram | undefined) =>
  Boolean(h && !h.reading.hidden && h.reading.body.every((part) => part.text.trim()) && h.reading.lines.length === 6);
export const cardReady = (c: Card | undefined) =>
  Boolean(c && !c.reading.hidden && c.reading.upright.trim() && ART[c.id]);

export interface OracleDay {
  date: string;
  label: string;
  /** "Fri, Sep 25", for the date line on a phone. */
  short: string;
  hexagram: number;
  card: string;
  /** Set when an entry was missing and an earlier day's pair stands in (never empty). */
  standIn: string | null;
}

/** The pair for a date. If either entry can't be shown, the day before stands in, up to a week back. */
export function oracleFor(date: string): OracleDay {
  for (let back = 0; back <= 7; back++) {
    const day = addDays(date, -back);
    const h = pickHexagram(day);
    const c = pickCard(day);
    if (hexagramReady(byNumber.get(h)) && cardReady(byCard.get(c))) {
      return { date, label: dateLabel(date), short: dateShort(date), hexagram: h, card: c, standIn: back ? day : null };
    }
  }
  throw new Error(`No complete oracle within a week of ${date}`);
}

/** The days built into /oracle: the UTC date at `now` and WINDOW_REACH days either side. */
export function oracleWindow(now: Date): OracleDay[] {
  const today = utcDate(now);
  return Array.from({ length: WINDOW_REACH * 2 + 1 }, (_, i) => oracleFor(addDays(today, i - WINDOW_REACH)));
}
