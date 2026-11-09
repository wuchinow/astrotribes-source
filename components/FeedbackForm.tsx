'use client';

import { useActionState, useId, useState } from 'react';
import { sendFeedback, type FeedbackState } from '@/app/(public)/feedback/actions';
import { Button } from '@/components/Button';
import { feedbackCopy } from '@/content/feedback';
import { FEEDBACK_MESSAGE_MAX, FEEDBACK_TYPES } from '@/lib/feedback-types';
import { CONTACT_EMAIL } from '@/lib/site';

/** The feedback form (Nov 9): a note, its kind, and an optional name or email. Saved to Notion by the action. */
export function FeedbackForm({ page }: { page: string }) {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(sendFeedback, { status: 'idle' });
  const [round, setRound] = useState(0);
  const id = useId();

  if (state.status === 'sent' && round === 0) {
    return (
      <div role="status" className="mt-8 grid gap-3">
        <h2 className="type-heading-3 text-ink-900">{feedbackCopy.sent.heading}</h2>
        <p className="text-ink-700">{feedbackCopy.sent.body}</p>
        <div>
          <Button variant="tertiary" onClick={() => setRound(1)} className="-ml-2">
            {feedbackCopy.sent.again}
          </Button>
        </div>
      </div>
    );
  }

  const error = state.status === 'error' && round === 0 ? state.error : null;
  const fieldError = error === 'empty' || error === 'long';
  return (
    <form action={(form) => { setRound(0); action(form); }} className="mt-8 grid gap-6" noValidate>
      <div className="grid gap-2">
        <label htmlFor={`${id}-message`} className="font-semibold text-[1rem] text-ink-900">
          {feedbackCopy.message.label}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          maxLength={FEEDBACK_MESSAGE_MAX}
          aria-invalid={fieldError || undefined}
          aria-describedby={`${id}-message-help${fieldError ? ` ${id}-error` : ''}`}
          className="field-input min-h-40 resize-y py-3"
        />
        <p id={`${id}-message-help`} className="type-caption text-ink-500">
          {feedbackCopy.message.help}
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-semibold text-[1rem] text-ink-900">{feedbackCopy.type.label}</legend>
        <div className="flex flex-wrap gap-x-6">
          {FEEDBACK_TYPES.map((type) => (
            <label key={type} className="inline-flex min-h-touch cursor-pointer items-center gap-3 text-ink-700">
              <input type="radio" name="type" value={type} defaultChecked={type === 'other'} className="size-5 accent-cobalt-600" />
              {feedbackCopy.types[type]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor={`${id}-from`} className="font-semibold text-[1rem] text-ink-900">
          {feedbackCopy.from.label}
        </label>
        <input id={`${id}-from`} name="from" type="text" maxLength={200} autoComplete="email" aria-describedby={`${id}-from-help`} className="field-input" />
        <p id={`${id}-from-help`} className="type-caption text-ink-500">
          {feedbackCopy.from.help}
        </p>
      </div>

      {/* Only a bot fills this in; people never see it. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="page" value={page} />

      {error ? (
        <p id={`${id}-error`} role="alert" className="type-body-sm text-ember-500">
          {feedbackCopy.errors[error]}
          {error === 'failed' || error === 'unavailable' ? (
            <>
              {' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cobalt-600 underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
              .
            </>
          ) : null}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? feedbackCopy.sending : feedbackCopy.send}
        </Button>
      </div>
    </form>
  );
}
