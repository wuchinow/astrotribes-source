'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Eyebrow, Headline } from '@/components/Section';
import { welcomeGuideCopy as copy } from '@/content/welcome';
import { cn } from '@/lib/cn';

/** The browser's note that this member has seen the guide. Holds only "1"; listed on the Privacy page. */
export const WELCOME_SEEN_KEY = 'at-welcome-seen';

function seen(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  } catch {
    // Storage blocked (a private window, a strict setting): show nothing rather than show it every visit.
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
  } catch {
    // Nothing to do: the guide stays closed for this visit either way.
  }
}

/**
 * The first-visit welcome guide (David, Nov 4): four short steps over Your chart, the first time a
 * member lands there, on birth details, the wheel and the Tribe, Members, and Famous charts and
 * Learn. Shown once per browser, noted in local storage the moment it opens, so a reload or a link
 * followed from inside it never brings it back; no database change. Skip, Escape, the close button,
 * and a tap on the backdrop all close it. A tertiary button under the page's next steps opens it
 * again. A native <dialog>, like the Oracle's: focus moves in and back, and the page behind is inert.
 */
export function WelcomeGuide() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const total = copy.steps.length;
  const current = copy.steps[step];
  const last = step === total - 1;

  const open = () => {
    setStep(0);
    markSeen();
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  // First visit only: the note is written as it opens.
  useEffect(() => {
    if (seen()) return;
    markSeen();
    dialog.current?.showModal();
  }, []);

  return (
    <>
      <Button variant="tertiary" onClick={open}>
        {copy.again}
      </Button>
      <dialog
        ref={dialog}
        aria-label={copy.label}
        aria-describedby="welcome-guide-body"
        className="oracle-modal welcome-modal"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="oracle-modal-head">
          <ol aria-hidden="true" className="flex gap-2">
            {copy.steps.map((s, i) => (
              <li
                key={s.id}
                className={cn('size-2 rounded-pill', i <= step ? 'bg-highlight' : 'bg-ink-200')}
              />
            ))}
          </ol>
          <button
            type="button"
            onClick={close}
            className="-mr-2 inline-flex size-touch shrink-0 items-center justify-center rounded-pill text-ink-700 transition-colors duration-200 hover:bg-surface-200 hover:text-ink-900"
          >
            <X aria-hidden="true" size={22} strokeWidth={1.5} />
            <span className="sr-only">{copy.close}</span>
          </button>
        </div>
        <div className="oracle-modal-body" data-welcome-step={current.id}>
          <Eyebrow>{copy.eyebrow(step + 1, total)}</Eyebrow>
          <Headline line={current.line} accent={current.accent} />
          <div id="welcome-guide-body" className="grid gap-3">
            {current.body.map((text) => (
              <p key={text} className="text-ink-700">
                {text}
              </p>
            ))}
          </div>
          {current.links.length ? (
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-1">
              {current.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="inline-flex min-h-touch items-center px-2 font-semibold text-cobalt-600 underline decoration-1 underline-offset-4 hover:decoration-gold-500 hover:decoration-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {last ? <span /> : (
              <Button variant="tertiary" onClick={close}>
                {copy.skip}
              </Button>
            )}
            <div className="flex gap-3">
              {step > 0 ? (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  {copy.back}
                </Button>
              ) : null}
              <Button onClick={last ? close : () => setStep(step + 1)} autoFocus>
                {last ? copy.done : copy.next}
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
