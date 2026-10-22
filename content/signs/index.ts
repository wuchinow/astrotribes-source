// The sign library: one plain line for the Sun, Moon, and Rising in each sign. The words live in
// signs.json so Dawa's review is a content-only change; every entry carries reviewed and source.
import type { SignId } from '@/lib/keys';
import type { ThreeBody } from '@/lib/free-chart';
import library from './signs.json';

export interface SignLine {
  body: ThreeBody;
  sign: SignId;
  line: string;
  /** False until Dawa approves the line. */
  reviewed: boolean;
  /** 'draft' for ours; Dawa's lines say where they came from. */
  source: string;
}

export const SIGN_LINES = library.entries as readonly SignLine[];

const byKey = new Map(SIGN_LINES.map((entry) => [`${entry.body}:${entry.sign}`, entry]));

export const signLine = (body: ThreeBody, sign: SignId): SignLine | undefined =>
  byKey.get(`${body}:${sign}`);
