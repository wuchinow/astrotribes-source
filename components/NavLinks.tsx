'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { PRIMARY_NAV } from '@/lib/site';

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

/** The main nav links. The current page is marked for screen readers and underlined. */
export function NavLinks({ tone = 'cobalt', className, linkClassName, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {PRIMARY_NAV.map((link) => {
        const current = !link.href.includes('#') && (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(
                'inline-flex min-h-touch items-center whitespace-nowrap type-ui underline-offset-[6px] decoration-2 hover:underline hover:decoration-gold-500 aria-[current=page]:underline',
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
