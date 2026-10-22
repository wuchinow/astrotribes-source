import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { HexagramFrame } from '@/components/oracle/HexagramFrame';
import { HexagramMore } from '@/components/oracle/HexagramMore';
import { HexagramReading } from '@/components/oracle/HexagramReading';
import { OracleDaySync } from '@/components/oracle/OracleDaySync';
import { HexagramSky, OracleStage } from '@/components/oracle/OracleStage';
import { TarotCard } from '@/components/oracle/TarotCard';
import { Eyebrow, Headline } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { oracleCopy } from '@/content/oracle/copy';
import { TRIGRAMS, WINDOW_REACH, dateLabel, hexagram, oracleWindow, type OracleDay } from '@/lib/oracle';
import { oracleDayCss, oracleDayScript } from '@/lib/oracle-head';

export const metadata: Metadata = { title: oracleCopy.metaTitle, description: oracleCopy.description };

// Pre-built and rebuilt at most hourly. Each build carries five days, the UTC date and two either
// side, so a visitor anywhere gets their own local date's pair even from a cache up to a day old.
export const revalidate = 3600;

/**
 * One day of the Oracle (1i): the eyebrow with the date, the headline, then the pair. From 1024px the
 * card and the hexagram sit side by side as two equal cards, tops aligned, the card on the left;
 * below it they stack, the hexagram first. The hexagram's image and six lines open in a modal.
 */
function Day({ day }: { day: OracleDay }) {
  const h = hexagram(day.hexagram);
  const headingId = `hexagram-${day.date}`;
  return (
    <div data-day={day.date}>
      <Eyebrow className="mb-3">
        {oracleCopy.heading}
        <span className="text-ink-700">
          {' · '}
          <span className="md:hidden">{day.short}</span>
          <span className="hidden md:inline">{day.label}</span>
        </span>
      </Eyebrow>
      <p className="oracle-nearest -mt-1 mb-3 type-caption text-ink-500">{oracleCopy.nearest(day.label)}</p>
      {day.standIn ? (
        <p className="-mt-1 mb-3 type-caption text-ink-500">{oracleCopy.standIn(dateLabel(day.standIn))}</p>
      ) : null}
      <Headline as="h1" line={oracleCopy.headline.line} accent={oracleCopy.headline.accent}/>
      <div className="oracle-pair">
        <div className="oracle-hex">
          <HexagramSky chinese={h.chinese} />
          <article aria-labelledby={headingId} className="oracle-card panel-frost">
            <HexagramFrame
              hexagram={h}
              upper={TRIGRAMS[h.upper]}
              lower={TRIGRAMS[h.lower]}
              headingId={headingId}
              numeral
            />
            <HexagramReading hexagram={h} fold>
              <HexagramMore
                name={`${oracleCopy.hexagram} ${h.number}, ${h.pinyin}`}
                parts={h.reading.body.slice(1)}
                lines={h.reading.lines}
                allLines={h.reading.allLines}
              />
            </HexagramReading>
          </article>
        </div>
        <TarotCard id={day.card} headingId={`card-${day.date}`} />
      </div>
    </div>
  );
}

export default function OraclePage() {
  const days = oracleWindow(new Date());
  const dates = days.map((day) => day.date);
  const utc = days[WINDOW_REACH].date;
  return (
    <>
      {/*
        First in the page: picks the visitor's local day before any day is painted on a full load;
        OracleDaySync does the same before paint on a client navigation (lib/oracle-head.ts).
      */}
      <script dangerouslySetInnerHTML={{ __html: oracleDayScript(dates) }} />
      <style dangerouslySetInnerHTML={{ __html: oracleDayCss(dates, utc) }} />
      <OracleDaySync days={dates} />
      <OracleStage>
        <div className="mx-auto max-w-content px-4 pt-27 pb-16 md:px-6 md:pt-34 md:pb-20">
          {days.map((day) => (
            <Day key={day.date} day={day} />
          ))}
          <TintPanel className="oracle-consult mt-8">
            <div>
              <Eyebrow>{oracleCopy.consult.eyebrow}</Eyebrow>
              <h2 className="type-heading-2 text-ink-900">{oracleCopy.consult.line}</h2>
              <p className="mt-3 max-w-[56ch] type-body text-ink-700">{oracleCopy.consult.body}</p>
            </div>
            <Button href="/oracle/consult" variant="secondary" className="shrink-0">
              {oracleCopy.consult.action}
            </Button>
          </TintPanel>
        </div>
      </OracleStage>
    </>
  );
}
