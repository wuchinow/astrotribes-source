import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FreeChart } from '@/components/FreeChart';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Your free chart' };

// Open to anyone since Oct 22 (the passcode came off with the public source). The page itself never
// touches the engine: the form posts to /api/chart. A member who has saved a chart goes to it
// (2c), so every "Get your chart" button lands right; only a visitor with a session cookie costs a
// session check.
export default async function ChartPage() {
  const store = await cookies();
  if (supabaseConfigured() && store.getAll().some(({ name }) => name.startsWith('sb-'))) {
    const supabase = await memberClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: sun } = await supabase
        .from('placements')
        .select('body')
        .eq('user_id', data.user.id)
        .eq('body', 'sun')
        .maybeSingle();
      if (sun) redirect('/your-chart');
    }
  }
  return <FreeChart />;
}
