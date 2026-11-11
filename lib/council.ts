// The Council, hellos, and messages (5b, 0009), always read as the member under RLS. Who sees what is
// decided by the database alone: this file never filters by sender, block, or status to hide anything
// a policy would show. Named columns only. Names on posts and hellos were copied by the database when
// they were written, so a private member's chart is never read to show who wrote something.
import 'server-only';
import { helloCopy } from '@/content/council';
import type { memberClient } from './supabase/server';

type Client = Awaited<ReturnType<typeof memberClient>>;

export const POST_COLUMNS = 'id, author_id, author_name, parent_id, body, created_at';
export const HELLO_COLUMNS = 'id, sender_id, recipient_id, sender_name, recipient_name, note, status, created_at, answered_at';
export const MESSAGE_COLUMNS = 'id, hello_id, sender_id, body, created_at, read_at';

/** The most top-level posts the Council shows at once. */
export const COUNCIL_LIMIT = 100;

export interface CouncilPost {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  replies: CouncilPost[];
}

export interface Hello {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  recipientName: string;
  note: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Message {
  id: string;
  helloId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

/** Text a member typed: trimmed, at least one character, at most `max`. */
export const cleanText = (value: unknown, max: number): { ok: true; text: string } | { ok: false; error: 'empty' | 'long' } => {
  if (typeof value !== 'string') return { ok: false, error: 'empty' };
  const text = value.replace(/\r\n/g, '\n').trim();
  if (text.length === 0) return { ok: false, error: 'empty' };
  if ([...text].length > max) return { ok: false, error: 'long' };
  return { ok: true, text };
};

/** Undefined when a table is not there yet: the migration has not been applied (preview before deploy). */
export const isMissingTable = (error: { code?: string } | null): boolean =>
  error?.code === '42P01' || error?.code === 'PGRST205';

interface PostRow {
  id: string;
  author_id: string;
  author_name: string;
  parent_id: string | null;
  body: string;
  created_at: string;
}

/** Top-level posts newest first, each with its replies oldest first. Pure, for tests. */
export function threadPosts(rows: readonly PostRow[]): CouncilPost[] {
  const toPost = (row: PostRow): CouncilPost => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    replies: [],
  });
  const tops = rows.filter((row) => row.parent_id === null).map(toPost);
  const byId = new Map(tops.map((post) => [post.id, post]));
  for (const row of rows) {
    if (row.parent_id === null) continue;
    byId.get(row.parent_id)?.replies.push(toPost(row));
  }
  tops.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const post of tops) post.replies.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return tops;
}

export type Loaded<T> = { state: 'ok'; value: T } | { state: 'missing' } | { state: 'failed' };

/** The Council: the newest posts and their replies. */
export async function councilPosts(supabase: Client): Promise<Loaded<CouncilPost[]>> {
  const { data: tops, error } = await supabase
    .from('council_posts')
    .select(POST_COLUMNS)
    .is('parent_id', null)
    .is('removed_at', null)
    .order('created_at', { ascending: false })
    .limit(COUNCIL_LIMIT);
  if (isMissingTable(error)) return { state: 'missing' };
  if (error) return { state: 'failed' };
  const ids = (tops ?? []).map((row) => row.id as string);
  if (ids.length === 0) return { state: 'ok', value: [] };
  const { data: replies, error: replyError } = await supabase
    .from('council_posts')
    .select(POST_COLUMNS)
    .in('parent_id', ids)
    .is('removed_at', null)
    .order('created_at', { ascending: true });
  if (replyError) return { state: 'failed' };
  return { state: 'ok', value: threadPosts([...(tops ?? []), ...(replies ?? [])] as PostRow[]) };
}

interface HelloRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  recipient_name: string;
  note: string;
  status: Hello['status'];
  created_at: string;
}

const toHello = (row: HelloRow): Hello => ({
  id: row.id,
  senderId: row.sender_id,
  recipientId: row.recipient_id,
  senderName: row.sender_name,
  recipientName: row.recipient_name,
  note: row.note,
  status: row.status,
  createdAt: row.created_at,
});

/** Every hello the member sent or received, newest first. */
export async function myHellos(supabase: Client): Promise<Loaded<Hello[]>> {
  const { data, error } = await supabase.from('hellos').select(HELLO_COLUMNS).order('created_at', { ascending: false });
  if (isMissingTable(error)) return { state: 'missing' };
  if (error) return { state: 'failed' };
  return { state: 'ok', value: ((data ?? []) as HelloRow[]).map(toHello) };
}

/** The hello between the member and one other member, if there is one the member may see. */
export async function helloWith(supabase: Client, me: string, other: string): Promise<Loaded<Hello | null>> {
  const { data, error } = await supabase
    .from('hellos')
    .select(HELLO_COLUMNS)
    .or(`and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`)
    .maybeSingle();
  if (isMissingTable(error)) return { state: 'missing' };
  if (error) return { state: 'failed' };
  return { state: 'ok', value: data ? toHello(data as HelloRow) : null };
}

/** One hello by id, if the member may see it. */
export async function helloById(supabase: Client, id: string): Promise<Hello | null> {
  const { data } = await supabase.from('hellos').select(HELLO_COLUMNS).eq('id', id).maybeSingle();
  return data ? toHello(data as HelloRow) : null;
}

interface MessageRow {
  id: string;
  hello_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

const toMessage = (row: MessageRow): Message => ({
  id: row.id,
  helloId: row.hello_id,
  senderId: row.sender_id,
  body: row.body,
  createdAt: row.created_at,
  readAt: row.read_at,
});

/** A conversation's messages, oldest first. Empty when the member is not in it. */
export async function conversation(supabase: Client, helloId: string): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('hello_id', helloId)
    .order('created_at', { ascending: true })
    .limit(500);
  return ((data ?? []) as MessageRow[]).map(toMessage);
}

/** How many unread messages the member has in each conversation. */
export async function unreadByConversation(supabase: Client, me: string): Promise<Map<string, number>> {
  const { data } = await supabase.from('messages').select('hello_id').is('read_at', null).neq('sender_id', me);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { hello_id: string }[]) counts.set(row.hello_id, (counts.get(row.hello_id) ?? 0) + 1);
  return counts;
}

/** Whether the member has blocked this one. */
export async function hasBlocked(supabase: Client, me: string, other: string): Promise<boolean> {
  const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', me).eq('blocked_id', other).maybeSingle();
  return Boolean(data);
}

/** The other member in a hello. */
export const otherIn = (hello: Hello, me: string) =>
  hello.senderId === me ? { id: hello.recipientId, name: hello.recipientName } : { id: hello.senderId, name: hello.senderName };

/** What a member card offers (5b): a link to say hello, answer, or message, or a quiet note. */
export interface HelloLink {
  href?: string;
  text: string;
  label?: string;
}

/**
 * Where the member stands on a hello with each other member, for the member cards (the members list,
 * a Tribe's members, Clanmates and Vibemates): no hello yet, one waiting either way, or an open
 * conversation. Without the tables (or when the read failed) cards offer nothing.
 */
export function helloLinks(hellos: Loaded<Hello[]>, me: string): (id: string, name: string) => HelloLink | undefined {
  if (hellos.state !== 'ok') return () => undefined;
  const byMember = new Map<string, Hello>(hellos.value.map((hello) => [otherIn(hello, me).id, hello]));
  const card = helloCopy.card;
  return (id, name) => {
    const hello = byMember.get(id);
    if (!hello) return { href: `/members/${id}#hello`, text: card.say, label: card.sayLabel(name) };
    if (hello.status === 'accepted') return { href: `/members/messages/${hello.id}`, text: card.message, label: card.messageLabel(name) };
    if (hello.status === 'pending') {
      return hello.recipientId === me ? { href: `/members/${id}#hello`, text: card.answer, label: card.answerLabel(name) } : { text: card.waiting };
    }
    return undefined;
  };
}
