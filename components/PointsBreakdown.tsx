import { pointsCopy } from '@/content/members';
import type { CloseMatch, ConnectionPoints } from '@/lib/connection-points';
import { BODIES, SIGNS, houseOf, type HouseNumber, type SignId } from '@/lib/keys';
import { KeyChip } from './KeyChip';

const where = (value: SignId | HouseNumber): string =>
  typeof value === 'number' ? pointsCopy.house(houseOf(value).roman) : SIGNS[value].name;

const closeLabel = ({ mine, theirs, kind }: CloseMatch): string =>
  kind === 'newMoon'
    ? pointsCopy.newMoon
    : kind === 'fullMoon'
      ? pointsCopy.fullMoon
      : kind === 'close'
        ? pointsCopy.close(BODIES[mine].name, BODIES[theirs].name)
        : pointsCopy.sitsOn(BODIES[mine].name, BODIES[theirs].name);

function Row({ children, points }: { children: React.ReactNode; points: number }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-ink-200 py-3 last:border-b-0">
      <div className="min-w-0 type-body-sm text-ink-900 [overflow-wrap:anywhere]">{children}</div>
      <span className="shrink-0 font-mono text-[0.9375rem] text-ink-700 tabular-nums">{pointsCopy.points(points)}</span>
    </li>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="type-label text-ink-500">{heading}</h3>
      <ul className="mt-2">{children}</ul>
    </div>
  );
}

/**
 * How two members' connection points add up (3p, 3q): each shared Key with its points, the places
 * the two charts meet across bodies, the placements close by degree (named, never the degrees), and
 * the rare combinations, then the total. Key names reach the screen through KeyChip only;
 * `firstTime` has usually shown each gloss already, higher on the page.
 */
export function PointsBreakdown({
  points,
  firstTime,
  noTime,
}: {
  points: ConnectionPoints;
  firstTime: (keyId: string) => boolean;
  /** Either chart has no birth time. */
  noTime: boolean;
}) {
  const { keys, cross, bonuses, close, total } = points;
  return (
    <div className="grid max-w-[40rem] gap-8">
      <p className="type-body-sm text-ink-700">
        {pointsCopy.intro}
        {noTime ? ` ${pointsCopy.noTime}` : null}
      </p>
      {keys.length > 0 ? (
        <Group heading={pointsCopy.keysHeading}>
          {keys.map(({ shared: { key, value }, points: p }) => (
            <Row key={key.id} points={p}>
              <KeyChip keyId={key.id} value={value} showGloss={firstTime(key.id)} />
              {key.body === 'southNode' ? (
                <p className="mt-1 type-caption text-ink-500">{pointsCopy.mirror(BODIES.northNode.name)}</p>
              ) : null}
            </Row>
          ))}
        </Group>
      ) : null}
      {cross.length > 0 ? (
        <Group heading={pointsCopy.crossHeading}>
          {cross.map((c) => (
            <Row key={`${c.mine}-${c.theirs}-${c.dimension}`} points={c.points}>
              {pointsCopy.cross(BODIES[c.mine].name, BODIES[c.theirs].name, where(c.value))}
            </Row>
          ))}
        </Group>
      ) : null}
      {close.length > 0 ? (
        <Group heading={pointsCopy.closeHeading}>
          {close.map(({ match, points: p }) => (
            <Row key={`${match.mine}-${match.theirs}-${match.kind}`} points={p}>
              {closeLabel(match)}
            </Row>
          ))}
        </Group>
      ) : null}
      {bonuses.length > 0 ? (
        <Group heading={pointsCopy.bonusHeading}>
          {bonuses.map((b) => (
            <Row key={b.bodies.join('-')} points={b.points}>
              {pointsCopy.bonus(b.bodies.map((body) => BODIES[body].name))}
            </Row>
          ))}
        </Group>
      ) : null}
      <div className="flex items-center justify-between gap-4 border-t-2 border-ink-900 pt-3">
        <span className="type-body font-semibold text-ink-900">{pointsCopy.total}</span>
        <span className="font-mono text-[1.0625rem] font-semibold text-ink-900 tabular-nums">{total}</span>
      </div>
      <div data-points-odds="">
        <h3 className="type-label text-ink-500">{pointsCopy.oddsHeading}</h3>
        <p className="mt-1 type-body-sm text-ink-700">
          {pointsCopy.odds(BODIES.sun.name, BODIES.moon.name, BODIES.rising.name)}
        </p>
      </div>
    </div>
  );
}
