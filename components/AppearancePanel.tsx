'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Suspense, lazy, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { appearanceCopy as copy } from '@/content/appearance';
import type { WashId } from '@/lib/art';
import {
  TEXT_STEPS,
  applyAppearance,
  parseAppearance,
  readAppearance,
  resetAppearance,
  serializeAppearance,
  subscribeAppearance,
  type Appearance,
  type ArtChoice,
  type MoodChoice,
  type TextStep,
  type WashStep,
} from '@/lib/appearance';
import { cn } from '@/lib/cn';
import { clearTuneCookie } from '@/lib/tune-cookie';
import { IconTip } from './IconTip';

/** Tune (1f) is its own chunk, fetched only after the server says this visitor holds the passcode. */
const TuneSection = lazy(() => import('./TuneSection'));

let tuneCheck: Promise<boolean> | null = null;
/**
 * Ask the server once per page load whether Tune may show. A no also clears any tune left on this
 * device (a lapsed or changed passcode); a failed request shows nothing and clears nothing.
 */
function checkTune(): Promise<boolean> {
  tuneCheck ??= fetch('/api/preview', { cache: 'no-store', credentials: 'same-origin' })
    .then((response) => (response.ok ? (response.json() as Promise<{ tune?: unknown }>) : null))
    .then((body) => {
      if (body && body.tune === false) clearTuneCookie();
      return body?.tune === true;
    })
    .catch(() => false);
  return tuneCheck;
}

/** Only one of the header's panels (this, the mobile menu) is open at a time. */
export const DISCLOSURE_EVENT = 'at:disclosure';

const snapshot = () => serializeAppearance(readAppearance());

/** A wash as the panel offers it, prepared on the server (lib/art-assets.ts, swatchList). */
export interface SwatchData {
  id: WashId;
  name: string;
  alt: string;
  avif: string;
  webp: string;
  width: number;
  height: number;
}

interface AppearancePanelProps {
  swatches: readonly SwatchData[];
  /** Below the header button, above the footer's, or in the flow under the button (the mobile menu). */
  placement?: 'below' | 'above' | 'inline';
  /** Show the word beside the icon (the mobile menu). */
  labelled?: boolean;
  /**
   * A small tooltip with the button's name on hover and keyboard focus, for an icon-only button
   * (the footer). It repeats the accessible name, so it is hidden from assistive tech.
   */
  tooltip?: boolean;
  /**
   * The disclosure group it opens under (the mobile menu's id), so opening it does not close the
   * menu it sits in. Its own id otherwise.
   */
  group?: string;
}

/**
 * The Appearance control: a button and a non-modal panel of native controls (mood, painting, wash
 * strength, text size, restore defaults, and Tune for the team behind the passcode). Every change applies at once and is saved in the at-appearance
 * cookie (lib/appearance.ts). Escape or a click outside closes it and focus returns to the button.
 */
export function AppearancePanel({
  swatches,
  placement = 'below',
  labelled = false,
  tooltip = false,
  group,
}: AppearancePanelProps) {
  const uid = useId();
  const disclosureId = group ?? uid;
  const panelId = `${uid}-panel`;
  const pathname = usePathname();
  // Remembering where it was opened closes it on a new page without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const button = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);

  const serialized = useSyncExternalStore(subscribeAppearance, snapshot, () => null);
  const settings = parseAppearance(serialized);
  const [tune, setTune] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    checkTune().then((ok) => {
      if (live) setTune(ok);
    });
    return () => {
      live = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const returnFocus = () => {
      if (container.current?.contains(document.activeElement)) button.current?.focus({ preventScroll: true });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      button.current?.focus({ preventScroll: true });
      setOpenOn(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (container.current?.contains(event.target as Node)) return;
      returnFocus();
      setOpenOn(null);
    };
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== disclosureId) setOpenOn(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener(DISCLOSURE_EVENT, onOther);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener(DISCLOSURE_EVENT, onOther);
    };
  }, [open, disclosureId]);

  function toggle() {
    if (open) {
      setOpenOn(null);
      return;
    }
    window.dispatchEvent(new CustomEvent(DISCLOSURE_EVENT, { detail: disclosureId }));
    setOpenOn(pathname);
  }

  // Read the live settings from <html>, not this render's snapshot, so quick changes never undo each other.
  const change = (patch: Partial<Appearance>) => applyAppearance({ ...readAppearance(), ...patch });

  return (
    <div
      ref={container}
      data-appearance-open={open || undefined}
      className={cn(placement === 'below' ? 'md:relative' : 'relative', tooltip && 'group/tip')}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={cn(
          'inline-flex min-h-touch items-center justify-center gap-2 rounded-pill transition-colors duration-200',
          labelled
            ? 'px-2 type-body-sm text-cobalt-600 underline-offset-4 hover:underline'
            : 'size-touch text-ink-700 hover:bg-surface-200 hover:text-ink-900',
        )}
      >
        <SlidersHorizontal aria-hidden="true" size={labelled ? 20 : 22} strokeWidth={1.5} />
        <span className={labelled ? undefined : 'sr-only'}>{copy.button}</span>
      </button>
      {tooltip && !open ? <IconTip>{copy.button}</IconTip> : null}

      <section
        id={panelId}
        aria-labelledby={`${uid}-title`}
        hidden={!open}
        className={cn(
          'z-40 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-md border border-ink-200 bg-surface-000 p-5 text-ink-700 shadow-warm',
          placement === 'above'
            ? 'absolute bottom-full right-0 mb-2 w-[22rem] max-w-[calc(100vw-2rem)]'
            : placement === 'inline'
              ? 'mt-2 w-full'
              : 'absolute inset-x-4 top-full md:inset-x-auto md:right-0 md:w-[22rem]',
        )}
      >
        {open ? (
          <PanelBody
            uid={uid}
            tune={tune}
            swatches={swatches}
            settings={settings}
            onChange={change}
            onReset={resetAppearance}
            onClose={() => {
              button.current?.focus({ preventScroll: true });
              setOpenOn(null);
            }}
          />
        ) : null}
      </section>
    </div>
  );
}

interface PanelBodyProps {
  uid: string;
  /** The server confirmed the preview passcode: show Tune. */
  tune: boolean;
  swatches: readonly SwatchData[];
  settings: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
  onReset: () => void;
  onClose: () => void;
}

const legend = 'mb-2 font-body text-[1rem] font-semibold text-ink-900';
const radioRow =
  'flex min-h-touch cursor-pointer items-center gap-3 rounded-sm px-2 text-[1rem] text-ink-900 hover:bg-surface-200';

function PanelBody({ uid, tune, swatches, settings, onChange, onReset, onClose }: PanelBodyProps) {
  const washOff = settings.art === 'none';
  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={`${uid}-title`} className="type-heading-3 text-ink-900">
            {copy.title}
          </h2>
          <p className="mt-1 text-[0.875rem] text-ink-500">{copy.intro}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mt-2 -mr-2 inline-flex size-touch shrink-0 items-center justify-center rounded-pill text-ink-700 hover:bg-surface-200"
        >
          <X aria-hidden="true" size={20} strokeWidth={1.5} />
          <span className="sr-only">{copy.close}</span>
        </button>
      </div>

      <fieldset>
        <legend className={legend}>{copy.mood.legend}</legend>
        <div className="grid">
          {(['paper', 'night', 'device'] as const satisfies readonly MoodChoice[]).map((mood) => (
            <label key={mood} className={radioRow}>
              <input
                type="radio"
                name={`${uid}-mood`}
                value={mood}
                checked={settings.mood === mood}
                onChange={() => onChange({ mood })}
                className="size-5 accent-cobalt-600"
              />
              {copy.mood[mood]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legend}>{copy.painting.legend}</legend>
        <div className="grid grid-cols-3 gap-2">
          <Swatch uid={uid} item="page" checked={settings.art === 'page'} onPick={() => onChange({ art: 'page' })} />
          {swatches.map((item) => (
            <Swatch key={item.id} uid={uid} item={item} checked={settings.art === item.id} onPick={() => onChange({ art: item.id })} />
          ))}
          <Swatch uid={uid} item={null} checked={settings.art === 'none'} onPick={() => onChange({ art: 'none' })} />
        </div>
        <p className="mt-2 text-[0.875rem] text-ink-500">{copy.painting.credit}</p>
      </fieldset>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label htmlFor={`${uid}-wash`} className={cn(legend, 'mb-0')}>
            {copy.wash.label}
          </label>
          <output htmlFor={`${uid}-wash`} className="type-data text-ink-700">
            {copy.wash.value(settings.wash)}
          </output>
        </div>
        <input
          id={`${uid}-wash`}
          type="range"
          min={0}
          max={30}
          step={5}
          value={settings.wash}
          disabled={washOff}
          aria-valuetext={copy.wash.valueText(settings.wash)}
          aria-describedby={washOff ? `${uid}-wash-off` : undefined}
          onChange={(event) => onChange({ wash: Number(event.target.value) as WashStep })}
          className="block min-h-touch w-full accent-cobalt-600 disabled:opacity-45"
        />
        {washOff ? (
          <p id={`${uid}-wash-off`} className="text-[0.875rem] text-ink-500">
            {copy.wash.off}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className={legend}>{copy.text.legend}</legend>
        <div className="grid grid-cols-4 gap-2">
          {TEXT_STEPS.map((step) => (
            <label
              key={step}
              className="relative flex min-h-touch cursor-pointer flex-col items-center justify-end gap-1 rounded-sm border border-ink-200 px-1 py-2 text-ink-900 hover:bg-surface-200 has-[:checked]:border-cobalt-600 has-[:checked]:bg-cobalt-100 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cobalt-400"
            >
              <input
                type="radio"
                name={`${uid}-text`}
                value={step}
                checked={settings.text === step}
                onChange={() => onChange({ text: step as TextStep })}
                className="sr-only"
              />
              <span aria-hidden="true" className="font-display leading-none" style={{ fontSize: `${18 + step * 2}px` }}>
                A
              </span>
              <span className="text-[0.75rem] leading-tight">{copy.text.steps[step]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="border-t border-ink-200 pt-3">
        <button
          type="button"
          onClick={onReset}
          className="-ml-2 inline-flex min-h-touch items-center px-2 type-ui text-cobalt-600 underline-offset-4 hover:underline hover:decoration-gold-500 hover:decoration-2"
        >
          {copy.restore}
        </button>
      </div>

      {tune ? (
        <Suspense fallback={null}>
          <TuneSection />
        </Suspense>
      ) : null}
    </div>
  );
}

interface SwatchProps {
  uid: string;
  /** A wash, or "page" for each page's own painting, or null for None. */
  item: SwatchData | 'page' | null;
  checked: boolean;
  onPick: () => void;
}

function Swatch({ uid, item, checked, onPick }: SwatchProps) {
  const wash = item && item !== 'page' ? item : null;
  const value: ArtChoice = wash ? wash.id : item === 'page' ? 'page' : 'none';
  return (
    <label className="relative flex cursor-pointer flex-col gap-1 rounded-sm p-1 text-center text-[0.75rem] leading-tight text-ink-900 hover:bg-surface-200 has-[:checked]:bg-cobalt-100 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cobalt-400">
      <input type="radio" name={`${uid}-art`} value={value} checked={checked} onChange={onPick} className="sr-only" />
      <span
        aria-hidden={wash ? undefined : true}
        className={cn(
          'block aspect-square w-full overflow-hidden rounded-sm',
          checked ? 'border-2 border-cobalt-600' : 'border border-ink-200',
          !wash && 'bg-surface-100',
          item === 'page' && 'grid grid-cols-2 gap-px bg-ink-200 p-px',
        )}
      >
        {wash ? (
          <picture>
            <source type="image/avif" srcSet={wash.avif} />
            <img src={wash.webp} alt={wash.alt} width={wash.width} height={wash.height} className="size-full object-cover" />
          </picture>
        ) : item === 'page' ? (
          // Four quiet squares: one painting per page, whichever it is.
          <>
            <span className="bg-surface-100" />
            <span className="bg-surface-200" />
            <span className="bg-surface-200" />
            <span className="bg-surface-100" />
          </>
        ) : null}
      </span>
      <span>{wash ? wash.name : item === 'page' ? copy.painting.page : copy.painting.none}</span>
    </label>
  );
}

