// Birth details and the member's own chart (2c): our words, not Dawa's. Every block is marked
// PLACEHOLDER until his copy replaces it. Key names come from lib/keys.ts through KeyChip, never here.

// PLACEHOLDER: the welcome steps.
export const welcomeCopy = {
  title: 'Welcome',
  eyebrow: 'Welcome',
  /** The steps, shown as "Step 2 of 2". */
  step: (n: number) => `Step ${n} of 2`,
  birthLine: 'Now, your birth.',
  birthAccent: 'Date, time, and place.',
  editEyebrow: 'Your account',
  editLine: 'Your birth details,',
  editAccent: 'to change.',
  lede: 'Your chart comes from these three. Only you ever see them. Other members see signs and houses, never your birth date, time, or place.',
  carried: 'We brought these over from your free chart. Check them, then save.',
  date: { label: 'Birth date', help: 'Day, month, and year.' },
  time: { label: 'Birth time', help: 'As close as you know it. A birth certificate often has it.' },
  place: { label: 'Birthplace', help: 'Start typing the town or city, then pick it from the list.' },
  unknownTime: "I don't know my birth time",
  unknownTimeNote:
    'That is fine. Without a time we can still read most of your chart. Rising and the twelve houses need one, and you can add it later from your account.',
  submit: 'Save and see my chart',
  submitEdit: 'Save changes',
  submitting: 'Saving',
  cancel: 'Back to your account',
  chooseHeading: 'One choice for you',
  choose: (body: string) =>
    `The ${body} changed sign on your birthday. Without a time, either could be yours. Read both, and pick the one that sounds more like you.`,
  chooseSubmit: 'Save my choice',
  chooseNote: 'You can change this later, and a birth time settles it.',
  /** Shown when the last change was under an hour ago; `time` is the visitor's own clock. */
  waitNote: (time: string) => `You changed these less than an hour ago. You can change them again after ${time}.`,
  errors: {
    invalid_body: "Something in the form didn't come through. Try again.",
    invalid_date: "That date isn't valid. Pick it from the calendar, or type it in full.",
    out_of_range: 'Charts cover births from 1800 on.',
    invalid_time: "That time isn't valid. Use hours and minutes, or tick that you don't know it.",
    invalid_place: 'Pick your birthplace from the list, so we know where on Earth it is.',
    invalid_pick: 'Pick one of the two signs.',
    too_soon: 'You changed these less than an hour ago. Try again in a little while.',
    limit: 'Too many tries. Wait a few minutes, then try again.',
    failed: "Your details didn't save this time. Try again in a moment.",
  },
};

// PLACEHOLDER: the member's own chart page.
export const yourChartCopy = {
  title: 'Your chart',
  eyebrow: 'Your chart',
  line: 'Your three,',
  accent: 'saved.',
  lede: 'Your Sun, Moon, and Rising, the start of your chart. The rest of your 28 Keys arrive here soon.',
  /** On a picked sign: "You chose Leo. Virgo is the other one it could be." */
  picked: (chosen: string, other: string) => `You chose ${chosen}. ${other} is the other sign it could be.`,
  noTime: 'You saved your chart without a birth time, so Rising and the houses wait on one.',
  next: {
    eyebrow: 'What comes next',
    tribe: 'Meet your Tribe',
    keys: 'About the 28 Keys',
    edit: 'Change your birth details',
    addTime: 'Add your birth time',
  },
};

// PLACEHOLDER: the free chart's way into an account.
export const carryCopy = {
  save: 'Save this chart to your account',
  note: 'We keep these details in this browser tab until you sign in and save them, then clear them.',
};

// PLACEHOLDER: the header's account menu.
export const accountMenuCopy = {
  /** The button's name for screen readers, with the member's name. */
  open: (name: string) => `${name}, account menu`,
  chart: 'Your chart',
  account: 'Account',
  signOut: 'Sign out',
};
