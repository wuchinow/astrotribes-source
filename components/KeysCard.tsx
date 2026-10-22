import type { CSSProperties } from 'react';
import skyFiles from '@/public/sky-images/credits.json';
import { BODIES, type BodyId, type KeyId } from '@/lib/keys';
import { SKY } from '@/lib/sky';
import { GlyphIcon } from './GlyphIcon';
import { KeyChip } from './KeyChip';

type KeysSky = 'keysSun' | 'keysMoon' | 'keysRising';

interface KeysCardProps {
  body: Extract<BodyId, 'sun' | 'moon' | 'rising'>;
  /** The card's keys, by id: names and glosses come from lib/keys.ts. */
  keys: readonly KeyId[];
  sky: KeysSky;
}

/**
 * One of the landing's three Keys cards (1h, design system v23's card-grid exception): an inked sky
 * image in a night-900 window at the top, Dawa's Sun or Moon glyph (none on Rising), the body's name,
 * and its keys with their one-line meanings. On Paper the window is its own night with a clean
 * edge; on Night it fades into the card. The image loads lazily, at its manifest strength scaled by
 * the visitor's wash; None hides it and its credit, and the window stays as plain night.
 */
export function KeysCard({ body, keys, sky }: KeysCardProps) {
  const image = SKY[sky];
  const file = skyFiles.images[sky].files['720'];
  const glyph = body === 'sun' || body === 'moon' ? body : null;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-ink-200 bg-surface-200 shadow-rest">
      <div className="keys-window relative aspect-video">
        {/* Already a 720px WebP cut by scripts/ink-sky.mjs, one size for every width; lazy like FramedArt. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.src}
          width={file.width}
          height={file.height}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="keys-sky absolute inset-0 size-full object-cover"
          style={{ '--sky-strength': skyFiles.images[sky].strength } as CSSProperties}
        />
        <p className="keys-credit">{skyFiles.images[sky].credit}</p>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        {/* Rising has no glyph of Dawa's; its space is kept so the three titles line up. */}
        {glyph ? <GlyphIcon glyph={glyph} size={48} className="-ml-1 text-ink-900" /> : <span aria-hidden="true" className="block h-12" />}
        <h3 className="mt-2 type-heading-3 text-ink-900">{BODIES[body].name}</h3>
        <ul className="mt-4 grid gap-5">
          {keys.map((id) => (
            <li key={id}>
              <KeyChip keyId={id} showGloss />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
