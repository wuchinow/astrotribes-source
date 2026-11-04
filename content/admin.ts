// The admin members page (0003). Team-only words, never shown to a visitor, so not Dawa's to
// write: our own, kept plain. Copy rules still apply (no exclamation marks, no em-dashes).

export const adminCopy = {
  title: 'Admin',
  eyebrow: 'Team only',
  line: 'Admin',
  accent: 'Who has joined.',
  note: 'Only people on the admin list can open this page, and each visit is recorded. Demo accounts are flagged and left out of the numbers. Times are Eastern.',
  stats: {
    total: 'Members',
    joinedWeek: 'Joined this week',
    finished: 'Finished sign-up',
    finishedHelp: 'A name and birth details',
    /** The comparison under each number. */
    weekAgo: (n: number) => `${n} a week ago`,
    weekBefore: (n: number) => `${n} the week before`,
    ofTotal: (pct: number) => `${pct}% of members`,
  },
  listHeading: 'Member list',
  searchLabel: 'Search by name or email',
  sortLabel: 'Sort by',
  sorts: { joined: 'Newest first', signedIn: 'Last signed in', name: 'Name, A to Z' },
  shown: (shown: number, total: number) =>
    shown === total ? `${total} ${total === 1 ? 'member' : 'members'}` : `${shown} of ${total} match`,
  columns: { name: 'Name', joined: 'Joined', lastSignIn: 'Last signed in', finished: 'Finished sign-up' },
  noName: 'No name yet',
  noEmail: 'No email',
  never: 'None recorded',
  noSignIn: 'No sign-in recorded',
  yes: 'Yes',
  no: 'No',
  demo: 'Demo',
  joinedOn: (day: string) => `Joined ${day}`,
  signedInOn: (day: string) => `Last signed in ${day}`,
  finishedYes: 'Finished sign-up',
  finishedNo: 'Not finished',
  empty: 'No members yet.',
  noMatch: 'No member matches that search.',
  viewsHeading: 'Who looked',
  viewsHelp: 'The last 50 visits to this page.',
  viewsEmpty: 'No visits recorded yet.',
  removedAdmin: 'A removed admin',
};
