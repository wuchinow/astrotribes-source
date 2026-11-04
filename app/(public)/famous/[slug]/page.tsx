import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/Button';
import { ChartWheel } from '@/components/ChartWheel';
import { KeyChip } from '@/components/KeyChip';
import { glossOnce } from '@/components/MemberCard';
import { PointsBreakdown } from '@/components/PointsBreakdown';
import { Eyebrow, Headline } from '@/components/Section';
import { SharedKeys } from '@/components/SharedKeys';
import { TribeBadge } from '@/components/TribeBadge';
import { famousCopy } from '@/content/famous';
import { memberCopy, pointsCopy, pointsCount } from '@/content/members';
import { famousChart, famousMatch, famousViewer } from '@/lib/famous';
import { SIGNS } from '@/lib/keys';
import { hasBirthTime } from '@/lib/shared-keys';
import { PRIMARY_ACTION } from '@/lib/site';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

const THREE = [
  ['sunSign', 'sun'],
  ['moonSign', 'moon'],
  ['risingSign', 'rising'],
] as const;

export async function generateMetadata({ params }: PageProps<'/famous/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const worked = famousChart(slug);
  return { title: worked ? worked.chart.name : famousCopy.title };
}

/**
 * One famous chart (3r): who they were, when and where they were born (a public record), their Sun,
 * Moon, and rising as Keys, then for a member with a chart the Keys the two of you share and how
 * the connection points add up, as on a member's page. Checks the session itself (invariant 5).
 */
export default async function FamousPersonPage({ params }: PageProps<'/famous/[slug]'>) {
  const { slug } = await params;
  const worked = famousChart(slug);
  if (!worked) notFound();
  const { chart, placements } = worked;

  const viewer = await famousViewer(supabaseConfigured() ? await memberClient() : null);
  const match = viewer.kind === 'member' ? famousMatch(viewer, worked) : null;
  const theirs = new Map(placements.map((row) => [row.body, row]));
  const sun = theirs.get('sun')!.sign;
  const firstTime = glossOnce();
  const myTime = viewer.kind === 'member' ? hasBirthTime(viewer.placements) : true;

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Link href="/famous" className="inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline-offset-4 hover:underline">
        {famousCopy.back}
      </Link>
      <Eyebrow className="mt-6">{famousCopy.personEyebrow}</Eyebrow>
      <Headline as="h1" line={chart.name} accent={match ? famousCopy.personAccent : undefined} />
      <p className="max-w-[56ch] type-body text-ink-900">{chart.line}</p>
      <p className="mt-2 max-w-[56ch] type-body-sm text-ink-700">{famousCopy.born(chart.place, chart.birth.date, chart.birth.time)}</p>
      <p className="mt-2 max-w-[56ch] type-body-sm text-ink-700">{famousCopy.notMember(chart.name)}</p>
      <div className="mt-6">
        <TribeBadge sign={sun} element={SIGNS[sun].element} label={SIGNS[sun].name} />
      </div>

      <section aria-labelledby="their-wheel" className="panel-frost mt-10 p-6 md:p-10">
        <ChartWheel
          wheel={worked.wheel}
          words={famousCopy.wheel(chart.name)}
          header={
            <h2 id="their-wheel" className="type-heading-2 text-ink-900">
              {famousCopy.wheelHeading(chart.name)}
            </h2>
          }
        />
      </section>

      <section aria-labelledby="their-three" className="mt-10">
        <h2 id="their-three" className="type-heading-3 text-ink-900">
          {famousCopy.threeHeading(chart.name)}
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {THREE.map(([keyId, body]) => {
            const row = theirs.get(body);
            return row ? <KeyChip key={keyId} keyId={keyId} value={row.sign} showGloss={firstTime(keyId)} /> : null;
          })}
        </div>
      </section>

      {match ? (
        <>
          <section aria-labelledby="shared-heading" className="mt-12 border-t border-ink-200 pt-10">
            <h2 id="shared-heading" className="type-display-lg max-w-[22ch] text-ink-900">
              {memberCopy.sharedHeading}
            </h2>
            <p className="mt-3 type-heading-3 text-ink-900">{pointsCount(match.points.total)}</p>
            <SharedKeys
              shared={match.shared}
              firstTime={firstTime}
              note={
                !myTime ? (
                  <p className="mt-2 type-body-sm text-ink-700">
                    {memberCopy.noTimeMine}{' '}
                    <Link href="/welcome?edit=birth" className="font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4">
                      {memberCopy.addTime}
                    </Link>
                  </p>
                ) : null
              }
            />
          </section>

          <section aria-labelledby="points-heading" className="mt-12 border-t border-ink-200 pt-10">
            <h2 id="points-heading" className="type-heading-2 text-ink-900">
              {pointsCopy.heading}
            </h2>
            <div className="mt-6">
              <PointsBreakdown points={match.points} firstTime={firstTime} noTime={!myTime} />
            </div>
          </section>
        </>
      ) : (
        <div className="mt-12 max-w-[40rem] rounded-md border border-ink-200 bg-surface-200 p-6">
          <h2 className="type-heading-3 text-ink-900">{famousCopy.visitorHeading}</h2>
          <p className="mt-2 type-body-sm text-ink-700">{viewer.kind === 'noChart' ? famousCopy.noChartPerson(chart.name) : famousCopy.visitorPerson(chart.name)}</p>
          <div className="mt-4">
            {viewer.kind === 'noChart' ? (
              <Button href="/welcome">{famousCopy.addDetails}</Button>
            ) : (
              <Button href={PRIMARY_ACTION.href}>{PRIMARY_ACTION.label}</Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-12">
        <Button href="/famous" variant="secondary">
          {famousCopy.back}
        </Button>
      </div>
    </div>
  );
}
