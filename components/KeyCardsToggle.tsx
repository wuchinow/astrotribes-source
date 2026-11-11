'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';

const cards = () => [...document.querySelectorAll<HTMLDetailsElement>('details[data-key-card]')];

/**
 * Opens or closes every short card on Your chart at once (5c), for a member who would rather read
 * straight through. It follows the cards: once the last one is opened by hand it offers to close them.
 */
export function KeyCardsToggle({ openAll, closeAll, className }: { openAll: string; closeAll: string; className?: string }) {
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const all = cards();
      setAllOpen(all.length > 0 && all.every((card) => card.open));
    };
    // `toggle` does not bubble, so it is caught on the way down.
    document.addEventListener('toggle', sync, true);
    return () => document.removeEventListener('toggle', sync, true);
  }, []);

  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      onClick={() => {
        const next = !allOpen;
        for (const card of cards()) card.open = next;
        setAllOpen(next);
      }}
    >
      {allOpen ? closeAll : openAll}
    </Button>
  );
}
