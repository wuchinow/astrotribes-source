// Site-wide links and addresses, shared by the header, the mobile menu, and the footer.

export interface NavLink {
  href: string;
  label: string;
}

// The main nav (1h, from the Sep 27 UX audit): How it works only jumps down the landing. Keys is its
// own page since 1k; Tribes still jumps down the landing until the Tribe pages have an index. The
// labels name each count, and the Oracle is the Daily Oracle everywhere it shows (David, Oct 21); its
// address stays /oracle. Today's sky came back once it was public (1d, David, Oct 27). Learn holds
// Dawa's articles (David, Nov 4).
export const PRIMARY_NAV: readonly NavLink[] = [
  { href: '/#tribes', label: '12 Tribes' },
  { href: '/keys', label: '28 Keys' },
  { href: '/oracle', label: 'Daily Oracle' },
  { href: '/sky', label: "Today's sky" },
  // Dawa's articles, and his videos to come (David, Nov 4).
  { href: '/learn', label: 'Learn' },
];

/**
 * The one primary action, with one label everywhere (1h, AT-08): the header on every page, the hero,
 * the 12 Tribes, and the next step. Since Nov 3 (David) the chart is free with an account: /chart
 * sends a visitor to Google sign-in, then the welcome steps (name, birth details), then their chart.
 * No payment and no subscription.
 */
export const PRIMARY_ACTION: NavLink = { href: '/chart', label: 'Get your free chart' };

/** The same button for a signed-in member (David, Nov 4): straight to their chart. */
export const MEMBER_ACTION: NavLink = { href: '/your-chart', label: 'See your chart' };

export const LEGAL_NAV: readonly NavLink[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
  // The site's code, offered under the AGPL that the Swiss Ephemeris needs (David, Oct 22): a
  // no-history copy of production without docs, art, or glyphs, until the paid licence replaces it.
  { href: 'https://github.com/wuchinow/astrotribes-source', label: 'Source' },
];

// The team's address (David, Sep 25), shown as a mailto link on Privacy, Terms, Contact, and the footer.
export const CONTACT_EMAIL = 'weareastrotribes@gmail.com';

// Feedback during the alpha (David, Nov 9): the form at /feedback, which saves each note to the team's
// Notion feedback database (lib/feedback.ts); in the footer's bottom row for everyone and in the
// account menu for members.
export const FEEDBACK_LINK: NavLink = { href: '/feedback', label: 'Send feedback' };
