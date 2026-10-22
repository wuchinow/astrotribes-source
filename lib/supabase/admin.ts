// The secret-key client (2b), server only. Two uses, both after the member's own session check:
// reading the member's placements with degrees for Export my data (M53), and deleting the member's
// auth user so 0001's cascade runs. It has no grant on birth_data or profiles (2a). Only the files
// listed in tests/auth/boundary.test.ts may import it. The key is never logged or returned.
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from './env';

export function adminClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('supabase_admin_unconfigured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
