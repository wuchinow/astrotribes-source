'use client';

import { useEffect } from 'react';

/** Opens the <details> the URL's hash points to, on arrival and on each hash change. */
export function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  return null;
}
