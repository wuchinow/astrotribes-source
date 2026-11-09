import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { MemberCard, glossOnce } from '@/components/MemberCard';
import { matesCopy as copy } from '@/content/clans';
import { membersCopy } from '@/content/members';
import { BODIES, HOUSES, KEYS, SIGNS, type HouseNumber, type SignId } from '@/lib/keys';
import { the } from '@/content/the';
import { isFamilyBody, mates, type MatesBody } from '@/lib/mates';
import { ownPlacements, visibleMembers, type MemberSummary } from '@/lib/members';
import { topShared } from '@/lib/shared-keys';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

const link = 'font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';

/**
 * The Clanmates or Vibemates of one sign (4l), or a generational family (4r: Uranus, Neptune, or Pluto
 * in one sign): a member page under /members, so proxy.ts refreshes
 * the session as on the members list. Checks the session itself (invariant 5) and reads as the member
 * under RLS through visibleMembers, the members list's own read: who appears is decided by
 * private.can_view_member alone, and lib/mates.ts only narrows that list to one sign. No degrees, no
 * birth data, no admin client. The total shows only from five people up (MIN_TOTAL).
 */
export async function MatesPage({ body, sign }: { body: MatesBody; sign: SignId }) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const mine = await ownPlacements(supabase, user.id);
  if (!mine.some((row) => row.body === 'sun')) redirect('/welcome');
  const members = await visibleMembers(supabase, user.id, mine);

  const name = SIGNS[sign].name;
  const family = isFamilyBody(body);
  const planet = family ? BODIES[body].name : '';
  const keyName = body === 'moon' ? KEYS.moonSign.name : KEYS.risingSign.name;
  const back = family ? `/keys/${body}` : body === 'moon' ? `/clans/${sign}` : `/vibes/${sign}`;
  const backLabel = family ? copy.familyBack(the(planet)) : copy.back(name, keyName);
  const line = family ? copy.familyLine(planet, name) : body === 'moon' ? copy.clanLine(name) : copy.vibeLine(name);
  const found = members ? mates(members, mine, body, sign) : null;
  const firstTime = glossOnce();
  const noTime = body === 'rising' && !mine.some((row) => row.body === 'rising');

  const groupTitle = (kind: string, value: SignId | HouseNumber) => {
    if (kind === 'hearth') return copy.groups.hearth(KEYS.moonHouse.name, HOUSES[(value as number) - 1].roman);
    const sign = SIGNS[value as SignId].name;
    if (kind === 'tribe') return copy.groups.tribe(KEYS.sunSign.name, sign);
    if (kind === 'vibe') return copy.groups.vibe(KEYS.risingSign.name, sign);
    return copy.groups.clan(KEYS.moonSign.name, sign);
  };

  const cards = (list: MemberSummary[]) => (
    <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.map((member) => (
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
  );

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <Headline as="h1" line={line} accent={copy.accent} />
      <Lede>
        <Link href={back} className={link}>
          {backLabel}
        </Link>
        {' · '}
        <Link href="/members" className={link}>
          {copy.allMembers}
        </Link>
      </Lede>
      {noTime ? <p className="mt-4 max-w-[56ch] type-body-sm text-ink-700">{copy.noTimeVibe}</p> : null}

      {found === null ? (
        <p role="alert" className="mt-10 type-body text-ember-500">
          {copy.failed}
        </p>
      ) : found.all.length === 0 ? (
        <div className="mt-10 max-w-[40rem] rounded-md border border-ink-200 bg-surface-200 p-6">
          <h2 className="type-heading-3 text-ink-900">{membersCopy.emptyHeading}</h2>
          <p className="mt-2 type-body-sm text-ink-700">{copy.empty}</p>
        </div>
      ) : (
        <>
          {found.total !== null ? (
            <p data-mates-total="" className="mt-6 type-body font-semibold text-ink-900">
              {family ? copy.familyTotal(found.total, planet, name) : copy.total(found.total, name, keyName)}
            </p>
          ) : null}
          {found.groups.map((group) => (
            <section key={group.kind} data-mates-group={group.kind} className="mt-12" aria-labelledby={`mates-${group.kind}`}>
              <h2 id={`mates-${group.kind}`} className="type-heading-2 text-ink-900">
                {groupTitle(group.kind, group.value)}
              </h2>
              {cards(group.members)}
            </section>
          ))}
          <section data-mates-group="all" className="mt-12" aria-labelledby="mates-all">
            <h2 id="mates-all" className="type-heading-2 text-ink-900">
              {copy.everyone}
            </h2>
            {cards(found.all)}
          </section>
        </>
      )}
    </div>
  );
}
