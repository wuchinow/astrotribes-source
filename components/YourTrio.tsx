'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SIGN_IDS, type SignId } from '@/lib/keys';
import { browserClient } from '@/lib/supabase/browser';
import { cn } from '@/lib/cn';
import { KeyChip } from './KeyChip';

const TRIO = ['sun', 'moon', 'rising'] as const;
type TrioBody = (typeof TRIO)[number];
const TRIO_KEY = { sun: 'sunSign', moon: 'moonSign', rising: 'risingSign' } as const;
const TRIO_HREF = { sun: '/tribes', moon: '/clans', rising: '/vibes' } as const;

interface YourTrioProps {
  words: { chart: string; none: string; start: string };
}

/**
 * A signed-in member's own three on the 12 Tribes page (5d): their Sun, Moon, and rising signs, each
 * a link to its own page. Read in the browser as the member, under row level security, by named
 * columns (never a degree, which the Data API does not grant), like the header's account slot, so
 * the page itself stays static. Display only: the database decides what the member may read. Nothing
 * is stored or logged. Its panel is `member-only`, so a visitor never sees its room.
 */
export function YourTrio({ words }: YourTrioProps) {
  // undefined while reading; an empty object for a member with no chart yet.
  const [signs, setSigns] = useState<Partial<Record<TrioBody, SignId>>>();
  useEffect(() => {
    const supabase = browserClient();
    if (!supabase) return;
    let live = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: rows } = await supabase
        .from('placements')
        .select('body, sign')
        .eq('user_id', data.user.id)
        .in('body', [...TRIO]);
      if (!live || !rows) return;
      const found: Partial<Record<TrioBody, SignId>> = {};
      for (const row of rows) {
        const body = TRIO.find((id) => id === row.body);
        const sign = SIGN_IDS.find((id) => id === row.sign);
        if (body && sign) found[body] = sign;
      }
      setSigns(found);
    })();
    return () => {
      live = false;
    };
  }, []);

  const linkClass =
    'inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';
  return (
    // Room for the three before they arrive, so the cards below hold still; a member with no chart
    // gets one line, so the room is given back.
    <div className={cn('mt-3', signs && !signs.sun ? undefined : 'min-h-[8.5rem] sm:min-h-[5.5rem]')}>
      {signs === undefined ? null : signs.sun ? (
        <>
          <ul role="list" className="grid gap-4 sm:grid-cols-3">
            {TRIO.map((body) => {
              const sign = signs[body];
              return sign ? (
                <li key={body}>
                  <KeyChip keyId={TRIO_KEY[body]} value={sign} href={`${TRIO_HREF[body]}/${sign}`} showGloss compact />
                </li>
              ) : null;
            })}
          </ul>
          <Link href="/your-chart" className={`${linkClass} mt-2`}>
            {words.chart}
          </Link>
        </>
      ) : (
        <p className="type-body text-ink-700">
          {words.none}{' '}
          <Link href="/welcome" className={linkClass}>
            {words.start}
          </Link>
        </p>
      )}
    </div>
  );
}
