import { AdminMemberList, type AdminMemberRow } from '@/components/AdminMemberList';
import { Eyebrow, Headline } from '@/components/Section';
import { adminCopy } from '@/content/admin';
import { formatDay, formatMoment, percent, type AdminData } from '@/lib/admin';

/**
 * What the admin members page shows (0003), given what private.admin_members() returned: three
 * numbers with last week beside each, the member list, and who looked. Dates are written out
 * here, on the server, so the browser renders the same text. It fetches nothing itself.
 */
export function AdminDashboard({ data }: { data: AdminData }) {
  const { stats } = data;
  const c = adminCopy;
  const finishedPct = percent(stats.finished, stats.total);

  const members: AdminMemberRow[] = data.members.map((m) => ({
    ...m,
    joinedDay: formatDay(m.joined) ?? '',
    lastSignInDay: formatDay(m.lastSignIn),
  }));

  const tiles = [
    { label: c.stats.total, value: stats.total, note: c.stats.weekAgo(stats.totalWeekAgo) },
    { label: c.stats.joinedWeek, value: stats.joinedWeek, note: c.stats.weekBefore(stats.joinedWeekBefore) },
    {
      label: c.stats.finished,
      value: stats.finished,
      note: [finishedPct === null ? null : c.stats.ofTotal(finishedPct), c.stats.weekAgo(stats.finishedWeekAgo)]
        .filter(Boolean)
        .join(' · '),
      help: c.stats.finishedHelp,
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Headline as="h1" line={c.line} accent={c.accent} />
      <p className="max-w-[56ch] type-body-sm text-ink-700">{c.note}</p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-md border border-ink-200 bg-surface-200 p-4 shadow-rest md:p-6">
            <dt className="type-label text-ink-500">{tile.label}</dt>
            <dd className="mt-2 font-display text-[2.5rem] leading-none text-ink-900 tabular-nums">{tile.value}</dd>
            <dd className="mt-2 type-body-sm text-ink-700">{tile.note}</dd>
            {tile.help ? <dd className="type-caption text-ink-500">{tile.help}</dd> : null}
          </div>
        ))}
      </dl>

      <section aria-labelledby="members-heading" className="mt-14">
        <h2 id="members-heading" className="mb-6 type-heading-2 text-ink-900">
          {c.listHeading}
        </h2>
        <AdminMemberList members={members} />
      </section>

      <section aria-labelledby="views-heading" className="mt-14 border-t border-ink-200 pt-10">
        <h2 id="views-heading" className="type-heading-3 text-ink-900">
          {c.viewsHeading}
        </h2>
        <p className="mt-1 type-body-sm text-ink-700">{c.viewsHelp}</p>
        {data.views.length === 0 ? (
          <p className="mt-4 type-body-sm text-ink-700">{c.viewsEmpty}</p>
        ) : (
          <ul className="mt-4 grid gap-1">
            {data.views.map((view, index) => (
              <li key={`${view.at}-${index}`} className="type-body-sm text-ink-700">
                <span className="text-ink-900">{view.who ?? c.removedAdmin}</span>, {formatMoment(view.at)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
