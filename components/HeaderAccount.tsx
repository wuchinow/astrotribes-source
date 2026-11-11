'use client';

import { ChevronDown, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ComponentProps, type ReactNode } from 'react';
import { startGoogleSignIn } from '@/app/(public)/sign-in/actions';
import { accountSlotCopy } from '@/content/account';
import { communityCopy } from '@/content/council';
import { accountMenuCopy } from '@/content/welcome';
import { cn } from '@/lib/cn';
import { syncMemberHint } from '@/lib/member-hint';
import { FEEDBACK_LINK, MEMBER_ACTION, PRIMARY_ACTION } from '@/lib/site';
import { Button } from './Button';
import { browserClient } from '@/lib/supabase/browser';
import { DISCLOSURE_EVENT } from './AppearancePanel';

type Slot =
  | { state: 'loading' }
  | { state: 'out' }
  | { state: 'in'; name: string | null; avatar: string | null; admin: boolean; inbox: number };

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
  // The before-paint hint (lib/member-hint.ts) follows the real answer once the session is read (5a).
  if (slot.state !== 'loading') syncMemberHint(slot.state === 'in');
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
    // The admin check (0004) answers yes or no for this session only; any error reads as no.
    // The inbox count (5b): hellos waiting for this member's answer and messages they have not read,
    // counted under RLS. Any error (the tables not there yet) reads as none.
    const [{ data: profile }, { data: admin }, { count: hellos }, { count: unread }] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', data.user.id).maybeSingle(),
      supabase.rpc('is_admin'),
      supabase.from('hellos').select('id', { count: 'exact', head: true }).eq('recipient_id', data.user.id).eq('status', 'pending'),
      supabase.from('messages').select('id', { count: 'exact', head: true }).is('read_at', null).neq('sender_id', data.user.id),
    ]);
    publish({
      state: 'in',
      name: profile?.display_name ?? null,
      avatar: avatarOf(data.user.user_metadata),
      admin: admin === true,
      inbox: (hellos ?? 0) + (unread ?? 0),
    });
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

/**
 * The primary button everywhere (David, Nov 4): "Get your free chart" for a visitor, "See your chart"
 * for a member, straight to it. A client island, so the public pages stay static; a member may see
 * the visitor's words for a moment while the session is read.
 */
export function PrimaryAction(props: Omit<ComponentProps<typeof Button>, 'href' | 'children'>) {
  const action = useMember().state === 'in' ? MEMBER_ACTION : PRIMARY_ACTION;
  return (
    <Button {...props} href={action.href}>
      {action.label}
    </Button>
  );
}

const linkClass =
  'min-h-touch items-center gap-2 whitespace-nowrap font-semibold text-cobalt-600 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4';

/**
 * The header's account slot (2b, 2c). Signed out: Sign in, before the primary action. Signed in:
 * the member's photo (an initial when there is none) at the far right, a button that opens a small
 * menu: Admin for an admin only (0004), Account, Send feedback (Nov 9), Sign out (David, Oct 22), with an
 * envelope before the photo for Messages and its count (5b). Your chart and Community are in the main nav (5c). `show` places each copy, so it renders only
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
    // One click to Google (David, Nov 4): the link posts straight to the action that starts sign-in,
    // with no stop on /sign-in. When email sign-in arrives this can open a small menu of the two.
    return (
      <form action={startGoogleSignIn} className={place === 'header' ? 'hidden lg:inline-flex' : 'flex w-full'}>
        <button
          type="submit"
          className={cn(linkClass, 'cursor-pointer', place === 'header' ? 'inline-flex px-2 text-[1rem]' : 'flex w-full text-[1.125rem]')}
        >
          {accountSlotCopy.signIn}
        </button>
      </form>
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
        <MenuLinks admin={slot.admin} inbox={slot.inbox} onNavigate={onNavigate} className="flex w-full text-[1.125rem]" />
      </div>
    );
  }
  return <AccountMenu name={name} slot={slot} />;
}

/**
 * The menu's links: Messages (with the mail icon and what is waiting), Admin, Account, Send feedback,
 * Sign out. Your chart and Council are in the main nav (5b and 5c, Nov 11); Messages sits here, not in
 * the header bar, because the bar is full (David, Nov 11). Admin shows
 * only when the database says this member is on the admin list (David, Nov 4); it is a convenience,
 * not the gate: /admin checks the list itself.
 */
function MenuLinks({
  admin,
  inbox,
  onNavigate,
  className,
}: {
  admin: boolean;
  inbox: number;
  onNavigate?: () => void;
  className: string;
}) {
  return (
    <>
      <Link href="/members/messages" onClick={onNavigate} className={cn(linkClass, className)}>
        <Mail aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
        {accountMenuCopy.messages}
        {inbox > 0 ? <span className="type-label text-ember-500 tabular-nums">{accountMenuCopy.newCount(inbox)}</span> : null}
      </Link>
      {admin ? (
        <Link href="/admin" onClick={onNavigate} className={cn(linkClass, className)}>
          {accountMenuCopy.admin}
        </Link>
      ) : null}
      <Link href="/account" onClick={onNavigate} className={cn(linkClass, className)}>
        {accountMenuCopy.account}
      </Link>
      <Link href={FEEDBACK_LINK.href} onClick={onNavigate} className={cn(linkClass, className)}>
        {FEEDBACK_LINK.label}
      </Link>
      <form method="post" action="/auth/sign-out">
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
    <div ref={root} className="relative hidden items-center lg:flex">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-menu`}
        onClick={toggle}
        title={name}
        className={cn(linkClass, 'inline-flex cursor-pointer gap-1 rounded-pill px-1 text-[1rem]')}
      >
        {/* Something waiting (a hello to answer, an unread message): an ember dot on the photo, and the
            count in the button's name, since Messages itself is inside the menu. */}
        <span className="relative inline-flex">
          <Avatar url={slot.avatar} name={slot.name} />
          {slot.inbox > 0 ? (
            <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-surface-100 bg-ember-500" />
          ) : null}
        </span>
        <span className="sr-only">
          {accountMenuCopy.open(name)}
          {slot.inbox > 0 ? `, ${communityCopy.inbox(slot.inbox)}` : ''}
        </span>
        {/* The photo alone, with a mark that it opens (David, Nov 11: "my username is truncated and
            i'm on a desktop"): with the member links in the nav, a name beside the photo had no
            room inside the content width at any window size. The whole name leads the menu. */}
        <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0 transition-transform duration-200', open && 'rotate-180')} strokeWidth={1.75} />
      </button>
      <div
        id={`${uid}-menu`}
        hidden={!open}
        className="absolute right-0 top-full z-40 mt-2 grid w-max min-w-[12rem] max-w-[min(20rem,calc(100vw-2rem))] rounded-sm border border-ink-200 bg-surface-100 px-4 py-2 shadow-warm"
      >
        {/* Never cut short: the menu is as wide as the name needs, up to 20rem, and past that the name
            wraps (`w-max`: without it the menu took its narrowest width, and a two-word name broke
            onto two lines for no reason). */}
        <p data-account-name="" className="flex min-h-touch items-center border-b border-ink-200 font-semibold break-words text-ink-900">
          <span className="min-w-0">{name}</span>
        </p>
        <MenuLinks admin={slot.admin} inbox={slot.inbox} onNavigate={() => setOpen(false)} className="flex w-full text-[1rem]" />
      </div>
    </div>
  );
}

/** A 32px round photo, or the name's first letter on a tint. Decorative: the name is beside it, or in the button's own name. */
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
