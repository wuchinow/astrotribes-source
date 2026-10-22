'use client';
// The browser's Supabase client (2b): the publishable key only, never the secret (invariant 4).
// Used by the header's account slot to read the signed-in member's own name; pages stay static.
import { createBrowserClient } from '@supabase/ssr';
import { supabasePublishableKey, supabaseUrl } from './env';

export function browserClient() {
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  return url && key ? createBrowserClient(url, key) : null;
}
