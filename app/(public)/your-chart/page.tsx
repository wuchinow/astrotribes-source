import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChartWheel } from '@/components/ChartWheel';
import { ChartReading } from '@/components/ChartReading';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { Quote } from '@/components/Quote';
import { ShareButton } from '@/components/ShareButton';
import { TintPanel } from '@/components/TintPanel';
import { TribePainting } from '@/components/TribePainting';
import { WelcomeGuide } from '@/components/WelcomeGuide';
import { PLANET_PAGES, paragraphs, planetHref } from '@/content/planets';
import { chartWheelCopy } from '@/content/chart-wheel';
import { quote } from '@/content/quotes';
import { yourChartCopy } from '@/content/welcome';
import { THREE, sharePath, type FreeChart } from '@/lib/free-chart';
import { BODIES, SIGNS, houseOf, keyFor, type HouseNumber, type SignId } from '@/lib/keys';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { wheelDetails } from '@/lib/wheel-details';
import { memberWheel } from '@/lib/your-wheel';

export const metadata: Metadata = { title: yourChartCopy.title };

interface Row {
  body: string;
  sign: SignId;
  sign_alternate: SignId | null;
  house: HouseNumber | null;
}

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
  // The wheel (3g): the member's own chart redrawn on the server from their birth details. Null on any failure.
  const wheel = await memberWheel(supabase, user.id, { sun: sun.sign, moon: moon?.sign ?? null });

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
                </div>
              );
            })}
          </div>
        </div>
      </ArtWash>

      <Section labelledBy="your-keys">
        <Eyebrow>{yourChartCopy.keys.eyebrow}</Eyebrow>
        <Headline id="your-keys" line={yourChartCopy.keys.line} accent={yourChartCopy.keys.accent} />
        <Lede>{yourChartCopy.keys.lede}</Lede>
        <div className="mt-8 grid gap-6">
          {PLANET_PAGES.map((planet) => {
            const row = byBody.get(planet.body);
            if (!row) return null;
            const name = BODIES[planet.body].name;
            // The Galactic Center has a house key only (it sits at the same degree for everyone).
            const signKey = keyFor(planet.body, 'sign');
            const houseKey = keyFor(planet.body, 'house')!;
            return (
              <div
                key={planet.body}
                data-your-planet={planet.body}
                className="grid gap-6 rounded-[12px] border border-ink-200 bg-surface-200 p-6 shadow-rest md:grid-cols-2 md:gap-8 md:p-8"
              >
                {signKey ? (
                  <div data-your-key={signKey.id}>
                    <p className="mb-2 type-label text-ink-500">{yourChartCopy.keys.inSign(name, SIGNS[row.sign].name)}</p>
                    <KeyChip keyId={signKey.id} value={row.sign} showGloss />
                    <Lines text={planet.signs[row.sign]} />
                  </div>
                ) : null}
                <div
                  data-your-key={houseKey.id}
                  className={signKey ? 'border-t border-ink-200 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8' : 'md:col-span-2'}
                >
                  {row.house ? (
                    <>
                      <p className="mb-2 type-label text-ink-500">
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
                </div>
                <div className="md:col-span-2">
                  <Button href={planetHref(planet)} variant="tertiary">
                    {yourChartCopy.keys.more(name)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

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
function Lines({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {paragraphs(text).map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mt-3 text-ink-900">
          {paragraph}
        </p>
      ))}
    </>
  );
}
