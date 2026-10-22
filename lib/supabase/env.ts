// The two public Supabase values (2a): the project URL and the publishable key. Both are public by
// design; the browser bundle carries them. Written out in full so Next inlines them on the client.
export const supabaseUrl = (): string | null => process.env.NEXT_PUBLIC_SUPABASE_URL || null;
export const supabasePublishableKey = (): string | null =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || null;

/** False when either value is unset (a local build without .env.local): sign-in then stays off. */
export const supabaseConfigured = (): boolean => supabaseUrl() !== null && supabasePublishableKey() !== null;
