import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/Button';
import { ChartReading } from '@/components/ChartReading';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { shareCopy } from '@/content/chart';
import { THREE, parseShare, signText, type FreeChart } from '@/lib/free-chart';

// A shared free chart: public (outside the passcode), noindex like the whole site, and built from
// the three signs in the URL alone. No art (1b decision): the page stands on plain paper. It never imports the engine (tests/engine/boundary.test.ts)
// and carries no birth detail: parseShare accepts sign slugs and nothing else.

const summaryOf = (chart: FreeChart) =>
  shareCopy.summary(signText(chart.sun), signText(chart.moon), chart.rising ? signText(chart.rising) : null);

export async function generateMetadata({ params }: PageProps<'/share/[sun]/[moon]/[rising]'>): Promise<Metadata> {
  const { sun, moon, rising } = await params;
  const chart = parseShare(sun, moon, rising);
  if (!chart) return {};
  const summary = summaryOf(chart);
  return { title: summary, openGraph: { title: summary, description: shareCopy.lede } };
}

export default async function SharePage({ params }: PageProps<'/share/[sun]/[moon]/[rising]'>) {
  const { sun, moon, rising } = await params;
  const chart = parseShare(sun, moon, rising);
  if (!chart) notFound();

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <div className="panel-frost max-w-[40rem] p-6 md:p-10">
        <Eyebrow>{shareCopy.eyebrow}</Eyebrow>
        <Headline as="h1" line={shareCopy.line} accent={shareCopy.accent} />
        <Lede>{shareCopy.lede}</Lede>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {THREE.map((body) => (
          <ChartReading
            key={body}
            body={body}
            reading={body === 'rising' ? chart.rising : chart[body]}
            headingId={`share-${body}`}
            shared
          />
        ))}
      </div>
      <div className="panel-frost mt-6 inline-flex p-4">
        <Button href="/chart">{shareCopy.cta}</Button>
      </div>
    </div>
  );
}
