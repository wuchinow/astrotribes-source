-- 0009: the Council, hellos, messages, blocks, and reports. Who may read and write each, that names
-- and authors are stamped by the database, that no message can be sent before a hello is accepted,
-- that a block hides both ways, and that only admins read reports. The users are synthetic.
begin;
select plan(47);

select tests.new_user('a', '{"display_name": "A"}');
select tests.new_user('b', '{"display_name": "B"}');
select tests.new_user('c', '{"display_name": "C"}');
select tests.new_user('p', '{"display_name": "P"}'); -- keeps their chart private
select tests.new_user('nameless');                    -- no display name yet
select tests.new_user('admin', '{"display_name": "Admin"}');
update public.profiles set visibility = 'everyone' where id in (tests.id('a'), tests.id('b'), tests.id('c'), tests.id('admin'));
insert into private.admins (user_id) values (tests.id('admin'));

-- Grants: nothing for visitors or the secret key, on any of the five tables.
select ok(not has_table_privilege('anon', 'public.council_posts', 'SELECT'), 'anon cannot read the Council');
select ok(not has_table_privilege('anon', 'public.hellos', 'SELECT'), 'anon cannot read hellos');
select ok(not has_table_privilege('anon', 'public.messages', 'SELECT'), 'anon cannot read messages');
select ok(not has_table_privilege('service_role', 'public.messages', 'SELECT'), 'the secret key cannot read messages');
select ok(not has_table_privilege('service_role', 'public.reports', 'SELECT'), 'the secret key cannot read reports');
select ok(not has_column_privilege('authenticated', 'public.council_posts', 'author_id', 'INSERT'),
  'a member cannot choose who a post is from');
select ok(not has_column_privilege('authenticated', 'public.hellos', 'sender_id', 'INSERT'),
  'a member cannot choose who a hello is from');
select ok(not has_column_privilege('authenticated', 'public.hellos', 'note', 'UPDATE'),
  'a hello cannot be rewritten');

-- The Council.
select tests.be('a');
select lives_ok($$insert into public.council_posts (body) values ('  Hello, Council  ')$$, 'a member posts');
select is((select author_name from public.council_posts where author_id = tests.id('a')), 'A', 'the name is stamped from the profile');
select is((select body from public.council_posts where author_id = tests.id('a')), 'Hello, Council', 'the words are trimmed');
select throws_ok(
  format($$insert into public.council_posts (body, author_id) values ('x', %L)$$, tests.id('b')),
  '42501', null, 'a member cannot post as someone else');
select tests.be('p');
select lives_ok($$insert into public.council_posts (body) values ('From a private chart')$$,
  'a member with a private chart may still post, under their name');
select is((select count(*) from public.council_posts), 2::bigint, 'and reads every post');
select is((select count(*) from public.profiles where id = tests.id('a')), 1::bigint, 'reading A (everyone) is allowed');
select tests.be('b');
select is((select count(*) from public.profiles where id = tests.id('p')), 0::bigint,
  'posting does not open the private member''s profile');
select lives_ok(format($$insert into public.council_posts (body, parent_id)
  select 'A reply', id from public.council_posts where author_id = %L$$, tests.id('a')), 'a member replies');
select throws_ok(format($$insert into public.council_posts (body, parent_id)
  select 'A reply to a reply', id from public.council_posts where author_id = %L and parent_id is not null$$, tests.id('b')),
  '23514', null, 'replies go one level deep');
select tests.be('nameless');
select throws_ok($$insert into public.council_posts (body) values ('No name')$$, '23514', null,
  'a member with no display name cannot post');
select tests.be('b');
with changed as (delete from public.council_posts where author_id = tests.id('a') returning 1) select is((select count(*) from changed), 0::bigint,
  'a member cannot delete someone else''s post');
with changed as (update public.council_posts set removed_at = now() returning 1) select is((select count(*) from changed), 0::bigint,
  'a member cannot remove posts');
select tests.be('admin');
with changed as (update public.council_posts set removed_at = now()
  where author_id = tests.id('p') returning 1) select is((select count(*) from changed), 1::bigint, 'an admin removes a post');
select tests.be('b');
select is((select count(*) from public.council_posts where author_id = tests.id('p')), 0::bigint,
  'a removed post is gone for members');

-- Hellos.
select tests.be('a');
select throws_ok(format($$insert into public.hellos (recipient_id, note) values (%L, 'Hi')$$, tests.id('p')),
  '42501', null, 'no hello to a member you cannot see');
select lives_ok(format($$insert into public.hellos (recipient_id, note) values (%L, 'Hi B')$$, tests.id('b')),
  'a hello to a member you can see');
select is((select sender_name || '>' || recipient_name || ':' || status from public.hellos), 'A>B:pending',
  'names and the pending status are stamped');
select throws_ok(format($$insert into public.messages (hello_id, body)
  select id, 'Before an answer' from public.hellos$$), '42501', null, 'no message before the hello is accepted');
with changed as (update public.hellos set status = 'accepted' returning 1) select is((select count(*) from changed), 0::bigint,
  'the sender cannot accept their own hello');
select tests.be('b');
select throws_ok(format($$insert into public.hellos (recipient_id, note) values (%L, 'Hi A')$$, tests.id('a')),
  '23505', null, 'one hello per pair, whoever sends it');
select tests.be('c');
select is((select count(*) from public.hellos), 0::bigint, 'nobody else sees a hello');
select tests.be('b');
select lives_ok($$update public.hellos set status = 'accepted'$$, 'the recipient accepts');
select ok((select answered_at is not null from public.hellos), 'the answer is dated');
with changed as (update public.hellos set status = 'declined' returning 1) select is((select count(*) from changed), 0::bigint,
  'an answer is given once');

-- Messages.
select lives_ok($$insert into public.messages (hello_id, body) select id, 'Hello back' from public.hellos$$,
  'after acceptance, the recipient writes');
select tests.be('a');
select lives_ok($$insert into public.messages (hello_id, body) select id, 'Good to meet you' from public.hellos$$,
  'and so does the sender');
select is((select count(*) from public.messages), 2::bigint, 'both read the conversation');
with changed as (update public.messages set read_at = now() returning 1) select is((select count(*) from changed), 1::bigint,
  'a member marks read only what the other wrote');
reset role;
select set_config('tests.hello', (select id from public.hellos)::text, true);
select tests.be('c');
select is((select count(*) from public.messages), 0::bigint, 'nobody else reads it');
select throws_ok($$insert into public.messages (hello_id, body) values (current_setting('tests.hello')::uuid, 'Butting in')$$,
  '42501', null, 'and nobody else can write in it, even knowing which hello');

-- Reports, then a block.
select tests.be('b');
select lives_ok(format($$insert into public.reports (message_id, reason)
  select id, 'Testing' from public.messages where sender_id = %L$$, tests.id('a')), 'a member reports a message they can read');
select is((select count(*) from public.reports), 0::bigint, 'a member cannot read reports, their own included');
select tests.be('admin');
select is((select excerpt || ' / ' || subject_name from public.reports), 'Good to meet you / A',
  'an admin reads the reported words and who wrote them');
select tests.be('b');
select lives_ok(format($$insert into public.blocks (blocked_id) values (%L)$$, tests.id('a')), 'a member blocks another');
select is((select count(*) from public.messages), 0::bigint, 'the conversation is hidden from the blocker');
select tests.be('a');
select is((select count(*) from public.hellos), 0::bigint, 'and the hello from the blocked member');
select is((select count(*) from public.council_posts where author_id = tests.id('b')), 0::bigint,
  'and the blocker''s posts from the blocked member');

select tests.be_anon();
select throws_ok('select count(*) from public.council_posts', '42501', null, 'a visitor reads nothing');
reset role;

select * from finish();
rollback;
