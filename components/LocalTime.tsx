'use client';

// A post, reply, or message time in the reader's own time zone. The server does not know the reader's
// zone, so it renders the date alone (in UTC); once hydrated, the browser shows the date and time in
// its own zone. useSyncExternalStore gives the server value during hydration and the local one after,
// so there is no mismatch warning.
import { useSyncExternalStore } from 'react';

const FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };

const subscribe = () => () => {};

export function LocalTime({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => new Date(iso).toLocaleString('en-US', FORMAT),
    () => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  );
  return <time dateTime={iso}>{text}</time>;
}
