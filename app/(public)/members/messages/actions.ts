'use server';
// Hellos, messages, blocks, and member reports (5b, 0009). Each checks the session itself (invariant 5).
// The database decides who may say hello to whom (only a member you may see, no block, one hello per
// pair), who may answer (the recipient, once), and who may write in a conversation (the two, once the
// hello is accepted). Ids from a form are only ever looked up; the sender is always the session.
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HELLO_NOTE_MAX, MESSAGE_MAX, REPORT_REASON_MAX } from '@/content/council';
import { cleanText } from '@/lib/council';
import { isMemberId } from '@/lib/members';
import { takeRateLimit } from '@/lib/rate-limit';
import { memberClient } from '@/lib/supabase/server';

const signedIn = async () => {
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/sign-in');
  return { supabase, user: data.user };
};

const memberPage = (id: string) => `/members/${id}`;

/** A hello from a member's page. */
export async function sayHello(form: FormData): Promise<void> {
  const to = form.get('recipient_id');
  if (!isMemberId(to)) redirect('/members');
  const back = `${memberPage(to)}?hello`;
  if (!takeRateLimit('hello', await headers()).ok) redirect(`${back}=limit#hello`);
  const { supabase } = await signedIn();
  const note = cleanText(form.get('note'), HELLO_NOTE_MAX);
  if (!note.ok) redirect(`${back}=${note.error}#hello`);
  const { error } = await supabase.from('hellos').insert({ recipient_id: to, note: note.text });
  if (error) redirect(`${back}=${error.code === '23505' ? 'exists' : 'failed'}#hello`);
  redirect(`${back}=sent#hello`);
}

/** The recipient accepts or declines. The database lets only the recipient answer, and only once. */
export async function answerHello(form: FormData): Promise<void> {
  const { supabase } = await signedIn();
  const id = form.get('id');
  const answer = form.get('answer');
  if (!isMemberId(id) || (answer !== 'accepted' && answer !== 'declined')) redirect('/members/messages');
  await supabase.from('hellos').update({ status: answer }).eq('id', id).eq('status', 'pending');
  redirect(answer === 'accepted' ? `/members/messages/${id}` : '/members/messages');
}

/** A message in an accepted conversation. */
export async function sendMessage(form: FormData): Promise<void> {
  const id = form.get('hello_id');
  if (!isMemberId(id)) redirect('/members/messages');
  const page = `/members/messages/${id}`;
  if (!takeRateLimit('message', await headers()).ok) redirect(`${page}?error=limit#write`);
  const { supabase } = await signedIn();
  const body = cleanText(form.get('body'), MESSAGE_MAX);
  if (!body.ok) redirect(`${page}?error=${body.error}#write`);
  const { error } = await supabase.from('messages').insert({ hello_id: id, body: body.text });
  redirect(error ? `${page}?error=failed#write` : `${page}#write`);
}

/** Blocks or unblocks a member. Only the member's own block list changes. */
export async function setBlock(form: FormData): Promise<void> {
  const { supabase, user } = await signedIn();
  const other = form.get('member_id');
  if (!isMemberId(other) || other === user.id) redirect('/members');
  if (form.get('block') === 'yes') {
    const { error } = await supabase.from('blocks').insert({ blocked_id: other });
    if (error && error.code !== '23505') redirect(`${memberPage(other)}?safety=failed#safety`);
  } else {
    await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', other);
  }
  // From a conversation, a block hides it, so the member goes back to their messages.
  redirect(form.get('from') === 'messages' ? '/members/messages' : `${memberPage(other)}#safety`);
}

/**
 * Reports a member, or a message in a conversation. The database copies a reported message's words for
 * the admin, and refuses one the member could not read.
 */
export async function reportMember(form: FormData): Promise<void> {
  if (!takeRateLimit('hello', await headers()).ok) redirect('/members/messages');
  const { supabase } = await signedIn();
  const member = form.get('member_id');
  const message = form.get('message_id');
  const hello = form.get('hello_id');
  const reason = cleanText(form.get('reason'), REPORT_REASON_MAX);
  const back = isMemberId(hello) ? `/members/messages/${hello}` : isMemberId(member) ? memberPage(member) : '/members';
  if (!isMemberId(member) && !isMemberId(message)) redirect(back);
  const { error } = await supabase.from('reports').insert({
    member_id: isMemberId(member) ? member : null,
    message_id: isMemberId(message) ? message : null,
    reason: reason.ok ? reason.text : null,
  });
  redirect(`${back}?safety=${error ? 'failed' : 'reported'}#safety`);
}
