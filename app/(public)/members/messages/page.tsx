import type { Metadata } from 'next';
import { LocalTime } from '@/components/LocalTime';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { CommunityTabs } from '@/components/CommunityTabs';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { councilCopy, messagesCopy, sendingCopy } from '@/content/council';
import { myHellos, otherIn, unreadByConversation } from '@/lib/council';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { answerHello } from './actions';

export const metadata: Metadata = { title: messagesCopy.title };

const link = 'font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';

/**
 * Messages (5b, 0009; David, Nov 11: "dm only after hello accepted"): hellos waiting for this member's
 * answer, then their open conversations, then hellos they sent. Everything here is read as the member
 * under RLS, so a block or a decline hides what it should without this page deciding. Checks the session
 * itself (invariant 5). One region on the page tone, so no bands.
 */
export default async function MessagesPage() {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const hellos = await myHellos(supabase);
  const unread = hellos.state === 'ok' ? await unreadByConversation(supabase, user.id) : new Map<string, number>();
  const all = hellos.state === 'ok' ? hellos.value : [];
  const waiting = all.filter((h) => h.status === 'pending' && h.recipientId === user.id);
  const open = all.filter((h) => h.status === 'accepted');
  const sent = all.filter((h) => h.status !== 'accepted' && h.senderId === user.id);
  // Whose pages this member may open: the database answers (0001), never this page.
  const others = [...new Set(all.map((h) => otherIn(h, user.id).id))];
  const { data: visible } = others.length
    ? await supabase.from('profiles').select('id').in('id', others)
    : { data: [] as { id: string }[] };
  const canOpen = new Set((visible ?? []).map((row) => row.id as string));
  const Name = ({ id, name }: { id: string; name: string }) =>
    canOpen.has(id) ? (
      <Link href={`/members/${id}`} className={link}>
        {name}
      </Link>
    ) : (
      <span className="font-semibold text-ink-900">{name}</span>
    );

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <CommunityTabs current="messages" />
      <Eyebrow>{messagesCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={messagesCopy.line} accent={messagesCopy.accent} />
      <Lede>{messagesCopy.lede}</Lede>

      {hellos.state === 'missing' ? (
        <p className="mt-10 max-w-[40rem] rounded-md border border-ink-200 bg-surface-200 p-6 type-body text-ink-900">
          {councilCopy.notReady}
        </p>
      ) : hellos.state === 'failed' ? (
        <p role="alert" className="mt-10 type-body text-ember-500">
          {messagesCopy.failed}
        </p>
      ) : (
        // From lg: what waits on you and your conversations on the left, the hellos you sent and the note beside them.
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)] lg:gap-x-16">
          <div className="grid content-start gap-12">
          {waiting.length > 0 ? (
            <section aria-labelledby="waiting-heading">
              <h2 id="waiting-heading" className="type-heading-3 text-ink-900">
                {messagesCopy.waitingHeading}
              </h2>
              <ul role="list" className="mt-4 grid gap-4">
                {waiting.map((hello) => (
                  <li key={hello.id} className="rounded-md border border-ink-200 bg-surface-200 p-5">
                    <p className="type-body-sm text-ink-700">
                      <Name id={hello.senderId} name={hello.senderName} />{' '}
                      · <LocalTime iso={hello.createdAt} />
                    </p>
                    <p className="mt-2 whitespace-pre-line type-body text-ink-900 [overflow-wrap:anywhere]">{hello.note}</p>
                    <form action={answerHello} className="mt-3 flex flex-wrap gap-3">
                      <input type="hidden" name="id" value={hello.id} />
                      <SubmitButton name="answer" value="accepted" size="sm" pending={sendingCopy.accepting} aria-label={messagesCopy.acceptLabel(hello.senderName)}>
                        {messagesCopy.accept}
                      </SubmitButton>
                      <SubmitButton name="answer" value="declined" variant="secondary" size="sm" pending={sendingCopy.declining} aria-label={messagesCopy.declineLabel(hello.senderName)}>
                        {messagesCopy.decline}
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="open-heading">
            <h2 id="open-heading" className="type-heading-3 text-ink-900">
              {messagesCopy.conversationsHeading}
            </h2>
            {open.length === 0 ? (
              <p className="mt-3 type-body-sm text-ink-700">
                {messagesCopy.none}{' '}
                <Link href="/members" className={link}>
                  {messagesCopy.findSomeone}
                </Link>
              </p>
            ) : (
              <ul role="list" className="mt-4 grid gap-3">
                {open.map((hello) => {
                  const other = otherIn(hello, user.id);
                  const count = unread.get(hello.id) ?? 0;
                  return (
                    <li key={hello.id}>
                      <Link
                        href={`/members/messages/${hello.id}`}
                        className="flex min-h-touch items-center justify-between gap-4 rounded-md border border-ink-200 bg-surface-200 px-5 py-3 no-underline hover:border-cobalt-600"
                      >
                        <span className="font-semibold text-cobalt-600 [overflow-wrap:anywhere]">{other.name}</span>
                        {count > 0 ? <span className="type-label text-ember-500">{messagesCopy.unread(count)}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          </div>

          <aside className="grid content-start gap-8">
          {sent.length > 0 ? (
            <section aria-labelledby="sent-heading">
              <h2 id="sent-heading" className="type-heading-3 text-ink-900">
                {messagesCopy.sentHeading}
              </h2>
              <ul role="list" className="mt-3 grid gap-2">
                {sent.map((hello) => (
                  <li key={hello.id} className="type-body-sm text-ink-700">
                    <Name id={hello.recipientId} name={hello.recipientName} />
                    : {hello.status === 'declined' ? messagesCopy.sentDeclined : messagesCopy.sentWaiting}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="max-w-[56ch] type-body-sm text-ink-700">{messagesCopy.checkBack}</p>
          </aside>
        </div>
      )}
    </div>
  );
}
