'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { appearanceCopy } from '@/content/appearance';
import { DISCLOSURE_EVENT } from './AppearancePanel';
import { HeaderAccount } from './HeaderAccount';
import { MoodToggle } from './MoodToggle';
import { NavLinks } from './NavLinks';

/**
 * The header's menu below lg: a menu button and a panel under the header row with the main nav, then
 * the account link (2b), the mood toggle (1h: the header keeps only the logo, the primary action, and this button on a
 * phone). The menu closes on Escape (focus returns to the button), on a link, on a new page, and when
 * another disclosure opens.
 */
export function MobileMenu() {
  const pathname = usePathname();
  // Remembering where it was opened closes it on navigation without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const button = useRef<HTMLButtonElement>(null);
  const uid = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenOn(null);
      button.current?.focus();
    };
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== uid) setOpenOn(null);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener(DISCLOSURE_EVENT, onOther);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(DISCLOSURE_EVENT, onOther);
    };
  }, [open, uid]);

  function toggle() {
    if (!open) window.dispatchEvent(new CustomEvent(DISCLOSURE_EVENT, { detail: uid }));
    setOpenOn(open ? null : pathname);
  }

  return (
    <div className="lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={toggle}
        className="inline-flex size-touch items-center justify-center rounded-pill text-ink-700 transition-colors duration-200 hover:bg-surface-200 hover:text-ink-900"
      >
        {open ? (
          <X aria-hidden="true" size={22} strokeWidth={1.5} />
        ) : (
          <Menu aria-hidden="true" size={22} strokeWidth={1.5} />
        )}
        <span className="sr-only">Menu</span>
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-6rem)] overflow-y-auto border-b border-ink-200 bg-surface-100 shadow-warm"
      >
        <div className="mx-auto max-w-content px-4 py-2">
          <nav aria-label="Main">
            <NavLinks
              className="grid"
              linkClassName="w-full text-[1.125rem]"
              onNavigate={() => setOpenOn(null)}
            />
          </nav>
          <div className="mt-2 border-t border-ink-200 pt-2">
            <HeaderAccount place="menu" onNavigate={() => setOpenOn(null)} />
          </div>
          <div className="mt-2 border-t border-ink-200 pt-2 pb-2">
            <div className="flex items-center gap-2 type-body-sm text-ink-700">
              <MoodToggle />
              <span aria-hidden="true">{appearanceCopy.moodToggle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
