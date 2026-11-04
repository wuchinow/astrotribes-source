import { memberCopy, sharedCount } from '@/content/members';
import { BODY_GROUPS, bodiesIn } from '@/lib/keys';
import { splitShared, type SharedKey } from '@/lib/shared-keys';
import { KeyChip } from './KeyChip';

/**
 * The Keys two members share (3g), in the six groups of the 28 Keys page, with the outer planets'
 * sign keys in a quiet panel of their own because a whole generation shares them. `note` is the
 * birth-time line, when either chart has none.
 */
export function SharedKeys({
  shared,
  firstTime,
  note,
}: {
  shared: readonly SharedKey[];
  firstTime: (keyId: string) => boolean;
  note?: React.ReactNode;
}) {
  const { personal, generational } = splitShared(shared);
  const generationalLabel = BODY_GROUPS.find((g) => g.id === 'generational')!.name;
  return (
    <>
      <p className="mt-2 type-body font-semibold text-ink-900">{sharedCount(personal.length)}</p>
      {note}
      {personal.length === 0 ? (
        <p className="mt-6 max-w-[56ch] type-body text-ink-700">{memberCopy.sharedNone}</p>
      ) : (
        <div className="mt-8 grid gap-10">
          {BODY_GROUPS.filter((group) => group.id !== 'generational').map((group) => {
            const bodies = new Set(bodiesIn(group.id));
            const list = personal.filter((s) => bodies.has(s.key.body));
            if (list.length === 0) return null;
            return (
              <div key={group.id}>
                <h3 className="type-label text-ink-500">{group.name}</h3>
                <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map(({ key, value }) => (
                    <KeyChip key={key.id} keyId={key.id} value={value} showGloss={firstTime(key.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {generational.length > 0 ? (
        <div className="mt-10 rounded-md border border-ink-200 bg-surface-200 p-4 md:p-6">
          <h3 className="type-heading-3 text-ink-900">{generationalLabel}</h3>
          <p className="mt-1 type-body-sm text-ink-700">{memberCopy.generationalNote}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {generational.map(({ key, value }) => (
              <KeyChip key={key.id} keyId={key.id} value={value} showGloss={firstTime(key.id)} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
