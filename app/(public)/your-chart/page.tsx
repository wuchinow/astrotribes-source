import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Fragment, type ReactNode } from 'react';
import { ArtWash } from '@/components/ArtWash';
import type { Backdrop } from '@/components/Backdrop';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChartWheel } from '@/components/ChartWheel';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyCardsToggle } from '@/components/KeyCardsToggle';
import { KeyChip } from '@/components/KeyChip';
import { Stressed } from '@/components/Stressed';
import { ChartRail } from '@/components/ChartRail';
import { OldPrint } from '@/components/OldPrint';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { Quote } from '@/components/Quote';
import { ShareButton } from '@/components/ShareButton';
import { TintPanel } from '@/components/TintPanel';
import { TribePainting } from '@/components/TribePainting';
import { WelcomeGuide } from '@/components/WelcomeGuide';
import { ZodiacHanzi, ZodiacJade } from '@/components/ZodiacJade';
import { PLANET_PAGES, paragraphs, planetHref, teaserLine } from '@/content/planets';
import { resultCopy } from '@/content/chart';
import { chartWheelCopy } from '@/content/chart-wheel';
import { quote } from '@/content/quotes';
import { yourChartCopy } from '@/content/welcome';
import { clanLinks } from '@/content/clans';
import { VIBE_DRAFTS, VIBE_LINES } from '@/content/vibes';
import { THREE, sharePath, type FreeChart } from '@/lib/free-chart';
import { chineseSign } from '@/lib/chinese-zodiac';
import { familyOf, GENERATIONAL } from '@/lib/generations';
import { drawn } from '@/lib/glyphs';
import { BODIES, BODY_GROUPS, KEYS, SIGNS, houseOf, keyFor, type BodyGroup, type BodyId, type HouseNumber, type SignId } from '@/lib/keys';
import { CARTOONS, PLATES } from '@/lib/old-prints';
import { cn } from '@/lib/cn';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { wheelDetails } from '@/lib/wheel-details';
import { memberWheel } from '@/lib/your-wheel';

export const metadata: Metadata = { title: yourChartCopy.title };

// Noto Serif TC Bold cut to the twelve zodiac animals' characters by scripts/hanzi-font.mjs (SIL Open
// Font License, zodiac-hanzi-OFL.txt beside it). Declared here, so only this page loads it.
const zodiacFont = localFont({
  src: './zodiac-hanzi.woff2',
  weight: '700',
  display: 'swap',
  variable: '--font-zodiac',
  fallback: ['Songti TC', 'PMingLiU', 'serif'],
  adjustFontFallback: false,
});

interface Row {
  body: string;
  sign: SignId;
  sign_alternate: SignId | null;
  house: HouseNumber | null;
}

/** Each group's section on Your chart (4o): the tone and backdrop it takes, in turn down the page. */
const GROUP_LOOK: Record<BodyGroup, { band?: boolean; backdrop?: Backdrop }> = {
  identity: { band: true, backdrop: { sky: 'andromeda', foot: true } },
  journey: { backdrop: { gradient: true } },
  planets: { backdrop: { art: 'p1', foot: true, pos: 'center 30%' } },
  generational: { band: true },
  healing: { backdrop: { gradient: true } },
  galacticCenter: { backdrop: { sky: 'keysCenter', foot: true } },
};

/**
 * The member's own chart (2c): their saved Sun, Moon, and Rising, read as the member under RLS by
 * named columns (never a degree, which the Data API does not grant). Where the member picked a sign
 * on a day it changed, it says so. Then Your Keys (2e, from Nov 4): each planet Dawa has written in
 * full (content/planets.ts) as the member's own sign key and house key, with his line for each, and
 * a link to that planet's page. A house key waits on a birth time. Checks the session itself
 * (invariant 5).
 *
 * Short cards that open (5c, David, Nov 11, option A of the Member UX Review): the page ran to 30
 * phone screens with the Sun and Moon read three times. Now the three stand once under the wheel, in
 * one panel beside the member's Tribe painting; each planet is a short card (its two Keys with their
 * glosses and the first sentence of Dawa's text) that opens in place to the whole of it; the birth
 * time note stands once; and each generational family sits in its own planet's card.
 */
export default async function YourChartPage({ searchParams }: PageProps<'/your-chart'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');
  const firstVisit = (await searchParams).welcome === '1';

  const { data: rows } = await supabase
    .from('placements')
    .select('body, sign, sign_alternate, house')
    .eq('user_id', user.id)
    .in('body', [...THREE, ...PLANET_PAGES.map((planet) => planet.body)]);
  const byBody = new Map((rows as Row[] | null)?.map((row) => [row.body, row]) ?? []);
  const sun = byBody.get('sun');
  if (!sun) redirect('/welcome');
  const rising = byBody.get('rising') ?? null;
  const moon = byBody.get('moon');
  // The share link carries the three signs and nothing else (the member's own choice to send it).
  const shared: FreeChart = {
    timeKnown: Boolean(rising),
    sun: { sign: sun.sign },
    moon: { sign: (moon ?? sun).sign },
    rising: rising ? { sign: rising.sign } : null,
  };
  // The Chinese zodiac sign (3y) from the member's own birth date, read as the member under RLS; only
  // the animal, element, and that year's Lunar New Year reach the page.
  const { data: birth } = await supabase.from('birth_data').select('birth_date').eq('user_id', user.id).maybeSingle();
  const chinese = birth?.birth_date ? chineseSign(String(birth.birth_date)) : null;
  // The generational families (4g): the member's Uranus, Neptune, and Pluto signs and their own
  // birth date pick each window; only the planet, sign, and two years reach the page.
  const families = birth?.birth_date
    ? GENERATIONAL.flatMap((planet) => {
        const row = byBody.get(planet);
        const family = row ? familyOf(planet, row.sign, String(birth.birth_date)) : null;
        return family ? [family] : [];
      })
    : [];
  // The wheel (3g): the member's own chart redrawn on the server from their birth details. Null on any failure.
  const wheel = await memberWheel(supabase, user.id, { sun: sun.sign, moon: moon?.sign ?? null });

  const familyBy = new Map(families.map((family) => [family.planet as BodyId, family]));

  // `beside`: from lg this card's star card stands beside it (it ends its group alone in a row), so
  // the one inside the open card shows below lg only.
  const planetCard = (planet: (typeof PLANET_PAGES)[number], beside = false) => {
    const row = byBody.get(planet.body);
    if (!row) return null;
    const name = BODIES[planet.body].name;
    // The Galactic Center has a house key only (it sits at the same degree for everyone).
    const signKey = keyFor(planet.body, 'sign');
    const houseKey = keyFor(planet.body, 'house')!;
    const signText = signKey ? planet.signs[row.sign] : undefined;
    const houseText = row.house ? planet.houses[row.house] : undefined;
    // With no birth time a house key waits; the one note about it stands under the wheel, so a card
    // with nothing else to show (the Galactic Center) is left out.
    if (!signKey && !row.house) return null;
    const family = familyBy.get(planet.body);
    return (
      <KeyCard
        key={planet.body}
        body={planet.body}
        name={name}
        chips={
          <>
            {signKey ? <KeyChip keyId={signKey.id} value={row.sign} showGloss compact /> : null}
            {row.house ? <KeyChip keyId={houseKey.id} value={row.house} showGloss compact /> : null}
          </>
        }
        teaser={teaserLine(signText ?? houseText)}
        note={
          // The member's generational family, in its own planet's card (was a panel of three under them).
          family ? (
            <p data-your-family={family.planet} className="mt-3 type-body-sm text-ink-700">
              <span className="font-semibold text-ink-900">
                {yourChartCopy.families.name(name, SIGNS[family.sign].name)}.
              </span>{' '}
              {yourChartCopy.families.years(family.from, family.to)}
              {/* On a line of its own: inline, it wrapped in one card and not in the next. */}
              <Link
                href={`/members/family/${family.planet}/${family.sign}`}
                className="key-card-link flex min-h-touch w-fit items-center font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
              >
                {yourChartCopy.families.members}
              </Link>
            </p>
          ) : null
        }
      >
        {/* Dawa's glyph for the sign; none for houses, as he says (Nov 7). */}
        {signKey && signText ? (
          <div data-your-key={signKey.id}>
            <div className="flex items-center gap-3">
              <GlyphIcon glyph={row.sign} size={48} className="shrink-0 text-ink-900" />
              <p className="type-label text-ink-500">{yourChartCopy.keys.inSign(name, SIGNS[row.sign].name)}</p>
            </div>
            <Lines text={signText} />
          </div>
        ) : null}
        {row.house && houseText ? (
          <div data-your-key={houseKey.id} className={signKey && signText ? 'mt-6 border-t border-ink-200 pt-5' : undefined}>
            <p className="type-label text-ink-500">
              {yourChartCopy.keys.inHouse(name, houseOf(row.house).roman, houseOf(row.house).name)}
            </p>
            <Lines text={houseText} />
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <Button href={planetHref(planet)} variant="tertiary" className="-ml-2">
            {yourChartCopy.keys.more(name)}
          </Button>
          {/* The sign's own star card (4o), now at the foot of the open card. */}
          {signKey ? (
            <OldPrint
              id={`plate-${row.sign}`}
              alt={PLATES[row.sign].alt}
              sizes="9rem"
              className={cn('max-w-[9rem]!', beside && 'lg:hidden')}
            />
          ) : null}
        </div>
      </KeyCard>
    );
  };

  // Rising has one Key and no planet page, so its card opens to the paragraph from its sign's page.
  const risingCard = rising ? (
    <KeyCard
      key="rising"
      body="rising"
      name={BODIES.rising.name}
      chips={<KeyChip keyId="risingSign" value={rising.sign} showGloss compact />}
      teaser={VIBE_LINES[rising.sign]}
    >
      <div data-your-key="risingSign">
        <div className="flex items-center gap-3">
          <GlyphIcon glyph={rising.sign} size={48} className="shrink-0 text-ink-900" />
          <p className="type-label text-ink-500">{yourChartCopy.keys.inSign(BODIES.rising.name, SIGNS[rising.sign].name)}</p>
        </div>
        <Lines text={`${VIBE_LINES[rising.sign]}\n\n${VIBE_DRAFTS[rising.sign]}`} />
      </div>
      <div className="mt-5">
        <Button href={`/vibes/${rising.sign}`} variant="tertiary" className="-ml-2">
          {clanLinks.yourVibe(SIGNS[rising.sign].name, KEYS.risingSign.name)}
        </Button>
      </div>
    </KeyCard>
  ) : null;

  // Where each of the three leads: the Tribe, and the Moon's and the rising sign's own pages (4l).
  const THREE_HREF = { sun: '/tribes', moon: '/clans', rising: '/vibes' } as const;
  const THREE_KEY = { sun: 'sunSign', moon: 'moonSign', rising: 'risingSign' } as const;
  const groupsShown = BODY_GROUPS.filter((group) =>
    PLANET_PAGES.some((planet) => BODIES[planet.body].group === group.id && byBody.has(planet.body) && (keyFor(planet.body, 'sign') || byBody.get(planet.body)?.house)),
  );

  // The last group (the Galactic Center's one card) shares a section with the one before it (below).
  const lastGroup = BODY_GROUPS.find((group) => group.id === 'galacticCenter');
  const sharesRow = !!lastGroup && groupsShown.includes(lastGroup) && groupsShown.some((group) => group.id === 'healing');

  // The side list's places, in page order (5d).
  const railItems = [
    { id: 'your-three', label: yourChartCopy.three.title },
    ...groupsShown.flatMap((group) => [
      { id: `your-group-${group.id}`, label: group.name },
      ...(group.id === 'identity' && chinese ? [{ id: 'your-chinese', label: yourChartCopy.chinese.rail }] : []),
    ]),
    { id: 'your-chart-next', label: yourChartCopy.next.eyebrow },
  ];

  // The Chinese zodiac sits under Identity (the Sun, Moon, and Rising) and above Journey (4v, David,
  // Nov 9). Plain paper, so it doesn't sit gradient against gradient with Journey.
  const chineseSection = chinese ? (
    <Section labelledBy="your-chinese">
      {/* The member's animal as one of the Met's Qing jade figures, cut out, with its character
          (4p, David, Nov 9), in place of the framed ink landscape. */}
      <div data-your-chinese="" className={cn(zodiacFont.variable, 'grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]')}>
        <TintPanel>
          <div className="flex items-center gap-5">
            <ZodiacHanzi animal={chinese.animal} className="shrink-0 text-ink-900" />
            <div className="min-w-0">
              <h2 id="your-chinese" className="type-heading-3 text-ink-900">
                {yourChartCopy.chinese.title}
              </h2>
              <p className="mt-2 type-heading-2 italic text-highlight">
                {yourChartCopy.chinese.name(chinese.element, chinese.animal)}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-measure type-body-sm text-ink-700">{yourChartCopy.chinese.body(longDate(chinese.newYear))}</p>
        </TintPanel>
        <ZodiacJade animal={chinese.animal} sizes="(width >= 64rem) 14rem, 12rem" className="mx-auto max-w-[12rem]! lg:mx-0 lg:max-w-[14rem]!" />
      </div>
    </Section>
  ) : null;

  return (
    <>
      <ArtWash piece="p9" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          {/* The wheel leads the page (David, Nov 4); the plain introduction stands in only if it cannot be drawn. */}
          {wheel ? (
            <div className="panel-frost p-6 md:p-10">
              <ChartWheel
                wheel={wheel}
                details={wheelDetails(wheel)}
                aside={
                  // Grandville's Sun asleep under the Moon (1844), framed (David's D, Nov 9).
                  <OldPrint
                    id="cartoon-sun-and-moon"
                    alt={CARTOONS['sun-and-moon'].alt}
                    sizes="18rem"
                    className="mx-auto max-w-[18rem]!"
                  />
                }
                header={
                  <>
                    <Eyebrow>{yourChartCopy.eyebrow}</Eyebrow>
                    <Headline as="h1" line={chartWheelCopy.line} accent={chartWheelCopy.accent} />
                  </>
                }
              />
            </div>
          ) : (
            <div className="panel-frost max-w-[40rem] p-6 md:p-10">
              <Eyebrow>{yourChartCopy.eyebrow}</Eyebrow>
              <Headline as="h1" line={yourChartCopy.line} accent={yourChartCopy.accent} />
              <Lede>{yourChartCopy.lede}</Lede>
            </div>
          )}
          {/*
            The three, once (5c): one panel beside Kirstie's painting of the member's Tribe, each Key a
            link to its own page, in place of three cards that the planets below then repeated. The
            birth time note stands here and nowhere else on the page.
          */}
          <section aria-labelledby="your-three" data-your-three="" className="panel-frost mt-6 grid gap-6 p-6 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-center md:gap-10 md:p-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <TribePainting
              sign={sun.sign}
              sizes="(width >= 64rem) 14rem, 11rem"
              className="mx-auto max-w-[9rem]! sm:mx-0 sm:max-w-none!"
            />
            <div className="min-w-0">
              <h2 id="your-three" className="type-label text-ink-500">
                {yourChartCopy.three.title}
              </h2>
              <ul role="list" className="mt-4 grid gap-5 lg:grid-cols-3 lg:gap-6">
                {THREE.map((body) => {
                  const row = byBody.get(body);
                  return (
                    <li key={body} data-your-body={body} className="flex items-start gap-3 lg:flex-col lg:gap-2">
                      <GlyphIcon glyph={row ? row.sign : body} size={48} className="mt-1 shrink-0 text-ink-900 lg:mt-0" />
                      <div className="min-w-0">
                        <p className="type-caption text-ink-500">{resultCopy.bodies[body]}</p>
                        {row ? (
                          <KeyChip keyId={THREE_KEY[body]} value={row.sign} href={`${THREE_HREF[body]}/${row.sign}`} showGloss compact className="mt-1" />
                        ) : (
                          <KeyChip keyId={THREE_KEY[body]} showGloss compact className="mt-1" />
                        )}
                        {row?.sign_alternate && body !== 'rising' ? (
                          <p className="mt-1 type-caption text-ink-500">
                            {yourChartCopy.picked(SIGNS[row.sign].name, SIGNS[row.sign_alternate].name)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {rising ? null : (
                <p className="mt-5 max-w-measure type-body-sm text-ink-700">
                  {yourChartCopy.noTime}{' '}
                  <Link
                    href="/welcome?edit=birth"
                    className="font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
                  >
                    {yourChartCopy.three.addTime}
                  </Link>
                </p>
              )}
              <div className="mt-6">
                <Button href={`/tribes/${sun.sign}`}>{yourChartCopy.next.tribe(SIGNS[sun.sign].name)}</Button>
              </div>
            </div>
          </section>
        </div>
      </ArtWash>

      {/* The Keys intro beside the member's own Sun sign's star card (David, Nov 9: rhythm, his pick C). */}
      <Section labelledBy="your-keys" backdrop={{ print: `plate-${sun.sign}` }}>
        <Eyebrow>{yourChartCopy.keys.eyebrow}</Eyebrow>
        <Headline id="your-keys" line={yourChartCopy.keys.line} accent={yourChartCopy.keys.accent} />
        <Lede>
          <Stressed text={yourChartCopy.keys.lede} />
        </Lede>
        <p className="mt-4 max-w-measure type-body-sm text-ink-700">{yourChartCopy.keys.hint}</p>
        <div className="mt-4 flex max-w-measure flex-wrap items-center gap-x-5 gap-y-1">
          {/* Below lg; from lg the side list beside the groups takes its place (5d). */}
          <nav aria-label={yourChartCopy.keys.jump} className="lg:hidden">
            <ul role="list" className="flex flex-wrap gap-x-5">
              {groupsShown.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#your-group-${group.id}`}
                    className="inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
                  >
                    {group.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {/* From lg the side list carries the switch, so it shows once. */}
          <div className="lg:hidden">
            <KeyCardsToggle openAll={yourChartCopy.keys.openAll} closeAll={yourChartCopy.keys.closeAll} />
          </div>
        </div>
      </Section>

      {/*
        The planets in the 28 Keys page's groups, each group a section of its own, taking turns down the
        page (4o, David, Nov 9: "text part of your chart should have more rhythm"): the band and Andromeda,
        the gradient, an ink landscape, the band with a framed engraving, the gradient, the galactic center.
      */}
      <div className="rail-scope relative">
        {/* The side list (5d, David, Nov 11: "side nav yes"): from lg it stays in view at the left of
            the groups, which move over to give it room (`.rail-scope` in app/globals.css). */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
          <div className="mx-auto h-full max-w-content px-6 py-16">
            <ChartRail label={yourChartCopy.keys.rail} items={railItems} className="pointer-events-auto sticky top-8 w-48">
              <KeyCardsToggle openAll={yourChartCopy.keys.openAll} closeAll={yourChartCopy.keys.closeAll} />
            </ChartRail>
          </div>
        </div>
      {BODY_GROUPS.map((group) => {
        if (!groupsShown.includes(group)) return null;
        // The last two groups hold one card each, and a card alone left half its row empty from lg
        // (David, Nov 11: "white space in healing and portal"), so they share a section there, each
        // under its own label; on a phone they stack as before.
        if (group.id === lastGroup?.id && sharesRow) return null;
        const planets = PLANET_PAGES.filter((planet) => BODIES[planet.body].group === group.id && byBody.has(planet.body));
        const look = GROUP_LOOK[group.id];
        const label = (of: (typeof BODY_GROUPS)[number]) => (
          <h2 id={`your-group-${of.id}`} className="mb-6 type-label text-ink-500">
            {of.name}
          </h2>
        );
        if (group.id === 'healing' && sharesRow && lastGroup) {
          return (
            <Section key={group.id} labelledBy={`your-group-${group.id}`} backdrop={GROUP_LOOK[lastGroup.id].backdrop}>
              <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-6">
                <div>
                  {label(group)}
                  {planets.map((planet) => planetCard(planet))}
                </div>
                <div>
                  {label(lastGroup)}
                  {PLANET_PAGES.filter((planet) => BODIES[planet.body].group === lastGroup.id).map((planet) => planetCard(planet))}
                </div>
              </div>
            </Section>
          );
        }
        // A group with an odd count ended with one card and half a row of nothing from lg (Rising,
        // Saturn, Pluto; and Chiron with no birth time, when the last group waits). The sign's star
        // card stands in that half, and leaves the inside of the card there (4o: the gaps the text leaves).
        const cards = planets.length + (group.id === 'identity' && rising ? 1 : 0);
        const last = planets[planets.length - 1];
        const lone = cards % 2 === 1 ? (group.id === 'identity' && rising ? rising : byBody.get(last?.body)) : undefined;
        return (
          <Fragment key={group.id}>
            <Section
              labelledBy={`your-group-${group.id}`}
              band={look.band}
              backdrop={look.backdrop}
            >
              {label(group)}
              {/* The generations' introduction leads their cards; each family is in its own planet's card (5c). */}
              {group.id === 'generational' && families.length > 0 ? (
                <div data-your-families="" className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
                  <TintPanel>
                    <h3 className="type-heading-3 text-ink-900">{yourChartCopy.families.title}</h3>
                    <p className="mt-2 max-w-measure type-body-sm text-ink-700">{yourChartCopy.families.intro}</p>
                    <Button href={yourChartCopy.families.more.href} variant="tertiary" className="mt-2 -ml-2">
                      {yourChartCopy.families.more.label}
                    </Button>
                  </TintPanel>
                  <OldPrint
                    id="cartoon-juggler-of-worlds"
                    alt={CARTOONS['juggler-of-worlds'].alt}
                    sizes="14rem"
                    className="mx-auto hidden max-w-[14rem]! lg:mx-0 lg:block"
                  />
                </div>
              ) : null}
              {/* Two to a row from lg, each its own height, so one opened card leaves its neighbour alone. */}
              <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
                {planets.map((planet) => planetCard(planet, !!lone && planet === last && !(group.id === 'identity' && rising)))}
                {group.id === 'identity' ? risingCard : null}
                {lone ? (
                  <OldPrint
                    id={`plate-${lone.sign}`}
                    alt={PLATES[lone.sign].alt}
                    sizes="20rem"
                    className="mx-auto hidden max-w-[20rem]! self-center lg:block"
                  />
                ) : null}
              </div>
            </Section>
            {group.id === 'identity' ? chineseSection : null}
          </Fragment>
        );
      })}
      </div>

      <Section band labelledBy="your-chart-next">
        <Eyebrow>{yourChartCopy.next.eyebrow}</Eyebrow>
        <Headline id="your-chart-next" line={yourChartCopy.next.line} accent={yourChartCopy.next.accent} />
        {/* Dawa's own words on reading a chart (from David's quotes page). */}
        <Quote quote={quote('dawa-inner-world')} wide className="mt-6" />
        {/* The Tribe painting and its button moved up beside the three (5c). */}
        <div className="mt-10">
          {/* Five links fill their rows (`.fill-rows` in app/globals.css: three, then two wider), and
              sharing stands under them as one strip: as a sixth card its button made its row taller,
              and the two links beside it stood half empty. */}
          <div className="fill-rows grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {yourChartCopy.next.cards.map((card) => (
              <Card key={card.href} href={card.href} title={card.title}>
                {card.body}
              </Card>
            ))}
          </div>
          <div className="mt-4 grid gap-4">
            <TintPanel>
              <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
                <div className="min-w-0">
                  <h3 className="type-heading-3 text-ink-900">{yourChartCopy.next.shareTitle}</h3>
                  <p className="mt-2 type-body-sm text-ink-700">{yourChartCopy.next.shareBody}</p>
                </div>
                <ShareButton path={sharePath(shared)} variant="secondary" />
              </div>
            </TintPanel>
            <div className="-ml-2 flex flex-wrap gap-x-4 gap-y-2">
              <Button href="/welcome?edit=birth" variant="tertiary">
                {rising ? yourChartCopy.next.edit : yourChartCopy.next.addTime}
              </Button>
              {/* The first-visit guide (David, Nov 4): opens itself once, for a new member straight from the
                  welcome steps (Nov 10: never on a later sign-in), and this button opens it again. */}
              <WelcomeGuide firstVisit={firstVisit} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/**
 * A short card that opens (5c): the planet, its Keys with their glosses, and one line; the whole text
 * waits in a <details> whose summary lies over the closed card, its words at the card's foot
 * (`.key-card` in app/globals.css).
 */
function KeyCard({
  body,
  name,
  chips,
  teaser,
  note,
  children,
}: {
  body: BodyId;
  name: string;
  chips: ReactNode;
  /** The first sentence of the text, shown until the card opens. */
  teaser?: string;
  /** A line that shows open or closed (a generational family). */
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article data-your-planet={body} className="key-card">
      <div className="flex min-h-touch items-center gap-3">
        {drawn(body) ? <GlyphIcon glyph={body} size={48} className="shrink-0 text-ink-900" /> : null}
        <h3 className="type-heading-3 text-ink-900">{name}</h3>
      </div>
      <div className="mt-3 grid gap-3">{chips}</div>
      {teaser ? <p className="key-card-teaser mt-3 type-body text-ink-900">{teaser}</p> : null}
      {note}
      <details data-key-card="" className="group">
        <summary>
          <span className="inline-flex min-h-touch items-center gap-1 type-ui font-semibold text-cobalt-600">
            <span className="group-open:hidden">{yourChartCopy.keys.readMore}</span>
            <span className="hidden group-open:inline">{yourChartCopy.keys.showLess}</span>
            <span className="sr-only">{yourChartCopy.keys.about(name)}</span>
            <ChevronDown aria-hidden="true" size={18} strokeWidth={1.75} className="transition-transform duration-200 group-open:rotate-180" />
          </span>
        </summary>
        <div className="open-in mt-4 border-t border-ink-200 pt-5">{children}</div>
      </details>
    </article>
  );
}

/** Dawa's line for this member's placement, a paragraph at a time, where he has written one. */
function Lines({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {paragraphs(text).map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mt-3 type-body text-ink-900">
          {paragraph}
        </p>
      ))}
    </>
  );
}

/** "1966-01-21" as "January 21, 1966", read as a calendar date. */
const longDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
