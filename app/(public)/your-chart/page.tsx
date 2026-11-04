import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChartReading } from '@/components/ChartReading';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { Quote } from '@/components/Quote';
import { ShareButton } from '@/components/ShareButton';
import { TintPanel } from '@/components/TintPanel';
import { TribePainting } from '@/components/TribePainting';
import { quote } from '@/content/quotes';
import { yourChartCopy } from '@/content/welcome';
import { THREE, sharePath, type FreeChart } from '@/lib/free-chart';
import { SIGNS, type SignId } from '@/lib/keys';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: yourChartCopy.title };

interface Row {
  body: string;
  sign: SignId;
  sign_alternate: SignId | null;
}

/**
 * The member's own chart (2c): their saved Sun, Moon, and Rising, read as the member under RLS by
 * named columns (never a degree, which the Data API does not grant). Where the member picked a sign
 * on a day it changed, it says so. The start of what 2d (the reveal) and 2e (Your Keys) grow into.
 * Checks the session itself (invariant 5).
 */
export default async function YourChartPage() {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const { data: rows } = await supabase
    .from('placements')
    .select('body, sign, sign_alternate')
    .eq('user_id', user.id)
    .in('body', [...THREE]);
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

  return (
    <>
      <ArtWash piece="p9" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          <div className="panel-frost max-w-[40rem] p-6 md:p-10">
            <Eyebrow>{yourChartCopy.eyebrow}</Eyebrow>
            <Headline as="h1" line={yourChartCopy.line} accent={yourChartCopy.accent} />
            <Lede>{yourChartCopy.lede}</Lede>
            {rising ? null : <p className="mt-3 type-body-sm text-ink-700">{yourChartCopy.noTime}</p>}
          </div>
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
            {yourChartCopy.next.cards.map((card) => (
              <Card key={card.href} href={card.href} title={card.title}>
                {card.body}
              </Card>
            ))}
            <TintPanel className="sm:col-span-2">
              <h3 className="type-heading-3 text-ink-900">{yourChartCopy.next.shareTitle}</h3>
              <p className="mt-2 mb-4 type-body-sm text-ink-700">{yourChartCopy.next.shareBody}</p>
              <ShareButton path={sharePath(shared)} variant="secondary" />
            </TintPanel>
            <div className="sm:col-span-2">
              <Button href="/welcome?edit=birth" variant="tertiary">
                {rising ? yourChartCopy.next.edit : yourChartCopy.next.addTime}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
