import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { FamousCard } from '@/components/FamousCard';
import { glossOnce } from '@/components/MemberCard';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { famousCopy } from '@/content/famous';
import { famousCharts, famousMatches, famousViewer } from '@/lib/famous';
import type { SignId } from '@/lib/keys';
import { topShared, type PlacementRow } from '@/lib/shared-keys';
import { PRIMARY_ACTION } from '@/lib/site';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: famousCopy.title };

/**
 * Famous charts (3r): well-known people who have died, from public birth records, never shown as
 * members. Anyone may look; a member with a chart sees their connection points with each, highest
 * first, worked out as on the members pages. Checks the session itself (invariant 5). One region on
 * the page tone, so no bands.
 */
export default async function FamousPage() {
  const viewer = await famousViewer(supabaseConfigured() ? await memberClient() : null);
  const firstTime = glossOnce();
  const sunOf = (rows: readonly PlacementRow[]): SignId => rows.find((row) => row.body === 'sun')!.sign;

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{famousCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={famousCopy.line} accent={famousCopy.accent} />
      <Lede>{famousCopy.lede}</Lede>
      <p className="mt-4 max-w-[56ch] type-body-sm text-ink-700">{famousCopy.forFun}</p>

      {viewer.kind !== 'member' ? (
        <div className="mt-8 max-w-[40rem] rounded-md border border-ink-200 bg-surface-200 p-6">
          <h2 className="type-heading-3 text-ink-900">{famousCopy.visitorHeading}</h2>
          <p className="mt-2 type-body-sm text-ink-700">{viewer.kind === 'noChart' ? famousCopy.noChartBody : famousCopy.visitorBody}</p>
          <div className="mt-4">
            {viewer.kind === 'noChart' ? (
              <Button href="/welcome">{famousCopy.addDetails}</Button>
            ) : (
              <Button href={PRIMARY_ACTION.href}>{PRIMARY_ACTION.label}</Button>
            )}
          </div>
        </div>
      ) : null}

      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {viewer.kind === 'member'
          ? famousMatches(viewer).map(({ worked, points, personalCount, shared }) => (
              <FamousCard
                key={worked.chart.slug}
                href={`/famous/${worked.chart.slug}`}
                name={worked.chart.name}
                line={worked.chart.line}
                years={famousCopy.years(worked.chart.born, worked.chart.died)}
                sun={sunOf(worked.placements)}
                match={{ points: points.total, personalCount, top: topShared(shared) }}
                firstTime={firstTime}
              />
            ))
          : famousCharts().map(({ chart, placements }) => (
              <FamousCard
                key={chart.slug}
                href={`/famous/${chart.slug}`}
                name={chart.name}
                line={chart.line}
                years={famousCopy.years(chart.born, chart.died)}
                sun={sunOf(placements)}
                firstTime={firstTime}
              />
            ))}
      </ul>
    </div>
  );
}
