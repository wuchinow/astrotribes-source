// Saved birth details (2c): reading the welcome form and turning the engine's chart into placement
// rows. Pure, with no engine import (only its types), so the action that runs the engine stays the
// one place it is reached. Nothing here logs, and errors are codes that never carry a value.
import { checkChartFields, type ChartRequest, type ChartRequestError } from './chart-request';
import { SIGN_IDS, type SignId } from './keys';
import type { Chart } from './engine/types';

/** The bodies a member picks a sign for on a day it changed, when the time is unknown (U12). */
export const PICK_BODIES = ['sun', 'moon'] as const;
export type PickBody = (typeof PICK_BODIES)[number];
export type Picks = Partial<Record<PickBody, SignId>>;
export type Choices = Partial<Record<PickBody, readonly [SignId, SignId]>>;

export interface BirthDetails extends ChartRequest {
  /** The place as the member picked it from the search, for the account page. */
  label: string;
  picks: Picks;
}

export type BirthErrorCode =
  | ChartRequestError
  | 'invalid_pick'
  | 'out_of_range'
  | 'too_soon'
  | 'limit'
  | 'failed';

export type BirthFormState =
  | { status: 'idle' }
  | { status: 'error'; code: BirthErrorCode }
  | { status: 'choose'; choices: Choices };

const MAX_LABEL = 200;
const isSign = (value: unknown): value is SignId => (SIGN_IDS as readonly unknown[]).includes(value);
const text = (form: FormData, name: string): string | null => {
  const value = form.get(name);
  return typeof value === 'string' ? value : null;
};

/** The welcome form's fields: date, time (or unknown), lat, lon, place label, and any picks. */
export const parseBirthForm = (
  form: FormData,
): { ok: true; value: BirthDetails } | { ok: false; code: BirthErrorCode } => {
  const unknown = text(form, 'time_unknown') === 'on';
  const lat = Number(text(form, 'lat'));
  const lon = Number(text(form, 'lon'));
  const checked = checkChartFields({
    date: text(form, 'date'),
    time: unknown ? null : text(form, 'time'),
    lat: text(form, 'lat') ? lat : null,
    lon: text(form, 'lon') ? lon : null,
  });
  if (!checked.ok) return checked;
  const label = text(form, 'place_label')?.trim() ?? '';
  if (label.length < 1 || label.length > MAX_LABEL) return { ok: false, code: 'invalid_place' };
  const picks: Picks = {};
  for (const body of PICK_BODIES) {
    const pick = text(form, `pick_${body}`);
    if (pick === null || pick === '') continue;
    if (!isSign(pick)) return { ok: false, code: 'invalid_pick' };
    picks[body] = pick;
  }
  return { ok: true, value: { ...checked.value, label, picks } };
};

/** The Sun and Moon pairs still waiting for the member's pick. Empty when nothing is uncertain. */
export const choicesNeeded = (chart: Chart, picks: Picks): Choices => {
  const choices: Choices = {};
  for (const body of PICK_BODIES) {
    const pair = chart.placements[body].signCandidates;
    if (pair && !(picks[body] && pair.includes(picks[body]))) choices[body] = pair;
  }
  return choices;
};

export interface PlacementRow {
  user_id: string;
  body: string;
  sign: SignId;
  sign_alternate: SignId | null;
  house: number | null;
  degree: number;
  minute: number;
  retrograde: boolean;
  engine_version: string;
  computed_at: string;
}

/**
 * One row per body the chart has (no rising row without a time). On a day a body changed sign,
 * `sign` is the member's pick for the Sun and the Moon, and the engine's own sign for the rest; the
 * other candidate is `sign_alternate`. A pick the engine did not land on takes the edge of that
 * sign: the earlier sign at 29°59', the later at 0°00', since the day began in one and ended in
 * the other. Only call this once choicesNeeded is empty.
 */
export const placementRows = (chart: Chart, picks: Picks, userId: string, now = new Date()): PlacementRow[] =>
  Object.values(chart.placements).flatMap((placement) => {
    if (!placement) return [];
    const pair = placement.signCandidates;
    const picked = (PICK_BODIES as readonly string[]).includes(placement.body)
      ? picks[placement.body as PickBody]
      : undefined;
    const sign = pair && picked && pair.includes(picked) ? picked : placement.sign;
    const moved = sign !== placement.sign;
    return [
      {
        user_id: userId,
        body: placement.body,
        sign,
        sign_alternate: pair ? (pair[0] === sign ? pair[1] : pair[0]) : null,
        house: placement.house,
        degree: moved ? (sign === pair![0] ? 29 : 0) : placement.degree,
        minute: moved ? (sign === pair![0] ? 59 : 0) : placement.minute,
        retrograde: placement.retrograde,
        engine_version: `${chart.engine.id}@${chart.engine.version}`.slice(0, 64),
        computed_at: now.toISOString(),
      },
    ];
  });
