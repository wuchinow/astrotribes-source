'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { tuneCopy as copy } from '@/content/tune';
import { cn } from '@/lib/cn';
import {
  DEFAULT_TUNE,
  TOKENS_VERSION,
  applyTune,
  clearTune,
  copyValues,
  readTuneCookie,
  resolveTune,
  suggestions,
  type NightButton,
  type TuneSettings,
} from '@/lib/tune';

const legend = 'mb-2 font-body text-[1rem] font-semibold text-ink-900';
const small = 'text-[0.875rem] leading-snug text-ink-500';

/**
 * Tune (1f): the team's section of the Appearance panel, loaded as its own chunk only after the
 * server confirms the preview passcode. Every change paints at once and is saved in at-tune
 * (lib/tune.ts); at the default settings there is no cookie and the site is the design system.
 * No contrast readouts (1i): David accepts the contrast risk while tuning, and settled values are
 * checked when they become design-system tokens.
 */
export default function TuneSection() {
  const uid = useId();
  const [settings, setSettings] = useState<TuneSettings>(() => readTuneCookie() ?? DEFAULT_TUNE);
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState<string | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  const change = (patch: Partial<TuneSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applyTune(next);
    setStatus('');
  };

  useEffect(() => {
    if (fallback) fallbackRef.current?.select();
  }, [fallback]);

  async function onCopy() {
    const text = copyValues(
      settings,
      copy.copy.summary({ date: new Date().toISOString().slice(0, 10), version: TOKENS_VERSION, ...settings }),
    );
    try {
      await navigator.clipboard.writeText(text);
      setFallback(null);
      setStatus(copy.copy.done);
    } catch {
      setFallback(text);
      setStatus(copy.copy.fallback);
    }
  }

  function onRestore() {
    clearTune();
    setSettings(DEFAULT_TUNE);
    setFallback(null);
    setStatus(copy.restored);
  }

  const resolved = resolveTune(settings);

  return (
    <details className="group border-t border-ink-200 pt-3">
      <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 type-ui text-cobalt-600 [&::-webkit-details-marker]:hidden">
        {copy.summary}
        <span aria-hidden="true" className="text-[1.25rem] leading-none transition-transform duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="grid gap-5 pt-2">
        <p className={small}>{copy.intro}</p>

        <fieldset>
          <legend className={legend}>{copy.temperature.legend}</legend>
          <div className="grid gap-3">
            {(['paper', 'night'] as const).map((m) => {
              const key = m === 'paper' ? 'tp' : 'tn';
              const value = settings[key];
              return (
                <Slider
                  key={m}
                  id={`${uid}-t-${m}`}
                  label={copy.temperature.label(m)}
                  min={-10}
                  max={10}
                  step={1}
                  value={value}
                  display={copy.temperature.value(value)}
                  valueText={copy.temperature.valueText(value)}
                  ends={copy.temperature.ends}
                  onChange={(v) => change({ [key]: v })}
                />
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>{copy.accent.legend}</legend>
          <div className="grid gap-3">
            <Slider
              id={`${uid}-a-paper`}
              label={copy.accent.paper}
              min={0}
              max={359}
              step={1}
              value={settings.ap}
              display={copy.accent.value(settings.ap)}
              valueText={copy.accent.valueText(settings.ap)}
              swatch={resolved.paper['button-primary']}
              onChange={(v) => change({ ap: v })}
            />
            <Slider
              id={`${uid}-a-night`}
              label={copy.accent.night}
              min={0}
              max={359}
              step={1}
              value={settings.an}
              display={copy.accent.value(settings.an)}
              valueText={copy.accent.valueText(settings.an)}
              swatch={resolved.night.highlight}
              onChange={(v) => change({ an: v })}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>{copy.nightButton.legend}</legend>
          <div className="grid">
            {(['c', 'a', 'p'] as const satisfies readonly NightButton[]).map((nb) => (
              <label
                key={nb}
                className="flex min-h-touch cursor-pointer items-center gap-3 rounded-sm px-2 text-[1rem] text-ink-900 hover:bg-surface-200"
              >
                <input
                  type="radio"
                  name={`${uid}-nb`}
                  value={nb}
                  checked={settings.nb === nb}
                  onChange={() => change({ nb })}
                  className="size-5 accent-cobalt-600"
                />
                {copy.nightButton.options[nb]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>{copy.suggestions.legend}</legend>
          <ul className="grid grid-cols-2 gap-2">
            {suggestions().map((s) => {
              const name = copy.suggestions.names[s.id];
              const preview = resolveTune({ ...settings, ap: s.ap, an: s.an });
              const active = settings.ap === s.ap && settings.an === s.an;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`${copy.suggestions.label(name, s.ap, s.an)}${s.warn ? `. ${copy.suggestions.warn[s.warn]}` : ''}`}
                    onClick={() => change({ ap: s.ap, an: s.an })}
                    className={cn(
                      'flex min-h-touch w-full items-center gap-2 rounded-sm border px-2 py-1 text-left text-[0.8125rem] leading-tight text-ink-900 hover:bg-surface-200',
                      active ? 'border-cobalt-600 bg-cobalt-100' : 'border-ink-200',
                    )}
                  >
                    <span aria-hidden="true" className="flex shrink-0 overflow-hidden rounded-sm border border-ink-200">
                      <span className="block size-5" style={{ background: preview.paper['button-primary'] }} />
                      <span className="block size-5" style={{ background: preview.night.highlight }} />
                    </span>
                    <span aria-hidden="true">
                      {name}
                      {s.warn ? <span className="block text-ink-500">{s.warn === 'cobalt' ? 'near cobalt' : 'near ember'}</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="grid gap-2 border-t border-ink-200 pt-3">
          <div className="flex flex-wrap gap-x-4">
            <button
              type="button"
              onClick={onCopy}
              className="-ml-2 inline-flex min-h-touch items-center px-2 type-ui text-cobalt-600 underline-offset-4 hover:underline"
            >
              {copy.copy.button}
            </button>
            <button
              type="button"
              onClick={onRestore}
              aria-label={copy.restoreName}
              className="inline-flex min-h-touch items-center px-2 type-ui text-cobalt-600 underline-offset-4 hover:underline"
            >
              {copy.restore}
            </button>
          </div>
          <p role="status" className={small}>
            {status}
          </p>
          {fallback ? (
            <textarea
              ref={fallbackRef}
              readOnly
              aria-label={copy.copy.button}
              value={fallback}
              rows={8}
              className="w-full rounded-sm border border-ink-500 bg-surface-000 p-2 font-mono text-[0.75rem] text-ink-900"
            />
          ) : null}
        </div>
      </div>
    </details>
  );
}

interface SliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  valueText: string;
  ends?: readonly [string, string];
  swatch?: string;
  onChange: (value: number) => void;
}

function Slider({ id, label, min, max, step, value, display, valueText, ends, swatch, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.9375rem] text-ink-900">
          {label}
        </label>
        <span className="flex items-center gap-2">
          {swatch ? <span aria-hidden="true" className="inline-block size-4 rounded-sm border border-ink-200" style={{ background: swatch }} /> : null}
          <output htmlFor={id} className="type-data-sm text-ink-700">
            {display}
          </output>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="block min-h-touch w-full accent-cobalt-600"
      />
      {ends ? (
        <div aria-hidden="true" className="-mt-2 flex justify-between text-[0.75rem] text-ink-500">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      ) : null}
    </div>
  );
}
