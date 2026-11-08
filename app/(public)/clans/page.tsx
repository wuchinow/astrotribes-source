import type { Metadata } from 'next';
import { KeyChip } from '@/components/KeyChip';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { SignLinks } from '@/components/SignLinks';
import { clanIndex as copy } from '@/content/clans';
import { paragraphs, planetPage } from '@/content/planets';
import { KEYS, SIGN_IDS } from '@/lib/keys';

// The twelve Clans (4l, Nov 8): the way in from the 28 Keys page, Your chart, and the Tribe pages. Dawa's
// note on the Moon as the lede, and each Clan with the first sentence of his paragraph for it. Static.
const clan = KEYS.moonSign.name;
const moon = planetPage('moon')!;

/** The first sentence of a paragraph, for a card. */
const firstSentence = (text: string) => {
  const end = text.search(/[.?](\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
};

const lines = Object.fromEntries(SIGN_IDS.map((sign) => [sign, firstSentence(moon.signs[sign] ?? '')]));

export const metadata: Metadata = { title: copy.metaTitle(clan), description: copy.description(clan) };

export default function ClansPage() {
  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <Headline as="h1" line={copy.line} accent={copy.accent(clan)} />
      <Lede>{paragraphs(moon.signsNote ?? '')[0]}</Lede>
      <div className="mt-6 max-w-[28rem]">
        <KeyChip keyId="moonSign" showGloss />
      </div>
      <SignLinks base="/clans" title={copy.card} lines={lines} className="mt-10" />
    </div>
  );
}
