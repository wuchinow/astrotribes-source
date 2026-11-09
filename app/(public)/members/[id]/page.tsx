import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/Button';
import { Eyebrow, Headline } from '@/components/Section';
import { KeyChip } from '@/components/KeyChip';
import { PointsBreakdown } from '@/components/PointsBreakdown';
import { glossOnce } from '@/components/MemberCard';
import { SharedKeys } from '@/components/SharedKeys';
import { TribeBadge } from '@/components/TribeBadge';
import { memberCopy, membersCopy, pointsCopy, pointsCount } from '@/content/members';
import { BODIES, KEYS, SIGNS } from '@/lib/keys';
import { FAMILY_BODIES } from '@/lib/mates';
import { ownPlacements, visibleMember } from '@/lib/members';
import { hasBirthTime } from '@/lib/shared-keys';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

// The member's name is never in the page title or the address bar beyond its id.
export const metadata: Metadata = { title: membersCopy.title };

const THREE_KEYS = ['sunSign', 'moonSign', 'risingSign'] as const;
const pageLink =
  'inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';

/**
 * One member's profile (3g; 4r): their Sun, Moon, and rising sign as Keys with links to those Tribe,
 * Clan, and Vibe pages, their generational families (signs only, linked to each family's members; no
 * years, which would narrow their birth date), then your connection points
 * (3p) and every Key the two of you share, in the six groups of the 28 Keys page, with the outer
 * planets' sign keys apart, then how the points add up. Read as the
 * viewer under RLS: a member the database does not let you see is a 404, the same as one who does
 * not exist, so the page never says which. Checks the session itself (invariant 5).
 */
export default async function MemberPage({ params }: PageProps<'/members/[id]'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const { id } = await params;
  if (id === user.id) redirect('/your-chart');
  const mine = await ownPlacements(supabase, user.id);
  if (!mine.some((row) => row.body === 'sun')) redirect('/welcome');
  const member = await visibleMember(supabase, id, mine);
  if (!member) notFound();

  const sun = member.placements.find((row) => row.body === 'sun')!;
  const theirs = new Map(member.placements.map((row) => [row.body, row]));
  const firstTime = glossOnce();
  const myTime = hasBirthTime(mine);
  const theirTime = hasBirthTime(member.placements);
  const families = FAMILY_BODIES.flatMap((body) => {
    const row = theirs.get(body);
    return row ? [row] : [];
  });

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Link href="/members" className="inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline-offset-4 hover:underline">
        {memberCopy.back}
      </Link>
      <Eyebrow className="mt-6">{member.isDemo ? `${memberCopy.eyebrow} · ${membersCopy.demo}` : memberCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={<span className="[overflow-wrap:anywhere]">{member.name}</span>} accent={memberCopy.accent} />
      <TribeBadge sign={sun.sign} element={SIGNS[sun.sign].element} label={SIGNS[sun.sign].name} />

      <section aria-labelledby="their-three" className="mt-10">
        <h2 id="their-three" className="type-heading-3 text-ink-900 [overflow-wrap:anywhere]">
          {memberCopy.threeHeading(member.name)}
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {THREE_KEYS.map((keyId) => {
            const row = theirs.get(keyId === 'sunSign' ? 'sun' : keyId === 'moonSign' ? 'moon' : 'rising');
            return row ? <KeyChip key={keyId} keyId={keyId} value={row.sign} showGloss={firstTime(keyId)} /> : null;
          })}
        </div>
        <h3 className="mt-6 type-label text-ink-500">{memberCopy.pagesLabel}</h3>
        <ul role="list" className="mt-1 flex flex-wrap gap-x-6">
          {THREE_KEYS.map((keyId) => {
            const row = theirs.get(keyId === 'sunSign' ? 'sun' : keyId === 'moonSign' ? 'moon' : 'rising');
            if (!row) return null;
            const base = keyId === 'sunSign' ? 'tribes' : keyId === 'moonSign' ? 'clans' : 'vibes';
            return (
              <li key={keyId}>
                <Link href={`/${base}/${row.sign}`} className={pageLink}>
                  {memberCopy.page(SIGNS[row.sign].name, KEYS[keyId].name)}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {families.length > 0 ? (
        <section aria-labelledby="their-families" className="mt-10">
          <h2 id="their-families" className="type-heading-3 text-ink-900 [overflow-wrap:anywhere]">
            {memberCopy.familiesHeading(member.name)}
          </h2>
          <p className="mt-2 max-w-measure type-body-sm text-ink-700">{memberCopy.familiesNote}</p>
          <ul role="list" className="mt-2 flex flex-wrap gap-x-6">
            {families.map((row) => (
              <li key={row.body}>
                <Link href={`/members/family/${row.body}/${row.sign}`} className={pageLink}>
                  {memberCopy.family(BODIES[row.body].name, SIGNS[row.sign].name)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="shared-heading" className="mt-12 border-t border-ink-200 pt-10">
        <h2 id="shared-heading" className="type-display-lg max-w-[22ch] text-ink-900">
          {memberCopy.sharedHeading}
        </h2>
        <p className="mt-3 type-heading-3 text-ink-900">{pointsCount(member.points.total)}</p>
        <SharedKeys
          shared={member.shared}
          firstTime={firstTime}
          note={
            !myTime ? (
              <p className="mt-2 type-body-sm text-ink-700">
                {memberCopy.noTimeMine}{' '}
                <Link href="/welcome?edit=birth" className="font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4">
                  {memberCopy.addTime}
                </Link>
              </p>
            ) : !theirTime ? (
              <p className="mt-2 type-body-sm text-ink-700 [overflow-wrap:anywhere]">{memberCopy.noTimeTheirs(member.name)}</p>
            ) : null
          }
        />
      </section>

      <section aria-labelledby="points-heading" className="mt-12 border-t border-ink-200 pt-10">
        <h2 id="points-heading" className="type-heading-2 text-ink-900">
          {pointsCopy.heading}
        </h2>
        <div className="mt-6">
          <PointsBreakdown points={member.points} firstTime={firstTime} noTime={!myTime || !theirTime} />
        </div>
      </section>

      <div className="mt-12">
        <Button href="/members" variant="secondary">
          {memberCopy.back}
        </Button>
      </div>
    </div>
  );
}

