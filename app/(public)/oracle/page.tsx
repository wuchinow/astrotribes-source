import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { HexagramFrame } from '@/components/oracle/HexagramFrame';
import { HexagramMore } from '@/components/oracle/HexagramMore';
import { HexagramReading } from '@/components/oracle/HexagramReading';
import { OracleDaySync } from '@/components/oracle/OracleDaySync';
import { HexagramSky, OracleStage } from '@/components/oracle/OracleStage';
import { TarotCard } from '@/components/oracle/TarotCard';
import { Eyebrow, Headline } from '@/components/Section';
import { Quote } from '@/components/Quote';
import { quoteForDay } from '@/content/quotes';
import { oracleCopy } from '@/content/oracle/copy';
import { TRIGRAMS, WINDOW_REACH, dateLabel, dayIndex, hexagram, oracleWindow, type OracleDay } from '@/lib/oracle';
import { oracleDayCss, oracleDayScript } from '@/lib/oracle-head';

export const metadata: Metadata = { title: oracleCopy.metaTitle, description: oracleCopy.description };

// Pre-built and rebuilt at most hourly. Each build carries five days, the UTC date and two either
// side, so a visitor anywhere gets their own local date's pair even from a cache up to a day old.
export const revalidate = 3600;

/**
 * One day of the Oracle (1i): the eyebrow with the date, the headline, then the pair. From 1024px the
 * card and the hexagram sit side by side as two equal cards, tops aligned, the card on the left;
 * below it they stack, the hexagram first. The hexagram's image and six lines open in a modal, and
 * Consult stands at the foot of the hexagram's card.
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
          <HexagramSky />
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
            {/* Consult, in the hexagram's own card (David, Nov 11: "oracle consult should be in iching card
                as its related and there white space"): at the card's foot, where the card stood empty
                beside the longer Tarot card. It was a panel of its own under the pair. */}
            <div className="oracle-consult">
              <section aria-labelledby={`consult-${day.date}`}>
                <Eyebrow className="mb-2">{oracleCopy.consult.eyebrow}</Eyebrow>
                <h3 id={`consult-${day.date}`} className="type-heading-3 text-ink-900">
                  {oracleCopy.consult.line}
                </h3>
                <p className="mt-2 max-w-measure type-body-sm text-ink-700">{oracleCopy.consult.body}</p>
                <Button href="/oracle/consult" variant="secondary" className="mt-4">
                  {oracleCopy.consult.action}
                </Button>
              </section>
            </div>
          </article>
        </div>
        <TarotCard id={day.card} headingId={`card-${day.date}`} />
      </div>
      {/* A thought for the day (David, Nov 4): the quotes in turn, one a day. On a panel, over the stage. */}
      <div className="panel-frost mt-8 p-6 md:p-8">
        <p className="mb-3 type-label text-ink-500">{oracleCopy.quote}</p>
        <Quote quote={quoteForDay(dayIndex(day.date))} />
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
        </div>
      </OracleStage>
    </>
  );
}
