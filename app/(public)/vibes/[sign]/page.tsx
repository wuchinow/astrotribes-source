import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/Button';
import { GlyphIcon } from '@/components/GlyphIcon';
import { GuestOnly, PrimaryAction } from '@/components/HeaderAccount';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { SkyWindow } from '@/components/SkyWindow';
import { TintPanel } from '@/components/TintPanel';
import { vibePage as copy } from '@/content/clans';
import { VIBE_DRAFTS, VIBE_LINES, vibeIntro } from '@/content/vibes';
import { famousWith } from '@/lib/famous';
import { KEYS, SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';

// The 12 Vibe pages (4l, Nov 8; Dawa's Nov 7 note 21, plan claude.ai/artifact/U5pJhfRWF1AoY11oBHdQpV):
// shorter than a Clan page, since Dawa has written less for the rising sign so far. His introduction
// beside Apollo 8's Earthrise (the rising sign is the sign coming up over the eastern horizon at birth;
// NASA, credited in the footer); his line for the sign, then a fuller paragraph drafted in his voice
// (content/vibes.ts, listed for him in Notion, no mark on the site); the famous people with the sign
// rising; the members, on their own member page (/members/vibe/<sign>); and a note for anyone with no
// birth time. Static and public; the famous risings are worked out at build time (lib/famous.ts).
export const dynamicParams = false;

export function generateStaticParams() {
  return SIGN_IDS.map((sign) => ({ sign }));
}

const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

const vibe = KEYS.risingSign.name;
const tribe = KEYS.sunSign.name;
const clan = KEYS.moonSign.name;

export async function generateMetadata({ params }: PageProps<'/vibes/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  const name = SIGNS[sign].name;
  return { title: copy.metaTitle(name, vibe), description: copy.description(name, vibe) };
}

const textLink = 'inline-flex min-h-touch items-center gap-2 type-ui text-cobalt-600 underline-offset-4 hover:underline';
const nameLink = 'text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';

export default async function VibePage({ params }: PageProps<'/vibes/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();

  const name = SIGNS[sign].name;
  const index = SIGN_IDS.indexOf(sign);
  const previous = SIGN_IDS[(index + 11) % 12];
  const next = SIGN_IDS[(index + 1) % 12];
  const famous = famousWith('rising', sign);
  const [horizon, style] = vibeIntro(vibe);

  return (
    <>
      <div className="bg-surface-hero">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 pt-31 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-14 md:px-6 md:pt-38 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="min-w-0">
            <Eyebrow>{copy.hero.eyebrow(name)}</Eyebrow>
            <div className="flex items-center gap-4">
              <GlyphIcon glyph={sign} size={96} className="shrink-0 text-ink-900" />
              <Headline as="h1" line={copy.hero.line} accent={copy.hero.accent(name, vibe)} className="mb-0" />
            </div>
            <Lede className="mt-6">{style}</Lede>
            <p className="mt-3 max-w-measure type-body-sm text-ink-700">{horizon}</p>
            <div className="mt-6 max-w-[28rem]">
              <KeyChip keyId="risingSign" value={sign} showGloss />
            </div>
          </div>
          <SkyWindow
            sky="vibeRising"
            aspect="aspect-square"
            eager
            sizes="(width >= 64rem) 26rem, (width >= 48rem) 22rem, calc(100vw - 2rem)"
            className="max-w-[26rem]"
          />
        </div>
      </div>

      <Section labelledBy="vibe-shows">
        <Eyebrow>{copy.shows.eyebrow}</Eyebrow>
        <h2 id="vibe-shows" className="type-heading-2 text-ink-900">
          {copy.shows.title(name, vibe)}
        </h2>
        <p data-vibe-line="" className="mt-4 max-w-[40ch] font-display text-[1.5rem] leading-snug text-ink-900 md:text-[1.875rem]">
          {VIBE_LINES[sign]}
        </p>
        {/* Drafted in Dawa's voice (content/vibes.ts); shown like his own, listed for him in Notion. */}
        <p data-vibe-draft="" className="mt-6 max-w-measure type-body text-ink-700">
          {VIBE_DRAFTS[sign]}
        </p>
      </Section>

      <Section labelledBy="vibe-famous" band>
        <Eyebrow>{copy.famous.eyebrow}</Eyebrow>
        <h2 id="vibe-famous" className="type-heading-2 font-normal text-ink-900">
          {copy.famous.title(name)}
        </h2>
        {famous.length > 0 ? (
          <>
            <p className="mt-2 type-body-sm text-ink-500">{copy.famous.lede}</p>
            <ul role="list" className="mt-6 columns-2 gap-x-6 sm:columns-3">
              {famous.map((person) => (
                <li key={person.slug} data-vibe-famous={person.slug} className="break-inside-avoid py-1 type-body-sm text-ink-900">
                  <Link href={`/famous/${person.slug}`} className={nameLink}>
                    {person.name}
                  </Link>
                  <span className="text-ink-500">, {SIGNS[person.tribe].name} Sun</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 type-body-sm text-ink-700">{copy.famous.none(name)}</p>
        )}
      </Section>

      <Section labelledBy="vibe-mates">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <TintPanel>
            <Eyebrow>{copy.mates.eyebrow}</Eyebrow>
            <h2 id="vibe-mates" className="type-heading-2 font-normal text-ink-900">
              {copy.mates.title(name)}
            </h2>
            <p className="mt-2 max-w-[56ch] text-ink-700">{copy.mates.body(tribe, clan)}</p>
            <div className="mt-6">
              <Button href={`/members/vibe/${sign}`} variant="secondary">
                {copy.mates.action}
              </Button>
            </div>
            <GuestOnly>
              <p className="mt-3 type-caption text-ink-500">{copy.mates.guest}</p>
            </GuestOnly>
          </TintPanel>
          <div data-vibe-no-time="" className="rounded-md border border-ink-200 bg-surface-200 p-6">
            <h3 className="type-heading-3 text-ink-900">{copy.noTime.title}</h3>
            <p className="mt-2 type-body-sm text-ink-700">{copy.noTime.body}</p>
            <Button href={copy.noTime.href} variant="tertiary" className="mt-3 -ml-2">
              {copy.noTime.action}
              <span aria-hidden="true">{'→'}</span>
            </Button>
          </div>
        </div>
        <nav aria-label={copy.neighbors.label} className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link href={`/vibes/${previous}`} className={textLink}>
            <span aria-hidden="true">{'←'}</span>
            <span className="sr-only">{copy.neighbors.previous}: </span>
            {copy.hero.accent(SIGNS[previous].name, vibe).slice(0, -1)}
          </Link>
          <Link href="/vibes" className={textLink}>
            {copy.neighbors.all(vibe)}
          </Link>
          <Link href={`/vibes/${next}`} className={textLink}>
            <span className="sr-only">{copy.neighbors.next}: </span>
            {copy.hero.accent(SIGNS[next].name, vibe).slice(0, -1)}
            <span aria-hidden="true">{'→'}</span>
          </Link>
        </nav>
      </Section>

      <GuestOnly>
        <Section labelledBy="vibe-next" band>
          <TintPanel art="p3">
            <Eyebrow>{copy.nextStep.eyebrow}</Eyebrow>
            <h2 id="vibe-next" className="type-heading-2 font-normal text-ink-900">
              {copy.nextStep.title}
            </h2>
            <p className="mt-2 max-w-[56ch] text-ink-700">{copy.nextStep.body}</p>
            <div className="mt-6">
              <PrimaryAction />
            </div>
          </TintPanel>
        </Section>
      </GuestOnly>
    </>
  );
}
