// The tap panel's extras for a chart wheel (3t): Dawa's line for the planet in its sign and house,
// and its page, where the planet has one (content/planets.ts). Built on the server so the planet
// pages' words stay out of the browser's script. A long line is cut to its opening for the panel
// (3x, Nov 6); the page has it whole.
import { panelLine, planetHref, planetPage } from '@/content/planets';
import type { WheelDetails, WheelInput } from './chart-wheel';

export function wheelDetails(wheel: WheelInput): WheelDetails {
  const out: WheelDetails = {};
  for (const b of wheel.bodies) {
    const planet = planetPage(b.body);
    if (!planet) continue;
    out[b.body] = {
      signLine: panelLine(planet.signs[b.sign]),
      houseLine: b.house ? panelLine(planet.houses[b.house]) : undefined,
      href: planetHref(planet),
    };
  }
  return out;
}
