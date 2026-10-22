import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Faq } from '@/components/Faq';
import { FrostPin, HexagramMark } from '@/components/FrostPin';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeysCard } from '@/components/KeysCard';
import { NightBand } from '@/components/NightBand';
import { NumberedSteps } from '@/components/NumberedSteps';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { TribeCard } from '@/components/TribeCard';
import { TribeWheel } from '@/components/TribeWheel';
import { cn } from '@/lib/cn';
import { imageSet } from '@/lib/art-assets';
import {
  contrast,
  hero,
  howItWorks,
  humanHands,
  keys,
  nextStep,
  privacyFaq,
  tribes,
} from '@/content/landing';
import { SIGN_IDS, sunSeasonSign } from '@/lib/keys';
import { PRIMARY_ACTION } from '@/lib/site';
import type { CSSProperties } from 'react';

// Rebuilt daily, so the Tribes pin shows the sign of the Sun's season (1h).
export const revalidate = 86400;

// The landing page, in the order of the brief's MVP row and the design system's
// Section card: one headline and at most one primary action per section.
//
// Jane's art, one piece per region, art and quiet sections alternating: the hero's wash (IMG_9821),
// the Tribe cards' windows (P2), the night band's framed piece (P1), and the next step's painted edge
// (P3); P5 sits in the footer. The Keys cards carry the sky instead: one inked telescope image per
// card (1h, design system v23's card-grid exception).
//
// Rhythm (1f, design system v20): below the hero, sections alternate the page tone and the band,
// starting on the page, and the footer ends on the band. How it works carries a texture of the
// hero's own painting at another crop (6% at the default); The Keys dropped its texture in 1h, when
// its cards took sky images, and links to the page of all 28 since 1k. Contrast, which touches the hero, takes none; the sections that hold a
// framed piece take none.
export default function HomePage() {
  const season = sunSeasonSign(new Date());
  return (
    <>
      {/* Hero: Jane's ink wash as wallpaper under the nav, a frosted panel, and pins. */}
      <ArtWash piece="h" top>
        <div className="mx-auto grid min-h-[70dvh] max-w-content items-center gap-6 px-4 pt-27 pb-12 md:grid-cols-[minmax(0,36rem)_1fr] md:items-end md:px-6 lg:items-center md:pt-38 md:pb-20 lg:pb-34">
          <div className="panel-frost p-6 md:p-10">
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <Headline as="h1" size="xl" line={hero.line} accent={hero.accent} inline />
            <Lede>
              {hero.lede.map((sentence) => (
                <span key={sentence} className="block">
                  {sentence}
                </span>
              ))}
            </Lede>
            <Button href={PRIMARY_ACTION.href} size="lg" className="mt-8">
              {PRIMARY_ACTION.label}
            </Button>
            <p className="mt-3 type-caption text-ink-500">{hero.note}</p>
          </div>
          {/* Bottom-aligned with the panel from md (1h). From lg the wheel of the 12 Tribes takes the
              right side (1l) and does the Tribe pin's job, so only the Oracle pin stays, under it. The column
              shifts right by half the outer margin, so the wheel sits midway between the panel and the
              window's edge, and the Oracle pin hangs below it out of the flow, so the wheel's centre lines up
              with the panel's (David, Oct 21 and 22). */}
          <div className="relative grid gap-6 lg:translate-x-[calc((100vw-min(100vw,var(--content-max)))/4)] lg:justify-items-center">
            <div className="hidden w-full lg:block">
              <TribeWheel season={season} />
            </div>
            <ul className="grid gap-3 md:justify-items-end lg:absolute lg:inset-x-0 lg:top-full lg:mt-6 lg:justify-items-center">
              {hero.pins.map((pin) => (
                <li key={pin.href} className={cn('w-full md:w-auto', pin.mark === 'sign' && 'lg:hidden')}>
                  <FrostPin
                    href={pin.href}
                    title={pin.title}
                    line={pin.line}
                    mark={pin.mark === 'hexagram' ? <HexagramMark /> : <GlyphIcon glyph={season} size={24} />}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ArtWash>

      <Section labelledBy="contrast-title">
        <Eyebrow>{contrast.eyebrow}</Eyebrow>
        <Headline
          id="contrast-title"
          line={contrast.line}
          accent={contrast.accent}
          className="max-w-[26ch]"
        />
      </Section>

      <Section id="how-it-works" labelledBy="how-it-works-title" band texture={{ piece: 'h', crop: 'a' }}>
        <Eyebrow>{howItWorks.eyebrow}</Eyebrow>
        <Headline id="how-it-works-title" line={howItWorks.line} accent={howItWorks.accent} />
        <NumberedSteps steps={howItWorks.steps} />
      </Section>

      <Section id="tribes" labelledBy="tribes-title">
        <Eyebrow>{tribes.eyebrow}</Eyebrow>
        <Headline id="tribes-title" line={tribes.line} accent={tribes.accent} />
        <Lede>{tribes.lede}</Lede>
        {/* Two cards a row with the text stacked under the image, then side by side from 40rem;
            three from 64rem and four from 75rem, where a card is wide enough for "Sagittarius" beside
            its badge. */}
        <ul
          className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 min-[75rem]:grid-cols-4"
          style={
            {
              '--strip-sm': imageSet('p2', 'crop', 512),
              '--strip-lg': imageSet('p2', 'crop', 1024),
            } as CSSProperties
          }
        >
          {SIGN_IDS.map((sign) => (
            <li key={sign}>
              <TribeCard sign={sign} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="type-body text-ink-700">{tribes.closing}</p>
          <Button href={PRIMARY_ACTION.href}>{PRIMARY_ACTION.label}</Button>
        </div>
      </Section>

      <Section id="keys" labelledBy="keys-title" band>
        <Eyebrow>{keys.eyebrow}</Eyebrow>
        <Headline id="keys-title" line={keys.line} accent={keys.accent} />
        <Lede>{keys.lede}</Lede>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          <li>
            <KeysCard body="sun" keys={['sunSign', 'sunHouse']} sky="keysSun" />
          </li>
          <li>
            <KeysCard body="moon" keys={['moonSign', 'moonHouse']} sky="keysMoon" />
          </li>
          <li>
            <KeysCard body="rising" keys={['risingSign']} sky="keysRising" />
          </li>
        </ul>
        {/* -ml-6: the button's own side padding, so its words start at the section's edge. */}
        <Button href={keys.more.href} variant="tertiary" className="mt-6 -ml-6">
          {keys.more.label}
        </Button>
      </Section>

      <Section labelledBy="human-hands-title">
        <NightBand
          id="human-hands-title"
          eyebrow={humanHands.eyebrow}
          title={humanHands.title}
          items={humanHands.items}
          art="p1"
        />
      </Section>

      <Section id="privacy-faq" labelledBy="privacy-faq-title" band>
        <Eyebrow>{privacyFaq.eyebrow}</Eyebrow>
        <Headline id="privacy-faq-title" line={privacyFaq.line} accent={privacyFaq.accent} />
        <Faq items={privacyFaq.items} />
      </Section>

      <Section labelledBy="next-step-title">
        <TintPanel art="p3">
          <Eyebrow>{nextStep.eyebrow}</Eyebrow>
          <h2 id="next-step-title" className="type-heading-2 font-normal text-ink-900">
            {nextStep.title}
          </h2>
          <p className="mt-2 max-w-[56ch] text-ink-700">{nextStep.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={PRIMARY_ACTION.href}>{PRIMARY_ACTION.label}</Button>
            <Button href={nextStep.secondary.href} variant="secondary">
              {nextStep.secondary.label}
            </Button>
          </div>
        </TintPanel>
      </Section>
    </>
  );
}
