// The free chart's details on their way into an account (2c; brief: "in the browser with consent,
// saved only then"). Kept in this tab's sessionStorage only after the visitor presses Save this
// chart, never sent anywhere by this file, never in a cookie or a URL, and cleared once saved, on
// sign-out, or after an hour. Every read and write is guarded: storage can be off or full.

export const CARRY_KEY = 'at-carry';
const MAX_AGE_MS = 60 * 60 * 1000;

export interface Carried {
  date: string;
  /** Null when the time is unknown. */
  time: string | null;
  place: { label: string; lat: number; lon: number };
}

export const keepCarry = (details: Carried): boolean => {
  try {
    sessionStorage.setItem(CARRY_KEY, JSON.stringify({ ...details, at: Date.now() }));
    return true;
  } catch {
    return false;
  }
};

export const clearCarry = (): void => {
  try {
    sessionStorage.removeItem(CARRY_KEY);
  } catch {
    // Nothing to clear.
  }
};

const isCarried = (value: unknown): value is Carried & { at: number } => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const place = v.place as Record<string, unknown> | undefined;
  return (
    typeof v.at === 'number' &&
    typeof v.date === 'string' &&
    (v.time === null || typeof v.time === 'string') &&
    typeof place?.label === 'string' &&
    typeof place.lat === 'number' &&
    typeof place.lon === 'number'
  );
};

/** The carried details, or null when there are none, they are malformed, or they are over an hour old. */
export const readCarry = (now = Date.now()): Carried | null => {
  try {
    const raw = sessionStorage.getItem(CARRY_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isCarried(value) || now - value.at > MAX_AGE_MS) {
      clearCarry();
      return null;
    }
    return { date: value.date, time: value.time, place: value.place };
  } catch {
    return null;
  }
};
