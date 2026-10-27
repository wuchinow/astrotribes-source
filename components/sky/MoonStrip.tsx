'use client';

import { skyCopy } from '@/content/sky';
import { cn } from '@/lib/cn';
import type { Lunation, MoonDay } from '@/lib/today-sky';
import { LocalWhen, dateIn, useVisitorDate, useVisitorZone } from './LocalWhen';
import { MoonDisc } from './MoonDisc';

const dayCount = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

const weekday = (date: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const dayOfMonth = (date: string) => Number(date.slice(8));

interface MoonStripProps {
  /** Twelve days from the day before the UTC date, so any visitor's local today is in reach. */
  days: readonly MoonDay[];
  lunations: readonly Lunation[];
  /** How many days to show. */
  length: number;
}

/**
 * The Moon's next ten days, starting from the visitor's own today. The server writes the strip from
 * the UTC date; after hydration it moves by a day either way when the visitor's date differs.
 */
export function MoonStrip({ days, lunations, length }: MoonStripProps) {
  // The server's UTC strip until hydration, then the visitor's own zone and date.
  const zone = useVisitorZone() ?? 'UTC';
  const today = useVisitorDate() ?? days.find((day) => day.today)!.date;
  const start = Math.max(0, days.findIndex((day) => day.date === today));
  const shown = days.slice(start, start + length);
  const { moonDays: copy } = skyCopy;

  return (
    <div>
      <ol className="grid grid-cols-5 gap-x-2 gap-y-4 sm:grid-cols-10">
        {shown.map((day) => {
          const isToday = day.date === today;
          return (
            <li
              key={day.date}
              aria-current={isToday ? 'date' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center',
                isToday && 'outline-1 outline-on-night-soft',
              )}
            >
              <span className="type-caption text-on-night-soft">{isToday ? copy.today : weekday(day.date)}</span>
              <MoonDisc illumination={day.illumination} waning={day.waning} size={28} className="text-on-night" />
              <span className="type-caption text-on-night">{dayOfMonth(day.date)}</span>
              <span className="sr-only">{skyCopy.phases[day.phase]}</span>
            </li>
          );
        })}
      </ol>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {lunations.map((lunation) => (
          <li key={lunation.kind} className="type-body-sm text-on-night-soft">
            <span className="font-semibold text-on-night">{copy.next[lunation.kind]}</span>{' '}
            {copy.inDays(dayCount(today, dateIn(lunation.at, zone)))}
            {' · '}
            <LocalWhen at={lunation.at} show="day" />
          </li>
        ))}
      </ul>
    </div>
  );
}
