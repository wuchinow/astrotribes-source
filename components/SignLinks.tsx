import { LIFT } from '@/lib/motion';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';
import { GlyphIcon } from './GlyphIcon';

interface SignLinksProps {
  /** Where each card goes: /tribes, /clans, or /vibes, then the sign. */
  base: '/tribes' | '/clans' | '/vibes';
  /** The card's title for a sign; the sign's name when absent. */
  title?: (name: string, sign: SignId) => string;
  /** One line under the title, where there is one. */
  lines?: Partial<Record<SignId, string>>;
  /** The sign whose page this is: shown, but not as a link. */
  current?: SignId;
  className?: string;
}

/**
 * The twelve signs as cards, each Dawa's glyph and a name, linking to a Tribe, Clan, or Vibe page (4l):
 * the two index pages, and the Clan page's "the Sun lights the Moon". Two a row on a phone.
 */
export function SignLinks({ base, title, lines, current, className }: SignLinksProps) {
  return (
    <ul role="list" className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {SIGN_IDS.map((sign) => {
        const name = SIGNS[sign].name;
        const inner = (
          <>
            <GlyphIcon glyph={sign} size={48} className="shrink-0 text-ink-900" />
            <span className="grid min-w-0 gap-1">
              <span className="type-ui font-semibold text-ink-900">{title ? title(name, sign) : name}</span>
              {lines?.[sign] ? <span className="type-body-sm text-ink-700">{lines[sign]}</span> : null}
            </span>
          </>
        );
        const box = 'flex h-full items-start gap-3 rounded-md border p-4';
        return (
          <li key={sign} data-sign-link={sign}>
            {sign === current ? (
              <div aria-current="page" className={cn(box, 'border-gold-500 bg-surface-100')}>
                {inner}
              </div>
            ) : (
              <Link
                href={`${base}/${sign}`}
                className={cn(box, `border-ink-200 bg-surface-200 no-underline shadow-rest ${LIFT}`)}
              >
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
