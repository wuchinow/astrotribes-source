'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { MEMBER_NAV, PRIMARY_NAV } from '@/lib/site';

interface NavLinksProps {
  /**
   * cobalt: links in cobalt, as everywhere. ink: the main nav over the hero, in
   * ink (on-night on Night) with the current page, hover, and focus in cobalt.
   */
  tone?: 'cobalt' | 'ink';
  className?: string;
  linkClassName?: string;
  /** Called after a link is followed, so the mobile menu can close. */
  onNavigate?: () => void;
}

/**
 * The main nav links, with the member links first for a signed-in member (5c). The current page is marked
 * for screen readers and underlined.
 */
export function NavLinks({ tone = 'cobalt', className, linkClassName, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {[...MEMBER_NAV, ...PRIMARY_NAV].map((link) => {
        const current = !link.href.includes('#') && (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          // The member links lead the nav for a signed-in member only (5c): `member-only` hides them
          // from everyone else, from the same before-paint hint that hides what is only for visitors.
          <li key={link.href} className={MEMBER_NAV.includes(link) ? 'member-only' : undefined}>
            <Link
              href={link.href}
              aria-current={current ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(
                // 6px of tap area each side, taken back by the margin, so a short label (Keys) is 44px wide
                // to a finger and nothing moves.
                '-mx-1.5 inline-flex min-h-touch items-center px-1.5 whitespace-nowrap type-ui underline-offset-[6px] decoration-2 hover:underline hover:decoration-gold-500 aria-[current=page]:underline',
                tone === 'ink'
                  ? 'text-ink-900 hover:text-cobalt-600 focus-visible:text-cobalt-600 aria-[current=page]:text-cobalt-600'
                  : 'text-cobalt-600',
                linkClassName,
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
