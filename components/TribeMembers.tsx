'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { KEYS, type SignId } from '@/lib/keys';
import { MEMBER_ATTR } from '@/lib/member-hint';
import { TRIBE_PAGE_HANDFUL, type TribeMembersResult } from '@/lib/tribe-members';
import { MemberCard, glossOnce } from './MemberCard';
import { Eyebrow } from './Section';

interface TribeMembersProps {
  sign: SignId;
  words: {
    eyebrow: string;
    title: string;
    emptyTitle: string;
    lede: string;
    council: string;
    all: string;
    empty: string;
    noChart: string;
    start: string;
    failed: string;
  };
}

const linkClass =
  'inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';

/**
 * A Tribe's members on its Tribe page (5b, David, Nov 11: "i should see dawa in aries, right?"), for a
 * signed-in member only. The page stays static: this island asks /api/members/tribe/[sign], which checks
 * the session and reads as the member under RLS, so who appears is the database's call. A visitor
 * never asks (no sign-in hint on <html>), and the panel is `member-only`, so they never see its room.
 * The first handful, closest connections first, each card with Say hello; the full list is a member page.
 */
export function TribeMembers({ sign, words }: TribeMembersProps) {
  // undefined while reading; null for no session, so nothing shows.
  const [result, setResult] = useState<TribeMembersResult | null>();
  useEffect(() => {
    if (!document.documentElement.hasAttribute(MEMBER_ATTR)) return;
    let live = true;
    fetch(`/api/members/tribe/${sign}`, { cache: 'no-store' })
      .then(async (response) => (response.status === 401 ? null : ((await response.json()) as TribeMembersResult)))
      .catch((): TribeMembersResult => ({ state: 'failed' }))
      .then((value) => {
        if (live) setResult(value);
      });
    return () => {
      live = false;
    };
  }, [sign]);

  if (!result) return null;
  const firstTime = glossOnce();
  return (
    <div data-tribe-members="" className="member-only mt-14 border-t border-ink-200 pt-10">
      <Eyebrow>{words.eyebrow}</Eyebrow>
      <h2 id="tribe-members-title" className="type-heading-2 font-normal text-ink-900">
        {result.state === 'ok' && result.count === 0 ? words.emptyTitle : words.title}
      </h2>
      {result.state === 'ok' && result.count > 0 ? <p className="mt-2 max-w-[56ch] type-body-sm text-ink-700">{words.lede}</p> : null}
      {result.state === 'failed' ? (
        <p role="alert" className="mt-6 type-body text-ember-500">
          {words.failed}
        </p>
      ) : result.state === 'no_chart' ? (
        <p className="mt-6 type-body text-ink-700">
          {words.noChart}{' '}
          <Link href="/welcome" className={linkClass}>
            {words.start}
          </Link>
        </p>
      ) : result.count === 0 ? (
        <p className="mt-4 max-w-[56ch] type-body text-ink-700">
          {words.empty}{' '}
          <Link href="/members/council" className={linkClass}>
            {words.council}
          </Link>
        </p>
      ) : (
        <>
          <ul role="list" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.members.map((member) => (
              <MemberCard
                key={member.id}
                href={`/members/${member.id}`}
                name={member.name}
                isDemo={member.isDemo}
                sun={member.sun}
                top={member.top.map(({ keyId, value }) => ({ key: KEYS[keyId], value }))}
                personalCount={member.personalCount}
                points={member.points}
                firstTime={firstTime}
                hello={member.hello}
              />
            ))}
          </ul>
          {/* The full list only when there is more to see than the handful here. */}
          {result.count > TRIBE_PAGE_HANDFUL ? (
            <Link href={`/members/tribe/${sign}`} className={`${linkClass} mt-4 gap-1`}>
              {words.all}
              <span aria-hidden="true">{'→'}</span>
            </Link>
          ) : null}
        </>
      )}
    </div>
  );
}
