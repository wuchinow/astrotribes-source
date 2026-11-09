import { describe, expect, it } from 'vitest';
import { footerColumns } from '@/components/SiteFooter';

describe('the footer links (4q)', () => {
  it('stand in three columns of three, Contact closing the second', () => {
    const columns = footerColumns();
    expect(columns.map((column) => column.length)).toEqual([3, 3, 3]);
    expect(columns[1].at(-1)?.href).toBe('/contact');
    expect(columns[2].map((link) => link.href)).toEqual(['/privacy', '/terms', 'https://github.com/wuchinow/astrotribes-source']);
  });
});

describe('the feedback link (4q)', () => {
  it('opens the feedback form, from the footer and the account menu', async () => {
    const { readFileSync } = await import('node:fs');
    const { FEEDBACK_LINK } = await import('@/lib/site');
    expect(FEEDBACK_LINK.href).toBe('/feedback');
    for (const file of ['components/SiteFooter.tsx', 'components/HeaderAccount.tsx']) {
      expect(readFileSync(file, 'utf8'), file).toContain('FEEDBACK_LINK.href');
    }
  });
});
