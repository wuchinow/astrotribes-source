'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { errorCopy, formCopy } from '@/content/chart';

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

type Status = 'idle' | 'searching' | 'done' | 'down' | 'off' | 'limited';

interface PlaceComboboxProps {
  id: string;
  selected: Place | null;
  onSelect: (place: Place | null) => void;
  invalid: boolean;
  /** Ids of the help and error text. */
  describedBy: string;
}

/**
 * The birthplace field: a WAI-ARIA 1.2 combobox over our own /api/place (never Geoapify from the
 * browser). Waits 300ms after typing, needs 3 characters, and cancels a stale search. Arrow keys
 * move through the list, Enter picks, Escape closes. The text lives in this component's state only.
 */
export function PlaceCombobox({ id, selected, onSelect, invalid, describedBy }: PlaceComboboxProps) {
  const listId = useId();
  const statusId = useId();
  const [text, setText] = useState(selected?.label ?? '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<Status>('idle');
  const inflight = useRef<AbortController | null>(null);

  // Search once typing pauses. Only the timer's callback sets state.
  useEffect(() => {
    if (query.length < MIN_CHARS) return;
    const timer = setTimeout(async () => {
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      setStatus('searching');
      try {
        const response = await fetch('/api/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: query }),
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = (await response.json()) as { results?: Place[]; error?: string };
        if (!response.ok || !data.results) {
          setResults([]);
          setOpen(false);
          setStatus(
            data.error === 'not_configured' ? 'off' : data.error === 'rate_limited' ? 'limited' : 'down',
          );
          return;
        }
        setResults(data.results);
        setActive(-1);
        setOpen(true);
        setStatus('done');
      } catch (error) {
        if ((error as { name?: string }).name !== 'AbortError') setStatus('down');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => () => inflight.current?.abort(), []);

  const change = (value: string) => {
    setText(value);
    if (selected) onSelect(null);
    const trimmed = value.trim();
    inflight.current?.abort();
    if (trimmed.length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      setStatus('idle');
    }
    setQuery(trimmed);
  };

  const pick = (place: Place) => {
    setText(place.label);
    setQuery('');
    setResults([]);
    setOpen(false);
    setActive(-1);
    setStatus('idle');
    onSelect(place);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (results.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      if (results.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      if (open && active >= 0 && results[active]) {
        event.preventDefault();
        pick(results[active]);
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    }
  };

  const expanded = open && results.length > 0;
  const optionId = (i: number) => `${listId}-option-${i}`;
  const message =
    status === 'searching'
      ? formCopy.place.searching
      : status === 'done'
        ? results.length > 0
          ? formCopy.place.count(results.length)
          : formCopy.place.none
        : status === 'down'
          ? errorCopy.place_down
          : status === 'off'
            ? errorCopy.place_off
            : status === 'limited'
              ? errorCopy.rate_limited
              : '';
  const visibleMessage = status === 'done' && results.length > 0 ? '' : status === 'searching' ? '' : message;

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        aria-describedby={`${describedBy} ${statusId}`}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        className="field-input"
        value={text}
        onChange={(event) => change(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        onFocus={() => results.length > 0 && !selected && setOpen(true)}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={formCopy.place.label}
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-sm border border-ink-500 bg-surface-000 py-1 shadow-warm"
      >
        {results.map((place, i) => (
          <li
            key={`${place.label}-${i}`}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            // Keep focus in the field, so a click reads like Enter.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(place)}
            className={cn(
              'flex min-h-touch cursor-pointer items-center px-3 py-2 text-[1rem] text-ink-900',
              i === active ? 'bg-cobalt-100' : 'hover:bg-surface-200',
            )}
          >
            {place.label}
          </li>
        ))}
      </ul>
      <p id={statusId} role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
      {visibleMessage ? (
        <p
          className={cn(
            'mt-2 type-caption',
            status === 'done' ? 'text-ink-700' : 'text-ember-500',
          )}
          aria-hidden="true"
        >
          {visibleMessage}
        </p>
      ) : null}
    </div>
  );
}
