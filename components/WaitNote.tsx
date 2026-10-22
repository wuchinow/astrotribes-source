'use client';

import { useSyncExternalStore } from 'react';
import { welcomeCopy } from '@/content/welcome';

const HOUR_MS = 60 * 60 * 1000;
const noSubscribe = () => () => {};

/**
 * On the birth details step when editing: says when the next change is allowed, on the visitor's
 * own clock, while 0002's one change an hour still holds. Nothing on the server, which has no clock
 * of the visitor's to format by.
 */
export function WaitNote({ changedAt }: { changedAt: string }) {
  const until = new Date(changedAt).getTime() + HOUR_MS;
  const waiting = useSyncExternalStore(noSubscribe, () => Date.now() < until, () => false);
  if (!waiting) return null;
  const time = new Date(until).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return <p className="mt-4 rounded-sm border border-ink-200 bg-surface-200 p-4 type-body-sm text-ink-700">{welcomeCopy.waitNote(time)}</p>;
}
