import { resultCopy } from '@/content/chart';
import { signLine } from '@/content/signs';
import { signText, type SignReading, type ThreeBody } from '@/lib/free-chart';
import { SIGNS, signDates, type KeyId, type SignId } from '@/lib/keys';
import { GlyphIcon } from './GlyphIcon';
import { KeyChip } from './KeyChip';

const KEY_OF: Record<ThreeBody, KeyId> = { sun: 'sunSign', moon: 'moonSign', rising: 'risingSign' };

const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

const facts = (sign: SignId) =>
  resultCopy.facts(capital(SIGNS[sign].element), SIGNS[sign].mode, signDates(sign));

interface ChartReadingProps {
  body: ThreeBody;
  /** Null for Rising when the birth time is unknown. */
  reading: SignReading | null;
  headingId?: string;
  /** On /share the chart is someone else's, so the notes speak of "their" birth. */
  shared?: boolean;
  /** A strip of the page's wash across the top of the card (the chart page; /share has no art). */
  strip?: boolean;
}

/**
 * One of the three on a frosted panel, after the design system's Reading pattern: the glyph, the
 * body, the sign, the key with Dawa's gloss, then the plain line. "Leo or Virgo" when an
 * unknown-time birth fell on the day the sign changed; a note in place of Rising without a time.
 */
export function ChartReading({ body, reading, headingId, shared = false, strip = false }: ChartReadingProps) {
  const bodyName = resultCopy.bodies[body];
  const keyId = KEY_OF[body];
  const stripEl = strip ? <div aria-hidden="true" className="wash-strip" /> : null;

  if (!reading) {
    return (
      <article aria-labelledby={headingId} className="panel-frost flex flex-col gap-4 p-6">
        {stripEl}
        <p className="type-label text-ink-500">{bodyName}</p>
        <h2 id={headingId} className="type-heading-2 text-ink-900">
          {resultCopy.risingUnknown.title}
        </h2>
        <KeyChip keyId={keyId} showGloss />
        <p className="text-ink-700">
          {shared ? resultCopy.shared.risingUnknown : resultCopy.risingUnknown.body}
        </p>
      </article>
    );
  }

  const signs = reading.candidates ?? [reading.sign];

  return (
    <article aria-labelledby={headingId} className="panel-frost flex flex-col gap-4 p-6">
      {stripEl}
      <div className="flex items-center gap-3 text-ink-900">
        {signs.map((sign) => (
          <GlyphIcon key={sign} glyph={sign} size={48} />
        ))}
      </div>
      <div>
        <p className="type-label text-ink-500">{bodyName}</p>
        <h2 id={headingId} className="mt-1 type-heading-2 text-ink-900">
          {signText(reading)}
        </h2>
      </div>
      <KeyChip keyId={keyId} value={reading.candidates ? undefined : reading.sign} showGloss />
      {reading.candidates ? (
        <>
          <p className="text-ink-700">
            {shared ? resultCopy.shared.either(bodyName) : resultCopy.either(bodyName)}
          </p>
          <ul className="grid gap-3">
            {reading.candidates.map((sign) => (
              <li key={sign} className="text-ink-700">
                <span className="font-semibold text-ink-900">{SIGNS[sign].name}.</span>{' '}
                {signLine(body, sign)?.line}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="text-ink-700">{signLine(body, reading.sign)?.line}</p>
          <p className="type-caption text-ink-500">{facts(reading.sign)}</p>
        </>
      )}
    </article>
  );
}
