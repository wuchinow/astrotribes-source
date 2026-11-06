// The Chinese zodiac sign (3y): known years and the Lunar New Year boundary. Dates are made up.
import { describe, expect, it } from 'vitest';
import { chineseSign } from '@/lib/chinese-zodiac';

describe('chineseSign', () => {
  it('names the animal and element of known years', () => {
    expect(chineseSign('1984-06-01')).toMatchObject({ element: 'Wood', animal: 'Rat', year: 1984 });
    expect(chineseSign('1966-06-01')).toMatchObject({ element: 'Fire', animal: 'Horse' });
    expect(chineseSign('2026-03-01')).toMatchObject({ element: 'Fire', animal: 'Horse', newYear: '2026-02-17' });
    expect(chineseSign('2000-06-01')).toMatchObject({ element: 'Metal', animal: 'Dragon' });
    expect(chineseSign('1900-06-01')).toMatchObject({ element: 'Metal', animal: 'Rat' });
    expect(chineseSign('1979-06-01')).toMatchObject({ element: 'Earth', animal: 'Goat' });
  });

  it('starts the year at Lunar New Year, not January 1', () => {
    expect(chineseSign('1966-01-20')).toMatchObject({ element: 'Wood', animal: 'Snake', year: 1965 });
    expect(chineseSign('1966-01-21')).toMatchObject({ element: 'Fire', animal: 'Horse', year: 1966 });
    expect(chineseSign('1985-02-19')).toMatchObject({ animal: 'Rat' });
    expect(chineseSign('1985-02-20')).toMatchObject({ element: 'Wood', animal: 'Ox' });
    expect(chineseSign('1916-02-03')).toMatchObject({ animal: 'Dragon' });
  });

  it('answers null outside the table', () => {
    expect(chineseSign('1899-12-31')).toBeNull();
    expect(chineseSign('1900-01-30')).toBeNull();
    expect(chineseSign('not a date')).toBeNull();
  });
});
