import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

// The root not-found renders outside the (public) layout, so it brings the header and footer itself:
// a lost visitor keeps the nav and the way to every section (UX audit, Nov 4).
const PLACES = [
  { href: '/', label: 'The home page' },
  { href: '/tribes', label: 'The 12 Tribes' },
  { href: '/keys', label: 'The 28 Keys' },
  { href: '/oracle', label: 'The Daily Oracle' },
  { href: '/sky', label: "Today's sky" },
] as const;

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-content flex-1 px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <h1 className="type-heading-1 text-ink-900">This page is not here</h1>
        <p className="mt-4 max-w-measure text-ink-700">The link may be old, or the page has not been built yet. Try one of these.</p>
        <ul className="mt-6 grid gap-1">
          {PLACES.map((place) => (
            <li key={place.href}>
              <Link
                href={place.href}
                className="inline-flex min-h-touch items-center text-cobalt-600 underline underline-offset-4"
              >
                {place.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
