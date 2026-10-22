'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { accountSlotCopy } from '@/content/account';
import { accountMenuCopy } from '@/content/welcome';
import { clearCarry } from '@/lib/carry';
import { cn } from '@/lib/cn';
import { browserClient } from '@/lib/supabase/browser';
import { DISCLOSURE_EVENT } from './AppearancePanel';

type Slot = { state: 'loading' } | { state: 'out' } | { state: 'in'; name: string | null; avatar: string | null };

/** Google's photo (David, Oct 22): its address from the session's metadata, shown, never copied to the profile. */
function avatarOf(meta: Record<string, unknown> | undefined): string | null {
  const url = meta?.avatar_url ?? meta?.picture;
  return typeof url === 'string' && url.startsWith('https://') ? url : null;
}

// One read of the session per page, shared by every copy of the slot (the header renders several).
const LOADING: Slot = { state: 'loading' };
let current: Slot = LOADING;
const listeners = new Set<() => void>();
let started = false;

const publish = (slot: Slot) => {
  current = slot;
  for (const listener of listeners) listener();
};

const start = () => {
  if (started) return;
  started = true;
  const supabase = browserClient();
  if (!supabase) return publish({ state: 'out' });
  const read = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return publish({ state: 'out' });
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', data.user.id)
      .maybeSingle();
    publish({ state: 'in', name: profile?.display_name ?? null, avatar: avatarOf(data.user.user_metadata) });
  };
  void read();
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') void read();
  });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Who is signed in, as the header knows it: loading, out, or in with the member's own display name
 * and Google photo. A client hook, so the public pages stay static: the browser client (publishable
 * key only) reads the session from its cookie and the member's own profile row under RLS.
 */
function useMember(): Slot {
  return useSyncExternalStore(subscribe, () => current, () => LOADING);
}

/**
 * Its children for anyone not signed in: the header's primary action ("Get your chart free"), which
 * a member no longer needs (David, Oct 22). It shows while the session is read, so a visitor never
 * waits for it; a member may see it for a moment before it goes.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  return useMember().state === 'in' ? null : <>{children}</>;
}

const linkClass =
  'min-h-touch items-center gap-2 whitespace-nowrap font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4';

/**
 * The header's account slot (2b, 2c). Signed out: Sign in, before the primary action. Signed in:
 * the member's photo (an initial when there is none) at the far right, a button that opens a small
 * menu: Your chart, Account, Sign out (David, Oct 22). `show` places each copy, so it renders only
 * in its own state. `place="menu"` is the mobile menu's copy: the name, then the same three links.
 * The header's own is from lg up, because below it the header has no room beside the logo.
 */
export function HeaderAccount({
  place = 'header',
  show = 'both',
  onNavigate,
}: {
  place?: 'header' | 'menu';
  show?: 'in' | 'out' | 'both';
  onNavigate?: () => void;
}) {
  const slot = useMember();
  if (slot.state === 'loading') return null;
  if (show !== 'both' && slot.state !== show) return null;

  if (slot.state === 'out') {
    return (
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className={cn(linkClass, place === 'header' ? 'hidden px-2 text-[1rem] lg:inline-flex' : 'flex w-full text-[1.125rem]')}
      >
        {accountSlotCopy.signIn}
      </Link>
    );
  }

  const name = slot.name ?? accountSlotCopy.noName;
  if (place === 'menu') {
    return (
      <div className="grid">
        <p className="flex min-h-touch items-center gap-2 font-semibold text-ink-900">
          <Avatar url={slot.avatar} name={slot.name} />
          {name}
        </p>
        <MenuLinks onNavigate={onNavigate} className="flex w-full text-[1.125rem]" />
      </div>
    );
  }
  return <AccountMenu name={name} slot={slot} />;
}

function MenuLinks({ onNavigate, className }: { onNavigate?: () => void; className: string }) {
  return (
    <>
      <Link href="/your-chart" onClick={onNavigate} className={cn(linkClass, className)}>
        {accountMenuCopy.chart}
      </Link>
      <Link href="/account" onClick={onNavigate} className={cn(linkClass, className)}>
        {accountMenuCopy.account}
      </Link>
      <form method="post" action="/auth/sign-out" onSubmit={clearCarry}>
        <button type="submit" className={cn(linkClass, className, 'cursor-pointer text-left')}>
          {accountMenuCopy.signOut}
        </button>
      </form>
    </>
  );
}

/**
 * The photo as a disclosure button, with the three links in a small panel under it. Closes on
 * Escape (focus back to the button), on a click outside, on a link, and when another disclosure
 * in the header opens.
 */
function AccountMenu({ name, slot }: { name: string; slot: Extract<Slot, { state: 'in' }> }) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== uid) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener(DISCLOSURE_EVENT, onOther);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener(DISCLOSURE_EVENT, onOther);
    };
  }, [open, uid]);

  const toggle = () => {
    if (!open) window.dispatchEvent(new CustomEvent(DISCLOSURE_EVENT, { detail: uid }));
    setOpen(!open);
  };

  return (
    <div ref={root} className="relative hidden lg:block">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-menu`}
        onClick={toggle}
        className={cn(linkClass, 'inline-flex max-w-[11rem] cursor-pointer rounded-pill px-1 text-[1rem]')}
      >
        <Avatar url={slot.avatar} name={slot.name} />
        <span className="sr-only">{accountMenuCopy.open(name)}</span>
        <span aria-hidden="true" className="hidden truncate xl:inline">
          {name}
        </span>
      </button>
      <div
        id={`${uid}-menu`}
        hidden={!open}
        className="absolute right-0 top-full z-40 mt-2 grid min-w-[12rem] rounded-sm border border-ink-200 bg-surface-100 px-4 py-2 shadow-warm"
      >
        <MenuLinks onNavigate={() => setOpen(false)} className="flex w-full text-[1rem]" />
      </div>
    </div>
  );
}

/** A 32px round photo, or the name's first letter on a tint. Decorative: the name is beside it. */
function Avatar({ url, name }: { url: string | null; name: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google's photo URL, shown as is, not proxied
      <img src={url} alt="" width={32} height={32} referrerPolicy="no-referrer" className="size-8 shrink-0 rounded-full border border-ink-200 object-cover" />
    );
  }
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-200 font-body text-[0.9375rem] font-semibold text-ink-900">
      {(name ?? '').trim().charAt(0).toUpperCase() || '·'}
    </span>
  );
}
