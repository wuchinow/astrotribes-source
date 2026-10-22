// The chart engine. Server-only (invariant 4): a client component that imports it fails the build,
// and tests/engine/boundary.test.ts checks that none does. Callers use these three functions and
// the types; the ephemeris behind them (lib/engine/port.ts) can change without touching a caller.
import 'server-only';
import { computeChartWith, keyPlacement } from './chart';
import { skyNowWith } from './sky';
import { swissEphemeris } from './swisseph';
import type { BirthInput, Chart, Sky } from './types';

export const computeChart = (birth: BirthInput): Chart => computeChartWith(swissEphemeris, birth);

export const skyNow = (date?: Date): Sky => skyNowWith(swissEphemeris, date);

export { keyPlacement };
export { TALLY_BODIES } from './zodiac';
export { EngineError, SKY_BODY_IDS } from './types';
export type {
  BirthInput,
  Chart,
  EngineErrorCode,
  HouseSystem,
  Ingress,
  KeyValue,
  LocalTimeNote,
  MoonPhase,
  Placement,
  Point,
  Sky,
  SkyBody,
  SkyBodyId,
} from './types';
