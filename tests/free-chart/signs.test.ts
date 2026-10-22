import { describe, expect, it } from 'vitest';
import { SIGN_LINES, signLine } from '@/content/signs';
import { THREE } from '@/lib/free-chart';
import { KEY_LIST, SIGN_IDS } from '@/lib/keys';

// The sign library is JSON, outside the lint's reach, so the copy rules are checked here.
const keyNames = KEY_LIST.map((k) => k.name).filter((name) => name !== 'Tribe');

describe('the sign library', () => {
  it('has one line for the Sun, Moon, and Rising in every sign', () => {
    expect(SIGN_LINES).toHaveLength(36);
    for (const sign of SIGN_IDS) {
      for (const body of THREE) expect(signLine(body, sign)?.line, `${body} ${sign}`).toBeTruthy();
    }
  });

  it('marks every line with its review state and source', () => {
    for (const entry of SIGN_LINES) {
      expect(typeof entry.reviewed).toBe('boolean');
      expect(entry.source).toMatch(/\S/);
    }
  });

  it('follows the copy rules: no exclamation marks, no em-dashes, no key names', () => {
    for (const { line, body, sign } of SIGN_LINES) {
      const label = `${body} ${sign}`;
      expect(line, label).not.toContain('!');
      expect(line, label).not.toContain('—');
      for (const name of keyNames) expect(line.includes(name), `${label}: ${name}`).toBe(false);
    }
  });
});
