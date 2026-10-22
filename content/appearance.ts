// PLACEHOLDER: the Appearance panel's words, ours until Dawa's. Sentence case, no dashes.

export const appearanceCopy = {
  button: 'Appearance',
  /** The sun and moon switch's name, shown beside it in the mobile menu and above it in the footer. */
  moodToggle: 'Night mood',
  title: 'Appearance',
  intro: 'Saved on this device. No account needed.',
  close: 'Close',
  mood: { legend: 'Mood', paper: 'Paper', night: 'Night', device: 'Match my device' },
  painting: {
    legend: 'Painting',
    page: "Each page's own",
    none: 'None',
    credit: 'Art by Jane Kwan',
  },
  wash: {
    label: 'Wash strength',
    value: (percent: number) => `${percent}%`,
    valueText: (percent: number) => `${percent} percent`,
    off: 'Pick a painting to set its strength.',
  },
  text: { legend: 'Text size', steps: ['Standard', 'Large', 'Larger', 'Largest'] },
  // Not "Reset": a retired key name (lib/keys.ts), which the lint guard keeps out of copy.
  restore: 'Restore defaults',
};
