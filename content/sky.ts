// The words on Today's sky (1d). PLACEHOLDER, every line: Claude wrote them for the noindex site, and
// Dawa replaces them (the roadmap asks for his review before launch). Signs and bodies are named from
// lib/keys.ts, never typed here.
import type { MoonPhase, PlanetId } from '@/lib/today-sky';

export const skyCopy = {
  placeholder: true,
  metaTitle: "Today's sky",
  description: 'Where the Sun, the Moon, and every planet are right now, in plain words.',
  eyebrow: "Today's sky",
  headline: { line: 'The sky right now,', accent: 'in plain words.' },
  lede: 'Where everything is today, what the Moon is doing, and what changes this week. Nothing here is about you yet, so there is nothing to type.',
  /** Under the hero: when the page was worked out. */
  updated: 'Worked out',
  updatedNote: 'refreshed every hour',

  sunMoon: { heading: 'The Sun and the Moon', label: 'The two lights' },
  /** One plain line for each light, whatever its sign. */
  sunLine: 'The Sun is the season you are in: the tone the whole month takes.',
  moonLine: 'The Moon is the mood of the day. It changes sign every two or three days.',
  inSign: (body: string, sign: string) => `${body} in ${sign}`,
  element: (element: string) => `${element} sign`,
  lit: (percent: number) => `${percent}% lit`,

  moonDays: {
    heading: "The Moon's next ten days",
    label: 'The Moon',
    today: 'Today',
    next: { full: 'Full Moon', new: 'New Moon' },
    inDays: (days: number) => (days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`),
  },

  planets: {
    heading: 'Where every planet is',
    label: 'The planets',
    retrograde: 'Retrograde',
    retrogradeNote:
      'Retrograde means a planet looks as if it moves backward from here on Earth. It is a time to go over old ground.',
  },

  soon: {
    heading: 'Changing soon',
    label: 'The next seven days',
    ingress: (body: string, sign: string) => `${body} moves into ${sign}`,
    retrograde: (body: string, sign: string) => `${body} turns retrograde in ${sign}`,
    direct: (body: string, sign: string) => `${body} turns direct in ${sign}`,
    none: 'No planet changes sign or turns this week. The sky holds steady.',
  },

  elements: { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' },

  phases: {
    new: 'New Moon',
    waxingCrescent: 'Waxing crescent',
    firstQuarter: 'First quarter',
    waxingGibbous: 'Waxing gibbous',
    full: 'Full Moon',
    waningGibbous: 'Waning gibbous',
    lastQuarter: 'Last quarter',
    waningCrescent: 'Waning crescent',
  } satisfies Record<MoonPhase, string>,

  /** One line for each phase, under the Moon. */
  phaseLines: {
    new: 'A dark Moon and a clean page. Good for starting small.',
    waxingCrescent: 'The first thin light. Plans start to take shape.',
    firstQuarter: 'Half lit and growing. A push past the first snag.',
    waxingGibbous: 'Nearly full. Time to adjust and refine.',
    full: 'All lit. What you started shows itself.',
    waningGibbous: 'The light starts to ebb. Share what you learned.',
    lastQuarter: 'Half lit and fading. Let go of what is not working.',
    waningCrescent: 'The last sliver. Rest before the next round.',
  } satisfies Record<MoonPhase, string>,

  /** What each planet stands for in the sky, whoever is looking. */
  planetLines: {
    mercury: 'How we think, talk, and get around.',
    venus: 'What we love, value, and find beautiful.',
    mars: 'Where our drive and our temper go.',
    jupiter: 'Where things grow and luck runs.',
    saturn: 'Limits, structure, and the long haul.',
    uranus: 'Sudden change and the urge to break free.',
    neptune: 'Dreams, longing, and what is hard to see clearly.',
    pluto: 'Deep change, power, and what is reborn.',
  } satisfies Record<PlanetId, string>,

  /** In place of the planet's line while it is retrograde. */
  retrogradeLines: {
    mercury: 'Mixed messages and delays. Check the details twice.',
    venus: 'Old loves and old values come back for a second look.',
    mars: 'Energy turns inward. Pick your battles.',
    jupiter: 'Growth slows down and looks inward.',
    saturn: 'A review of the rules you live by.',
    uranus: 'Change works quietly, beneath the surface.',
    neptune: 'The fog lifts a little. Illusions show.',
    pluto: 'Old power struggles come up to be settled.',
  } satisfies Record<PlanetId, string>,
};
