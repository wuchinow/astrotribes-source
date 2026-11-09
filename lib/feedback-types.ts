// The feedback form's kinds of note, the Type options of the Notion feedback database. Kept apart from
// lib/feedback.ts, which is server only, so the form can import them.
export const FEEDBACK_TYPES = ['bug', 'feature', 'design', 'question', 'other'] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
export const FEEDBACK_MESSAGE_MAX = 2000;
