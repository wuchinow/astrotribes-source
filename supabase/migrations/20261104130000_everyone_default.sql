-- 0006: new members start visible to all members, for the team alpha (Nov 4, David: "can we have
-- all members be the default setting for now, so it's easier for the team and then once we have
-- beta testers [or] paying users, we'll change the default setting"). Before beta a new migration
-- sets the default back to 'private' (U54 in docs/ASSESSMENT.md). Nothing else changes: the three
-- levels, private.can_view_member, every policy and grant, and what a visible member shows (names,
-- signs, houses, shared Keys, which placements sit close; never birth details or a degree). A
-- member can still choose Only you or Your Tribe on the account page. Once applied this file is
-- never edited; a fix is a new migration.

-- 1. The default for every profile 0001's trigger creates from now on.
alter table public.profiles alter column visibility set default 'everyone';

-- 2. The members who joined before this, at the old default. On Nov 4 that is one row, David's own
--    (he asked for it); demo members are left as they are.
update public.profiles set visibility = 'everyone' where visibility = 'private' and not is_demo;
