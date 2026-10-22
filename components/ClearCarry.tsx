'use client';

import { useEffect } from 'react';
import { clearCarry } from '@/lib/carry';

/** Once birth details are saved, the free chart's copy in this tab goes (2c). Renders nothing. */
export function ClearCarry() {
  useEffect(() => clearCarry(), []);
  return null;
}
