import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Your free chart' };

// Every "Get your free chart" button lands here. Since Nov 3 (David) the chart is free with an
// account, so this page draws nothing: a signed-in member goes to the welcome steps, which send a
// member with a saved chart straight on to it, and everyone else goes to sign-in, whose callback
// opens the welcome steps. Only a visitor with a session cookie costs a session check (invariant 5:
// the welcome and chart pages check the session again themselves).
export default async function ChartPage() {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const store = await cookies();
  if (store.getAll().some(({ name }) => name.startsWith('sb-'))) {
    const supabase = await memberClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect('/welcome');
  }
  redirect('/sign-in');
}
