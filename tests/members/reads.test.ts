import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PLACEMENT_COLUMNS, PROFILE_COLUMNS } from '@/lib/members';
import { VISIBILITY_LEVELS } from '@/lib/visibility';

// What the members pages may read (3g). A member never reads a degree or minute (0001's column
// grant), never another member's birth details, and never through the secret key.
const root = process.cwd();
const files = ['lib/members.ts', 'app/(public)/members/page.tsx', 'app/(public)/members/[id]/page.tsx'];
const text = (file: string) => readFileSync(path.join(root, file), 'utf8');

describe('the members pages', () => {
  it('read placements by the columns members are granted, and no degree', () => {
    const columns = PLACEMENT_COLUMNS.split(',').map((c) => c.trim());
    const granted = ['user_id', 'body', 'sign', 'house', 'retrograde', 'engine_version', 'computed_at', 'sign_alternate'];
    for (const column of columns) expect(granted).toContain(column);
    expect(columns).not.toContain('degree');
    expect(columns).not.toContain('minute');
  });

  it('read only a name, an id, and the demo flag from another profile', () => {
    expect(PROFILE_COLUMNS.split(',').map((c) => c.trim())).toEqual(['id', 'display_name', 'is_demo']);
  });

  it('never select everything, touch birth data, or use the admin client', () => {
    for (const file of files) {
      const source = text(file);
      expect(source, file).not.toMatch(/select\(\s*['"]\*['"]/);
      expect(source, file).not.toMatch(/['"]birth_data['"]/);
      expect(source, file).not.toMatch(/select\([^)]*\b(degree|minute)\b/);
      expect(source, file).not.toMatch(/supabase\/admin/);
    }
  });

  it('check the session themselves', () => {
    for (const file of files.slice(1)) expect(text(file), file).toMatch(/auth\.getUser\(\)/);
  });

  it('offer the same three levels the database checks', () => {
    const schema = text('supabase/migrations/20261002190030_schema_and_rls.sql');
    expect(schema).toMatch(/visibility in \('private', 'tribe', 'everyone'\)/);
    expect([...VISIBILITY_LEVELS]).toEqual(['private', 'tribe', 'everyone']);
  });
});
