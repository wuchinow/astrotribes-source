-- 0009: the Council and hellos (5b, Nov 11, David: "one shared board", "dm only after hello
-- accepted", "free alpha possibly beta, then paid"). Plan: claude.ai review "Member messaging" (Nov 11).
--   * council_posts: one board every signed-in member reads and writes, newest first, with one
--     level of replies. A member deletes their own; an admin removes anyone's.
--   * hellos: a short note from one member to another they may see. Nothing more can be sent until
--     the other member accepts. One hello per pair, ever: a declined hello cannot be sent again.
--   * messages: a two-person conversation, open only once a hello is accepted.
--   * blocks: either member hides the other's posts, hellos, and messages, both ways.
--   * reports: a member flags a post, a message, or a member; only admins read reports.
-- Names are copied onto a post or hello when it is written, so a member who keeps their chart
-- private can still post under their name without their chart becoming readable. No birth data,
-- placement, or degree is read or copied here. Every table has RLS and explicit column grants;
-- anon gets nothing; the secret key gets nothing; no function is added to public. Deleting an
-- account removes everything here through 0001's cascade (invariant 7). Before anyone beyond the
-- team: the human security review (Sep 30) and visibility back to Only you (U54).
-- Once applied this file is never edited; a fix is a new migration.

-- 1. Tables.
create table public.council_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Copied from the author's display name when the post is written (step 3).
  author_name text not null check (char_length(author_name) between 1 and 40),
  -- A reply names the post it answers. Replies go one level deep (step 3).
  parent_id uuid references public.council_posts (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  -- Set by an admin. A removed post is kept for the report it came from, and shown to no one else.
  removed_at timestamptz
);
create index council_posts_created_idx on public.council_posts (created_at desc) where parent_id is null;
create index council_posts_parent_idx on public.council_posts (parent_id, created_at);

create table public.hellos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  -- Both names copied when the hello is written (step 3), so each sees who the other is even when
  -- one keeps their chart private.
  sender_name text not null check (char_length(sender_name) between 1 and 40),
  recipient_name text not null check (char_length(recipient_name) between 1 and 40),
  note text not null check (char_length(btrim(note)) between 1 and 300),
  status text not null default 'pending'
    constraint hellos_status_check check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  constraint hellos_not_self check (sender_id <> recipient_id)
);
-- One hello per pair, whichever of the two sent it.
create unique index hellos_pair_idx on public.hellos (least(sender_id, recipient_id), greatest(sender_id, recipient_id));
create index hellos_recipient_idx on public.hellos (recipient_id, status);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  hello_id uuid not null references public.hellos (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_hello_idx on public.messages (hello_id, created_at);

create table public.blocks (
  blocker_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  post_id uuid references public.council_posts (id) on delete cascade,
  message_id uuid references public.messages (id) on delete cascade,
  member_id uuid references public.profiles (id) on delete cascade,
  reason text check (char_length(reason) <= 500),
  -- Copied when the report is written (step 3): what was said and who said it, so an admin reads
  -- the reported words without any right to read the conversation they came from.
  excerpt text check (char_length(excerpt) <= 2000),
  subject_name text check (char_length(subject_name) <= 40),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint reports_names_something check (num_nonnulls(post_id, message_id, member_id) >= 1)
);
create index reports_open_idx on public.reports (created_at desc) where resolved_at is null;

revoke all on public.council_posts, public.hellos, public.messages, public.blocks, public.reports
  from public, anon, authenticated, service_role;

alter table public.council_posts enable row level security;
alter table public.hellos enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- 2. The checks the policies call. Each is security definer so it can read blocks and hellos
--    beyond the caller's own rows, returns a boolean only, and fails closed with no session.

-- Has either member blocked the other? False for yourself and with no session.
create function private.is_blocked(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.uid()) is not null and other <> (select auth.uid()) and exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = other)
       or (b.blocker_id = other and b.blocked_id = (select auth.uid()))), false);
$$;
revoke all on function private.is_blocked(uuid) from public, anon, authenticated, service_role;
grant execute on function private.is_blocked(uuid) to authenticated;

-- Is the caller one of the two in an accepted hello, with no block between them?
create function private.in_conversation(hello uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.uid()) is not null and exists (
    select 1 from public.hellos h
    where h.id = hello
      and h.status = 'accepted'
      and (select auth.uid()) in (h.sender_id, h.recipient_id)
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = h.sender_id and b.blocked_id = h.recipient_id)
           or (b.blocker_id = h.recipient_id and b.blocked_id = h.sender_id))), false);
$$;
revoke all on function private.in_conversation(uuid) from public, anon, authenticated, service_role;
grant execute on function private.in_conversation(uuid) to authenticated;

-- 3. What a member writes is stamped here, never taken from the request: who wrote it (the
--    session), their name (their own profile), and what a report points at.

create function private.stamp_council_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'signed_out' using errcode = '42501';
  end if;
  new.author_id := caller;
  new.author_name := (select p.display_name from public.profiles p where p.id = caller);
  if new.author_name is null then
    raise exception 'needs_name' using errcode = '23514';
  end if;
  new.body := btrim(new.body);
  new.created_at := now();
  new.removed_at := null;
  if new.parent_id is not null and not exists (
    select 1 from public.council_posts c
    where c.id = new.parent_id and c.parent_id is null and c.removed_at is null) then
    raise exception 'reply_to_a_post' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_council_post() from public, anon, authenticated, service_role;
create trigger council_posts_stamp
  before insert on public.council_posts
  for each row execute function private.stamp_council_post();

create function private.stamp_hello()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if caller is null then
      raise exception 'signed_out' using errcode = '42501';
    end if;
    new.sender_id := caller;
    new.sender_name := (select p.display_name from public.profiles p where p.id = caller);
    new.recipient_name := (select p.display_name from public.profiles p where p.id = new.recipient_id);
    if new.sender_name is null or new.recipient_name is null then
      raise exception 'needs_name' using errcode = '23514';
    end if;
    new.note := btrim(new.note);
    new.status := 'pending';
    new.created_at := now();
    new.answered_at := null;
  else
    -- Only the answer changes, once (the column grant and the policy hold the rest).
    if new.status is distinct from old.status then
      new.answered_at := now();
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_hello() from public, anon, authenticated, service_role;
create trigger hellos_stamp
  before insert or update on public.hellos
  for each row execute function private.stamp_hello();

create function private.stamp_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'signed_out' using errcode = '42501';
  end if;
  new.sender_id := (select auth.uid());
  new.body := btrim(new.body);
  new.created_at := now();
  new.read_at := null;
  return new;
end;
$$;
revoke all on function private.stamp_message() from public, anon, authenticated, service_role;
create trigger messages_stamp
  before insert on public.messages
  for each row execute function private.stamp_message();

-- A report copies the reported words and who wrote them, but only from a post or message the
-- reporter could already read (the policy in step 4 checks that before this row is kept).
create function private.stamp_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'signed_out' using errcode = '42501';
  end if;
  new.reporter_id := (select auth.uid());
  new.created_at := now();
  new.resolved_at := null;
  new.excerpt := null;
  new.subject_name := null;
  if new.post_id is not null then
    select left(c.body, 2000), c.author_name, c.author_id
      into new.excerpt, new.subject_name, new.member_id
      from public.council_posts c where c.id = new.post_id;
  elsif new.message_id is not null then
    select left(m.body, 2000), m.sender_id
      into new.excerpt, new.member_id
      from public.messages m where m.id = new.message_id;
  end if;
  if new.member_id is not null and new.subject_name is null then
    new.subject_name := (select p.display_name from public.profiles p where p.id = new.member_id);
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_report() from public, anon, authenticated, service_role;
create trigger reports_stamp
  before insert on public.reports
  for each row execute function private.stamp_report();

-- 4. Policies. Every one names its role; none is USING (true); anon has none.

-- The Council: any signed-in member reads it, except posts by someone either of you blocked.
-- Admins also see removed posts (for the reports page).
create policy council_posts_select on public.council_posts
  for select to authenticated
  using ((removed_at is null and not private.is_blocked(author_id)) or private.is_admin());

create policy council_posts_insert_own on public.council_posts
  for insert to authenticated
  with check (author_id = (select auth.uid()));

create policy council_posts_delete_own on public.council_posts
  for delete to authenticated
  using (author_id = (select auth.uid()));

create policy council_posts_remove_admin on public.council_posts
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- Hellos: the two members only, and neither once a block stands between them.
create policy hellos_select_own on public.hellos
  for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id)
    and not private.is_blocked(sender_id) and not private.is_blocked(recipient_id));

-- Only to a member you may already see (0001), with no block between you.
create policy hellos_insert_own on public.hellos
  for insert to authenticated
  with check (sender_id = (select auth.uid())
    and private.can_view_member(recipient_id)
    and not private.is_blocked(recipient_id));

-- The recipient answers once: accepted or declined.
create policy hellos_answer on public.hellos
  for update to authenticated
  using (recipient_id = (select auth.uid()) and status = 'pending')
  with check (recipient_id = (select auth.uid()) and status in ('accepted', 'declined'));

-- Messages: only inside an accepted hello with no block.
create policy messages_select on public.messages
  for select to authenticated
  using (private.in_conversation(hello_id));

create policy messages_insert_own on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and private.in_conversation(hello_id));

-- The one who received a message marks it read.
create policy messages_mark_read on public.messages
  for update to authenticated
  using (private.in_conversation(hello_id) and sender_id <> (select auth.uid()))
  with check (private.in_conversation(hello_id) and sender_id <> (select auth.uid()));

-- Blocks: your own list only. The member you block is never told.
create policy blocks_select_own on public.blocks
  for select to authenticated
  using (blocker_id = (select auth.uid()));

create policy blocks_insert_own on public.blocks
  for insert to authenticated
  with check (blocker_id = (select auth.uid()));

create policy blocks_delete_own on public.blocks
  for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- Reports: any member files one about what they can read; only admins read or resolve them.
-- The subqueries run as the reporter, under the policies above, so a report can only point at a
-- post or message the reporter could see.
create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid())
    and (post_id is null or exists (select 1 from public.council_posts c where c.id = post_id))
    and (message_id is null or exists (select 1 from public.messages m where m.id = message_id))
    and (member_id is null or member_id <> (select auth.uid())));

create policy reports_select_admin on public.reports
  for select to authenticated
  using (private.is_admin());

create policy reports_resolve_admin on public.reports
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- 5. Grants: only the columns the app writes. Nothing to anon or the secret key.
grant select on public.council_posts to authenticated;
grant insert (parent_id, body) on public.council_posts to authenticated;
grant delete on public.council_posts to authenticated;
grant update (removed_at) on public.council_posts to authenticated;

grant select on public.hellos to authenticated;
grant insert (recipient_id, note) on public.hellos to authenticated;
grant update (status) on public.hellos to authenticated;

grant select on public.messages to authenticated;
grant insert (hello_id, body) on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

grant select, delete on public.blocks to authenticated;
grant insert (blocked_id) on public.blocks to authenticated;

grant select on public.reports to authenticated;
grant insert (post_id, message_id, member_id, reason) on public.reports to authenticated;
grant update (resolved_at) on public.reports to authenticated;
