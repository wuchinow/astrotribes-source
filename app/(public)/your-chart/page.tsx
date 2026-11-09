import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArtWash } from '@/components/ArtWash';
import type { Backdrop } from '@/components/Backdrop';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChartWheel } from '@/components/ChartWheel';
import { ChartReading } from '@/components/ChartReading';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyChip } from '@/components/KeyChip';
import { Stressed } from '@/components/Stressed';
import { OldPrint } from '@/components/OldPrint';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { Quote } from '@/components/Quote';
import { ShareButton } from '@/components/ShareButton';
import { TintPanel } from '@/components/TintPanel';
import { TribePainting } from '@/components/TribePainting';
import { WelcomeGuide } from '@/components/WelcomeGuide';
import { ZodiacHanzi, ZodiacJade } from '@/components/ZodiacJade';
import { PLANET_PAGES, paragraphs, planetHref } from '@/content/planets';
import { chartWheelCopy } from '@/content/chart-wheel';
import { quote } from '@/content/quotes';
import { yourChartCopy } from '@/content/welcome';
import { clanLinks } from '@/content/clans';
import { THREE, sharePath, type FreeChart } from '@/lib/free-chart';
import { chineseSign } from '@/lib/chinese-zodiac';
import { familyOf, GENERATIONAL } from '@/lib/generations';
import { drawn } from '@/lib/glyphs';
import { BODIES, BODY_GROUPS, KEYS, SIGNS, houseOf, keyFor, type BodyGroup, type HouseNumber, type SignId } from '@/lib/keys';
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
 */
export default async function YourChartPage() {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

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

  const planetCard = (planet: (typeof PLANET_PAGES)[number]) => {
    const row = byBody.get(planet.body);
    if (!row) return null;
    const name = BODIES[planet.body].name;
    // The Galactic Center has a house key only (it sits at the same degree for everyone).
    const signKey = keyFor(planet.body, 'sign');
    const houseKey = keyFor(planet.body, 'house')!;
    const signText = signKey ? (planet.signs[row.sign] ?? '') : '';
    const houseText = row.house ? (planet.houses[row.house] ?? '') : yourChartCopy.keys.noTime(houseKey.name);
    const gap = signKey ? gapFor(signText, houseText, row.sign) : null;
    const plate = gap ? <GapPlate sign={row.sign} wide={gap.wide} /> : null;
    return (
      <div
        key={planet.body}
        data-your-planet={planet.body}
        className="grid gap-6 rounded-[12px] border border-ink-200 bg-surface-200 p-6 shadow-rest md:grid-cols-2 md:gap-8 md:p-8"
      >
        {/* Dawa's glyphs for the planet and its sign; none for houses, as he says (Nov 7). */}
        <div className="flex items-center gap-4 md:col-span-2">
          {drawn(planet.body) ? <GlyphIcon glyph={planet.body} size={72} className="text-ink-900" /> : null}
          <h3 className="type-heading-2 text-ink-900">{name}</h3>
        </div>
        {signKey ? (
          <div data-your-key={signKey.id}>
            <div className="mb-3 flex items-center gap-3">
              <GlyphIcon glyph={row.sign} size={48} className="text-ink-900" />
              <p className="type-label text-ink-500">{yourChartCopy.keys.inSign(name, SIGNS[row.sign].name)}</p>
            </div>
            <KeyChip keyId={signKey.id} value={row.sign} showGloss />
            <Lines text={planet.signs[row.sign]} />
            {gap?.column === 'sign' ? plate : null}
          </div>
        ) : null}
        <div
          data-your-key={houseKey.id}
          className={signKey ? 'border-t border-ink-200 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8' : 'md:col-span-2'}
        >
          {row.house ? (
            <>
              <p className="mb-3 flex min-h-12 items-center type-label text-ink-500">
                {yourChartCopy.keys.inHouse(name, houseOf(row.house).roman, houseOf(row.house).name)}
              </p>
              <KeyChip keyId={houseKey.id} value={row.house} showGloss />
              <Lines text={planet.houses[row.house]} />
            </>
          ) : (
            <>
              <KeyChip keyId={houseKey.id} showGloss />
              <p className="mt-3 type-body-sm text-ink-700">{yourChartCopy.keys.noTime(houseKey.name)}</p>
            </>
          )}
          {gap?.column === 'house' ? plate : null}
        </div>
        <div className="md:col-span-2">
          <Button href={planetHref(planet)} variant="tertiary">
            {yourChartCopy.keys.more(name)}
          </Button>
        </div>
      </div>
    );
  };

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
              {rising ? null : <p className="mt-3 type-body-sm text-ink-700">{yourChartCopy.noTime}</p>}
            </div>
          )}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {THREE.map((body) => {
              const row = byBody.get(body);
              return (
                <div key={body} className="grid content-start gap-2">
                  <ChartReading body={body} reading={row ? { sign: row.sign } : null} headingId={`your-${body}`} strip />
                  {row?.sign_alternate && body !== 'rising' ? (
                    <p className="px-2 type-caption text-ink-500">
                      {yourChartCopy.picked(SIGNS[row.sign].name, SIGNS[row.sign_alternate].name)}
                    </p>
                  ) : null}
                  {/* Their Clan and Vibe pages (4l, Nov 8). */}
                  {row && body === 'moon' ? (
                    <Button href={`/clans/${row.sign}`} variant="tertiary" className="-ml-2 justify-self-start">
                      {clanLinks.yourClan(SIGNS[row.sign].name, KEYS.moonSign.name)}
                      <span aria-hidden="true">{'→'}</span>
                    </Button>
                  ) : null}
                  {row && body === 'rising' ? (
                    <Button href={`/vibes/${row.sign}`} variant="tertiary" className="-ml-2 justify-self-start">
                      {clanLinks.yourVibe(SIGNS[row.sign].name, KEYS.risingSign.name)}
                      <span aria-hidden="true">{'→'}</span>
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </ArtWash>

      {/* The Keys intro beside the member's own Sun sign's star card (David, Nov 9: rhythm, his pick C). */}
      <Section labelledBy="your-keys" backdrop={{ print: `plate-${sun.sign}` }}>
        <Eyebrow>{yourChartCopy.keys.eyebrow}</Eyebrow>
        <Headline id="your-keys" line={yourChartCopy.keys.line} accent={yourChartCopy.keys.accent} />
        <Lede>
          <Stressed text={yourChartCopy.keys.lede} />
        </Lede>
      </Section>

      {/*
        The planets in the 28 Keys page's groups, each group a section of its own, taking turns down the
        page (4o, David, Nov 9: "text part of your chart should have more rhythm"): the band and Andromeda,
        the gradient, an ink landscape, the band with a framed engraving, the gradient, the galactic center.
      */}
      {BODY_GROUPS.map((group) => {
        const planets = PLANET_PAGES.filter((planet) => BODIES[planet.body].group === group.id && byBody.has(planet.body));
        if (planets.length === 0) return null;
        const look = GROUP_LOOK[group.id];
        return (
          <Section
            key={group.id}
            labelledBy={`your-group-${group.id}`}
            band={look.band}
            backdrop={look.backdrop}
          >
            <h2 id={`your-group-${group.id}`} className="mb-6 type-label text-ink-500">
              {group.name}
            </h2>
            <div className="grid gap-6">{planets.map(planetCard)}</div>
            {group.id === 'generational' && families.length > 0 ? (
              <div data-your-families="" className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
                <TintPanel>
                  <h3 className="type-heading-3 text-ink-900">{yourChartCopy.families.title}</h3>
                  <p className="mt-2 max-w-measure type-body-sm text-ink-700">{yourChartCopy.families.intro}</p>
                  <ul role="list" className="mt-6 grid gap-6 md:grid-cols-3">
                    {families.map((family) => (
                      <li key={family.planet} data-your-family={family.planet} className="flex items-start gap-3">
                        {drawn(family.planet) ? (
                          <GlyphIcon glyph={family.planet} size={48} className="shrink-0 text-ink-900" />
                        ) : null}
                        <div>
                          <p className="type-heading-3 text-ink-900">
                            {yourChartCopy.families.name(BODIES[family.planet].name, SIGNS[family.sign].name)}
                          </p>
                          <p className="mt-1 type-body-sm text-ink-700">{yourChartCopy.families.years(family.from, family.to)}</p>
                          {/* Everyone in the family, whatever their Tribe (4r, Dawa's punch list). */}
                          <Link
                            href={`/members/family/${family.planet}/${family.sign}`}
                            className="mt-1 inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4"
                          >
                            {yourChartCopy.families.members}
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button href={yourChartCopy.families.more.href} variant="tertiary" className="mt-4 -ml-2">
                    {yourChartCopy.families.more.label}
                  </Button>
                </TintPanel>
                <OldPrint
                  id="cartoon-juggler-of-worlds"
                  alt={CARTOONS['juggler-of-worlds'].alt}
                  sizes="(width >= 64rem) 18rem, calc(100vw - 2rem)"
                  className="mx-auto max-w-[18rem]! lg:mx-0"
                />
              </div>
            ) : null}
          </Section>
        );
      })}

      {chinese ? (
        <Section labelledBy="your-chinese" backdrop={{ gradient: true }}>
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
      ) : null}

      <Section band labelledBy="your-chart-next">
        <Eyebrow>{yourChartCopy.next.eyebrow}</Eyebrow>
        <Headline id="your-chart-next" line={yourChartCopy.next.line} accent={yourChartCopy.next.accent} />
        {/* Dawa's own words on reading a chart (from David's quotes page). */}
        <Quote quote={quote('dawa-inner-world')} wide className="mt-6" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
          <div className="grid content-start gap-4">
            <TribePainting sign={sun.sign} sizes="(width >= 64rem) 20rem, (width >= 40rem) 20rem, 100vw" className="max-w-[20rem]" />
            <p className="text-ink-700">{yourChartCopy.next.tribeBody}</p>
            <div>
              <Button href={`/tribes/${sun.sign}`}>{yourChartCopy.next.tribe(SIGNS[sun.sign].name)}</Button>
            </div>
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {yourChartCopy.next.cards.map((card, i, all) => (
              <Card
                key={card.href}
                href={card.href}
                title={card.title}
                className={all.length % 2 === 1 && i === all.length - 1 ? 'sm:col-span-2' : undefined}
              >
                {card.body}
              </Card>
            ))}
            <TintPanel className="sm:col-span-2">
              <h3 className="type-heading-3 text-ink-900">{yourChartCopy.next.shareTitle}</h3>
              <p className="mt-2 mb-4 type-body-sm text-ink-700">{yourChartCopy.next.shareBody}</p>
              <ShareButton path={sharePath(shared)} variant="secondary" />
            </TintPanel>
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:col-span-2">
              <Button href="/welcome?edit=birth" variant="tertiary">
                {rising ? yourChartCopy.next.edit : yourChartCopy.next.addTime}
              </Button>
              {/* The first-visit guide (David, Nov 4): opens itself once, and this button opens it again. */}
              <WelcomeGuide />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/** Dawa's line for this member's placement, a paragraph at a time, where he has written one. */
/*
 * Where one column of a planet card runs well short of the other (from md, where they sit side by
 * side), the sign's own star card fills the gap under it (David, Nov 9: "natural areas with lots of
 * white space where text leaves a gap"). A rough measure in characters: about 52 to a line of 29px.
 */
interface Gap {
  column: 'sign' | 'house';
  /** 14rem, or 20rem where the gap has room for it. */
  wide: boolean;
}

function gapFor(signText: string, houseText: string, sign: SignId): Gap | null {
  const [w, h] = PLATES[sign].size;
  const chars = (width: number) => ((24 + (width * h) / w) / 29) * 52;
  const diff = houseText.length - signText.length;
  const room = Math.abs(diff);
  if (room < chars(224)) return null;
  return { column: diff > 0 ? 'sign' : 'house', wide: room >= chars(320) };
}

function GapPlate({ sign, wide }: { sign: SignId; wide: boolean }) {
  return (
    <OldPrint
      id={`plate-${sign}`}
      alt={PLATES[sign].alt}
      sizes={wide ? '20rem' : '14rem'}
      className={cn('mt-6 hidden md:block', wide ? 'max-w-[20rem]!' : 'max-w-[14rem]!')}
    />
  );
}

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
