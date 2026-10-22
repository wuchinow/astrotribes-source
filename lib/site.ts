// Site-wide links and addresses, shared by the header, the mobile menu, and the footer.

export interface NavLink {
  href: string;
  label: string;
}

// The main nav (1h, from the Sep 27 UX audit): How it works only jumps down the landing, and Sky waits
// behind the passcode until the engine license is settled; it comes back when it is public. Keys is
// its own page since 1k; Tribes still jumps down the landing until the Tribe pages have an index.
// The labels name each count, and the Oracle is the Daily Oracle everywhere it shows (David, Oct 21);
// its address stays /oracle.
export const PRIMARY_NAV: readonly NavLink[] = [
  { href: '/#tribes', label: '12 Tribes' },
  { href: '/keys', label: '28 Keys' },
  { href: '/oracle', label: 'Daily Oracle' },
];

/**
 * The one primary action, with one label everywhere (1h, AT-08): the header on every page, the hero,
 * the 12 Tribes, and the next step. The free chart sits behind the preview passcode until the engine
 * license is decided; the site is noindex, and the chart is for the team and invitees until then.
 */
export const PRIMARY_ACTION: NavLink = { href: '/chart', label: 'Get your chart free' };

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
