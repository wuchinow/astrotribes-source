'use server';

import { headers } from 'next/headers';
import { parseFeedback, saveFeedback } from '@/lib/feedback';
import { takeRateLimit } from '@/lib/rate-limit';

export type FeedbackState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; error: 'empty' | 'long' | 'limit' | 'failed' | 'unavailable' };

/**
 * Saves one note to the team's Notion feedback database (lib/feedback.ts). Open to anyone, signed in
 * or not, so it is rate-limited per IP and carries a hidden field that only a bot fills in.
 */
export async function sendFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  // A bot that fills the hidden field is told it worked, and nothing is saved.
  if (typeof form.get('website') === 'string' && form.get('website') !== '') return { status: 'sent' };
  if (!takeRateLimit('feedback', await headers()).ok) return { status: 'error', error: 'limit' };
  const parsed = parseFeedback(form);
  if (!parsed.ok) return { status: 'error', error: parsed.error };
  const token = process.env.NOTION_FEEDBACK_TOKEN;
  if (!token) return { status: 'error', error: 'unavailable' };
  return (await saveFeedback(parsed.feedback, token)) ? { status: 'sent' } : { status: 'error', error: 'failed' };
}
