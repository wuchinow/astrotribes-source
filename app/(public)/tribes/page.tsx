import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PrimaryAction } from '@/components/HeaderAccount';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { SignGlyphSprite } from '@/components/SignGlyphSprite';
import { TintPanel } from '@/components/TintPanel';
import { ElementDisc } from '@/components/TribeBadge';
import { YourTrio } from '@/components/YourTrio';
import { tribes } from '@/content/landing';
import { TRIBE_DAWA, knownFor } from '@/content/tribe-dawa';
import { TRIBE_WORDS, tribeIndex as copy, tribePage } from '@/content/tribes';
import { SIGNS, SIGN_IDS, signDates, type SignId } from '@/lib/keys';
import { tribePaintingSet } from '@/lib/tribe-paintings';

// The 12 Tribes, a page of its own (5d, David, Nov 11: "tribes from any page other than homepage jumps
// to tribes section of homepage. should it be its own page?"). The main nav's Tribes link opened the
// middle of the landing page, a visitor's pitch; Keys and the Oracle each open a page, and the Moon's
// and the rising signs' twelve already have theirs (/clans, /vibes). Static and public, one region on
// the page tone. The landing page keeps its grid of paintings and links here for more (David, Nov 11:
// "that could link to tribes page with more detail/info"), so this page is a guide, not the grid
// again: each Tribe with Kirstie Connon's painting, Dawa's slogan, what his hello says the Tribe is
// famous for, and its element, mode, ruling planet, and first traits, all from the Tribe pages' own words
// (content/tribe-dawa.ts, content/tribes.ts), then the way on to the other two of a chart's three. A
// signed-in member sees their own three first, read in the browser as the member
// (components/YourTrio.tsx), so the page stays static.
export const metadata: Metadata = { title: copy.metaTitle, description: copy.description };

export default function TribesPage() {
  return (
    <>
      {/* The twelve sign glyphs ride in the page, so the cards fetch none (4z). */}
      <SignGlyphSprite />
      <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <Eyebrow>{tribes.eyebrow}</Eyebrow>
        <Headline as="h1" line={tribes.line} accent={tribes.accent} />
        <Lede>{tribes.lede}</Lede>
        {/* A member reads the same gloss in their own three, below. */}
        <div className="guest-only mt-6 max-w-[28rem]">
          <KeyChip keyId="sunSign" showGloss />
        </div>

        {/* A member's own three, first (the before-paint hint keeps its room, so nothing jumps). */}
        <TintPanel className="member-only mt-10">
          <h2 className="type-heading-3 text-ink-900">{copy.yours.title}</h2>
          <YourTrio words={copy.yours} />
        </TintPanel>

        <h2 className="sr-only">{copy.all}</h2>
        <ul className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {SIGN_IDS.map((sign) => (
            <li key={sign}>
              <TribeGuide sign={sign} />
            </li>
          ))}
        </ul>
        <div className="guest-only mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="type-body text-ink-700">{tribes.closing}</p>
          <PrimaryAction />
        </div>

        <h2 className="mt-16 type-heading-2 text-ink-900">{copy.more.title}</h2>
        <p className="mt-3 max-w-measure type-body text-ink-700">{copy.more.body}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card href="/clans" title={copy.more.clans}>
            <KeyChip keyId="moonSign" showGloss compact />
          </Card>
          <Card href="/vibes" title={copy.more.vibes}>
            <KeyChip keyId="risingSign" showGloss compact />
          </Card>
        </div>
      </div>
    </>
  );
}

/** How wide a guide card shows its painting, beside the Tribe's name. */
const GUIDE_SIZES = '(width >= 40rem) 8rem, 5.5rem';
/** How many of Dawa's traits a guide card names; the Tribe page has them all. */
const GUIDE_TRAITS = 4;

/**
 * One Tribe in the guide: Kirstie's painting (decorative here: the heading's link names the sign)
 * beside the name, dates, element, and Dawa's slogan, then five facts across the card's whole width,
 * with the way in to the Tribe's own page at its foot. The facts start under the painting, not beside
 * it: beside it they ran far below it and left the card's corner empty. No text touches the painting.
 */
function TribeGuide({ sign }: { sign: SignId }) {
  const def = SIGNS[sign];
  const dawa = TRIBE_DAWA[sign];
  const words = TRIBE_WORDS[sign];
  const set = tribePaintingSet(sign);
  const href = `/tribes/${sign}`;
  const known = knownFor(sign);
  const facts: ReadonlyArray<readonly [string, string]> = [
    ...(known ? [[copy.knownFor, known] as const] : []),
    [tribePage.signature.facts.element, tribePage.element[def.element]],
    [tribePage.signature.facts.mode, tribePage.mode[def.mode]],
    [tribePage.signature.facts.ruler, words.ruler.name],
    [tribePage.signature.traits, dawa.traits.slice(0, GUIDE_TRAITS).join(', ')],
  ];
  return (
    <article
      id={sign}
      data-tribe-guide={sign}
      className="grid h-full scroll-mt-4 grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-4 gap-y-4 rounded-md border border-ink-200 bg-surface-200 p-4 shadow-rest sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:gap-x-5 sm:p-5"
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block self-start">
        <picture className="block">
          <source type="image/avif" srcSet={set.avif} sizes={GUIDE_SIZES} />
          <source type="image/webp" srcSet={set.webp} sizes={GUIDE_SIZES} />
          <img
            src={set.fallback}
            alt=""
            width={set.size}
            height={set.size}
            loading="lazy"
            decoding="async"
            className="block aspect-square h-auto w-full rounded-sm"
          />
        </picture>
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="type-heading-3">
              <Link href={href} className="inline-flex min-h-touch min-w-touch items-center text-cobalt-600 underline-offset-4 hover:underline">
                {def.name}
              </Link>
            </h3>
            <p className="type-data-sm whitespace-nowrap text-ink-500">{signDates(sign)}</p>
          </div>
          <ElementDisc sign={sign} element={def.element} sprite />
        </div>
        <p className="mt-2 type-poster text-[1.25rem] leading-tight text-highlight">{dawa.slogans.join(' · ')}</p>
      </div>
      <div className="col-span-2 flex min-w-0 flex-col">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 type-body-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-500">{label}</dt>
              <dd className="text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>
        <Button href={href} variant="tertiary" className="mt-auto -ml-2 self-start pt-2">
          {copy.meet(def.name)}
        </Button>
      </div>
    </article>
  );
}
