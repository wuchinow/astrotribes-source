'use server';
// The Council's writes (5b, 0009). Each checks the session itself (invariant 5). Who wrote a post and
// under what name is stamped by the database from the session, never taken from the form.
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COUNCIL_POST_MAX, REPORT_REASON_MAX } from '@/content/council';
import { cleanText } from '@/lib/council';
import { isMemberId } from '@/lib/members';
import { takeRateLimit } from '@/lib/rate-limit';
import { memberClient } from '@/lib/supabase/server';

const PAGE = '/members/council';

const signedIn = async () => {
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/sign-in');
  return { supabase, user: data.user };
};

/** A new post, or a reply when the form names the post it answers. */
export async function postToCouncil(form: FormData): Promise<void> {
  const parent = form.get('parent_id');
  const anchor = isMemberId(parent) ? `&on=${parent}#post-${parent}` : '#new-post';
  if (!takeRateLimit('council', await headers()).ok) redirect(`${PAGE}?error=limit${anchor}`);
  const { supabase } = await signedIn();
  const body = cleanText(form.get('body'), COUNCIL_POST_MAX);
  if (!body.ok) redirect(`${PAGE}?error=${body.error}${anchor}`);
  const { error } = await supabase
    .from('council_posts')
    .insert({ body: body.text, parent_id: isMemberId(parent) ? parent : null });
  if (error) redirect(`${PAGE}?error=${error.message.includes('needs_name') ? 'name' : 'failed'}${anchor}`);
  redirect(isMemberId(parent) ? `${PAGE}#post-${parent}` : `${PAGE}?posted=1#new-post`);
}

/** Deletes the member's own post (RLS allows only their own); its replies go with it. */
export async function deleteCouncilPost(form: FormData): Promise<void> {
  const { supabase, user } = await signedIn();
  const id = form.get('id');
  if (!isMemberId(id)) redirect(PAGE);
  await supabase.from('council_posts').delete().eq('id', id).eq('author_id', user.id);
  redirect(`${PAGE}?deleted=1`);
}

/** Reports a post. The database copies the words for the admin and checks the member could see it. */
export async function reportCouncilPost(form: FormData): Promise<void> {
  if (!takeRateLimit('council', await headers()).ok) redirect(`${PAGE}?error=limit`);
  const { supabase } = await signedIn();
  const id = form.get('id');
  if (!isMemberId(id)) redirect(PAGE);
  const reason = cleanText(form.get('reason'), REPORT_REASON_MAX);
  const { error } = await supabase.from('reports').insert({ post_id: id, reason: reason.ok ? reason.text : null });
  redirect(error ? `${PAGE}?error=failed#post-${id}` : `${PAGE}?reported=1#post-${id}`);
}
