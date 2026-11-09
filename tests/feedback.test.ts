import { describe, expect, it, vi } from 'vitest';
import { FEEDBACK_DATABASE_ID, FEEDBACK_NOTIFY_USER_ID, areaFor, notionPage, pagePath, parseFeedback, saveFeedback } from '@/lib/feedback';

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

describe('the feedback form (Nov 9)', () => {
  it('keeps only a path on this site from the referer', () => {
    expect(pagePath('https://astrotribes.vercel.app/tribes/aries?x=1#y', 'astrotribes.vercel.app')).toBe('/tribes/aries');
    expect(pagePath('https://elsewhere.com/tribes/aries', 'astrotribes.vercel.app')).toBe('');
    expect(pagePath('https://astrotribes.vercel.app/feedback', 'astrotribes.vercel.app')).toBe('');
    expect(pagePath(null, 'astrotribes.vercel.app')).toBe('');
    expect(pagePath('not a url', 'astrotribes.vercel.app')).toBe('');
  });

  it('needs a note, caps its length, and falls back to other for an unknown kind', () => {
    expect(parseFeedback(form({ message: '   ' }))).toEqual({ ok: false, error: 'empty' });
    expect(parseFeedback(form({ message: 'x'.repeat(2001) }))).toEqual({ ok: false, error: 'long' });
    const parsed = parseFeedback(form({ message: ' The wheel is lovely ', type: 'nonsense', from: 'Kevin', page: 'https://x' }));
    expect(parsed).toEqual({ ok: true, feedback: { message: 'The wheel is lovely', type: 'other', from: 'Kevin', page: '' } });
  });

  it('files each note in the Notion feedback database as new, in-app, with its area', () => {
    expect(areaFor('/tribes/leo')).toEqual(['tribe']);
    expect(areaFor('/')).toEqual(['landing']);
    expect(areaFor('')).toEqual([]);
    const page = notionPage({ message: 'Line one\nLine two', type: 'bug', from: '', page: '/your-chart' }, '2026-11-09');
    expect(page.parent.database_id).toBe(FEEDBACK_DATABASE_ID);
    expect(page.properties.Feedback.title[0].text.content).toBe('Line one');
    expect(page.properties.Notes.rich_text[0].text.content).toBe('Line one\nLine two\n\nSent from /your-chart');
    expect(page.properties.Source.select.name).toBe('in-app');
    expect(page.properties.Status.select.name).toBe('new');
    expect(page.properties.Type.select.name).toBe('bug');
    expect(page.properties.Area.multi_select).toEqual([{ name: 'chart' }]);
    expect(page.properties.From.rich_text[0].text.content).toBe('Not given');
    expect(page.properties.Received.date.start).toBe('2026-11-09');
    // David is mentioned in the body, so Notion notifies and emails him.
    expect(page.children[0].paragraph.rich_text[0].mention?.user.id).toBe(FEEDBACK_NOTIFY_USER_ID);
    expect(JSON.stringify(page.children)).not.toContain('Line one');
  });

  it('answers whether Notion saved it, without throwing or logging the note', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const feedback = { message: 'canary-feedback-text', type: 'other' as const, from: '', page: '' };
    const ok = vi.fn(async () => new Response('{}', { status: 200 }));
    expect(await saveFeedback(feedback, 'token', ok as unknown as typeof fetch)).toBe(true);
    const [, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token');
    expect(await saveFeedback(feedback, 'token', (async () => new Response('{}', { status: 400 })) as unknown as typeof fetch)).toBe(false);
    expect(await saveFeedback(feedback, 'token', (async () => { throw new Error('down'); }) as unknown as typeof fetch)).toBe(false);
    expect(JSON.stringify(log.mock.calls)).not.toContain('canary-feedback-text');
    log.mockRestore();
  });
});
