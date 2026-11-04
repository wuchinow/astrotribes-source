-- 0005: close matches. Members learn which placements sit close, never a degree; only for members
-- they may already see; a Moon with no birth time and a picked sign's edge degree count for
-- nothing. The users and their placements are synthetic.
begin;
select plan(17);

select ok(not (select prosecdef from pg_proc where oid = 'public.close_matches(uuid[])'::regprocedure),
  'the door in public is security invoker');
select ok((select prosecdef from pg_proc where oid = 'private.close_matches(uuid[])'::regprocedure),
  'the work behind it is security definer');
select ok(not has_function_privilege('anon', 'public.close_matches(uuid[])', 'EXECUTE'), 'anon cannot call it');
select ok(not has_function_privilege('service_role', 'public.close_matches(uuid[])', 'EXECUTE'),
  'the secret key cannot call it');
select ok(has_function_privilege('authenticated', 'public.close_matches(uuid[])', 'EXECUTE'), 'members may call it');
select is(
  (select array_agg(a order by a) from unnest(
    (select proargnames from pg_proc where oid = 'public.close_matches(uuid[])'::regprocedure)) as a),
  array['kind', 'member', 'mine', 'others', 'theirs'],
  'it returns who, which placements, and the kind of match: never a degree');

-- A: Sun 10 Cancer, Moon 12 Cancer (born near a new moon), Rising 20 Libra, Mercury 20 Taurus,
--    North Node 0 Aquarius, South Node 0 Leo.
-- B: Sun 21 Libra (on A's Rising), Moon 14 Cancer (2 from A's Moon), Mercury 22 Taurus 30.
-- C: like A, but private.
-- D: no birth time. Sun 1 Leo (on A's South Node), Moon 12 Cancer (would be close to A's Moon).
-- E: Sun 10 Aries, Moon 12 Aries (also near a new moon), and Venus at the edge of Taurus, picked on a
--    day it changed sign, which would otherwise be close to A's Mercury.
select tests.new_user('a', '{"display_name": "A"}');
select tests.new_user('b', '{"display_name": "B"}');
select tests.new_user('c', '{"display_name": "C"}');
select tests.new_user('d', '{"display_name": "D"}');
select tests.new_user('e', '{"display_name": "E"}');
update public.profiles set visibility = 'everyone'
where id in (tests.id('a'), tests.id('b'), tests.id('d'), tests.id('e'));

insert into public.placements (user_id, body, sign, house, degree, minute, retrograde, engine_version, sign_alternate)
values
  (tests.id('a'), 'sun', 'cancer', 10, 10, 0, false, 'test-engine@0', null),
  (tests.id('a'), 'moon', 'cancer', 10, 12, 0, false, 'test-engine@0', null),
  (tests.id('a'), 'rising', 'libra', null, 20, 0, false, 'test-engine@0', null),
  (tests.id('a'), 'mercury', 'taurus', 8, 20, 0, false, 'test-engine@0', null),
  (tests.id('a'), 'northNode', 'aquarius', 5, 0, 0, false, 'test-engine@0', null),
  (tests.id('a'), 'southNode', 'leo', 11, 0, 0, false, 'test-engine@0', null),
  (tests.id('b'), 'sun', 'libra', 1, 21, 0, false, 'test-engine@0', null),
  (tests.id('b'), 'moon', 'cancer', 10, 14, 0, false, 'test-engine@0', null),
  (tests.id('b'), 'rising', 'pisces', null, 10, 0, false, 'test-engine@0', null),
  (tests.id('b'), 'mercury', 'taurus', 3, 22, 30, false, 'test-engine@0', null),
  (tests.id('c'), 'sun', 'cancer', 10, 10, 0, false, 'test-engine@0', null),
  (tests.id('c'), 'moon', 'cancer', 10, 12, 0, false, 'test-engine@0', null),
  (tests.id('c'), 'rising', 'libra', null, 20, 0, false, 'test-engine@0', null),
  (tests.id('d'), 'sun', 'leo', null, 1, 0, false, 'test-engine@0', null),
  (tests.id('d'), 'moon', 'cancer', null, 12, 0, false, 'test-engine@0', null),
  (tests.id('e'), 'sun', 'aries', 4, 10, 0, false, 'test-engine@0', null),
  (tests.id('e'), 'moon', 'aries', 4, 12, 0, false, 'test-engine@0', null),
  (tests.id('e'), 'rising', 'capricorn', null, 0, 0, false, 'test-engine@0', null),
  (tests.id('e'), 'venus', 'taurus', 5, 21, 0, false, 'test-engine@0', 'aries');

create temporary table seen on commit drop as select * from public.close_matches(array[]::uuid[]) limit 0;
grant all on seen to authenticated;

select tests.be('a');
insert into seen select * from public.close_matches(
  array[tests.id('a'), tests.id('b'), tests.id('c'), tests.id('d'), tests.id('e')]);
reset role;

select is((select count(*) from seen where member = tests.id('b')), 3::bigint,
  'B: Mercury and Moon close, and a Sun on a Rising');
select ok(exists (select 1 from seen where member = tests.id('b') and mine = 'rising' and theirs = 'sun' and kind = 'rising'),
  'their Sun within 2 degrees of your Rising is a Rising match');
select ok(not exists (select 1 from seen where member = tests.id('b') and mine = 'rising' and theirs = 'sun' and kind = 'close'),
  'and is not counted again as close');
select is((select count(*) from seen where member = tests.id('c')), 0::bigint,
  'nothing about a member who keeps their chart private');
select is((select array_agg(mine || '>' || theirs || ':' || kind) from seen where member = tests.id('d')),
  array['southNode>sun:node'], 'a Sun on your South Node is a Node match');
select ok(not exists (select 1 from seen where member = tests.id('d') and theirs = 'moon'),
  'a Moon with no birth time counts for nothing');
select is((select array_agg(mine || '>' || theirs || ':' || kind) from seen where member = tests.id('e')),
  array['moon>moon:newMoon'], 'both born near a new moon; a picked sign''s edge degree counts for nothing');
select is((select count(*) from seen where member = tests.id('a')), 0::bigint, 'never yourself');

select tests.be('b');
select is((select count(*) from public.close_matches(array[tests.id('a')])), 3::bigint,
  'the same matches from the other side');
reset role;

select tests.be_anon();
select throws_ok('select * from public.close_matches(array[]::uuid[])', '42501', null,
  'a visitor with no session is refused');
reset role;

select tests.be('a');
select throws_ok('select degree from public.placements limit 1', '42501', null,
  'and members still cannot read a degree themselves');
reset role;

select * from finish();
rollback;
