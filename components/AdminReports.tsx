import { removeReportedPost, resolveReport } from '@/app/(public)/admin/actions';
import { LocalTime } from './LocalTime';
import { reportsAdminCopy } from '@/content/council';
import { Button } from './Button';

export interface AdminReport {
  id: string;
  postId: string | null;
  messageId: string | null;
  memberId: string | null;
  reason: string | null;
  excerpt: string | null;
  subjectName: string | null;
  createdAt: string;
}

/**
 * Open reports on the admin page (5b, 0009). Only admins can read reports (the policy, not this
 * component). A reported post or message shows the words the database copied when it was reported, so
 * no admin needs a right to read anyone's conversations. Who reported is never shown.
 */
export function AdminReports({ reports }: { reports: AdminReport[] }) {
  const c = reportsAdminCopy;
  return (
    <section id="reports" aria-labelledby="reports-heading" className="mt-14 scroll-mt-28">
      <h2 id="reports-heading" className="type-heading-2 text-ink-900">
        {c.heading}
      </h2>
      {reports.length === 0 ? (
        <p className="mt-4 type-body-sm text-ink-700">{c.none}</p>
      ) : (
        <ul role="list" className="mt-6 grid max-w-[44rem] gap-4">
          {reports.map((report) => (
            <li key={report.id} className="rounded-md border border-ink-200 bg-surface-200 p-5">
              <p className="type-label text-ember-500">
                {report.postId ? c.post : report.messageId ? c.message : c.member}
              </p>
              <p className="mt-1 type-body-sm text-ink-700">
                {report.subjectName ? c.about(report.subjectName) : null} · <LocalTime iso={report.createdAt} />
              </p>
              {report.excerpt ? (
                <p className="mt-2 whitespace-pre-line type-body text-ink-900 [overflow-wrap:anywhere]">{report.excerpt}</p>
              ) : null}
              <p className="mt-2 type-body-sm text-ink-700 [overflow-wrap:anywhere]">
                <span className="font-semibold text-ink-900">{c.reason}:</span> {report.reason ?? c.noReason}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {report.postId ? (
                  <form action={removeReportedPost}>
                    <input type="hidden" name="post_id" value={report.postId} />
                    <input type="hidden" name="report_id" value={report.id} />
                    <Button type="submit" variant="danger" size="sm">
                      {c.remove}
                    </Button>
                  </form>
                ) : null}
                <form action={resolveReport}>
                  <input type="hidden" name="report_id" value={report.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    {c.resolve}
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
