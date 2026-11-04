import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DraftNote } from '@/components/DraftNote';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { SkyWindow } from '@/components/SkyWindow';
import { articleFor, learnCopy } from '@/content/articles';
import { PLANET_PAGES, planetPageCopy as copy, type PlanetContent } from '@/content/planets';
import { GLYPHS } from '@/lib/glyphs';
import { BODIES, HOUSES, SIGN_IDS, keyFor } from '@/lib/keys';

export const dynamicParams = false;

export function generateStaticParams() {
  return PLANET_PAGES.map((planet) => ({ planet: planet.slug }));
}

const find = (slug: string): PlanetContent | undefined => PLANET_PAGES.find((planet) => planet.slug === slug);

export async function generateMetadata({ params }: PageProps<'/keys/[planet]'>): Promise<Metadata> {
  const planet = find((await params).planet);
  if (!planet) return {};
  const name = BODIES[planet.body].name;
  return { title: copy.metaTitle(name), description: copy.description(name) };
}

const linkClass = 'inline-flex min-h-touch items-center type-ui text-cobalt-600 underline-offset-4 hover:underline';

/**
 * One planet's Keys in full (David, Nov 4, from Dawa's Jupiter doc): Dawa's introduction (and any
 * introduction drafted for him, under a draft note), then the planet in each sign under its sign key
 * and in each house under its house key, wherever he has written the line. Static
 * and public like the 28 Keys page; no engine, no data. Names, glosses, signs, and houses come from
 * lib/keys.ts and Dawa's words from content/planets.ts, so a rename lands here too. The hero is the
 * words beside a telescope picture of the planet in a night window (David, Nov 4, the Today's sky
 * pattern; its credit is in the footer), so the page carries no Jane wash; below it the page is one
 * region on the page tone.
 */
export default async function PlanetPage({ params }: PageProps<'/keys/[planet]'>) {
  const planet = find((await params).planet);
  if (!planet) notFound();
  const body = BODIES[planet.body];
  const signKey = keyFor(planet.body, 'sign')!;
  const houseKey = keyFor(planet.body, 'house')!;
  // Only the signs and houses Dawa has written a line for (Pluto's run from Leo, the Sun's are to come).
  const signs = SIGN_IDS.filter((sign) => planet.signs[sign]);
  const houses = HOUSES.filter((house) => planet.houses[house.number]);
  // Dawa's Substack article on this planet, where he has written one (Learn, David, Nov 4).
  const article = articleFor(planet.body);

  return (
    <>
      <div className="bg-surface-hero">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 pt-31 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-14 md:px-6 md:pt-38 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="min-w-0">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <div className="flex items-center gap-4">
              {GLYPHS[planet.body].credit !== null ? (
                <GlyphIcon glyph={planet.body} size={48} className="text-ink-900" />
              ) : null}
              <Headline as="h1" line={`${body.name},`} accent={body.line.charAt(0).toLowerCase() + body.line.slice(1)} className="mb-0" />
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <KeyChip keyId={signKey.id} showGloss />
              <KeyChip keyId={houseKey.id} showGloss />
            </div>
          </div>
          <SkyWindow
            sky={planet.sky}
            aspect={planet.aspect}
            eager
            sizes="(width >= 64rem) 26rem, (width >= 48rem) 22rem, calc(100vw - 2rem)"
            className="max-w-[26rem]"
          />
        </div>
      </div>

      <div className="border-t border-ink-200">
        <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-16">
          <Link href="/keys" className={linkClass}>
            {copy.back}
          </Link>

          <section data-planet-intro="" aria-labelledby="planet-intro" className="mt-6 max-w-measure">
            <h2 id="planet-intro" className="type-heading-2 text-ink-900">
              {copy.introTitle(body.name)}
            </h2>
            {planet.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-4 text-ink-700">
                {paragraph}
              </p>
            ))}
            {planet.draft.length > 0 ? (
              <div data-planet-draft="" className="mt-6">
                <DraftNote label={copy.draftLabel}>
                  {planet.draft.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="mt-3 first:mt-0">
                      {paragraph}
                    </p>
                  ))}
                </DraftNote>
              </div>
            ) : null}
            {article ? (
              <p className="mt-6">
                <a href={article.url} data-planet-article="" className={linkClass}>
                  {learnCopy.planetLink(body.name)}
                </a>
              </p>
            ) : null}
          </section>

          <section aria-labelledby="planet-signs" className="mt-14 border-t border-ink-200 pt-10">
            <h2 id="planet-signs" className="type-heading-2 text-ink-900">
              {copy.signsTitle(body.name)}
            </h2>
            <Lede className="mt-2">{copy.signsLede(signKey.name, body.name)}</Lede>
            {signs.length === 0 ? <p className="mt-6 type-body-sm text-ink-700">{copy.signsComing(body.name)}</p> : null}
            <ul role="list" className="mt-6 grid gap-x-8 border-b border-ink-200 empty:hidden sm:grid-cols-2">
              {signs.map((sign) => (
                <li key={sign} data-planet-sign={sign} className="grid gap-3 border-t border-ink-200 py-5">
                  <div className="flex items-center gap-3">
                    {GLYPHS[sign].credit !== null ? <GlyphIcon glyph={sign} size={24} className="text-ink-900" /> : null}
                    <KeyChip keyId={signKey.id} value={sign} />
                  </div>
                  <p className="type-body-sm text-ink-700">{planet.signs[sign]}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="planet-houses" className="mt-14 border-t border-ink-200 pt-10">
            <h2 id="planet-houses" className="type-heading-2 text-ink-900">
              {copy.housesTitle(body.name)}
            </h2>
            <Lede className="mt-2">{copy.housesLede(houseKey.name, body.name)}</Lede>
            {houses.length === 0 ? <p className="mt-6 type-body-sm text-ink-700">{copy.housesComing(body.name)}</p> : null}
            <ol role="list" className="mt-6 grid gap-x-8 border-b border-ink-200 empty:hidden sm:grid-cols-2">
              {houses.map((house) => (
                <li
                  key={house.number}
                  data-planet-house={house.number}
                  className="grid grid-cols-[4.5rem_1fr] gap-x-3 border-t border-ink-200 py-5"
                >
                  <span className="step-numeral" aria-hidden="true">
                    {house.roman}
                  </span>
                  <div className="grid gap-2">
                    <p className="type-label text-ink-500">{copy.houseLabel(house.roman, house.name)}</p>
                    <p className="type-body-sm text-ink-700">{planet.houses[house.number]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <p className="mt-10 type-caption text-ink-500">{planet.source}</p>
          <div className="mt-4 flex flex-wrap gap-x-8">
            <Link href={copy.yourChart.href} className={linkClass}>
              {copy.yourChart.label}
            </Link>
            <Link href="/keys" className={linkClass}>
              {copy.back}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
