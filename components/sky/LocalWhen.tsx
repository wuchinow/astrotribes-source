'use client';

import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/** The visitor's IANA time zone, or null on the server and during hydration. */
export const useVisitorZone = () =>
  useSyncExternalStore(noSubscribe, () => Intl.DateTimeFormat().resolvedOptions().timeZone, () => null);

/** The visitor's calendar date, 'YYYY-MM-DD', or null on the server and during hydration. */
export const useVisitorDate = () =>
  useSyncExternalStore(noSubscribe, () => new Date().toLocaleDateString('en-CA'), () => null);

/** A calendar date in a time zone, 'YYYY-MM-DD' (en-CA writes dates that way). */
export const dateIn = (at: string, zone: string) => new Date(at).toLocaleDateString('en-CA', { timeZone: zone });

interface LocalWhenProps {
  /** ISO UTC instant. */
  at: string;
  /** A day ("Tue, Oct 27") or a day and a time ("Tue, Oct 27, 4:05 PM"). */
  show?: 'day' | 'time';
}

const OPTIONS = {
  day: { weekday: 'short', month: 'short', day: 'numeric' },
  time: { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/**
 * A moment in the visitor's own time zone. The page is built on the server once an hour, so it is
 * first written in UTC (and says so); after hydration it is the browser's zone.
 */
export function LocalWhen({ at, show = 'time' }: LocalWhenProps) {
  const zone = useVisitorZone();
  const text = new Intl.DateTimeFormat('en-US', { ...OPTIONS[show], timeZone: zone ?? 'UTC' }).format(new Date(at));
  return (
    <time dateTime={at}>
      {text}
      {zone === null && show === 'time' ? ' UTC' : null}
    </time>
  );
}
