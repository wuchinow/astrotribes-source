'use server';
// The admin page's writes for reports (5b, 0009). Each checks the session itself (invariant 5) and
// asks the database whether the member is an admin (0004); the policies hold the same check, so a
// member who is not one changes nothing even if they reach this.
import { redirect } from 'next/navigation';
import { isMemberId } from '@/lib/members';
import { memberClient } from '@/lib/supabase/server';

const asAdmin = async () => {
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/sign-in');
  const { data: admin } = await supabase.rpc('is_admin');
  if (admin !== true) redirect('/');
  return supabase;
};

/** Removes a Council post and marks its report handled. */
export async function removeReportedPost(form: FormData): Promise<void> {
  const supabase = await asAdmin();
  const post = form.get('post_id');
  const report = form.get('report_id');
  if (isMemberId(post)) await supabase.from('council_posts').update({ removed_at: new Date().toISOString() }).eq('id', post);
  if (isMemberId(report)) await supabase.from('reports').update({ resolved_at: new Date().toISOString() }).eq('id', report);
  redirect('/admin#reports');
}

/** Marks a report handled without removing anything. */
export async function resolveReport(form: FormData): Promise<void> {
  const supabase = await asAdmin();
  const report = form.get('report_id');
  if (isMemberId(report)) await supabase.from('reports').update({ resolved_at: new Date().toISOString() }).eq('id', report);
  redirect('/admin#reports');
}
