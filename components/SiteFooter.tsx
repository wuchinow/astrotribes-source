import type { CSSProperties } from 'react';
import Link from 'next/link';
import { backdropImages } from './Backdrop';
import { CONTACT_EMAIL, LEGAL_NAV, PRIMARY_NAV, type NavLink } from '@/lib/site';
import { pictureCreditLines, skyCreditLines } from '@/lib/sky-credits';
import { Logo } from './Logo';
import { MoodToggle } from './MoodToggle';
import { SkyCredit } from './SkyCredit';

function LinkList({ label, links }: { label: string; links: readonly NavLink[] }) {
  return (
    <nav aria-label={label}>
      <ul className="grid">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-touch items-center type-body-sm text-cobalt-600 underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The footer (1h), on the band tone where the page's rhythm ends. Desktop: the logo left, large (David,
 * Nov 9, in place of the ink enso), the main nav repeated (0d) beside the legal links and the address on
 * the right, the credit lines under the logo (the art is wallpaper, so its credit lives here, and in What
 * stays true; the page's telescope images are credited here too, David, Nov 4), then a bottom row with
 * the year and the mood toggle as an icon, with its name on hover and focus. On a phone the same parts stack.
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
      <div className="mx-auto grid max-w-content gap-8 px-4 pt-2 pb-10 md:grid-cols-[1fr_auto] md:grid-rows-[auto_1fr] md:gap-x-12 md:gap-y-6 md:px-6 md:pb-12">
        {/* The logo, featured (David, Nov 9: the enso is not needed here; it stays ready for another page). */}
        <Logo className="w-[300px] max-w-full md:col-start-1 md:row-start-1 md:w-[420px]" />
        {/* Two link columns, the address under both, starting under the first (David, Nov 4). */}
        <div className="grid grid-cols-[auto_auto] content-start justify-start gap-x-12 md:col-start-2 md:row-span-2 md:row-start-1 md:justify-self-end">
          <LinkList label="Footer" links={PRIMARY_NAV} />
          <LinkList label="Legal" links={LEGAL_NAV} />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="col-span-2 mt-2 inline-flex min-h-touch items-center justify-self-start type-body-sm text-cobalt-600 underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <div className="max-w-measure md:col-start-1 md:row-start-2 md:self-start">
          <p className="type-body-sm text-ink-700">All art on AstroTribes is made by human hands.</p>
          <p className="mt-1 type-caption text-ink-500">Glyphs by Lama Dawa. Tribe paintings by Kirstie Connon. Ink landscapes: public domain, from museum collections.</p>
          <SkyCredit lines={skyCreditLines()} />
          <SkyCredit lines={pictureCreditLines} sky={false} />
        </div>
      </div>
      <div className="border-t border-ink-200">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-2 md:px-6">
          <p className="type-caption text-ink-500">© 2026 AstroTribes</p>
          <div className="flex items-center gap-1">
            <MoodToggle tooltip />
          </div>
        </div>
      </div>
    </footer>
  );
}
