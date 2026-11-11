import Link from 'next/link';
import { answerHello, reportMember, sayHello, setBlock } from '@/app/(public)/members/messages/actions';
import { HELLO_NOTE_MAX, REPORT_REASON_MAX, helloCopy, messagesCopy, safetyCopy, sendingCopy } from '@/content/council';
import type { Hello } from '@/lib/council';
import { SubmitButton } from './SubmitButton';

const link = 'font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';
const summary =
  'inline-flex min-h-touch cursor-pointer list-none items-center type-ui font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4 [&::-webkit-details-marker]:hidden';

/**
 * Say hello, on a member's page (5b; David, Nov 11: "dm only after hello accepted"). With no hello
 * between the two: a short note to send. Sent and waiting: says so. Received: accept or decline.
 * Accepted: a link to the conversation. Declined: says so, and nothing more can be sent. Server only;
 * the database decides what each member may do, this only shows the state it reads.
 */
export function HelloPanel({
  me,
  memberId,
  name,
  hello,
  status,
}: {
  me: string;
  memberId: string;
  name: string;
  hello: Hello | null;
  /** The last action's result, from the address after a send. */
  status: string | null;
}) {
  const errorText = status && status in helloCopy.errors ? helloCopy.errors[status as keyof typeof helloCopy.errors] : null;

  let body;
  if (!hello) {
    body = (
      <form action={sayHello} className="mt-3 grid gap-2">
        <input type="hidden" name="recipient_id" value={memberId} />
        <p className="max-w-measure type-body-sm text-ink-700 [overflow-wrap:anywhere]">{helloCopy.body(name)}</p>
        <label htmlFor="hello-note" className="mt-2 font-semibold text-[1rem] text-ink-900">
          {helloCopy.label}
        </label>
        <textarea
          id="hello-note"
          name="note"
          required
          rows={3}
          maxLength={HELLO_NOTE_MAX}
          className="field-input min-h-24 resize-y py-3"
          aria-invalid={Boolean(errorText) || undefined}
        />
        {errorText ? (
          <p role="alert" className="type-body-sm text-ember-500">
            {errorText}
          </p>
        ) : null}
        <div>
          <SubmitButton pending={sendingCopy.sending}>{helloCopy.send}</SubmitButton>
        </div>
      </form>
    );
  } else if (hello.status === 'accepted') {
    body = (
      <p className="mt-3">
        <Link href={`/members/messages/${hello.id}`} className={link}>
          {helloCopy.accepted}
        </Link>
      </p>
    );
  } else if (hello.status === 'declined') {
    body = (
      <p className="mt-3 type-body-sm text-ink-700">{hello.senderId === me ? helloCopy.declined : helloCopy.declinedByYou}</p>
    );
  } else if (hello.senderId === me) {
    body = (
      <p role={status === 'sent' ? 'status' : undefined} className="mt-3 type-body-sm text-ink-700 [overflow-wrap:anywhere]">
        {status === 'sent' ? helloCopy.sent(name) : helloCopy.waiting(name)}
      </p>
    );
  } else {
    body = (
      <div className="mt-3">
        <p className="type-body-sm text-ink-700 [overflow-wrap:anywhere]">{helloCopy.theyWrote(name)}</p>
        <p className="mt-2 max-w-measure whitespace-pre-line rounded-md border border-ink-200 bg-surface-200 p-4 type-body text-ink-900 [overflow-wrap:anywhere]">
          {hello.note}
        </p>
        <form action={answerHello} className="mt-3 flex flex-wrap gap-3">
          <input type="hidden" name="id" value={hello.id} />
          <SubmitButton name="answer" value="accepted" size="sm" pending={sendingCopy.accepting} aria-label={messagesCopy.acceptLabel(name)}>
            {messagesCopy.accept}
          </SubmitButton>
          <SubmitButton name="answer" value="declined" variant="secondary" size="sm" pending={sendingCopy.declining} aria-label={messagesCopy.declineLabel(name)}>
            {messagesCopy.decline}
          </SubmitButton>
        </form>
      </div>
    );
  }

  return (
    <section id="hello" aria-labelledby="hello-heading" className="mt-10 max-w-[40rem] scroll-mt-28">
      <h2 id="hello-heading" className="type-heading-3 text-ink-900">
        {helloCopy.heading}
      </h2>
      {body}
    </section>
  );
}

/** Block and report, at the foot of a member's page (5b). */
export function SafetyPanel({ memberId, name, blocked, status }: { memberId: string; name: string; blocked: boolean; status: string | null }) {
  return (
    <section id="safety" aria-labelledby="safety-heading" className="mt-12 max-w-[40rem] scroll-mt-28 border-t border-ink-200 pt-8">
      <h2 id="safety-heading" className="type-heading-3 text-ink-900">
        {safetyCopy.heading}
      </h2>
      {status === 'reported' ? (
        <p role="status" className="mt-2 type-body-sm text-ink-900">
          {safetyCopy.reported}
        </p>
      ) : status === 'failed' ? (
        <p role="alert" className="mt-2 type-body-sm text-ember-500">
          {safetyCopy.failed}
        </p>
      ) : null}
      <p className="mt-2 type-body-sm text-ink-700 [overflow-wrap:anywhere]">
        {blocked ? safetyCopy.blocked(name) : safetyCopy.blockBody(name)}
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <form action={setBlock}>
          <input type="hidden" name="member_id" value={memberId} />
          <input type="hidden" name="block" value={blocked ? 'no' : 'yes'} />
          <SubmitButton
            variant={blocked ? 'secondary' : 'danger'}
            size="sm"
            pending={blocked ? sendingCopy.unblocking : sendingCopy.blocking}
            aria-label={blocked ? undefined : safetyCopy.blockLabel(name)}
          >
            {blocked ? safetyCopy.unblock : safetyCopy.block}
          </SubmitButton>
        </form>
        <details>
          <summary className={summary} aria-label={safetyCopy.reportMember(name)}>
            {safetyCopy.report}
          </summary>
          <form action={reportMember} className="mt-2 grid max-w-[32rem] gap-2">
            <input type="hidden" name="member_id" value={memberId} />
            <label htmlFor="report-reason" className="type-body-sm font-semibold text-ink-900">
              {safetyCopy.reportReason}
            </label>
            <input id="report-reason" name="reason" type="text" maxLength={REPORT_REASON_MAX} className="field-input" />
            <div>
              <SubmitButton variant="secondary" size="sm" pending={sendingCopy.sending}>
                {safetyCopy.sendReport}
              </SubmitButton>
            </div>
          </form>
        </details>
      </div>
    </section>
  );
}
