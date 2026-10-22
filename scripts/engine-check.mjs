// Runs before `next build`: loads the sweph binary and reads the ephemeris files, so a platform
// without a working binding fails the build instead of the first chart request. Synthetic instant.
import path from 'node:path';
import { calc_ut, constants as C, set_ephe_path, version } from 'sweph';

set_ephe_path(path.join(process.cwd(), 'lib/engine/ephe'));
const { flag } = calc_ut(2451545, C.SE_CHIRON, C.SEFLG_SWIEPH | C.SEFLG_SPEED);
if (flag < 0 || (flag & C.SEFLG_SWIEPH) === 0) {
  console.error('engine check: sweph loaded but the Swiss Ephemeris files were not read');
  process.exit(1);
}
console.log(
  `engine check: sweph ${version()} loaded on ${process.platform}-${process.arch}, Node ${process.version}, Swiss Ephemeris files read`,
);
