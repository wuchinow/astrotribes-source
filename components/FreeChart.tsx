'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { errorCopy, formCopy, resultCopy } from '@/content/chart';
import { THREE, sharePath, type FreeChart as Chart } from '@/lib/free-chart';
import { ArtWash } from './ArtWash';
import { Button } from './Button';
import { ChartReading } from './ChartReading';
import { PlaceCombobox, type Place } from './PlaceCombobox';
import { Eyebrow, Lede, Section } from './Section';
import { ShareButton } from './ShareButton';
import { TintPanel } from './TintPanel';

type FieldError = 'date' | 'time' | 'place';
type ErrorCode = keyof typeof errorCopy;

/** After the errors render, take the keyboard to the first field that needs fixing. */
const focusFirstError = () =>
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus(),
  );

// Birth details live in this component's state only: never in storage, a cookie, or a URL, and a
// reload returns an empty form (invariant 9). Only date, time, and coordinates go to /api/chart.

export function FreeChart() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldError, ErrorCode>>>({});
  const [formError, setFormError] = useState<ErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [chart, setChart] = useState<Chart | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const shown = useRef(false);

  // Move focus to the new view's heading, but not on first load.
  useEffect(() => {
    if (!shown.current) {
      shown.current = true;
      return;
    }
    (chart ? resultHeading : formHeading).current?.focus();
  }, [chart]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found: Partial<Record<FieldError, ErrorCode>> = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) found.date = 'invalid_date';
    if (!unknownTime && !/^\d{2}:\d{2}$/.test(time)) found.time = 'invalid_time';
    if (!place) found.place = 'invalid_place';
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0 || !place) {
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time: unknownTime ? null : time, lat: place.lat, lon: place.lon }),
        cache: 'no-store',
      });
      const data = (await response.json()) as Chart & { error?: string };
      if (!response.ok) {
        const code = data.error ?? 'failed';
        if (code === 'invalid_date' || code === 'invalid_input') setErrors({ date: 'invalid_date' });
        else if (code === 'out_of_range') setErrors({ date: 'out_of_range' });
        else if (code === 'invalid_time') setErrors({ time: 'invalid_time' });
        else if (code === 'invalid_place') setErrors({ place: 'invalid_place' });
        else setFormError(code in errorCopy ? (code as ErrorCode) : 'failed');
        focusFirstError();
        return;
      }
      setChart(data);
    } catch {
      setFormError('failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (chart && place) {
    return (
      <Result
        chart={chart}
        placeLabel={place.label}
        headingRef={resultHeading}
        onStartOver={() => setChart(null)}
      />
    );
  }

  return (
    <ChartFormView
      headingRef={formHeading}
      values={{ date, time, unknownTime, place }}
      set={{ setDate, setTime, setUnknownTime, setPlace }}
      errors={errors}
      formError={formError}
      submitting={submitting}
      onSubmit={submit}
    />
  );
}

interface FormViewProps {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  values: { date: string; time: string; unknownTime: boolean; place: Place | null };
  set: {
    setDate: (v: string) => void;
    setTime: (v: string) => void;
    setUnknownTime: (v: boolean) => void;
    setPlace: (v: Place | null) => void;
  };
  errors: Partial<Record<FieldError, ErrorCode>>;
  formError: ErrorCode | null;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function ChartFormView({ headingRef, values, set, errors, formError, submitting, onSubmit }: FormViewProps) {
  const uid = useId();
  const ids = {
    why: `${uid}-why`,
    date: `${uid}-date`,
    time: `${uid}-time`,
    unknown: `${uid}-unknown`,
    place: `${uid}-place`,
  };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ArtWash piece="p9" top>
      <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <div className="panel-frost max-w-[40rem] p-6 md:p-10">
          <Eyebrow>{formCopy.eyebrow}</Eyebrow>
          <h1 ref={headingRef} tabIndex={-1} className="mb-4 type-display-lg text-ink-900 focus:outline-none">
            {formCopy.line}
            <em className="block font-normal italic text-highlight">{formCopy.accent}</em>
          </h1>
          <Lede>{formCopy.lede}</Lede>
          <p id={ids.why} className="mt-4 max-w-[56ch] type-body-sm text-ink-700">
            {formCopy.whyWeAsk}
          </p>

          <noscript>
            <p className="mt-6 text-ember-500">{formCopy.noscript}</p>
          </noscript>

          {/* method="post" and no field names: if the script never runs, nothing is sent at all. */}
          <form method="post" action="/api/chart" noValidate onSubmit={onSubmit} className="mt-8 grid gap-6">
            <Field id={ids.date} label={formCopy.date.label} help={formCopy.date.help} error={errors.date}>
              {(describedBy) => (
                <input
                  id={ids.date}
                  type="date"
                  min="1800-01-01"
                  max={today}
                  autoComplete="off"
                  className="field-input"
                  value={values.date}
                  aria-invalid={errors.date ? true : undefined}
                  aria-describedby={`${describedBy} ${ids.why}`}
                  onChange={(e) => set.setDate(e.target.value)}
                />
              )}
            </Field>

            <div className="grid gap-3">
              {values.unknownTime ? (
                <p className="rounded-sm border border-ink-200 bg-surface-200 p-4 type-body-sm text-ink-700">
                  {formCopy.unknownTimeNote}
                </p>
              ) : (
                <Field id={ids.time} label={formCopy.time.label} help={formCopy.time.help} error={errors.time}>
                  {(describedBy) => (
                    <input
                      id={ids.time}
                      type="time"
                      autoComplete="off"
                      className="field-input"
                      value={values.time}
                      aria-invalid={errors.time ? true : undefined}
                      aria-describedby={describedBy}
                      onChange={(e) => set.setTime(e.target.value)}
                    />
                  )}
                </Field>
              )}
              <label htmlFor={ids.unknown} className="inline-flex min-h-touch cursor-pointer items-center gap-3 text-ink-900">
                <input
                  id={ids.unknown}
                  type="checkbox"
                  className="size-5 accent-cobalt-600"
                  checked={values.unknownTime}
                  onChange={(e) => set.setUnknownTime(e.target.checked)}
                />
                {formCopy.unknownTime}
              </label>
            </div>

            <Field id={ids.place} label={formCopy.place.label} help={formCopy.place.help} error={errors.place}>
              {(describedBy) => (
                <PlaceCombobox
                  id={ids.place}
                  selected={values.place}
                  onSelect={set.setPlace}
                  invalid={Boolean(errors.place)}
                  describedBy={describedBy}
                />
              )}
            </Field>
            <p className="-mt-3 flex flex-wrap items-center gap-x-4 type-caption text-ink-500">
              <a
                href="https://www.geoapify.com/"
                className="inline-flex min-h-touch items-center text-cobalt-600 underline underline-offset-4"
              >
                Powered by Geoapify
              </a>
              <a
                href="https://www.openstreetmap.org/copyright"
                className="inline-flex min-h-touch items-center text-cobalt-600 underline underline-offset-4"
              >
                © OpenStreetMap contributors
              </a>
            </p>

            {formError ? (
              <p role="alert" className="text-ember-500">
                {errorCopy[formError]}
              </p>
            ) : null}

            <div>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? formCopy.submitting : formCopy.submit}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ArtWash>
  );
}

interface FieldProps {
  id: string;
  label: string;
  help: string;
  error?: ErrorCode;
  children: (describedBy: string) => React.ReactNode;
}

/** Label above, help under, and the error in ember when there is one (design system Input). */
function Field({ id, label, help, error, children }: FieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-semibold text-[1rem] text-ink-900">
        {label}
      </label>
      {children(error ? `${errorId} ${helpId}` : helpId)}
      {error ? (
        <p id={errorId} className="type-body-sm text-ember-500">
          {errorCopy[error]}
        </p>
      ) : null}
      <p id={helpId} className="type-caption text-ink-500">
        {help}
      </p>
    </div>
  );
}

interface ResultProps {
  chart: Chart;
  placeLabel: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onStartOver: () => void;
}

function Result({ chart, placeLabel, headingRef, onStartOver }: ResultProps) {
  const uid = useId();
  const tribeHref = chart.sun.candidates ? '/#tribes' : `/tribes/${chart.sun.sign}`;

  return (
    <>
      <ArtWash piece="p9" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          <div className="panel-frost max-w-[40rem] p-6 md:p-10">
            <Eyebrow>{resultCopy.eyebrow}</Eyebrow>
            <h1 ref={headingRef} tabIndex={-1} className="mb-4 type-display-lg text-ink-900 focus:outline-none">
              {resultCopy.line}
              <em className="block font-normal italic text-highlight">{resultCopy.accent}</em>
            </h1>
            <Lede>{resultCopy.lede}</Lede>
            <p className="mt-3 type-body-sm text-ink-700">{placeLabel}</p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {THREE.map((body) => (
              <ChartReading
                key={body}
                body={body}
                reading={body === 'rising' ? chart.rising : chart[body]}
                headingId={`${uid}-${body}`}
                strip
              />
            ))}
          </div>
        </div>
      </ArtWash>

      <Section band>
        <TintPanel>
          <Eyebrow>{resultCopy.next.eyebrow}</Eyebrow>
          <ul className="flex flex-wrap gap-6">
            <li className="grid gap-1">
              <Button href={tribeHref} variant="secondary">
                {resultCopy.next.tribe}
              </Button>
              <span className="type-caption text-ink-500">{resultCopy.next.tribeSoon}</span>
            </li>
            <li className="grid gap-1">
              {/* Nowhere to go yet, so not cobalt: the design system's static chip. */}
              <span className="inline-flex min-h-touch items-center rounded-pill border border-ink-200 bg-surface-100 px-4 font-semibold text-ink-900">
                {resultCopy.next.keys}
              </span>
              <span className="type-caption text-ink-500">{resultCopy.next.keysSoon}</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ink-200 pt-6">
            <ShareButton path={sharePath(chart)} />
            <Button variant="tertiary" onClick={onStartOver}>
              {resultCopy.startOver}
            </Button>
          </div>
          <p className="mt-2 type-caption text-ink-500">{resultCopy.shareNote}</p>
        </TintPanel>
      </Section>
    </>
  );
}
