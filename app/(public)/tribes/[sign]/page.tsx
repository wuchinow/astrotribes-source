import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/Button';
import { KeyChip } from '@/components/KeyChip';
import { NightBand } from '@/components/NightBand';
import { OldPrint } from '@/components/OldPrint';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { TribeBadge } from '@/components/TribeBadge';
import { TribeCard } from '@/components/TribeCard';
import { TribePainting } from '@/components/TribePainting';
import { famousByName } from '@/content/famous-charts';
import { TRIBE_FAMOUS } from '@/content/tribe-famous';
import { SUN_STORIES } from '@/content/sun-stories';
import { TRIBE_DAWA, starList } from '@/content/tribe-dawa';
import { TRIBE_WORDS, tribePage as copy } from '@/content/tribes';
import { clanLinks } from '@/content/clans';
import { TribeNewsFlash } from '@/components/TribeNewsFlash';
import { tribeNews } from '@/lib/tribe-news';
import { houseOf, KEYS, SIGN_IDS, SIGNS, signDates, type SignId } from '@/lib/keys';
import { GuestOnly, PrimaryAction } from '@/components/HeaderAccount';
import { CARTOONS, PLATES, TRIBE_CARTOON } from '@/lib/old-prints';
import { PRIMARY_ACTION } from '@/lib/site';

// The 12 Tribe pages (3a), from David's "warm community" direction (Oct 21), reworked after a UX
// pass: every section is finished content today (the sign's signature, with Dawa's shadow side under
// its strengths; how the keys split a Tribe; questions to bring; the element family), and what
// arrives with members is one band, said as a promise rather than as empty placeholders. Static: no database.
//
// Art (David, Nov 4): Kirstie Connon's paintings belong to the Tribes, the ink landscapes to the backgrounds. The
// hero carries Kirstie's painting of the sign, framed and credited under it, the one painting in the
// first screen; the element family's cards carry hers too, credited under the list. The landscapes stay as
// background: the night band's P8 and the next step's painted edge P4. Members' gallery art comes
// with layer 3.
//
// Old prints (4j, David, Nov 8): the sign's Urania's Mirror star card (1824) beside the facts, and a
// Grandville engraving (1844) beside the Astro humor lines (4r: three per Tribe, ours), a stand-in for
// the cartoons Dawa has in mind; lib/old-prints.ts.
//
// Rhythm: the hero on surface-hero, then the page tone and the band alternating. No textures:
// Kirstie's paintings have no texture cut.
export const dynamicParams = false;

// The News Flash reads Today's sky: rebuilt hourly, like /sky.
export const revalidate = 3600;

export function generateStaticParams() {
  return SIGN_IDS.map((sign) => ({ sign }));
}

const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

export async function generateMetadata({ params }: PageProps<'/tribes/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  const name = SIGNS[sign].name;
  return { title: copy.metaTitle(name), description: copy.description(name) };
}

const textLink = 'inline-flex min-h-touch items-center gap-2 type-ui text-cobalt-600 underline-offset-4 hover:underline';

export default async function TribePage({ params }: PageProps<'/tribes/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();

  const def = SIGNS[sign];
  const words = TRIBE_WORDS[sign];
  const dawa = TRIBE_DAWA[sign];
  const house = houseOf(dawa.house);
  const news = tribeNews(sign);
  const name = def.name;
  const element = copy.element[def.element];
  const index = SIGN_IDS.indexOf(sign);
  const previous = SIGN_IDS[(index + 11) % 12];
  const next = SIGN_IDS[(index + 1) % 12];
  const family = SIGN_IDS.filter((s) => SIGNS[s].element === def.element);
  const others = family.filter((s) => s !== sign).map((s) => SIGNS[s].name);

  return (
    <>
      <div className="bg-surface-hero">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 pt-31 pb-14 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-12 md:px-6 md:pt-38 md:pb-20">
          <div className="min-w-0">
            <Eyebrow>
              {copy.hero.eyebrow} · {signDates(sign)}
            </Eyebrow>
            <p className="mb-3 type-poster text-[1.5rem] leading-tight text-highlight md:text-[1.875rem]">
              {dawa.slogans.join(' · ')}
            </p>
            <Headline
              as="h1"
              size="xl"
              line={copy.hero.line}
              accent={copy.hero.accent(name)}
              className="text-[clamp(2.75rem,1.6rem+4vw,5rem)]!"
            />
            <Lede>{copy.hero.lede}</Lede>
            <div className="mt-6">
              <TribeBadge sign={sign} element={def.element} label={`${element} · ${words.symbol}`} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <PrimaryAction size="lg" />
              <GuestOnly>
                <p className="type-caption text-ink-500">{copy.hero.note}</p>
              </GuestOnly>
            </div>
          </div>
          <TribePainting
            sign={sign}
            sizes="(min-width: 48rem) 24rem, calc(100vw - 2rem)"
            priority
            className="mx-auto md:mx-0 md:justify-self-end"
          />
        </div>
      </div>

      <Section labelledBy="hello-title" backdrop={{ gradient: true }}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="min-w-0">
            <h2 id="hello-title" className="mb-4 type-label text-ink-500">
              {copy.hello.eyebrow(name)}
            </h2>
            <p className="max-w-[34ch] font-display text-[1.5rem] leading-snug text-ink-900 md:text-[1.875rem]">
              {dawa.hello}
            </p>
            <h3 className="mt-10 type-label text-ink-500">{copy.hello.story}</h3>
            {SUN_STORIES[sign].split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-3 max-w-[65ch] type-body text-ink-700">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid content-start gap-10">
            <dl className="grid content-start border-b border-ink-200">
              {[
                [copy.signature.facts.dates, signDates(sign)],
                [copy.signature.facts.latin, dawa.latin.text],
                [copy.signature.facts.element, element],
                [copy.signature.facts.mode, copy.mode[def.mode]],
                [copy.signature.facts.symbol, words.symbol],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[8rem_1fr] gap-3 border-t border-ink-200 py-3">
                  <dt className="type-label text-ink-500">{label}</dt>
                  <dd className="type-body-sm text-ink-900">{value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-ink-200 py-3">
                <dt className="type-label text-ink-500">{copy.signature.facts.ruler}</dt>
                <dd className="type-body-sm text-ink-700">
                  <span className="font-semibold text-ink-900">{words.ruler.name}</span>
                  <span className="mt-1 block">{words.ruler.line}</span>
                </dd>
              </div>
              {[
                [copy.signature.facts.house, `${house.roman} ${house.name}: ${house.question}`],
                [copy.signature.facts.season, dawa.season.text],
                [copy.signature.facts.stars, starList(dawa.stars)],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[8rem_1fr] gap-3 border-t border-ink-200 py-3">
                  <dt className="type-label text-ink-500">{label}</dt>
                  <dd className="type-body-sm text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            {dawa.didYouKnow.length > 0 ? (
              <div>
                <h3 className="type-label text-ink-500">{copy.signature.didYouKnow}</h3>
                <ul role="list" className="mt-2 grid gap-3">
                  {dawa.didYouKnow.map((fact) => (
                    <li key={fact.slice(0, 24)} className="border-l-2 border-gold-500 pl-4 type-body-sm text-ink-700">
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {/* The sign's Urania's Mirror card (4j), whole and full strength; credited in the footer. */}
            <div>
              <h3 className="type-label text-ink-500">{copy.signature.plate.label}</h3>
              <p className="mt-2 mb-4 type-body-sm text-ink-700">{copy.signature.plate.line(name)}</p>
              <OldPrint id={`plate-${sign}`} alt={PLATES[sign].alt} sizes="(min-width: 64rem) 24rem, calc(100vw - 2rem)" />
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="signature-title" band backdrop={{ art: 'p7', foot: true }}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="min-w-0">
            <Eyebrow>{copy.signature.eyebrow}</Eyebrow>
            <Headline id="signature-title" line={copy.signature.line(name)} accent={copy.signature.accent} />
            <h3 className="sr-only">{copy.signature.traits}</h3>
            <ul role="list" className="mt-6 flex max-w-[40rem] flex-wrap gap-x-6 gap-y-1">
              {dawa.traits.map((trait) => (
                <li key={trait} className="font-display text-[1.625rem] leading-snug text-ink-900 md:text-[2rem]">
                  {trait}
                </li>
              ))}
            </ul>
            {dawa.aside ? <p className="mt-3 type-body text-ink-700">{dawa.aside}</p> : null}
            <div className="mt-10">
              <h3 className="type-label text-ink-500">{copy.signature.shadow.label}</h3>
              <ul role="list" className="mt-2 flex max-w-[40rem] flex-wrap gap-x-5 gap-y-1">
                {dawa.shadows.map((shadow) => (
                  <li key={shadow} className="font-display text-[1.25rem] italic leading-snug text-ink-700 md:text-[1.375rem]">
                    {shadow}
                  </li>
                ))}
              </ul>
              {copy.signature.shadow.note.map((line) => (
                <p key={line} className="mt-3 max-w-[56ch] type-body-sm text-ink-500">
                  {line}
                </p>
              ))}
            </div>
            {/* Astro humor (4r, Dawa's Nov 7 note 19): three of our lines beside a Grandville engraving (4j), until his cartoons. */}
            <div className="mt-10 grid items-center gap-6 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
              <OldPrint
                id={`cartoon-${TRIBE_CARTOON[sign]}`}
                alt={CARTOONS[TRIBE_CARTOON[sign]].alt}
                sizes="(min-width: 40rem) 17rem, calc(100vw - 2rem)"
                className="max-w-[17rem]!"
              />
              <figure className="border-l-2 border-gold-500 pl-5">
                <figcaption className="type-label text-ink-500">{copy.signature.smileLabel}</figcaption>
                <ul role="list" className="mt-2 grid max-w-[40ch] gap-4">
                  {[words.smile, ...words.jokes].map((line) => (
                    <li key={line} className="font-display text-[1.375rem] italic leading-snug text-ink-900">
                      {line}
                    </li>
                  ))}
                </ul>
              </figure>
            </div>
          </div>
          <TribeNewsFlash sign={sign} news={news} />
        </div>
      </Section>

      <Section labelledBy="famous-title" backdrop={{ gradient: true }}>
        <Eyebrow>{copy.famous.eyebrow}</Eyebrow>
        <h2 id="famous-title" className="type-heading-2 font-normal text-ink-900">
          {copy.famous.title(name)}
        </h2>
        <p className="mt-2 type-body-sm text-ink-500">{copy.famous.lede}</p>
        <ul role="list" className="mt-6 columns-2 gap-x-6 sm:columns-3 lg:columns-4">
          {TRIBE_FAMOUS[sign].map((person) => {
            const chart = famousByName(person);
            return (
              <li key={person} className="break-inside-avoid py-1 type-body-sm text-ink-900">
                {chart ? (
                  <Link
                    href={`/famous/${chart.slug}`}
                    className="text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
                  >
                    {person}
                  </Link>
                ) : (
                  person
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section labelledBy="people-title" band backdrop={{ sky: 'andromeda' }}>
        <Eyebrow>{copy.people.eyebrow}</Eyebrow>
        <Headline id="people-title" line={copy.people.line(12 * 12 * 12)} accent={copy.people.accent} />
        <Lede>{copy.people.lede(name)}</Lede>
        <ul role="list" className="mt-8 grid gap-6 md:grid-cols-3">
          {(['sunSign', 'moonSign', 'risingSign'] as const).map((key) => (
            <li key={key} className="grid content-start gap-3 rounded-md border border-ink-200 bg-surface-200 p-5 shadow-rest">
              <KeyChip keyId={key} showGloss />
              {/* The Clan and Vibe pages (4l, Nov 8). */}
              {key === 'moonSign' ? (
                <Link href="/clans" className={textLink}>
                  {clanLinks.allClans(KEYS.moonSign.name)}
                  <span aria-hidden="true">{'→'}</span>
                </Link>
              ) : key === 'risingSign' ? (
                <Link href="/vibes" className={textLink}>
                  {clanLinks.allVibes(KEYS.risingSign.name)}
                  <span aria-hidden="true">{'→'}</span>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-6 type-body-sm text-ink-700">
          {copy.people.sum(KEYS.sunSign.name, KEYS.moonSign.name, KEYS.risingSign.name)}
        </p>
        <Button href={PRIMARY_ACTION.href} variant="tertiary" className="mt-2 -ml-2">
          {copy.people.action}
          <span aria-hidden="true">{'→'}</span>
        </Button>
      </Section>

      <Section labelledBy="fire-title">
        <Eyebrow>{copy.fire.eyebrow(name)}</Eyebrow>
        <Headline id="fire-title" line={copy.fire.line} accent={copy.fire.accent} />
        <Lede>{copy.fire.lede}</Lede>
        <ol role="list" className="mt-8 grid gap-x-8 border-b border-ink-200 md:grid-cols-3">
          {words.prompts.map((prompt, i) => (
            <li key={prompt} className="grid grid-cols-[3rem_1fr] gap-x-3 border-t border-ink-200 py-6">
              <span aria-hidden="true" className="step-numeral">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-display text-[1.25rem] leading-snug text-ink-900">{prompt}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <NightBand
            id="opening-title"
            eyebrow={copy.opening.eyebrow}
            title={copy.opening.title(name)}
            items={copy.opening.items(words.fellows, name)}
            art="p8"
          />
        </div>
      </Section>

      <Section labelledBy="family-title" band backdrop={{ art: 'p6' }}>
        <Eyebrow>{copy.family.eyebrow(element)}</Eyebrow>
        <Headline id="family-title" line={copy.family.line} accent={copy.family.accent} />
        <Lede>{copy.family.lede(name, element, others.join(copy.family.and))}</Lede>
        <ul role="list" className="mt-8 grid max-w-[44rem] grid-cols-2 gap-3 md:gap-4">
          {family.filter((s) => s !== sign).map((s) => (
            <li key={s}>
              <TribeCard sign={s} />
            </li>
          ))}
        </ul>
        <nav aria-label={copy.neighbors.label} className="mt-6 flex max-w-[44rem] flex-wrap justify-between gap-4">
          <Link href={`/tribes/${previous}`} className={textLink}>
            <span aria-hidden="true">{'←'}</span>
            <span className="sr-only">{copy.neighbors.previous}: </span>
            {SIGNS[previous].name}
          </Link>
          <Link href={`/tribes/${next}`} className={textLink}>
            <span className="sr-only">{copy.neighbors.next}: </span>
            {SIGNS[next].name}
            <span aria-hidden="true">{'→'}</span>
          </Link>
        </nav>
      </Section>

      <Section labelledBy="next-step-title">
        <TintPanel art="p4">
          <Eyebrow>{copy.nextStep.eyebrow}</Eyebrow>
          <h2 id="next-step-title" className="type-heading-2 font-normal text-ink-900">
            {copy.nextStep.title}
          </h2>
          <p className="mt-2 max-w-[56ch] text-ink-700">{copy.nextStep.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryAction />
            <Button href={copy.nextStep.secondary.href} variant="secondary">
              {copy.nextStep.secondary.label}
            </Button>
          </div>
        </TintPanel>
      </Section>
    </>
  );
}
