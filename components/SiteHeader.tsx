import Link from 'next/link';
import { PRIMARY_ACTION } from '@/lib/site';
import { Button } from './Button';
import { GuestOnly, HeaderAccount } from './HeaderAccount';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { MoodToggle } from './MoodToggle';
import { NavLinks } from './NavLinks';

/**
 * Logo home, the main nav from lg up, and on the right the mood switch, Sign in (2b), the
 * primary action (one label everywhere, 1h; hidden for a signed-in member, 2c), and a signed-in
 * member's photo, which opens the account menu, at the far right (David,
 * Oct 21 and 22). Below lg, where the
 * longer labels (12 Tribes, 28 Keys, Daily Oracle) no longer fit beside the logo: the logo, the
 * primary action, and the menu button; the mood switch moves into the menu. The Appearance menu was removed (David, Oct 21). No bar (design
 * system v3.2): it takes no height and sits on the top of the hero, over the art, or on plain paper
 * where a page has none. Not sticky; the footer repeats the nav. About 20px above the logo on a
 * phone and 32px on desktop (1h); each page's top padding clears it.
 */
export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="relative mx-auto flex max-w-content items-center justify-between gap-2 px-4 pt-5 pb-2 md:gap-4 md:px-6 md:pt-8">
        <Link href="/" className="inline-flex min-h-touch shrink-0 items-center">
          <Logo className="w-[120px] min-[24rem]:w-[164px] md:w-[280px] xl:w-[340px]" label="AstroTribes, home" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks tone="ink" className="flex items-center gap-6" />
        </nav>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden items-center lg:flex">
            <MoodToggle />
          </div>
          <HeaderAccount show="out" />
          <GuestOnly>
            <Button href={PRIMARY_ACTION.href} size="nav">
              {PRIMARY_ACTION.label}
            </Button>
          </GuestOnly>
          <HeaderAccount show="in" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
