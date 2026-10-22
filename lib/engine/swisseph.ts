// Swiss Ephemeris through the sweph binding. The only file that imports sweph.
// Licence: AGPL-3.0 (or the Swiss Ephemeris Professional License). See lib/engine/ephe/README.md.
import path from 'node:path';
import { calc_ut, constants as C, fixstar2_ut, houses_ex2, set_ephe_path, version } from 'sweph';
import type { BodyPosition, Ephemeris, EphemerisBody, HouseResult } from './port';
import { EngineError } from './types';

const EPHE_PATH = path.join(process.cwd(), 'lib/engine/ephe');

const BODY: Record<EphemerisBody, number> = {
  sun: C.SE_SUN,
  moon: C.SE_MOON,
  mercury: C.SE_MERCURY,
  venus: C.SE_VENUS,
  mars: C.SE_MARS,
  jupiter: C.SE_JUPITER,
  saturn: C.SE_SATURN,
  uranus: C.SE_URANUS,
  neptune: C.SE_NEPTUNE,
  pluto: C.SE_PLUTO,
  chiron: C.SE_CHIRON,
  northNode: C.SE_TRUE_NODE,
};

const FLAGS = C.SEFLG_SWIEPH | C.SEFLG_SPEED;

let ready = false;
const init = () => {
  if (!ready) {
    set_ephe_path(EPHE_PATH);
    ready = true;
  }
};

/** Swiss Ephemeris answers with the Moshier model when a file is missing, and has no Chiron without one. We refuse that. */
const requireSwissFiles = (flag: number) => {
  if (flag < 0 || (flag & C.SEFLG_SWIEPH) === 0) throw new EngineError('ephemeris_unavailable');
};

export const swissEphemeris: Ephemeris = {
  id: 'swiss-ephemeris',
  version: version(),

  position(jdUt: number, body: EphemerisBody): BodyPosition {
    init();
    const result = calc_ut(jdUt, BODY[body], FLAGS);
    requireSwissFiles(result.flag);
    return { longitude: result.data[0], speed: result.data[3] };
  },

  houses(jdUt: number, lat: number, lon: number): HouseResult {
    init();
    const result = houses_ex2(jdUt, 0, lat, lon, 'P');
    // Inside the polar circles Placidus has no solution; the library answers with Porphyry
    // and a negative flag ("within polar circle, switched to Porphyry").
    const fallback = result.flag < 0;
    const { houses, points } = result.data;
    return {
      cusps: houses.slice(0, 12),
      ascendant: points[0],
      midheaven: points[1],
      system: fallback ? 'porphyry' : 'placidus',
      fallback,
    };
  },

  galacticCenter(jdUt: number): number {
    init();
    // "Galactic Center" in sefstars.txt: Sgr A*, ICRS, with its proper motion.
    const result = fixstar2_ut('Galactic Center', jdUt, FLAGS);
    if (result.flag < 0) throw new EngineError('ephemeris_unavailable');
    return result.data[0];
  },
};
