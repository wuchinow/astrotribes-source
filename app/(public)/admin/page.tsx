import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminReports, type AdminReport } from '@/components/AdminReports';
import { adminCopy } from '@/content/admin';
import { parseAdminData } from '@/lib/admin';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: adminCopy.title };

/**
 * The admin members page (0003; David, Nov 4: "first just tracking users"). Anyone not on the
 * admin list, signed in or not, gets the ordinary page not found, so the page never shows that it
 * exists. The one read is private.admin_members(), called with the member's own session (never
 * the secret key): it checks the list, writes the audit row, and returns names, emails, dates,
 * and whether birth details were saved, never the details (invariant 2). Checks the session
 * itself (invariant 5). One region on the page tone, so no bands.
 */
export default async function AdminPage() {
  if (!supabaseConfigured()) notFound();
  const supabase = await memberClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) notFound();

  const { data: raw, error } = await supabase.rpc('admin_members');
  // A refusal (42501) and any other failure look the same from outside: not found.
  if (error || !raw) notFound();

  // Open reports (5b, 0009): only admins can read them (the policy). Left out until the table exists.
  const { data: rows, error: reportsError } = await supabase
    .from('reports')
    .select('id, post_id, message_id, member_id, reason, excerpt, subject_name, created_at')
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(100);
  const reports: AdminReport[] | null = reportsError
    ? null
    : (rows ?? []).map((r) => ({
        id: r.id as string,
        postId: (r.post_id as string | null) ?? null,
        messageId: (r.message_id as string | null) ?? null,
        memberId: (r.member_id as string | null) ?? null,
        reason: (r.reason as string | null) ?? null,
        excerpt: (r.excerpt as string | null) ?? null,
        subjectName: (r.subject_name as string | null) ?? null,
        createdAt: r.created_at as string,
      }));

  return <AdminDashboard data={parseAdminData(raw)} reports={reports ? <AdminReports reports={reports} /> : null} />;
}
