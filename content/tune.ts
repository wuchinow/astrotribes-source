// PLACEHOLDER: the Tune section's words (1f, team only), ours. Sentence case, no dashes. "Reset" is a
// retired key name the lint guard keeps out of copy, so the button reads "Restore defaults" (1i).

import type { Mood, NightButton, Suggestion } from '@/lib/tune';

const HUES: Array<[number, string]> = [
  [15, 'red'],
  [45, 'orange'],
  [75, 'amber'],
  [100, 'gold'],
  [130, 'olive'],
  [160, 'green'],
  [190, 'teal'],
  [225, 'cyan'],
  [255, 'blue'],
  [285, 'indigo'],
  [315, 'violet'],
  [345, 'plum'],
  [360, 'red'],
];

/** A plain name for a hue, for the value a screen reader announces. */
export const hueName = (degrees: number) => HUES.find(([end]) => degrees < end)?.[1] ?? 'red';

const MOOD: Record<Mood, string> = { paper: 'Paper', night: 'Night' };

export const tuneCopy = {
  summary: 'Tune (team only)',
  intro: 'For the team, behind the preview passcode. Saved in its own cookie on this device. Visitors never see it.',
  temperature: {
    legend: 'Temperature',
    label: (mood: Mood) => MOOD[mood],
    value: (t: number) => (t === 0 ? '0' : t > 0 ? `+${t} warmer` : `${t} cooler`),
    valueText: (t: number) => (t === 0 ? 'neutral, as designed' : t > 0 ? `${t}, warmer` : `${-t}, cooler`),
    ends: ['Cooler', 'Warmer'] as const,
  },
  accent: {
    legend: 'Accent',
    paper: 'Paper: highlight and primary button',
    night: 'Night: highlight',
    value: (h: number) => `${h}°`,
    valueText: (h: number) => `Hue ${h} degrees, ${hueName(h)}`,
  },
  nightButton: {
    legend: 'Primary button on Night',
    options: { c: 'Pale cobalt', a: 'Follows the Night accent', p: 'Plum' } satisfies Record<NightButton, string>,
  },
  suggestions: {
    legend: 'Suggestions, anchored on cobalt',
    names: {
      system: 'Design system',
      complementary: 'Complement',
      'split-a': 'Split',
      'split-b': 'Split',
      'analogous-a': 'Analogous',
      'analogous-b': 'Analogous',
      'triadic-a': 'Triadic',
      'triadic-b': 'Triadic',
    } satisfies Record<Suggestion['id'], string>,
    label: (name: string, ap: number, an: number) =>
      `${name}: ${hueName(ap)} on Paper, ${hueName(an)} on Night`,
    warn: { cobalt: 'Near cobalt: may read as a link', ember: 'Near ember, the stamp color' },
  },
  copy: {
    button: 'Copy values',
    done: 'Copied. Paste it into the planning chat.',
    fallback: 'Select the text below and copy it.',
    summary: (parts: {
      date: string;
      version: string;
      tp: number;
      tn: number;
      ap: number;
      an: number;
      nb: NightButton;
    }) =>
      `AstroTribes tune, ${parts.date}, from tokens v${parts.version}. Temperature: Paper ${signed(parts.tp)}, Night ${signed(parts.tn)}. Accent: Paper ${parts.ap}°, Night ${parts.an}°. Night primary button: ${lowerFirst(tuneCopy.nightButton.options[parts.nb])}.`,
  },
  // Visible "Restore defaults", like the visitor settings' button in the same panel. The accessible
  // name starts with the visible words (WCAG 2.5.3, so voice control finds it) and says which one.
  restore: 'Restore defaults',
  restoreName: 'Restore defaults for Tune',
  restored: "Tune is back to the design system's values.",
};

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function signed(t: number) {
  return t === 0 ? '0' : t > 0 ? `+${t} (warmer)` : `${t} (cooler)`;
}
