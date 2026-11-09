import type { CSSProperties } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { backdropImages } from './Backdrop';
import { CONTACT_EMAIL, FEEDBACK_LINK, LEGAL_NAV, PRIMARY_NAV, type NavLink } from '@/lib/site';
import { footerCredits } from '@/lib/sky-credits';
import { Logo } from './Logo';
import { MoodToggle } from './MoodToggle';

/**
 * The footer's links in three even columns (David, Nov 9: "instead of 2 columns, let's have 3 of 3"):
 * the main nav in order, then Contact, then the rest of the legal links, filled down each column.
 */
export function footerColumns(): NavLink[][] {
  const contact = LEGAL_NAV.filter((link) => link.href === '/contact');
  const links = [...PRIMARY_NAV, ...contact, ...LEGAL_NAV.filter((link) => link.href !== '/contact')];
  const perColumn = Math.ceil(links.length / 3);
  return [0, 1, 2].map((column) => links.slice(column * perColumn, (column + 1) * perColumn));
}

function LinkColumn({ links }: { links: readonly NavLink[] }) {
  return (
    // From md the list and its items give way (contents), so the nav's own four rows can spread the
    // links to the height of the credits beside them (David, Nov 9: "compress link vert spacing to
    // equal left text height").
    <ul className="grid content-start md:contents">
      {links.map((link) => (
        <li key={link.href} className="md:contents">
          <Link
            href={link.href}
            className="inline-flex min-h-touch items-center type-body-sm text-cobalt-600 underline-offset-4 hover:underline md:-my-2.5 md:min-h-0 md:py-2.5"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The footer (1h), on the band tone where the page's rhythm ends. Desktop: the logo left (David, Nov 9,
 * in place of the ink enso) with the credits under it, the same on every page (the art is wallpaper, so
 * its credit lives here, and in What stays true), and the links in three columns with the address on
 * the right; then a bottom row with the year and the mood toggle as an icon, with no rule above it
 * since 4q, with its name on hover and focus. On a phone the same parts stack.
 */
export function SiteFooter() {
  // The horizon (4m, David, Nov 8: "also possibly footer"): Eight views (P9) across the top edge, above the words.
  const horizon = backdropImages({ art: 'p9' });
  return (
    <footer className="border-t border-ink-200 bg-surface-band">
      <div
        aria-hidden="true"
        className="footer-horizon"
        style={{ '--bd-sm': horizon.sm, '--bd-lg': horizon.lg, '--bd-pos': 'center 70%' } as CSSProperties}
      />
      {/* The logo centered on its own row, then two balanced groups side by side, the same height (David,
          Nov 9): the credits on the left, wrapped to a width near the links', and the links with the
          address on the right, spread to the credits' height. */}
      <div className="mx-auto max-w-content px-4 pt-2 pb-6 md:px-6 md:pb-8">
        {/* The logo, featured (David, Nov 9: the enso is not needed here; it stays ready for another page). */}
        <Logo className="mx-auto w-[260px] max-w-full md:w-[340px]" />
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-stretch md:justify-between md:gap-12">
          <div className="max-w-[26rem]">
            <p className="type-body-sm text-ink-700">All art on AstroTribes is made by human hands.</p>
            {/* The same credits on every page, one kind to a line (4q, David, Nov 9). */}
            <p className="mt-1 type-caption text-ink-500">{footerCredits.people}</p>
            <p className="mt-1 type-caption text-pretty text-ink-500">{footerCredits.publicDomain}</p>
            <p className="mt-1 type-caption text-ink-500">{footerCredits.space}</p>
          </div>
          {/* Three link columns of three (David, Nov 9), the address under them, starting under the first. */}
          <nav aria-label="Footer" className="grid grid-cols-[repeat(3,auto)] content-start justify-start gap-x-8 sm:gap-x-12 md:grid-flow-col md:grid-rows-[repeat(4,auto)] md:content-between">
            {footerColumns().map((links) => (
              <LinkColumn key={links[0].href} links={links} />
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="col-span-3 mt-2 inline-flex min-h-touch items-center md:col-start-1 md:row-start-4 md:-my-2.5 md:min-h-0 md:py-2.5 justify-self-start type-body-sm text-cobalt-600 underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </nav>
        </div>
      </div>
      {/* The year, the feedback link centered (David, Nov 9: apart from the site's links), and the mood
          toggle, with no rule above them (David, Nov 9: the divider was not needed). */}
      <div className="mx-auto grid max-w-content grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 pb-3 md:px-6">
        <p className="type-caption whitespace-nowrap text-ink-500">© 2026 AstroTribes</p>
        <Link
          href={FEEDBACK_LINK.href}
          className="inline-flex min-h-touch items-center gap-1.5 type-body-sm text-cobalt-600 underline-offset-4 hover:underline"
        >
          {/* A comment icon before the words (David, Nov 9). */}
          <MessageCircle aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
          {FEEDBACK_LINK.label}
        </Link>
        <div className="flex items-center gap-1 justify-self-end">
          <MoodToggle tooltip />
        </div>
      </div>
    </footer>
  );
}
