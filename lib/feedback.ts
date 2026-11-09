// Feedback from the site (David, Nov 9: "that feedback should be captured in the dev database and
// emailed to me"). A short form at /feedback; each note becomes a row in the team's Notion feedback
// database (astrotribes / dev / feedback) with Source "in-app" and Status "new", through Notion's API
// with NOTION_FEEDBACK_TOKEN (a Notion internal integration connected to that database, server only).
// The email to David: each new row mentions him in its body, so Notion notifies him and emails the
// notification (4t, Nov 9: a Notion automation's Gmail step sent nothing, for rows added by hand or by
// the site). The site itself has no sending service yet. Nothing here logs what anyone writes.
import 'server-only';
import { FEEDBACK_MESSAGE_MAX, FEEDBACK_TYPES, type FeedbackType } from './feedback-types';

/** The Notion database that holds feedback (astrotribes / dev / feedback). */
export const FEEDBACK_DATABASE_ID = '4b03b241-3467-4477-acfc-49e6260e9b3b';
const NOTION_VERSION = '2022-06-28';
/** David's Notion user, mentioned on every new note so Notion emails him (not a secret: an opaque id). */
export const FEEDBACK_NOTIFY_USER_ID = 'c0a60c8f-691a-492b-97ec-5b92dcda4b32';

export const FEEDBACK_LIMITS = { message: FEEDBACK_MESSAGE_MAX, from: 200 } as const;

export interface Feedback {
  message: string;
  type: FeedbackType;
  /** A name or email, only if the sender gave one. */
  from: string;
  /** The page the sender came from, a path on this site, or empty. */
  page: string;
}

export type ParsedFeedback = { ok: true; feedback: Feedback } | { ok: false; error: 'empty' | 'long' };

const text = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value.trim() : '');

/** Only a path on this site, with no query or fragment, so nothing typed elsewhere rides along. */
export function pagePath(referer: string | null, host: string | null): string {
  if (!referer || !host) return '';
  try {
    const url = new URL(referer);
    if (url.host !== host || url.pathname === '/feedback') return '';
    return url.pathname.slice(0, 200);
  } catch {
    return '';
  }
}

export function parseFeedback(form: FormData): ParsedFeedback {
  const message = text(form.get('message'));
  if (!message) return { ok: false, error: 'empty' };
  if (message.length > FEEDBACK_LIMITS.message) return { ok: false, error: 'long' };
  const type = text(form.get('type'));
  const page = text(form.get('page'));
  return {
    ok: true,
    feedback: {
      message,
      type: (FEEDBACK_TYPES as readonly string[]).includes(type) ? (type as FeedbackType) : 'other',
      from: text(form.get('from')).slice(0, FEEDBACK_LIMITS.from),
      page: page.startsWith('/') ? page.slice(0, 200) : '',
    },
  };
}

/** The database's Area options, picked from the page the note came from. */
export function areaFor(page: string): string[] {
  const first = page.split('/')[1] ?? '';
  const areas: Record<string, string> = {
    '': 'landing',
    keys: 'keys',
    tribes: 'tribe',
    clans: 'tribe',
    vibes: 'tribe',
    'your-chart': 'chart',
    famous: 'chart',
    members: 'matching',
    learn: 'learn',
    oracle: 'oracle',
    welcome: 'join',
    'sign-in': 'join',
    account: 'join',
  };
  return page && first in areas ? [areas[first]] : [];
}

const richText = (content: string) => [{ type: 'text', text: { content } }];

/** The Notion page for one note: the database's own columns, nothing else. */
export function notionPage(feedback: Feedback, today: string) {
  const firstLine = feedback.message.split('\n')[0];
  const title = firstLine.length > 120 ? `${firstLine.slice(0, 117)}...` : firstLine;
  const notes = feedback.page ? `${feedback.message}\n\nSent from ${feedback.page}` : feedback.message;
  return {
    parent: { database_id: FEEDBACK_DATABASE_ID },
    properties: {
      Feedback: { title: richText(title) },
      Notes: { rich_text: richText(notes.slice(0, 2000)) },
      From: { rich_text: richText(feedback.from || 'Not given') },
      Source: { select: { name: 'in-app' } },
      Status: { select: { name: 'new' } },
      Type: { select: { name: feedback.type } },
      Area: { multi_select: areaFor(feedback.page).map((name) => ({ name })) },
      Received: { date: { start: today } },
    },
    // The mention is what makes Notion notify David, and email him when he has not seen it in the app.
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'mention', mention: { type: 'user', user: { id: FEEDBACK_NOTIFY_USER_ID } } },
            { type: 'text', text: { content: ' a new note from the site.' } },
          ],
        },
      },
    ],
  };
}

/** Sends one note to Notion. Answers whether it was saved; never throws, never logs the note. */
export async function saveFeedback(feedback: Feedback, token: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl('https://api.notion.com/v1/pages', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify(notionPage(feedback, new Date().toISOString().slice(0, 10))),
    });
    return response.ok;
  } catch {
    return false;
  }
}
