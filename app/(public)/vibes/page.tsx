import type { Metadata } from 'next';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { SignLinks } from '@/components/SignLinks';
import { vibeIndex as copy } from '@/content/clans';
import { VIBE_LINES, vibeIntro } from '@/content/vibes';
import { KEYS } from '@/lib/keys';

// The twelve Vibes (4l, Nov 8): the way in from the 28 Keys page, Your chart, and the Tribe pages. Dawa's
// introduction to the rising sign as the lede, and each Vibe with his line for it. Static.
const vibe = KEYS.risingSign.name;

export const metadata: Metadata = { title: copy.metaTitle(vibe), description: copy.description(vibe) };

export default function VibesPage() {
  const [horizon, style] = vibeIntro(vibe);
  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <Headline as="h1" line={copy.line} accent={copy.accent(vibe)} />
      <Lede>{style}</Lede>
      <p className="mt-3 max-w-measure type-body-sm text-ink-700">{horizon}</p>
      <div className="mt-6 max-w-[28rem]">
        <KeyChip keyId="risingSign" showGloss />
      </div>
      <SignLinks base="/vibes" title={copy.card} lines={VIBE_LINES} className="mt-10" />
    </div>
  );
}
