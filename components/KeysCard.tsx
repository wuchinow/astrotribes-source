import type { CSSProperties } from 'react';
import skyFiles from '@/public/sky-images/credits.json';
import { BODIES, KEYS, sourceLabel, type BodyId, type KeyId } from '@/lib/keys';
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
 * One of the landing's three Keys cards (1h, design system v23's card-grid exception): a sky
 * image in a night-900 window at the top, Dawa's Sun or Moon glyph (none on Rising), the body's name,
 * and its keys with their one-line meanings. On Paper the window is its own night with a clean
 * edge; on Night it fades into the card. The image loads lazily, at its manifest strength scaled by
 * the visitor's wash; None hides it, and the window stays as plain night. No text sits on the image
 * (David, Nov 3), and its credit is in the footer (David, Nov 4, like the art).
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
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        {/* Rising has no glyph of Dawa's; its space is kept so the three titles line up. */}
        {glyph ? <GlyphIcon glyph={glyph} size={72} className="-ml-1 text-ink-900" /> : <span aria-hidden="true" className="block h-18" />}
        <h3 className="mt-2 type-heading-2 text-ink-900">{BODIES[body].name}</h3>
        {/* Each Key in a tile of its own with where it comes from, so the house Keys (Realm, Hearth)
            stand out as clearly as the sign Keys (Dawa, Nov 7). */}
        <ul className="mt-4 grid gap-4">
          {keys.map((id) => (
            <li key={id} data-starter-key={id} className="rounded-md border border-ink-200 bg-surface-100 p-4">
              <p className="mb-2 type-label text-ink-500">{sourceLabel(KEYS[id])}</p>
              <KeyChip keyId={id} showGloss />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
