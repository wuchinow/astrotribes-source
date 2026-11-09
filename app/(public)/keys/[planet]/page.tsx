import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { SkyWindow } from '@/components/SkyWindow';
import { learnCopy, learnHref } from '@/content/articles';
import { clanLinks } from '@/content/clans';
import { PLANET_PAGES, paragraphs, planetPageCopy as copy, type PlanetContent } from '@/content/planets';
import { GLYPHS, drawn } from '@/lib/glyphs';
import { BODIES, HOUSES, KEYS, SIGNS, SIGN_IDS, keyFor } from '@/lib/keys';
import { learnArticleFor } from '@/lib/substack';

export const dynamicParams = false;

// The link to Dawa's article follows his Substack feed, read again at most once an hour (3y).
export const revalidate = 3600;

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
 * introduction drafted for him, shown the same way since Nov 6), then the planet in each sign under its sign key
 * and in each house under its house key, wherever he has written the line. Static
 * and public like the 28 Keys page; no engine, no data. Names, glosses, signs, and houses come from
 * lib/keys.ts and Dawa's words from content/planets.ts, so a rename lands here too. The hero is the
 * words beside a telescope picture of the planet in a night window (David, Nov 4, the Today's sky
 * pattern; its credit is in the footer), so the page carries no painting wash; below it the page is one
 * region on the page tone. The Galactic Center sits at the same degree for everyone, so its page has
 * a house key and house lines only (3x, Nov 6). A line or note can run to several paragraphs.
 */
export default async function PlanetPage({ params }: PageProps<'/keys/[planet]'>) {
  const planet = find((await params).planet);
  if (!planet) notFound();
  const body = BODIES[planet.body];
  const signKey = keyFor(planet.body, 'sign');
  const houseKey = keyFor(planet.body, 'house')!;
  // Only the signs and houses Dawa has written a line for (Pluto's run from Leo, the Sun's are to come).
  const signs = SIGN_IDS.filter((sign) => planet.signs[sign]);
  const houses = HOUSES.filter((house) => planet.houses[house.number]);
  // Dawa's Substack article on this planet, where he has written one (Learn, David, Nov 4), read in full on the site since 4w.
  const article = await learnArticleFor(planet.body);

  return (
    <>
      <div className="bg-surface-hero">
        <div
          className={
            planet.sky
              ? 'mx-auto grid max-w-content items-center gap-10 px-4 pt-31 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-14 md:px-6 md:pt-38 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]'
              : 'mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16'
          }
        >
          <div className="min-w-0">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <div className="flex items-center gap-4">
              {drawn(planet.body) ? (
                <GlyphIcon glyph={planet.body} size={96} className="text-ink-900" />
              ) : null}
              <Headline as="h1" line={`${body.name},`} accent={body.line.charAt(0).toLowerCase() + body.line.slice(1)} className="mb-0" />
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {signKey ? <KeyChip keyId={signKey.id} showGloss /> : null}
              <KeyChip keyId={houseKey.id} showGloss />
            </div>
          </div>
          {planet.sky ? (
            <SkyWindow
              sky={planet.sky}
              aspect={planet.aspect ?? 'aspect-square'}
              eager
              sizes="(width >= 64rem) 26rem, (width >= 48rem) 22rem, calc(100vw - 2rem)"
              className="max-w-[26rem]"
            />
          ) : null}
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
            {/* Drafted for Dawa (content/planets.ts); shown like his own since Nov 6 (David). */}
            {planet.draft.length > 0 ? (
              <div data-planet-draft="">
                {planet.draft.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-4 text-ink-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {article ? (
              <p className="mt-6">
                <Link href={learnHref(article)} data-planet-article="" className={linkClass}>
                  {learnCopy.planetLink(body.name)}
                </Link>
              </p>
            ) : null}
          </section>

          {signKey ? (
            <section aria-labelledby="planet-signs" className="mt-14 border-t border-ink-200 pt-10">
              <h2 id="planet-signs" className="type-heading-2 text-ink-900">
                {copy.signsTitle(body.name)}
              </h2>
              <Lede className="mt-2">{copy.signsLede(signKey.name, body.name)}</Lede>
              <Note text={planet.signsNote} />
              {signs.length === 0 ? <p className="mt-6 type-body-sm text-ink-700">{copy.signsComing(body.name)}</p> : null}
              <ul role="list" className="mt-6 grid gap-x-8 border-b border-ink-200 empty:hidden sm:grid-cols-2">
                {signs.map((sign) => (
                  <li key={sign} data-planet-sign={sign} className="grid gap-3 border-t border-ink-200 py-5">
                    <div className="flex items-center gap-3">
                      {GLYPHS[sign].credit !== null ? <GlyphIcon glyph={sign} size={48} className="text-ink-900" /> : null}
                      <KeyChip keyId={signKey.id} value={sign} />
                    </div>
                    <Lines text={planet.signs[sign]!} />
                    {/* The Moon's sign is a Clan, with a page of its own (4l, Nov 8). */}
                    {planet.body === 'moon' ? (
                      <Link href={`/clans/${sign}`} data-planet-clan={sign} className={linkClass}>
                        {clanLinks.clanOf(SIGNS[sign].name, KEYS.moonSign.name)}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="planet-houses" className="mt-14 border-t border-ink-200 pt-10">
            <h2 id="planet-houses" className="type-heading-2 text-ink-900">
              {copy.housesTitle(body.name)}
            </h2>
            <Lede className="mt-2">{copy.housesLede(houseKey.name, body.name)}</Lede>
            <Note text={planet.housesNote} />
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
                    <Lines text={planet.houses[house.number]!} />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {planet.source ? <p className="mt-10 type-caption text-ink-500">{planet.source}</p> : null}
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

/** Dawa's note on a whole section (the Moon's signs, the Sun's houses), a paragraph at a time. */
function Note({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div data-planet-note="" className="mt-4 max-w-measure">
      {paragraphs(text).map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mt-3 text-ink-700 first:mt-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/** One sign's or house's line, a paragraph at a time. */
function Lines({ text }: { text: string }) {
  return (
    <div className="grid gap-2">
      {paragraphs(text).map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="type-body text-ink-700">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
