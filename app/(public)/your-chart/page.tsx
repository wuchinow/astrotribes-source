import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { ChartReading } from '@/components/ChartReading';
import { ClearCarry } from '@/components/ClearCarry';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { yourChartCopy } from '@/content/welcome';
import { THREE } from '@/lib/free-chart';
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
export default async function YourChartPage({ searchParams }: PageProps<'/your-chart'>) {
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
  const saved = (await searchParams).saved === '1';

  return (
    <>
      {saved ? <ClearCarry /> : null}
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

      <Section band>
        <TintPanel>
          <Eyebrow>{yourChartCopy.next.eyebrow}</Eyebrow>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Button href={`/tribes/${sun.sign}`} variant="secondary">
                {yourChartCopy.next.tribe}
              </Button>
            </li>
            <li>
              <Button href="/keys" variant="secondary">
                {yourChartCopy.next.keys}
              </Button>
            </li>
            <li>
              <Button href="/welcome?edit=birth" variant="tertiary">
                {rising ? yourChartCopy.next.edit : yourChartCopy.next.addTime}
              </Button>
            </li>
          </ul>
        </TintPanel>
      </Section>
    </>
  );
}
