// The generational families (4g): when Uranus, Neptune, and Pluto were in each sign, 1850 to 2050,
// for "anyone born between 1996 and 2003 is in your Uranus family" (Dawa's "Planetary Families",
// Oct 23). A local tool, run by hand from repo/: `node scripts/generations.mjs`. Samples each planet
// every two days with the Swiss Ephemeris and writes lib/generations.json. A window runs from the
// planet's first entry into a sign to its last exit, so the back-and-forth of a retrograde year at
// either end belongs to one family (anyone born in it may share the sign). Nothing about anyone.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { calc_ut, constants as C, set_ephe_path } from "sweph";

set_ephe_path(path.join(process.cwd(), "lib/engine/ephe"));
const SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
const PLANETS = {
  uranus: C.SE_URANUS,
  neptune: C.SE_NEPTUNE,
  pluto: C.SE_PLUTO,
};
const START = Date.UTC(1850, 0, 1);
const END = Date.UTC(2050, 11, 31);
const DAY = 86_400_000;
const STEP = 2 * DAY;
const jd = (ms) => ms / DAY + 2440587.5;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const signAt = (body, ms) =>
  SIGNS[Math.floor(calc_ut(jd(ms), body, C.SEFLG_SWIEPH).data[0] / 30)];

const out = {};
for (const [name, body] of Object.entries(PLANETS)) {
  // Runs of one sign, then each sign's runs merged while the planet comes back within a cycle.
  const runs = [];
  for (let t = START; t <= END; t += STEP) {
    const sign = signAt(body, t);
    const last = runs.at(-1);
    if (last && last.sign === sign) last.to = t;
    else runs.push({ sign, from: t, to: t });
  }
  const windows = [];
  for (const run of runs) {
    // The same sign again within ten years is the same pass (a retrograde loop), not the next cycle.
    const same = windows.findLast(
      (w) => w.sign === run.sign && run.from - w.to < 10 * 365 * DAY,
    );
    if (same) same.to = run.to;
    else windows.push({ ...run });
  }
  out[name] = windows
    .sort((a, b) => a.from - b.from)
    .map((w) => ({ sign: w.sign, from: iso(w.from), to: iso(w.to) }));
}
writeFileSync("lib/generations.json", `${JSON.stringify(out, null, 1)}\n`);
console.log(
  Object.entries(out)
    .map(([k, v]) => `${k}: ${v.length} windows`)
    .join(", "),
);
