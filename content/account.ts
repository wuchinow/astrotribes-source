// Sign-in and the account page (2b): our words, not Dawa's. Every block is marked PLACEHOLDER until
// his copy replaces it. Google only for now (David, Oct 21); email and password come later.

// PLACEHOLDER: the header and mobile menu slot.
export const accountSlotCopy = {
  signIn: 'Sign in',
  /** Shown while a signed-in member has not chosen a name yet. */
  noName: 'Your account',
};

// PLACEHOLDER: the sign-in page.
export const signInCopy = {
  title: 'Sign in',
  eyebrow: 'Members',
  line: 'Sign in',
  accent: 'with Google.',
  body: 'AstroTribes is open to the team for now. Use the Google account the team added for you.',
  google: 'Continue with Google',
  note: 'Google shares your name, email address, and photo with our sign-in service. Your photo shows beside your name at the top of the page. The name members see is the one you choose here.',
  errors: {
    google: "Google didn't finish signing you in. Try again.",
    limit: 'Too many tries. Wait a few minutes, then try again.',
    off: 'Sign-in is switched off on this build.',
  } as Record<string, string>,
};

// PLACEHOLDER: the account page.
export const accountCopy = {
  title: 'Your account',
  eyebrow: 'Your account',
  line: 'Hello,',
  nameHeading: 'Your name',
  nameNeeded: 'Choose the name other members will see. You can change it any time.',
  nameLabel: 'Name',
  nameHelp: 'Up to 40 characters. We never take your name from Google.',
  nameSave: 'Save name',
  nameSaved: 'Saved.',
  /** After a save: the way on, so the page needs no Done or Back button. */
  nameNext: 'See your chart',
  firstLine: 'Welcome.',
  firstAccent: 'What should we call you?',
  firstSave: 'Continue',
  nameInvalid: 'Use 1 to 40 characters.',
  birthHeading: 'Your birth details',
  /** Shown to the owner only, on their own account page. */
  birthSummary: (date: string, time: string | null, place: string) =>
    `${date}, ${time ?? 'time not known'}, ${place}.`,
  birthNone: 'You have not added them yet. Your chart comes from them.',
  birthPrivate: 'Only you see these. Other members see signs and houses, never your birth date, time, or place.',
  birthChange: 'Change birth details',
  birthAdd: 'Add your birth details',
  birthChart: 'See your chart',
  signedInHeading: 'Signed in',
  emailLabel: 'Signed in with Google as',
  exportHeading: 'Your data',
  exportBody: 'Download everything we hold about you as one file: your profile, your birth details, and your placements.',
  exportButton: 'Export my data',
  deleteHeading: 'Delete your account',
  deleteBody: 'This removes your profile, your birth details, and your placements for good. It cannot be undone.',
  deleteLabel: 'Type delete to confirm',
  deleteButton: 'Delete my account',
  deleteInvalid: 'Type delete, in lowercase, to confirm.',
  deleteFailed: "We couldn't delete your account just now. Try again in a minute.",
  signOut: 'Sign out',
};
