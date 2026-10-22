'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { appearanceCopy } from '@/content/appearance';
import { applyAppearance, readAppearance, subscribeAppearance } from '@/lib/appearance';
import { IconTip } from './IconTip';

// The mood lives on <html data-theme>, set before first paint by the head script (lib/appearance.ts).
// This switch reads it and writes the visitor's choice into the same at-appearance cookie
// the Appearance panel uses, so the two stay in sync.

const readTheme = () => (document.documentElement.getAttribute('data-theme') === 'night' ? 'night' : 'paper');

/** `tooltip`: show the name above the icon on hover and keyboard focus (the footer, 1h). */
export function MoodToggle({ tooltip = false }: { tooltip?: boolean }) {
  const mood = useSyncExternalStore(subscribeAppearance, readTheme, () => null);

  function toggle() {
    applyAppearance({ ...readAppearance(), mood: readTheme() === 'night' ? 'paper' : 'night' });
  }

  // A toggle switch (David, Oct 21): a pill track showing both the sun (Paper, left) and the moon
  // (Night, right), with a knob behind the active one. The knob's place and the icons' colors come
  // from CSS on <html data-theme>, so nothing flashes before hydration; the 44px button around the
  // track is the touch target.
  const button = (
    <button
      type="button"
      role="switch"
      onClick={toggle}
      aria-checked={mood === 'night'}
      className="group/mood inline-flex min-h-touch shrink-0 items-center rounded-pill px-0.5"
    >
      <span
        aria-hidden="true"
        className="relative inline-flex h-8 w-[3.75rem] items-center justify-between rounded-pill border border-ink-200 bg-surface-200 px-[3px] transition-colors duration-200 group-hover/mood:border-ink-500"
      >
        <span className="absolute top-[2px] left-[2px] size-[26px] rounded-pill bg-surface-000 shadow-rest transition-transform duration-200 night:translate-x-[26px] night:bg-ink-900 motion-reduce:transition-none" />
        <span className="relative inline-flex size-[26px] items-center justify-center text-ink-900 night:text-ink-500">
          <Sun size={15} strokeWidth={1.75} />
        </span>
        <span className="relative inline-flex size-[26px] items-center justify-center text-ink-500 night:text-surface-100">
          <Moon size={15} strokeWidth={1.75} />
        </span>
      </span>
      <span className="sr-only">{NAME}</span>
    </button>
  );
  if (!tooltip) return button;
  return (
    <span className="group/tip relative inline-flex">
      {button}
      <IconTip>{NAME}</IconTip>
    </span>
  );
}

const NAME = appearanceCopy.moodToggle;
