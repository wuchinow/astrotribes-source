'use client';

import { useLayoutEffect } from 'react';
import { applyOracleDay } from '@/lib/oracle-head';

/**
 * Picks the visitor's local day before paint on every arrival at /oracle, a client-side navigation
 * included, where React does not run the page's inline day script (lib/oracle-head.ts, U26).
 */
export function OracleDaySync({ days }: { days: readonly string[] }) {
  useLayoutEffect(() => {
    applyOracleDay(days);
  }, [days]);
  return null;
}
