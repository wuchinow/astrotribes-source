'use client';

import { X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/Button';
import { oracleCopy } from '@/content/oracle/copy';

interface HexagramMoreProps {
  /** "Hexagram 40, Xiè", the modal's heading. */
  name: string;
  parts: ReadonlyArray<{ heading: string; text: string }>;
  lines: readonly string[];
  allLines: string | null;
}

/**
 * The daily hexagram's image and six line texts (David, Oct 21): a button at the foot of the
 * hexagram card opens them in a modal, so the card never grows past the tarot card beside it. A
 * native <dialog>: Escape closes it, focus moves in and back, and the page behind is inert; a tap
 * on the backdrop closes it too.
 */
export function HexagramMore({ name, parts, lines, allLines }: HexagramMoreProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  return (
    <>
      <Button variant="secondary" size="sm" className="mt-8" onClick={() => dialog.current?.showModal()}>
        {oracleCopy.readMore}
        <span className="sr-only">{oracleCopy.readMoreAbout(name)}</span>
      </Button>
      <dialog
        ref={dialog}
        aria-label={name}
        className="oracle-modal"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="oracle-modal-head">
          <p className="type-label text-ink-500">{name}</p>
          <button
            type="button"
            onClick={close}
            className="-mr-2 inline-flex size-touch shrink-0 items-center justify-center rounded-pill text-ink-700 transition-colors duration-200 hover:bg-surface-200 hover:text-ink-900"
          >
            <X aria-hidden="true" size={22} strokeWidth={1.5} />
            <span className="sr-only">{oracleCopy.close}</span>
          </button>
        </div>
        <div className="oracle-modal-body">
          {parts.map((p) => (
            <section key={p.heading} className="mb-8">
              <h2 className="mb-2 type-label text-ink-500">{p.heading}</h2>
              <p className="type-body text-ink-700">{p.text}</p>
            </section>
          ))}
          <section>
            <h2 className="mb-2 type-label text-ink-500">{oracleCopy.sixLines}</h2>
            <ol className="grid gap-3">
              {lines.map((text, i) => (
                <li key={i} className="type-body text-ink-700">
                  {text}
                </li>
              ))}
            </ol>
            {allLines ? (
              <>
                <p className="mt-5 mb-1 type-label text-ink-500">{oracleCopy.allLines}</p>
                <p className="type-body text-ink-700">{allLines}</p>
              </>
            ) : null}
          </section>
        </div>
      </dialog>
    </>
  );
}
