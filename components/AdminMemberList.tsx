'use client';

import { useId, useState } from 'react';
import { adminCopy } from '@/content/admin';
import { MEMBER_SORTS, viewMembers, type AdminMember, type MemberSort } from '@/lib/admin';

/** A member with its dates already written out on the server, so the browser renders the same text. */
export interface AdminMemberRow extends AdminMember {
  joinedDay: string;
  lastSignInDay: string | null;
}

/**
 * The admin members list (0003): a search over name and email and three orders, filtered in the
 * browser so nothing typed reaches a URL or a log. A table from md up; below it each member is a
 * small card, since the admin reads on a phone or an iPad. Names and emails left-aligned.
 */
export function AdminMemberList({ members }: { members: AdminMemberRow[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<MemberSort>('joined');
  const searchId = useId();
  const sortId = useId();
  const shown = viewMembers(members, query, sort) as AdminMemberRow[];
  const c = adminCopy;

  const finished = (m: AdminMemberRow) => Boolean(m.name) && m.birthDetails;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <label htmlFor={searchId} className="font-semibold text-[1rem] text-ink-900">
            {c.searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="field-input"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor={sortId} className="font-semibold text-[1rem] text-ink-900">
            {c.sortLabel}
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(event) => setSort(event.target.value as MemberSort)}
            className="field-input"
          >
            {MEMBER_SORTS.map((s) => (
              <option key={s} value={s}>
                {c.sorts[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 type-body-sm text-ink-700" role="status" aria-live="polite">
        {c.shown(shown.length, members.length)}
      </p>

      {members.length === 0 ? (
        <p className="mt-4 type-body text-ink-700">{c.empty}</p>
      ) : shown.length === 0 ? (
        <p className="mt-4 type-body text-ink-700">{c.noMatch}</p>
      ) : (
        <>
          {/* Phone and small tablet: one card per member. */}
          <ul className="mt-4 grid gap-3 md:hidden">
            {shown.map((m) => (
              <li key={m.id} className="rounded-md border border-ink-200 bg-surface-200 p-4 shadow-rest">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                  <span>{m.name ?? c.noName}</span>
                  {m.isDemo ? <DemoTag /> : null}
                </p>
                <p className="type-body-sm break-all text-ink-700">{m.email ?? c.noEmail}</p>
                <p className="mt-2 type-body-sm text-ink-700">{c.joinedOn(m.joinedDay)}</p>
                <p className="type-body-sm text-ink-700">{m.lastSignInDay ? c.signedInOn(m.lastSignInDay) : c.noSignIn}</p>
                <p className="mt-2 type-body-sm font-semibold text-ink-900">{finished(m) ? c.finishedYes : c.finishedNo}</p>
              </li>
            ))}
          </ul>

          {/* md and up: a table, its header held in view while the list scrolls. */}
          <div className="mt-4 hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-surface-100">
                <tr className="border-b border-ink-200">
                  <th scope="col" className="py-3 pr-4 type-label text-ink-500">
                    {c.columns.name}
                  </th>
                  <th scope="col" className="py-3 pr-4 type-label text-ink-500">
                    {c.columns.joined}
                  </th>
                  <th scope="col" className="py-3 pr-4 type-label text-ink-500">
                    {c.columns.lastSignIn}
                  </th>
                  <th scope="col" className="py-3 type-label text-ink-500">
                    {c.columns.finished}
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={m.id} className="border-b border-ink-200 align-top">
                    <td className="py-3 pr-4">
                      <span className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                        <span>{m.name ?? c.noName}</span>
                        {m.isDemo ? <DemoTag /> : null}
                      </span>
                      <span className="block type-body-sm break-all text-ink-700">{m.email ?? c.noEmail}</span>
                    </td>
                    <td className="py-3 pr-4 type-body-sm whitespace-nowrap text-ink-700">{m.joinedDay}</td>
                    <td className="py-3 pr-4 type-body-sm whitespace-nowrap text-ink-700">{m.lastSignInDay ?? c.never}</td>
                    <td className="py-3 type-body-sm text-ink-900">{finished(m) ? c.yes : c.no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function DemoTag() {
  return (
    <span className="rounded-sm border border-ink-500 px-2 py-0.5 type-caption font-semibold text-ink-700">
      {adminCopy.demo}
    </span>
  );
}
