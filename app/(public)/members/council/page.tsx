import type { Metadata } from 'next';
import { LocalTime } from '@/components/LocalTime';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { CommunityTabs } from '@/components/CommunityTabs';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { COUNCIL_POST_MAX, REPORT_REASON_MAX, councilCopy, sendingCopy } from '@/content/council';
import { councilPosts, type CouncilPost } from '@/lib/council';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { deleteCouncilPost, postToCouncil, reportCouncilPost } from './actions';

export const metadata: Metadata = { title: councilCopy.title };

const link = 'font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';
// Report and Delete are quiet (audit, Nov 11): small, at the end of the line that names the writer,
// and still on every post, reply, and message. Opened, the form takes the full width under that line.
const quiet =
  'inline-flex min-h-touch cursor-pointer list-none items-center type-caption font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4 [&::-webkit-details-marker]:hidden';
const summary =
  'inline-flex min-h-touch cursor-pointer list-none items-center type-ui font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4 [&::-webkit-details-marker]:hidden';

/**
 * The Council (5b, 0009; David, Nov 11: "one shared board"): one board for every signed-in member,
 * newest first, with one level of replies. No ranking and no feed: the order is time alone. A member
 * deletes their own posts and reports anyone's; an admin removes. Names were stamped by the database
 * when each post was written, so a name links to the author's page only when the database lets this
 * member see it. Checks the session itself (invariant 5). One region on the page tone, so no bands.
 */
export default async function CouncilPage({ searchParams }: PageProps<'/members/council'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
  if (!profile?.display_name) redirect('/welcome');

  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : null;
  // A reply's error shows on that post's reply form, which opens again.
  const on = typeof params.on === 'string' ? params.on : null;
  const posts = await councilPosts(supabase);

  // Whose pages this member may open: the database answers (0001), never this page.
  const authors = posts.state === 'ok' ? [...new Set(posts.value.flatMap((p) => [p.authorId, ...p.replies.map((r) => r.authorId)]))] : [];
  const { data: visible } = authors.length
    ? await supabase.from('profiles').select('id').in('id', authors)
    : { data: [] as { id: string }[] };
  const canOpen = new Set((visible ?? []).map((row) => row.id as string));

  const errorText = (code: string | null) =>
    code === 'name'
      ? councilCopy.needsName
      : code && code in councilCopy.errors
        ? councilCopy.errors[code as keyof typeof councilCopy.errors]
        : null;

  const Author = ({ post }: { post: CouncilPost }) =>
    post.authorId === user.id ? (
      <span className="font-semibold text-ink-900">{post.authorName}</span>
    ) : canOpen.has(post.authorId) ? (
      <Link href={`/members/${post.authorId}`} className={link}>
        {post.authorName}
      </Link>
    ) : (
      <span className="font-semibold text-ink-900">{post.authorName}</span>
    );

  const Tools = ({ post }: { post: CouncilPost }) =>
    post.authorId === user.id ? (
      <form action={deleteCouncilPost} className="ml-auto">
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" className={quiet} aria-label={councilCopy.deleteLabel}>
          {councilCopy.delete}
        </button>
      </form>
    ) : (
      <details className="ml-auto open:ml-0 open:basis-full">
        <summary className={quiet} aria-label={councilCopy.reportLabel(post.authorName)}>
          {councilCopy.report}
        </summary>
        <form action={reportCouncilPost} className="mt-2 grid max-w-[32rem] gap-2">
          <input type="hidden" name="id" value={post.id} />
          <label htmlFor={`reason-${post.id}`} className="type-body-sm font-semibold text-ink-900">
            {councilCopy.reportReason}
          </label>
          <input id={`reason-${post.id}`} name="reason" type="text" maxLength={REPORT_REASON_MAX} className="field-input" />
          <div>
            <SubmitButton variant="secondary" size="sm" pending={sendingCopy.sending}>
              {councilCopy.sendReport}
            </SubmitButton>
          </div>
        </form>
      </details>
    );

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <CommunityTabs current="council" />
      <Eyebrow>{councilCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={councilCopy.line} accent={councilCopy.accent} />
      <Lede>{councilCopy.lede}</Lede>
      <p className="mt-4 max-w-[56ch] type-body-sm text-ink-700">{councilCopy.whoSees}</p>

      {params.reported ? (
        <p role="status" className="mt-6 type-body-sm text-ink-900">
          {councilCopy.reported}
        </p>
      ) : null}

      {posts.state === 'missing' ? (
        <p className="mt-10 max-w-[40rem] rounded-md border border-ink-200 bg-surface-200 p-6 type-body text-ink-900">
          {councilCopy.notReady}
        </p>
      ) : (
        <>
          <section id="new-post" aria-label={councilCopy.newHeading} className="mt-8 max-w-[44rem] scroll-mt-28">
            {/* One line until opened (David, Nov 11: "let's try them"): the posts lead, and a new post
                lands just under where it was written. Opens again with an error or after posting. */}
            <details open={(error && !on) || undefined} className="group rounded-md border border-ink-200 bg-surface-200">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-5 type-ui font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4 group-open:border-b group-open:border-ink-200 [&::-webkit-details-marker]:hidden">
                {councilCopy.newHeading}
              </summary>
              <form action={postToCouncil} className="grid gap-2 p-5">
                <label htmlFor="new-body" className="font-semibold text-[1rem] text-ink-900">
                  {councilCopy.newLabel}
                </label>
                <textarea
                  id="new-body"
                  name="body"
                  required
                  rows={4}
                  maxLength={COUNCIL_POST_MAX}
                  className="field-input min-h-32 resize-y py-3"
                  aria-invalid={(error && !on) || undefined}
                />
                {error && !on && errorText(error) ? (
                  <p role="alert" className="type-body-sm text-ember-500">
                    {errorText(error)}
                  </p>
                ) : null}
                <div>
                  <SubmitButton pending={sendingCopy.posting}>{councilCopy.post}</SubmitButton>
                </div>
              </form>
            </details>
            {params.posted ? (
              <p role="status" className="mt-2 type-body-sm text-ink-700">
                {councilCopy.posted}
              </p>
            ) : null}
          </section>

          {posts.state === 'failed' ? (
            <p role="alert" className="mt-10 type-body text-ember-500">
              {councilCopy.failed}
            </p>
          ) : posts.value.length === 0 ? (
            <div className="mt-6 max-w-[44rem] rounded-md border border-ink-200 bg-surface-200 p-6">
              <h2 className="type-heading-3 text-ink-900">{councilCopy.emptyHeading}</h2>
              <p className="mt-2 type-body-sm text-ink-700">{councilCopy.emptyBody}</p>
            </div>
          ) : (
            <ol role="list" className="mt-6 grid max-w-[44rem] gap-6">
              {posts.value.map((post) => (
                <li key={post.id} id={`post-${post.id}`} className="scroll-mt-28 rounded-md border border-ink-200 bg-surface-200 p-5 md:p-6">
                  <article aria-labelledby={`by-${post.id}`}>
                    <div className="flex flex-wrap items-center gap-x-4">
                      <p id={`by-${post.id}`} className="type-body-sm text-ink-700">
                        <Author post={post} /> · <LocalTime iso={post.createdAt} />
                      </p>
                      <Tools post={post} />
                    </div>
                    <p className="whitespace-pre-line type-body text-ink-900 [overflow-wrap:anywhere]">{post.body}</p>
                  </article>

                  {post.replies.length > 0 ? (
                    <ol role="list" aria-label={councilCopy.replies(post.replies.length)} className="mt-4 grid gap-4 border-l-2 border-ink-200 pl-4">
                      {post.replies.map((reply) => (
                        <li key={reply.id} id={`post-${reply.id}`} className="scroll-mt-28">
                          <div className="flex flex-wrap items-center gap-x-4">
                            <p className="type-body-sm text-ink-700">
                              <Author post={reply} /> · <LocalTime iso={reply.createdAt} />
                            </p>
                            <Tools post={reply} />
                          </div>
                          <p className="whitespace-pre-line type-body text-ink-900 [overflow-wrap:anywhere]">{reply.body}</p>
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  <details className="mt-3" open={on === post.id || undefined}>
                    <summary className={summary}>{councilCopy.reply}</summary>
                    <form action={postToCouncil} className="mt-2 grid gap-2">
                      <input type="hidden" name="parent_id" value={post.id} />
                      <label htmlFor={`reply-${post.id}`} className="type-body-sm font-semibold text-ink-900">
                        {councilCopy.replyLabel(post.authorName)}
                      </label>
                      <textarea
                        id={`reply-${post.id}`}
                        name="body"
                        required
                        rows={3}
                        maxLength={COUNCIL_POST_MAX}
                        className="field-input min-h-24 resize-y py-3"
                        aria-invalid={(error && on === post.id) || undefined}
                      />
                      {error && on === post.id && errorText(error) ? (
                        <p role="alert" className="type-body-sm text-ember-500">
                          {errorText(error)}
                        </p>
                      ) : null}
                      <div>
                        <SubmitButton variant="secondary" size="sm" pending={sendingCopy.sending}>
                          {councilCopy.sendReply}
                        </SubmitButton>
                      </div>
                    </form>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

    </div>
  );
}
