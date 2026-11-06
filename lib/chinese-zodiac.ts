// The Chinese zodiac sign for a birth date (3y, admin to-do, David Nov 6): the animal and element of
// the Chinese year the member was born in. A Chinese year starts at Lunar New Year, which moves
// between January 21 and February 20, so someone born in January 1966 is a Wood Snake, not a Fire
// Horse. The dates below are Lunar New Year for 1900 to 2100 from the lunar-javascript library
// (6tail, MIT), checked year by year against a calculation from the Swiss Ephemeris (the second new
// moon after the winter solstice, or the third after a leap month, in China time): 200 of 201 agree,
// and the one that differs, 1916, follows the published tables (China kept Beijing local time then).
// The birth date is compared as written, the member's own calendar date; a birth on the evening
// before Lunar New Year in the Americas can fall on the new year's first day in China, which no
// birth time here settles. Pure: no birth detail is stored, logged, or sent.

/** Lunar New Year as MMDD, one per year from 1900 to 2100, ten to a line. */
const LUNAR_NEW_YEAR = `
  0131 0219 0208 0129 0216 0204 0125 0213 0202 0122
  0210 0130 0218 0206 0126 0214 0203 0123 0211 0201
  0220 0208 0128 0216 0205 0124 0213 0202 0123 0210
  0130 0217 0206 0126 0214 0204 0124 0211 0131 0219
  0208 0127 0215 0205 0125 0213 0202 0122 0210 0129
  0217 0206 0127 0214 0203 0124 0212 0131 0218 0208
  0128 0215 0205 0125 0213 0202 0121 0209 0130 0217
  0206 0127 0215 0203 0123 0211 0131 0218 0207 0128
  0216 0205 0125 0213 0202 0220 0209 0129 0217 0206
  0127 0215 0204 0123 0210 0131 0219 0207 0128 0216
  0205 0124 0212 0201 0122 0209 0129 0218 0207 0126
  0214 0203 0123 0210 0131 0219 0208 0128 0216 0205
  0125 0212 0201 0122 0210 0129 0217 0206 0126 0213
  0203 0123 0211 0131 0219 0208 0128 0215 0204 0124
  0212 0201 0122 0210 0130 0217 0206 0126 0214 0202
  0123 0211 0201 0219 0208 0128 0215 0204 0124 0212
  0202 0121 0209 0129 0217 0205 0126 0214 0203 0123
  0211 0131 0219 0207 0127 0215 0205 0124 0212 0202
  0122 0209 0129 0217 0206 0126 0214 0203 0124 0210
  0130 0218 0207 0127 0215 0205 0125 0212 0201 0121
  0209
`.trim().split(/\s+/);

const FIRST_YEAR = 1900;

export const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;
export const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;

export interface ChineseSign {
  animal: (typeof ANIMALS)[number];
  element: (typeof ELEMENTS)[number];
  /** The Gregorian year the Chinese year began in. */
  year: number;
  /** That year's Lunar New Year, YYYY-MM-DD. */
  newYear: string;
}

const newYearOf = (year: number) => `${year}-${LUNAR_NEW_YEAR[year - FIRST_YEAR].slice(0, 2)}-${LUNAR_NEW_YEAR[year - FIRST_YEAR].slice(2)}`;

/** The sign for a birth date (YYYY-MM-DD), or null outside 1900-01-31 to 2101-01-28. */
export function chineseSign(birthDate: string): ChineseSign | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);
  if (!match) return null;
  let year = Number(match[1]);
  if (year < FIRST_YEAR || year >= FIRST_YEAR + LUNAR_NEW_YEAR.length) return null;
  // Before this year's Lunar New Year, the birth belongs to the year before.
  if (birthDate.slice(0, 10) < newYearOf(year)) year -= 1;
  if (year < FIRST_YEAR) return null;
  // 1984 began a cycle: Wood Rat. The animal turns every year, the element every two.
  const cycle = (((year - 1984) % 60) + 60) % 60;
  return { animal: ANIMALS[cycle % 12], element: ELEMENTS[Math.floor((cycle % 10) / 2)], year, newYear: newYearOf(year) };
}
