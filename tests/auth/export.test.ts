import { describe, expect, it } from 'vitest';
import { PLACEMENT_EXPORT_COLUMNS, buildExport } from '@/lib/account-export';

// Export my data (invariant 7): one file, every part named, degrees included (M53). Synthetic data.
describe('the export', () => {
  it('has one fixed shape', () => {
    const out = buildExport(
      {
        account: { email: 'demo@example.test', createdAt: '2026-10-21T00:00:00Z', providers: ['google'] },
        profile: { display_name: 'Demo', visibility: 'private', created_at: '2026-10-21T00:00:00Z' },
        birthData: null,
        placements: [{ body: 'sun', sign: 'aries', house: null, degree: 1, minute: 2, retrograde: false }],
      },
      new Date('2026-10-21T12:00:00Z'),
    );
    expect(Object.keys(out)).toEqual(['format', 'version', 'exportedAt', 'account', 'profile', 'birthData', 'placements']);
    expect(out.format).toBe('astrotribes-export');
    expect(out.exportedAt).toBe('2026-10-21T12:00:00.000Z');
    expect(out.placements[0]).toHaveProperty('degree', 1);
  });

  it('asks for degrees and minutes from the server, and never for every column', () => {
    const columns = PLACEMENT_EXPORT_COLUMNS.split(',').map((c) => c.trim());
    expect(columns).toEqual(expect.arrayContaining(['body', 'sign', 'house', 'degree', 'minute']));
    expect(columns).not.toContain('*');
    expect(columns).not.toContain('user_id');
  });
});
