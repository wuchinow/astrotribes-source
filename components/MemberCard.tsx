import Link from 'next/link';
import { membersCopy, pointsCount, sharedCount } from '@/content/members';
import { SIGNS, type SignId } from '@/lib/keys';
import type { SharedKey } from '@/lib/shared-keys';
import { KeyChip } from './KeyChip';
import { TribeBadge } from './TribeBadge';

interface MemberCardProps {
  /** The member page's address; none on the styleguide's sample. */
  href?: string;
  name: string;
  isDemo: boolean;
  sun: SignId;
  /** The first few shared personal keys (topShared). */
  top: SharedKey[];
  /** Every shared personal key, for the count. */
  personalCount: number;
  /** Connection points (3p). */
  points: number;
  /** True the first time a key appears on the screen, so its gloss shows once. */
  firstTime: (keyId: string) => boolean;
}

/** One member on the members list (3g, 3p): name, Tribe, your connection points, how many Keys you share, and the first few with their gloss. */
export function MemberCard({ href, name, isDemo, sun, top, personalCount, points, firstTime }: MemberCardProps) {
  const more = personalCount - top.length;
  return (
    <li className="grid min-w-0 content-start gap-4 rounded-md border border-ink-200 bg-surface-200 p-4 shadow-rest md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="min-w-0 type-heading-3 text-ink-900 [overflow-wrap:anywhere]">{name}</h2>
        {isDemo ? <span className="type-label text-ink-500">{membersCopy.demo}</span> : null}
      </div>
      <TribeBadge sign={sun} element={SIGNS[sun].element} label={SIGNS[sun].name} />
      <div>
        <p className="type-body font-semibold text-ink-900">{pointsCount(points)}</p>
        <p className="type-body-sm text-ink-700">{sharedCount(personalCount)}</p>
      </div>
      {top.length > 0 ? (
        <div className="grid gap-3">
          {top.map(({ key, value }) => (
            <KeyChip key={key.id} keyId={key.id} value={value} showGloss={firstTime(key.id)} />
          ))}
          {more > 0 ? <p className="type-caption text-ink-500">{membersCopy.more(more)}</p> : null}
        </div>
      ) : null}
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
        >
          {membersCopy.open(name)}
        </Link>
      ) : null}
    </li>
  );
}

/** The first time a key appears on a screen it carries its gloss; after that, the chip alone. */
export function glossOnce(): (keyId: string) => boolean {
  const seen = new Set<string>();
  return (keyId) => (seen.has(keyId) ? false : (seen.add(keyId), true));
}
