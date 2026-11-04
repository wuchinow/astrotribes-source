import Link from 'next/link';
import { famousCopy } from '@/content/famous';
import { membersCopy, pointsCount, sharedCount } from '@/content/members';
import { SIGNS, type SignId } from '@/lib/keys';
import type { SharedKey } from '@/lib/shared-keys';
import { KeyChip } from './KeyChip';
import { TribeBadge } from './TribeBadge';

interface FamousCardProps {
  href: string;
  name: string;
  line: string;
  years: string;
  sun: SignId;
  /** Only for a member with a chart: the points and the first few shared Keys. */
  match?: { points: number; personalCount: number; top: SharedKey[] };
  firstTime: (keyId: string) => boolean;
}

/** One famous chart on the list (3r): who they were, their Tribe, and for a member, your connection points. */
export function FamousCard({ href, name, line, years, sun, match, firstTime }: FamousCardProps) {
  const more = match ? match.personalCount - match.top.length : 0;
  return (
    <li className="grid min-w-0 content-start gap-4 rounded-md border border-ink-200 bg-surface-200 p-4 shadow-rest md:p-6">
      <div>
        <h2 className="min-w-0 type-heading-3 text-ink-900 [overflow-wrap:anywhere]">{name}</h2>
        <p className="mt-1 type-body-sm text-ink-700">{line}</p>
        <p className="type-caption text-ink-500">{years}</p>
      </div>
      <TribeBadge sign={sun} element={SIGNS[sun].element} label={SIGNS[sun].name} />
      {match ? (
        <>
          <div>
            <p className="type-body font-semibold text-ink-900">{pointsCount(match.points)}</p>
            <p className="type-body-sm text-ink-700">{sharedCount(match.personalCount)}</p>
          </div>
          {match.top.length > 0 ? (
            <div className="grid gap-3">
              {match.top.map(({ key, value }) => (
                <KeyChip key={key.id} keyId={key.id} value={value} showGloss={firstTime(key.id)} />
              ))}
              {more > 0 ? <p className="type-caption text-ink-500">{membersCopy.more(more)}</p> : null}
            </div>
          ) : null}
        </>
      ) : null}
      <Link
        href={href}
        className="inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
      >
        {match ? famousCopy.openShared(name) : famousCopy.open(name)}
      </Link>
    </li>
  );
}
