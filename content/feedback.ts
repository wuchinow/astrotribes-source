// PLACEHOLDER: our words for the feedback form (Nov 9), until Dawa's copy replaces them.
import type { FeedbackType } from '@/lib/feedback-types';

export const feedbackCopy = {
  title: 'Feedback',
  eyebrow: 'Feedback',
  line: 'Tell us what you think.',
  accent: 'A person reads every note.',
  lede: 'Something broken, confusing, or lovely? A few words help. You are among the first to see AstroTribes, so nothing is too small.',
  message: { label: 'Your note', help: 'Up to 2,000 characters. Please leave out your birth date, time, and place.' },
  type: { label: 'What kind of note is it?' },
  types: {
    bug: 'Something is broken',
    feature: 'An idea',
    design: 'How it looks',
    question: 'A question',
    other: 'Something else',
  } satisfies Record<FeedbackType, string>,
  from: { label: 'Your name or email (optional)', help: 'Only if you would like a reply.' },
  send: 'Send feedback',
  sending: 'Sending',
  sent: { heading: 'Thank you.', body: 'Your note reached the team.', again: 'Send another' },
  errors: {
    empty: 'Write a few words first.',
    long: 'That is a little long. Keep it under 2,000 characters.',
    limit: 'You have sent several notes in a short time. Try again in a few minutes.',
    failed: 'Your note did not go through. Try again, or email us at',
    unavailable: 'The form is not connected yet. Email us at',
  },
};
