import { describe, expect, it } from 'vitest';
import { cleanDisplayName } from '@/lib/display-name';

// The same rule as 0001's check on profiles.display_name: 1 to 40 characters.
describe('display names', () => {
  it('trims and collapses spaces', () => {
    expect(cleanDisplayName('  Ada   Lovelace ')).toBe('Ada Lovelace');
  });

  it('refuses empty, too long, and non-text values', () => {
    expect(cleanDisplayName('   ')).toBeNull();
    expect(cleanDisplayName('x'.repeat(41))).toBeNull();
    expect(cleanDisplayName(null)).toBeNull();
  });

  it('counts characters, not bytes', () => {
    expect(cleanDisplayName('é'.repeat(40))).toBe('é'.repeat(40));
  });
});
