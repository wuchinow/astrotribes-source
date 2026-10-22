'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { LINE_NAMES, consultCopy } from '@/content/oracle/copy';
import { TRIGRAMS, hexagram } from '@/lib/iching';
import { readCast, tossThree, valueOfHeads, type LineValue } from '@/lib/oracle-cast';
import { HexagramFrame } from './HexagramFrame';
import { HexagramReading } from './HexagramReading';

type Phase = 'intro' | 'cast' | 'result';
type Mode = 'coins' | 'real';

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * Consult (1c): cast a hexagram with three coins six times, here or with real coins, bottom line
 * first, and read the cast and what it is changing into. The whole cast lives in this component's
 * state: nothing goes to storage, cookies, the URL, or the network, and leaving the page forgets
 * it. Every toss is announced politely. The coins do not spin under reduced motion (globals.css).
 */
export function Consult({ art }: { art: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('coins');
  const [values, setValues] = useState<LineValue[]>([]);
  const [coins, setCoins] = useState<[boolean, boolean, boolean] | null>(null);
  const [tossCount, setTossCount] = useState(0);
  const [heads, setHeads] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const pendingFocus = useRef<'intro' | 'cast' | 'result' | 'radio' | null>(null);
  const setFocus = (target: 'intro' | 'cast' | 'result' | 'radio') => {
    pendingFocus.current = target;
  };
  const castHeading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const introHeading = useRef<HTMLHeadingElement>(null);
  const firstRadio = useRef<HTMLInputElement>(null);

  // Move focus once the element it goes to has rendered: the new step, the next line, the result.
  useEffect(() => {
    const focus = pendingFocus.current;
    if (!focus) return;
    pendingFocus.current = null;
    ({ intro: introHeading, cast: castHeading, result: resultHeading, radio: firstRadio })[focus].current?.focus();
  });

  const addLine = (value: LineValue, tossed: [boolean, boolean, boolean] | null) => {
    const next = [...values, value];
    const words = tossed ? tossed.map((h) => (h ? consultCopy.heads : consultCopy.tails)).join(', ') : null;
    setValues(next);
    setAnnouncement(consultCopy.announce(next.length, words, value));
    if (next.length === 6) {
      setPhase('result');
      setFocus('result');
    }
  };

  const toss = () => {
    const tossed = tossThree();
    setCoins(tossed);
    setTossCount((n) => n + 1);
    addLine(valueOfHeads(tossed.filter(Boolean).length), tossed);
  };

  const addReal = () => {
    if (heads === null) return;
    addLine(valueOfHeads(heads), null);
    setHeads(null);
    if (values.length < 5) setFocus('radio');
  };

  const back = () => {
    setValues((v) => v.slice(0, -1));
    setHeads(null);
    setFocus('radio');
  };

  const begin = () => {
    setValues([]);
    setCoins(null);
    setHeads(null);
    setAnnouncement('');
    setPhase('cast');
    setFocus('cast');
  };

  const again = () => {
    setValues([]);
    setCoins(null);
    setHeads(null);
    setAnnouncement('');
    setPhase('intro');
    setFocus('intro');
  };

  const cast = phase === 'result' && values.length === 6 ? readCast(values) : null;
  const n = values.length + 1;

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className={phase === 'result' ? '' : 'grid items-start gap-10 md:grid-cols-[minmax(0,40rem)_auto] md:gap-16'}>
        <div>
          <p className="mb-4 type-label text-ink-500">{consultCopy.eyebrow}</p>
          <h1 ref={introHeading} tabIndex={-1} className="type-display-lg text-ink-900 outline-none">
            {consultCopy.heading}
          </h1>

          {phase === 'intro' ? (
            <>
              <p className="mt-4 max-w-[56ch] type-body-lg text-ink-700">{consultCopy.intro}</p>
              <p className="mt-3 type-caption text-ink-500">{consultCopy.privacy}</p>
              <fieldset className="mt-8 grid gap-3">
                <legend className="mb-3 type-ui text-ink-900">{consultCopy.modeLegend}</legend>
                {(['coins', 'real'] as const).map((m) => (
                  <label key={m} className="consult-option">
                    <input type="radio" name="consult-mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
                    <span>
                      <span className="block type-ui text-ink-900">{consultCopy.modes[m].label}</span>
                      <span className="block type-caption text-ink-500">{consultCopy.modes[m].hint}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <Button onClick={begin} className="mt-8">
                {consultCopy.begin}
              </Button>
            </>
          ) : null}

          {phase === 'cast' ? (
            <section aria-labelledby="consult-cast" className="mt-8">
              <h2 id="consult-cast" ref={castHeading} tabIndex={-1} className="type-heading-2 text-ink-900 outline-none">
                {consultCopy.modes[mode].label}
              </h2>
              <p className="mt-2 type-caption text-ink-500">{consultCopy.countsNote}</p>

              {mode === 'coins' ? (
                <div className="mt-6">
                  <p className="type-label text-ink-500">{consultCopy.tossProgress(Math.min(values.length + 1, 6))}</p>
                  <div aria-hidden="true" className="mt-4 flex gap-4">
                    {[0, 1, 2].map((i) => (
                      <svg key={`${tossCount}-${i}`} viewBox="0 0 64 64" className={tossCount ? 'coin coin-flip' : 'coin'}>
                        <circle cx="32" cy="32" r="29" className={coins?.[i] ? 'coin-heads' : 'coin-tails'} />
                        <rect x="25" y="25" width="14" height="14" className="coin-hole" />
                      </svg>
                    ))}
                  </div>
                  {coins ? (
                    <p aria-hidden="true" className="mt-3 type-body-sm text-ink-700">
                      {coins.map((h) => (h ? consultCopy.heads : consultCopy.tails)).join(', ')}
                    </p>
                  ) : null}
                  <Button onClick={toss} className="mt-6" disabled={values.length >= 6}>
                    {consultCopy.toss}
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <fieldset key={values.length} className="grid gap-3">
                    <legend className="mb-3 type-ui text-ink-900">{consultCopy.realLegend(n)}</legend>
                    {[0, 1, 2, 3].map((h) => (
                      <label key={h} className="consult-option">
                        <input
                          ref={h === 0 ? firstRadio : undefined}
                          type="radio"
                          name={`line-${n}`}
                          value={h}
                          checked={heads === h}
                          onChange={() => setHeads(h)}
                        />
                        <span className="type-body-sm text-ink-900">
                          {consultCopy.realOptions[h]}: {lower(LINE_NAMES[valueOfHeads(h)])}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button onClick={addReal} aria-disabled={heads === null ? 'true' : undefined}>
                      {consultCopy.addLine}
                    </Button>
                    {values.length ? (
                      <Button onClick={back} variant="tertiary">
                        {consultCopy.back}
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}

              {values.length ? (
                <div className="mt-8">
                  <p className="mb-3 type-label text-ink-500">{consultCopy.castSoFar}</p>
                  <ol className="consult-stack">
                    {values.map((v, i) => (
                      <li key={i}>
                        <span aria-hidden="true" className={v === 7 || v === 9 ? 'consult-bar' : 'consult-bar consult-bar-broken'} />
                        <span className="type-caption text-ink-700">
                          {consultCopy.line(i + 1)}: {LINE_NAMES[v]}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        {phase === 'result' ? null : <div className="max-w-[20rem]">{art}</div>}
      </div>

      {cast ? (
        <section aria-labelledby="consult-result" className="mt-10 max-w-[48rem]">
          <h2 id="consult-result" ref={resultHeading} tabIndex={-1} className="type-heading-2 text-ink-900 outline-none">
            {consultCopy.resultHeading}
          </h2>
          <Result number={cast.primary} changing={cast.changing} numeral as="h3" note={!cast.relating}>
            {cast.changing.some(Boolean) ? (
              <section className="mt-8">
                <h4 className="mb-3 type-label text-ink-500">{consultCopy.changingHeading}</h4>
                <ol className="grid gap-4">
                  {cast.changing.map((moving, i) =>
                    moving ? (
                      <li key={i}>
                        <span className="block type-ui text-ink-900">{consultCopy.line(i + 1)}</span>
                        <span className="type-body text-ink-700">{hexagram(cast.primary).reading.lines[i]}</span>
                      </li>
                    ) : null,
                  )}
                </ol>
                {cast.changing.every(Boolean) && hexagram(cast.primary).reading.allLines ? (
                  <p className="mt-4 type-body text-ink-700">{hexagram(cast.primary).reading.allLines}</p>
                ) : null}
              </section>
            ) : null}
          </Result>
          {cast.relating ? (
            <section className="mt-12 border-t border-ink-200 pt-10">
              <p className="mb-4 type-label text-ink-500">{consultCopy.relatingHeading}</p>
              <Result number={cast.relating} as="h3" note />
            </section>
          ) : (
            <p className="mt-8 type-body text-ink-700">{consultCopy.noChange}</p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button onClick={again} variant="secondary">
              {consultCopy.castAgain}
            </Button>
            <Button href="/oracle" variant="tertiary">
              {consultCopy.backToToday}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Result({
  number,
  changing,
  numeral = false,
  as,
  note,
  children,
}: {
  number: number;
  changing?: readonly boolean[];
  numeral?: boolean;
  as: 'h3';
  note: boolean;
  children?: ReactNode;
}) {
  const h = hexagram(number);
  return (
    <div className="mt-6">
      <HexagramFrame hexagram={h} upper={TRIGRAMS[h.upper]} lower={TRIGRAMS[h.lower]} numeral={numeral} changing={changing} as={as} />
      <HexagramReading hexagram={h} partAs="h4" note={note}>
        {children}
      </HexagramReading>
    </div>
  );
}
