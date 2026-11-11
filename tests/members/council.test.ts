import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HELLO_COLUMNS, MESSAGE_COLUMNS, POST_COLUMNS, cleanText, isMissingTable, threadPosts } from '@/lib/council';

// The Council, hellos, and messages (5b, 0009). Synthetic data.
describe('the Council and messages', () => {
  it('trims what a member types and holds it to a length', () => {
    expect(cleanText('  hello \r\n there  ', 20)).toEqual({ ok: true, text: 'hello \n there' });
    expect(cleanText('   ', 20)).toEqual({ ok: false, error: 'empty' });
    expect(cleanText(null, 20)).toEqual({ ok: false, error: 'empty' });
    expect(cleanText('x'.repeat(21), 20)).toEqual({ ok: false, error: 'long' });
    // Counted in characters, not code units.
    expect(cleanText('☉'.repeat(20), 20).ok).toBe(true);
  });

  it('threads posts newest first, with replies oldest first under their post', () => {
    const row = (id: string, created_at: string, parent_id: string | null = null) => ({
      id,
      author_id: 'u',
      author_name: 'Demo',
      parent_id,
      body: id,
      created_at,
    });
    const posts = threadPosts([
      row('old', '2026-11-10T10:00:00Z'),
      row('new', '2026-11-11T10:00:00Z'),
      row('r2', '2026-11-11T12:00:00Z', 'old'),
      row('r1', '2026-11-11T11:00:00Z', 'old'),
      row('stray', '2026-11-11T11:00:00Z', 'gone'),
    ]);
    expect(posts.map((p) => p.id)).toEqual(['new', 'old']);
    expect(posts[1].replies.map((r) => r.id)).toEqual(['r1', 'r2']);
  });

  it('reads named columns only, never every column', () => {
    for (const columns of [POST_COLUMNS, HELLO_COLUMNS, MESSAGE_COLUMNS]) expect(columns).not.toContain('*');
    expect(POST_COLUMNS).not.toContain('removed_at');
  });

  it('treats a missing table as not set up yet, not as a failure', () => {
    expect(isMissingTable({ code: 'PGRST205' })).toBe(true);
    expect(isMissingTable({ code: '42P01' })).toBe(true);
    expect(isMissingTable({ code: '42501' })).toBe(false);
    expect(isMissingTable(null)).toBe(false);
  });

  it('never uses the secret key for any of it', () => {
    for (const file of [
      'lib/council.ts',
      'app/(public)/members/council/actions.ts',
      'app/(public)/members/messages/actions.ts',
      'app/(public)/admin/actions.ts',
    ]) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/adminClient|SUPABASE_SECRET_KEY/);
    }
  });
});
