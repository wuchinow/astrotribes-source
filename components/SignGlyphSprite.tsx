import { signGlyphSpriteId } from '@/lib/glyphs';
import { SIGN_IDS } from '@/lib/keys';
import sprite from '@/lib/sign-glyph-sprite.json';

/**
 * The twelve sign glyphs' drawings, written into the page once and out of sight, so a
 * `GlyphIcon sprite` draws from the page itself and not from twelve files (4z, David, Nov 10: the
 * hero wheel "needs to be fast on first load and every load"). A first visit used to show the
 * wheel's discs empty until each file arrived. A server component: the drawings ride in the
 * HTML, never in a script chunk. The data is lib/sign-glyph-sprite.json, cut from public/glyphs/
 * by scripts/sign-glyph-sprite.mjs and held to those files by tests/landing/tribe-wheel.test.ts.
 */
export function SignGlyphSprite() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        {SIGN_IDS.map((sign) => (
          <g key={sign} id={signGlyphSpriteId(sign)} transform={sprite[sign].transform ?? undefined}>
            {sprite[sign].paths.map((path: { d: string; evenodd?: boolean }) => (
              <path key={path.d.slice(0, 24)} d={path.d} fillRule={path.evenodd ? 'evenodd' : undefined} />
            ))}
          </g>
        ))}
      </defs>
    </svg>
  );
}
