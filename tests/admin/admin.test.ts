import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatDay, parseAdminData, percent, viewMembers, type AdminMember } from '@/lib/admin';

// The admin members page (0003). What the database returns is checked in
// supabase/tests/database/09_admin_members.test.sql; these check how the page reads it.

const member = (over: Partial<AdminMember> & { id: string }): AdminMember => ({
  email: `${over.id}@example.test`,
  name: null,
  joined: '2026-11-01T12:00:00Z',
  lastSignIn: null,
  birthDetails: false,
  isDemo: false,
  ...over,
});

describe('parseAdminData', () => {
  it('reads the function’s JSON', () => {
    const data = parseAdminData({
      stats: { total: 3, total_week_ago: 1, joined_week: 2, joined_week_before: 1, finished: 1, finished_week_ago: 0 },
      demo: 1,
      members: [
        { id: 'a', email: 'a@example.test', name: 'Ada', joined: '2026-11-02T00:00:00Z', last_sign_in: null, birth_details: true, is_demo: false },
      ],
      views: [{ who: 'Ada', at: '2026-11-04T03:00:00Z' }],
    });
    expect(data.stats).toEqual({ total: 3, totalWeekAgo: 1, joinedWeek: 2, joinedWeekBefore: 1, finished: 1, finishedWeekAgo: 0 });
    expect(data.demo).toBe(1);
    expect(data.members).toEqual([
      { id: 'a', email: 'a@example.test', name: 'Ada', joined: '2026-11-02T00:00:00Z', lastSignIn: null, birthDetails: true, isDemo: false },
    ]);
    expect(data.views).toEqual([{ who: 'Ada', at: '2026-11-04T03:00:00Z' }]);
  });

  it('reads anything missing or malformed as empty, never as a crash', () => {
    for (const raw of [null, undefined, 'x', 3, [], {}, { stats: 'x', members: 'x', views: {} }]) {
      const data = parseAdminData(raw);
      expect(data.stats.total).toBe(0);
      expect(data.members).toEqual([]);
      expect(data.views).toEqual([]);
    }
  });

  it('drops a member row with no id or no join date, and keeps only true as yes', () => {
    const data = parseAdminData({
      members: [{ email: 'x' }, { id: 'b', joined: '2026-11-01T00:00:00Z', birth_details: 'true' }],
    });
    expect(data.members.map((m) => m.id)).toEqual(['b']);
    expect(data.members[0].birthDetails).toBe(false);
  });

  it('carries no birth detail field, whatever the JSON holds', () => {
    const data = parseAdminData({
      members: [{ id: 'c', joined: '2026-11-01T00:00:00Z', birth_date: '2000-01-01', place_label: 'x' }],
    });
    expect(Object.keys(data.members[0]).sort()).toEqual(['birthDetails', 'email', 'id', 'isDemo', 'joined', 'lastSignIn', 'name']);
  });
});

describe('viewMembers', () => {
  const list = [
    member({ id: 'old', name: 'Zed', joined: '2026-10-01T00:00:00Z', lastSignIn: '2026-11-03T00:00:00Z' }),
    member({ id: 'new', name: 'amy', joined: '2026-11-03T00:00:00Z', lastSignIn: '2026-11-01T00:00:00Z' }),
    member({ id: 'mid', name: null, email: 'Bea@Example.test', joined: '2026-10-20T00:00:00Z' }),
  ];

  it('puts the newest first by default', () => {
    expect(viewMembers(list, '', 'joined').map((m) => m.id)).toEqual(['new', 'mid', 'old']);
  });

  it('sorts by last sign-in, never signed in last', () => {
    expect(viewMembers(list, '', 'signedIn').map((m) => m.id)).toEqual(['old', 'new', 'mid']);
  });

  it('sorts by name A to Z, any case, falling back to the email', () => {
    expect(viewMembers(list, '', 'name').map((m) => m.id)).toEqual(['new', 'mid', 'old']);
  });

  it('searches name and email, any case, any part', () => {
    expect(viewMembers(list, 'BEA', 'joined').map((m) => m.id)).toEqual(['mid']);
    expect(viewMembers(list, ' ze ', 'joined').map((m) => m.id)).toEqual(['old']);
    expect(viewMembers(list, 'nobody', 'joined')).toEqual([]);
  });

  it('leaves the list it was given alone', () => {
    const before = list.map((m) => m.id);
    viewMembers(list, '', 'name');
    expect(list.map((m) => m.id)).toEqual(before);
  });
});

describe('the helpers', () => {
  it('rounds a percentage, and gives none of nothing', () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(0, 0)).toBeNull();
  });

  it('writes dates in Eastern time', () => {
    // 03:00 UTC on Nov 4 is still Nov 3 in Asheville.
    expect(formatDay('2026-11-04T03:00:00Z')).toBe('Nov 3, 2026');
    expect(formatDay(null)).toBeNull();
    expect(formatDay('not a date')).toBeNull();
  });
});

describe('the admin page', () => {
  const page = readFileSync(path.join(process.cwd(), 'app/(public)/admin/page.tsx'), 'utf8');

  it('checks the session itself and shows not found to anyone else (invariant 5)', () => {
    expect(page).toContain('supabase.auth.getUser()');
    expect(page).toContain("rpc('admin_members')");
    expect(page.match(/notFound\(\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(page).not.toContain('redirect(');
  });

  it('reads with the member’s own session, never the secret key', () => {
    expect(page).toContain("from '@/lib/supabase/server'");
    expect(page).not.toContain('@/lib/supabase/admin');
  });
});
