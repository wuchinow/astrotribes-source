// PLACEHOLDER: the famous charts pages (3r). Our words, not Dawa's, until his copy replaces them.
// Key names come from lib/keys.ts through KeyChip, never from here.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "March 30, 1853" from "1853-03-30". */
export const longDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

/** "11:00 in the morning", "at noon", "12:30 at night", from "HH:MM". */
export const clockWords = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 12 && m === 0) return 'noon';
  const twelve = `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`;
  const part = h < 5 ? 'at night' : h < 12 ? 'in the morning' : h < 17 ? 'in the afternoon' : h < 21 ? 'in the evening' : 'at night';
  return `${twelve} ${part}`;
};

export const famousCopy = {
  title: 'Famous charts',
  eyebrow: 'Famous charts',
  line: 'Famous charts,',
  accent: 'and yours.',
  lede: 'Well-known people from history, with their charts worked out from public birth records. See which Keys you share with each, and how many connection points.',
  forFun: "Just for fun: none of these people are members of AstroTribes.",
  visitorHeading: 'See how your chart meets theirs',
  visitorBody: 'Get your free chart and every card here shows the Keys you share and your connection points.',
  noChartBody: 'Add your birth details and every card here shows the Keys you share and your connection points.',
  addDetails: 'Add your birth details',
  /** On a card. */
  open: (name: string) => `See ${name}'s chart`,
  openShared: (name: string) => `See the Keys you share with ${name}`,
  years: (born: number, died: number) => `${born} to ${died}`,
  /** One person's page. */
  personEyebrow: 'A famous chart',
  personAccent: 'and you.',
  born: (place: string, date: string, time: string) =>
    `Born in ${place}, on ${longDate(date)}, at ${clockWords(time)}.`,
  notMember: (name: string) => `Just for fun: ${name} was never a member of AstroTribes.`,
  visitorPerson: (name: string) => `Get your free chart to see the Keys you share with ${name}, and your connection points.`,
  noChartPerson: (name: string) => `Add your birth details to see the Keys you share with ${name}, and your connection points.`,
  /** Beside their chart wheel (3s). */
  wheelHeading: (name: string) => `${name}'s sky, the moment they were born`,
  wheel: (name: string) => ({
    body: `Where the Sun, the Moon, and every planet stood when ${name} was born, set around the twelve signs.`,
    houses: 'The lines inside mark the twelve houses, counted from the Rising at the left.',
    noTime: '',
    figure: `${name}'s chart as a wheel. The list beside it says the same in words.`,
  }),
  threeHeading: (name: string) => `${name}'s Sun, Moon, and rising`,
  back: 'All famous charts',
  /** On the members list and Your chart. */
  membersLink: 'While more members join, see how your chart meets some famous ones.',
  membersLinkLabel: 'Famous charts',
};
