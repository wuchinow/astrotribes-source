import Link from 'next/link';
import { CONTACT_EMAIL, LEGAL_NAV, PRIMARY_NAV, type NavLink } from '@/lib/site';
import { FramedArt } from './FramedArt';
import { Logo } from './Logo';
import { MoodToggle } from './MoodToggle';

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
 * The footer (1h), on the band tone where the page's rhythm ends. Desktop: the logo left, Jane's enso
 * collage centred, the main nav repeated (0d) beside the legal links and the address on the right,
 * the credit lines lower left (the art is wallpaper, so its credit lives here, and in What stays
 * true), then a bottom row with the year and the mood toggle as an icon, with its name on hover and
 * focus. On a phone the same parts stack, the enso centred.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-surface-band">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-10 md:grid-cols-[1fr_auto_1fr] md:grid-rows-[auto_1fr] md:gap-x-12 md:gap-y-6 md:px-6 md:py-12">
        <Logo className="w-[240px] md:col-start-1 md:row-start-1" />
        <div className="flex justify-center md:col-start-2 md:row-span-2 md:row-start-1 md:items-center">
          <FramedArt id="p5" sizes="112px" className="w-[112px]" />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-2 md:col-start-3 md:row-span-2 md:row-start-1 md:justify-self-end">
          <LinkList label="Footer" links={PRIMARY_NAV} />
          <div>
            <LinkList label="Legal" links={LEGAL_NAV} />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-touch items-center type-body-sm text-cobalt-600 underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="max-w-measure md:col-start-1 md:row-start-2 md:self-end">
          <p className="type-body-sm text-ink-700">All art on AstroTribes is made by human hands.</p>
          <p className="mt-1 type-caption text-ink-500">Glyphs by Lama Dawa. Art by Jane Kwan.</p>
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
