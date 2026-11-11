import type { Metadata } from 'next';
import { LocalTime } from '@/components/LocalTime';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { Eyebrow } from '@/components/Section';
import { MESSAGE_MAX, REPORT_REASON_MAX, messagesCopy, safetyCopy, sendingCopy } from '@/content/council';
import { conversation, helloById, otherIn } from '@/lib/council';
import { isMemberId } from '@/lib/members';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { reportMember, sendMessage, setBlock } from '../actions';

// The other member's name is never in the page title.
export const metadata: Metadata = { title: messagesCopy.title };

const link = 'inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline-offset-4 hover:underline';
// Report and Delete are quiet (audit, Nov 11): small, at the end of the line that names the writer,
// and still on every post, reply, and message. Opened, the form takes the full width under that line.
const quiet =
  'inline-flex min-h-touch cursor-pointer list-none items-center type-caption font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4 [&::-webkit-details-marker]:hidden';

/**
 * One conversation (5b, 0009): the hello that opened it, then the messages oldest first, then the
 * box to write in. The database shows it only to the two members, only once the hello is accepted, and
 * not across a block; anything else is a 404, so the page never says which. Opening it marks the other
 * member's messages read. No live updates: a new message shows on the next visit or send.
 * Checks the session itself (invariant 5).
 */
export default async function ConversationPage({ params, searchParams }: PageProps<'/members/messages/[id]'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const { id } = await params;
  if (!isMemberId(id)) notFound();
  const hello = await helloById(supabase, id);
  if (!hello || hello.status !== 'accepted') notFound();
  const other = otherIn(hello, user.id);
  const query = await searchParams;
  const error = typeof query.error === 'string' ? query.error : null;

  const messages = await conversation(supabase, id);
  if (messages.some((m) => m.senderId !== user.id && !m.readAt)) {
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('hello_id', id).neq('sender_id', user.id).is('read_at', null);
  }

  const errorText = error && error in messagesCopy.errors ? messagesCopy.errors[error as keyof typeof messagesCopy.errors] : null;

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Link href="/members/messages" className={link}>
        {messagesCopy.back}
      </Link>
      <Eyebrow className="mt-6">{messagesCopy.eyebrow}</Eyebrow>
      <h1 className="mt-2 type-display-lg text-ink-900 [overflow-wrap:anywhere]">{messagesCopy.conversationWith(other.name)}</h1>

      <ol role="list" className="mt-8 grid max-w-[44rem] gap-4">
        <li className="rounded-md border border-ink-200 bg-surface-200 p-5">
          <p className="type-label text-ink-500">{hello.senderId === user.id ? messagesCopy.yourHello : messagesCopy.hello}</p>
          <p className="mt-2 whitespace-pre-line type-body text-ink-900 [overflow-wrap:anywhere]">{hello.note}</p>
        </li>
        {messages.map((message) => {
          const mine = message.senderId === user.id;
          return (
            <li
              key={message.id}
              className={mine ? 'ml-8 rounded-md border border-ink-200 bg-surface-100 p-4 md:ml-16' : 'mr-8 rounded-md border border-ink-200 bg-surface-200 p-4 md:mr-16'}
            >
              <div className="flex flex-wrap items-center gap-x-4">
                <p className="type-body-sm text-ink-700">
                  <span className="font-semibold text-ink-900">{mine ? messagesCopy.you : other.name}</span> ·{' '}
                  <LocalTime iso={message.createdAt} />
                </p>
                {!mine ? (
                <details className="ml-auto open:ml-0 open:basis-full">
                  <summary className={quiet} aria-label={safetyCopy.reportMessageLabel(other.name)}>
                    {safetyCopy.report}
                  </summary>
                  <form action={reportMember} className="mt-2 grid max-w-[32rem] gap-2">
                    <input type="hidden" name="message_id" value={message.id} />
                    <input type="hidden" name="hello_id" value={hello.id} />
                    <label htmlFor={`reason-${message.id}`} className="type-body-sm font-semibold text-ink-900">
                      {safetyCopy.reportReason}
                    </label>
                    <input id={`reason-${message.id}`} name="reason" type="text" maxLength={REPORT_REASON_MAX} className="field-input" />
                    <div>
                      <SubmitButton variant="secondary" size="sm" pending={sendingCopy.sending}>
                        {safetyCopy.sendReport}
                      </SubmitButton>
                    </div>
                  </form>
                </details>
                ) : null}
              </div>
              <p className="whitespace-pre-line type-body text-ink-900 [overflow-wrap:anywhere]">{message.body}</p>
            </li>
          );
        })}
      </ol>

      <form id="write" action={sendMessage} className="mt-8 grid max-w-[44rem] scroll-mt-28 gap-2">
        <input type="hidden" name="hello_id" value={hello.id} />
        <label htmlFor="message-body" className="font-semibold text-[1rem] text-ink-900">
          {messagesCopy.label}
        </label>
        <textarea
          id="message-body"
          name="body"
          required
          rows={3}
          maxLength={MESSAGE_MAX}
          className="field-input min-h-24 resize-y py-3"
          aria-invalid={Boolean(errorText) || undefined}
        />
        {errorText ? (
          <p role="alert" className="type-body-sm text-ember-500">
            {errorText}
          </p>
        ) : null}
        <div>
          <SubmitButton pending={sendingCopy.sending}>{messagesCopy.send}</SubmitButton>
        </div>
      </form>

      <section id="safety" aria-labelledby="safety-heading" className="mt-12 max-w-[44rem] scroll-mt-28 border-t border-ink-200 pt-8">
        <h2 id="safety-heading" className="type-heading-3 text-ink-900">
          {safetyCopy.heading}
        </h2>
        {query.safety === 'reported' ? (
          <p role="status" className="mt-2 type-body-sm text-ink-900">
            {safetyCopy.reported}
          </p>
        ) : query.safety === 'failed' ? (
          <p role="alert" className="mt-2 type-body-sm text-ember-500">
            {safetyCopy.failed}
          </p>
        ) : null}
        <p className="mt-2 type-body-sm text-ink-700 [overflow-wrap:anywhere]">{safetyCopy.blockBody(other.name)}</p>
        <form action={setBlock} className="mt-3">
          <input type="hidden" name="member_id" value={other.id} />
          <input type="hidden" name="block" value="yes" />
          <input type="hidden" name="from" value="messages" />
          <SubmitButton variant="danger" size="sm" pending={sendingCopy.blocking} aria-label={safetyCopy.blockLabel(other.name)}>
            {safetyCopy.block}
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
