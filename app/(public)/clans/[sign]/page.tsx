import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/Button';
import { GlyphIcon } from '@/components/GlyphIcon';
import { GuestOnly, PrimaryAction } from '@/components/HeaderAccount';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { SignLinks } from '@/components/SignLinks';
import { SkyWindow } from '@/components/SkyWindow';
import { TintPanel } from '@/components/TintPanel';
import { clanPage as copy } from '@/content/clans';
import { paragraphs, planetPage } from '@/content/planets';
import { famousWith } from '@/lib/famous';
import { HOUSES, KEYS, SIGN_IDS, SIGNS, type SignId } from '@/lib/keys';

// The 12 Clan pages (4l, Nov 8; Dawa's Nov 7 note 21, plan claude.ai/artifact/U5pJhfRWF1AoY11oBHdQpV),
// top to bottom as his 2025 Clan docs lay it out: the welcome, with his glyph and a NASA photo of the
// Moon (its credit in the footer); his paragraph for the Moon in the sign; his note on the Hearth and
// the twelve Hearth lines; his line on how the Tribe colors the Clan, with the twelve Tribes; the
// famous people with the Moon in the sign; then the members, on their own member page
// (/members/clan/<sign>), so this page stays static and public. Every word but the headings is
// Dawa's (content/planets.ts, the same words as the Moon's page). Kirstie's paintings stay with the
// Tribes; the ink landscapes are the Clans' own (P8's moonlit cliff, P1's moon through the pines).
// The famous Moons are worked out by the engine at build time, from public records of people who
// have died (lib/famous.ts); no member data.
export const dynamicParams = false;

export function generateStaticParams() {
  return SIGN_IDS.map((sign) => ({ sign }));
}

const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

const clan = KEYS.moonSign.name;
const hearth = KEYS.moonHouse.name;
const tribe = KEYS.sunSign.name;
const vibe = KEYS.risingSign.name;
const moon = planetPage('moon')!;
// Dawa's note on the Clan has three paragraphs: the Moon itself, the Sun lighting the Moon, and the Hearth.
const [moonNote, sunNote, hearthNote] = paragraphs(moon.signsNote ?? '');

export async function generateMetadata({ params }: PageProps<'/clans/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  const name = SIGNS[sign].name;
  return { title: copy.metaTitle(name, clan), description: copy.description(name, clan) };
}

const textLink = 'inline-flex min-h-touch items-center gap-2 type-ui text-cobalt-600 underline-offset-4 hover:underline';
const nameLink = 'text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4';

export default async function ClanPage({ params }: PageProps<'/clans/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();

  const name = SIGNS[sign].name;
  const index = SIGN_IDS.indexOf(sign);
  const previous = SIGN_IDS[(index + 11) % 12];
  const next = SIGN_IDS[(index + 1) % 12];
  const famous = famousWith('moon', sign);

  return (
    <>
      <div className="bg-surface-hero">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 pt-31 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-14 md:px-6 md:pt-38 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="min-w-0">
            <Eyebrow>{copy.hero.eyebrow(name)}</Eyebrow>
            <div className="flex items-center gap-4">
              <GlyphIcon glyph={sign} size={96} className="shrink-0 text-ink-900" />
              <Headline as="h1" line={copy.hero.line} accent={copy.hero.accent(name, clan)} className="mb-0" />
            </div>
            <Lede className="mt-6">{moonNote}</Lede>
            <div className="mt-6 max-w-[28rem]">
              <KeyChip keyId="moonSign" value={sign} showGloss />
            </div>
          </div>
          <SkyWindow
            sky="clanMoon"
            aspect="aspect-square"
            eager
            sizes="(width >= 64rem) 26rem, (width >= 48rem) 22rem, calc(100vw - 2rem)"
            className="max-w-[26rem]"
          />
        </div>
      </div>

      <Section labelledBy="clan-moon" backdrop={{ print: 'cartoon-moon', pos: 'center 35%' }}>
        <Eyebrow>{copy.moon.eyebrow}</Eyebrow>
        <h2 id="clan-moon" className="type-heading-2 text-ink-900">
          {copy.moon.title(name)}
        </h2>
        <div data-clan-moon="" className="max-w-measure">
          {paragraphs(moon.signs[sign] ?? '').map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="mt-4 type-body text-ink-700">
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      <Section labelledBy="clan-hearth" backdrop={{ gradient: true }}>
        <Eyebrow>{copy.hearth.eyebrow(clan, hearth)}</Eyebrow>
        <Headline id="clan-hearth" line={copy.hearth.line} accent={copy.hearth.accent} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
          <div className="max-w-measure">
            <p className="type-body text-ink-700">{hearthNote}</p>
            <p className="mt-3 type-body-sm text-ink-500">{copy.hearth.lede(hearth)}</p>
          </div>
          <div>
            <KeyChip keyId="moonHouse" showGloss />
          </div>
        </div>
        <ol role="list" className="mt-8 grid gap-x-8 border-b border-ink-200 sm:grid-cols-2">
          {HOUSES.map((house) => (
            <li
              key={house.number}
              data-clan-hearth={house.number}
              className="grid grid-cols-[4.5rem_1fr] gap-x-3 border-t border-ink-200 py-5"
            >
              <span className="step-numeral" aria-hidden="true">
                {house.roman}
              </span>
              <div className="grid content-start gap-2">
                <p className="type-label text-ink-500">{copy.hearth.label(house.roman, house.name)}</p>
                <p className="type-body-sm text-ink-700">{moon.houses[house.number]}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="clan-sun">
        <Eyebrow>{copy.sun.eyebrow(tribe, clan)}</Eyebrow>
        <Headline id="clan-sun" line={copy.sun.line} accent={copy.sun.accent} />
        <p className="max-w-measure type-body text-ink-700">{sunNote}</p>
        <p className="mt-6 type-body-sm text-ink-500">{copy.sun.lede(name, tribe)}</p>
        <SignLinks base="/tribes" title={(sunSign) => copy.sun.cardLabel(name, sunSign)} className="mt-4" />
      </Section>

      <Section labelledBy="clan-famous" band backdrop={{ sky: 'keysCenter' }}>
        <Eyebrow>{copy.famous.eyebrow}</Eyebrow>
        <h2 id="clan-famous" className="type-heading-2 font-normal text-ink-900">
          {copy.famous.title(name)}
        </h2>
        {famous.length > 0 ? (
          <>
            <p className="mt-2 max-w-[40rem] type-body-sm text-ink-500">{copy.famous.lede}</p>
            <ul role="list" className="mt-6 columns-2 gap-x-6 sm:columns-3 xl:max-w-[36rem] xl:columns-2">
              {famous.map((person) => (
                <li key={person.slug} data-clan-famous={person.slug} className="break-inside-avoid py-1 type-body-sm text-ink-900">
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

      <Section labelledBy="clan-mates">
        <TintPanel art="p8">
          <Eyebrow>{copy.mates.eyebrow}</Eyebrow>
          <h2 id="clan-mates" className="type-heading-2 font-normal text-ink-900">
            {copy.mates.title(name)}
          </h2>
          <p className="mt-2 max-w-[56ch] text-ink-700">{copy.mates.body(tribe, vibe, hearth)}</p>
          <div className="mt-6">
            <Button href={`/members/clan/${sign}`} variant="secondary">
              {copy.mates.action}
            </Button>
          </div>
          <GuestOnly>
            <p className="mt-3 type-caption text-ink-500">{copy.mates.guest}</p>
          </GuestOnly>
        </TintPanel>
        <nav aria-label={copy.neighbors.label} className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link href={`/clans/${previous}`} className={textLink}>
            <span aria-hidden="true">{'←'}</span>
            <span className="sr-only">{copy.neighbors.previous}: </span>
            {copy.hero.accent(SIGNS[previous].name, clan).slice(0, -1)}
          </Link>
          <Link href="/clans" className={textLink}>
            {copy.neighbors.all(clan)}
          </Link>
          <Link href={`/clans/${next}`} className={textLink}>
            <span className="sr-only">{copy.neighbors.next}: </span>
            {copy.hero.accent(SIGNS[next].name, clan).slice(0, -1)}
            <span aria-hidden="true">{'→'}</span>
          </Link>
        </nav>
      </Section>

      <GuestOnly>
        <Section labelledBy="clan-next" band>
          <TintPanel art="p1">
            <Eyebrow>{copy.nextStep.eyebrow}</Eyebrow>
            <h2 id="clan-next" className="type-heading-2 font-normal text-ink-900">
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
