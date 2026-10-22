import { GLYPHS } from '@/lib/glyphs';
import { BODIES, isGenerational, keyFor, needsBirthTime, sourceLabel, type BodyId, type KeyDef } from '@/lib/keys';
import { GlyphIcon } from './GlyphIcon';
import { KeyChip } from './KeyChip';

interface KeyRowProps {
  body: BodyId;
  /** The plain-words notes under a key that needs a birth time or is shared by a generation. */
  notes: { birthTime: string; generational: string };
  /** For a body with one key (Rising, the Galactic Center): a line in place of the missing one. */
  missing?: string;
}

function KeyCell({ keyDef, notes }: { keyDef: KeyDef; notes: KeyRowProps['notes'] }) {
  const note = needsBirthTime(keyDef) ? 'birthTime' : isGenerational(keyDef) ? 'generational' : null;
  return (
    <div data-key={keyDef.id}>
      <p className="mb-2 type-label text-ink-500">{sourceLabel(keyDef)}</p>
      <KeyChip keyId={keyDef.id} showGloss />
      {note ? (
        <p data-note={note} className="mt-1 type-caption text-ink-500">
          {notes[note]}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One body on the 28 Keys page (1k): its name, Dawa's glyph where he has drawn one, his line for the
 * body (1m), then its sign key and its house key, each through KeyChip with its one-line meaning. Everything comes from
 * lib/keys.ts by the body's id. A chip links nowhere yet (there is no page per key), so it is the
 * quiet static chip. A stand-in glyph that is not Dawa's is never shown here: the row goes without.
 * From lg the row is three columns, body, sign key, house key; below it they stack in that order.
 */
export function KeyRow({ body, notes, missing }: KeyRowProps) {
  const sign = keyFor(body, 'sign');
  const house = keyFor(body, 'house');
  const byDawa = GLYPHS[body].credit !== null;
  const gap = missing ? <p className="max-w-[40ch] type-body-sm text-ink-500">{missing}</p> : null;
  return (
    <div data-key-row="" className="grid gap-x-8 gap-y-5 py-6 lg:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="flex items-center gap-3 lg:block">
          {byDawa ? <GlyphIcon glyph={body} size={48} className="-ml-1 text-ink-900" /> : null}
          <h3 className="type-heading-3 text-ink-900 lg:mt-1">{BODIES[body].name}</h3>
        </div>
        <p data-body-line="" className="mt-1 max-w-[40ch] font-display text-[1.0625rem] leading-snug italic text-ink-700">
          {BODIES[body].line}
        </p>
      </div>
      {sign ? <KeyCell keyDef={sign} notes={notes} /> : gap}
      {house ? <KeyCell keyDef={house} notes={notes} /> : gap}
    </div>
  );
}
