import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { MemberCard, glossOnce } from '@/components/MemberCard';
import { membersCopy, visibilityCopy } from '@/content/members';
import { ownPlacements, visibleMembers } from '@/lib/members';
import { topShared } from '@/lib/shared-keys';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { DEFAULT_VISIBILITY, isVisibility } from '@/lib/visibility';

export const metadata: Metadata = { title: membersCopy.title };

/**
 * The members list (3g): every other member the database lets this member see, each with their
 * Tribe, their connection points (3p, highest first), and the first few Keys the two of them share,
 * with Dawa's gloss. Who appears is decided by
 * private.can_view_member alone (0001), never here. Checks the session itself (invariant 5) and
 * sends a member with no chart to the welcome steps. One region on the page tone, so no bands.
 */
export default async function MembersPage() {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const [{ data: profile }, mine] = await Promise.all([
    supabase.from('profiles').select('display_name, visibility').eq('id', user.id).maybeSingle(),
    ownPlacements(supabase, user.id),
  ]);
  if (!profile?.display_name || !mine.some((row) => row.body === 'sun')) redirect('/welcome');
  const visibility = isVisibility(profile.visibility) ? profile.visibility : DEFAULT_VISIBILITY;
  const members = await visibleMembers(supabase, user.id, mine);

  const firstTime = glossOnce();

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{membersCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={membersCopy.line} accent={membersCopy.accent} />
      <Lede>{membersCopy.lede}</Lede>

      <p className="mt-6 max-w-[56ch] type-body-sm text-ink-700">
        {membersCopy.yourSetting(visibilityCopy.levels[visibility].label)}{' '}
        {visibility === 'private' ? `${membersCopy.privateNote} ` : null}
        <Link href="/account#visibility" className="font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4">
          {membersCopy.change}
        </Link>
      </p>

      {members === null ? (
        <p role="alert" className="mt-10 type-body text-ember-500">
          {membersCopy.failed}
        </p>
      ) : members.length === 0 ? (
        <div className="mt-10 max-w-[40rem] rounded-md border border-ink-200 bg-surface-200 p-6">
          <h2 className="type-heading-3 text-ink-900">{membersCopy.emptyHeading}</h2>
          <p className="mt-2 type-body-sm text-ink-700">{membersCopy.emptyBody}</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              href={`/members/${member.id}`}
              name={member.name}
              isDemo={member.isDemo}
              sun={member.placements.find((row) => row.body === 'sun')!.sign}
              top={topShared(member.shared)}
              personalCount={member.personalCount}
              points={member.points.total}
              firstTime={firstTime}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
