'use client';

import { startTransition, useActionState, useEffect, useId, useState } from 'react';
import { saveBirthDetails } from '@/app/(public)/welcome/actions';
import { resultCopy } from '@/content/chart';
import { signLine } from '@/content/signs';
import { welcomeCopy } from '@/content/welcome';
import { PICK_BODIES, type BirthFormState, type Picks } from '@/lib/birth-details';
import { readCarry } from '@/lib/carry';
import { SIGNS } from '@/lib/keys';
import { Button } from './Button';
import { PlaceCombobox, type Place } from './PlaceCombobox';

export interface BirthInitial {
  date: string;
  time: string | null;
  place: Place;
}

type FieldName = 'date' | 'time' | 'place';
const FIELD_OF: Partial<Record<string, FieldName>> = {
  invalid_date: 'date',
  out_of_range: 'date',
  invalid_time: 'time',
  invalid_place: 'place',
};

/**
 * The birth details step (2c): date, time or "I don't know", and place from our own place search.
 * Filled from the member's saved details when they edit, or from the free chart carried in this tab.
 * The values live in this component's state and go to the server action in the POST body only.
 * On a day the Sun or the Moon changed sign, with no time, the action asks for a pick first.
 */
export function BirthDetailsForm({ initial, edit = false }: { initial: BirthInitial | null; edit?: boolean }) {
  const uid = useId();
  const [state, action, pending] = useActionState<BirthFormState, FormData>(saveBirthDetails, { status: 'idle' });
  const [date, setDate] = useState(initial?.date ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [unknownTime, setUnknownTime] = useState(initial ? initial.time === null : false);
  const [place, setPlace] = useState<Place | null>(initial?.place ?? null);
  const [picks, setPicks] = useState<Picks>({});
  const [carried, setCarried] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  // The free chart's details, when the visitor brought them along and nothing is saved yet.
  useEffect(() => {
    if (initial) return;
    const found = readCarry();
    if (!found) return;
    // Storage is only readable after hydration, so this one effect sets state.
    /* eslint-disable react-hooks/set-state-in-effect */
    setDate(found.date);
    setTime(found.time ?? '');
    setUnknownTime(found.time === null);
    setPlace(found.place);
    setCarried(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initial]);

  const choices = state.status === 'choose' ? state.choices : null;
  const errorCode = state.status === 'error' ? state.code : null;
  const fieldError = errorCode ? FIELD_OF[errorCode] : undefined;
  const ids = { date: `${uid}-date`, time: `${uid}-time`, unknown: `${uid}-unknown`, place: `${uid}-place` };
  const fieldErrorText = (name: FieldName) =>
    fieldError === name && errorCode ? (
      <p id={`${ids[name]}-error`} className="type-body-sm text-ember-500">
        {welcomeCopy.errors[errorCode]}
      </p>
    ) : null;
  const describedBy = (name: FieldName) => (fieldError === name ? `${ids[name]}-error ${ids[name]}-help` : `${ids[name]}-help`);

  return (
    <form
      // Submitted by hand, not through `action`: React resets a form after its action runs, which
      // unticks the controlled checkbox and radios while their state stays set.
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(() => action(form));
      }}
      className="mt-8 grid gap-6"
    >
      {carried ? <p className="rounded-sm border border-ink-200 bg-surface-200 p-4 type-body-sm text-ink-700">{welcomeCopy.carried}</p> : null}

      <div className="grid gap-2">
        <label htmlFor={ids.date} className="font-semibold text-[1rem] text-ink-900">
          {welcomeCopy.date.label}
        </label>
        <input
          id={ids.date}
          name="date"
          type="date"
          min="1800-01-01"
          max={today}
          required
          autoComplete="off"
          className="field-input"
          value={date}
          aria-invalid={fieldError === 'date' || undefined}
          aria-describedby={describedBy('date')}
          onChange={(e) => setDate(e.target.value)}
        />
        {fieldErrorText('date')}
        <p id={`${ids.date}-help`} className="type-caption text-ink-500">
          {welcomeCopy.date.help}
        </p>
      </div>

      <div className="grid gap-3">
        {unknownTime ? (
          <p className="rounded-sm border border-ink-200 bg-surface-200 p-4 type-body-sm text-ink-700">{welcomeCopy.unknownTimeNote}</p>
        ) : (
          <div className="grid gap-2">
            <label htmlFor={ids.time} className="font-semibold text-[1rem] text-ink-900">
              {welcomeCopy.time.label}
            </label>
            <input
              id={ids.time}
              name="time"
              type="time"
              required
              autoComplete="off"
              className="field-input"
              value={time}
              aria-invalid={fieldError === 'time' || undefined}
              aria-describedby={describedBy('time')}
              onChange={(e) => setTime(e.target.value)}
            />
            {fieldErrorText('time')}
            <p id={`${ids.time}-help`} className="type-caption text-ink-500">
              {welcomeCopy.time.help}
            </p>
          </div>
        )}
        <label htmlFor={ids.unknown} className="inline-flex min-h-touch cursor-pointer items-center gap-3 text-ink-900">
          <input
            id={ids.unknown}
            name="time_unknown"
            type="checkbox"
            className="size-5 accent-cobalt-600"
            checked={unknownTime}
            onChange={(e) => setUnknownTime(e.target.checked)}
          />
          {welcomeCopy.unknownTime}
        </label>
      </div>

      <div className="grid gap-2">
        <label htmlFor={ids.place} className="font-semibold text-[1rem] text-ink-900">
          {welcomeCopy.place.label}
        </label>
        <PlaceCombobox
          // Remounted once when carried details arrive, so the field shows the carried place.
          key={carried ? 'carried' : 'fresh'}
          id={ids.place}
          selected={place}
          onSelect={setPlace}
          invalid={fieldError === 'place'}
          describedBy={describedBy('place')}
        />
        {fieldErrorText('place')}
        <p id={`${ids.place}-help`} className="type-caption text-ink-500">
          {welcomeCopy.place.help}
        </p>
        {/* The picked place only; the typed search text never reaches the action. */}
        <input type="hidden" name="place_label" value={place?.label ?? ''} />
        <input type="hidden" name="lat" value={place ? String(place.lat) : ''} />
        <input type="hidden" name="lon" value={place ? String(place.lon) : ''} />
      </div>

      {choices ? (
        <div className="grid gap-6 rounded-sm border border-ink-200 bg-surface-100 p-5">
          <h2 className="type-heading-3 text-ink-900">{welcomeCopy.chooseHeading}</h2>
          {PICK_BODIES.map((body) => {
            const pair = choices[body];
            if (!pair) return null;
            const bodyName = resultCopy.bodies[body];
            return (
              <fieldset key={body} className="grid gap-3">
                <legend className="mb-2 text-ink-700">{welcomeCopy.choose(bodyName)}</legend>
                {pair.map((sign) => (
                  <label key={sign} className="flex min-h-touch cursor-pointer gap-3 rounded-sm border border-ink-200 p-4 text-ink-700 has-[:checked]:border-cobalt-600">
                    <input
                      type="radio"
                      name={`pick_${body}`}
                      value={sign}
                      required
                      className="mt-1 size-5 shrink-0 accent-cobalt-600"
                      checked={picks[body] === sign}
                      onChange={() => setPicks((p) => ({ ...p, [body]: sign }))}
                    />
                    <span>
                      <span className="font-semibold text-ink-900">{SIGNS[sign].name}.</span> {signLine(body, sign)?.line}
                    </span>
                  </label>
                ))}
              </fieldset>
            );
          })}
          <p className="type-caption text-ink-500">{welcomeCopy.chooseNote}</p>
        </div>
      ) : null}

      {errorCode && !fieldError ? (
        <p role="alert" className="text-ember-500">
          {welcomeCopy.errors[errorCode]}
        </p>
      ) : null}
      {fieldError ? (
        <p role="alert" className="sr-only">
          {welcomeCopy.errors[errorCode!]}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? welcomeCopy.submitting : choices ? welcomeCopy.chooseSubmit : edit ? welcomeCopy.submitEdit : welcomeCopy.submit}
        </Button>
        {edit ? (
          <Button href="/account" variant="tertiary">
            {welcomeCopy.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
