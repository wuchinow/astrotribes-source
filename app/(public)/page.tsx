import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Faq } from '@/components/Faq';
import { FrostPin, HexagramMark } from '@/components/FrostPin';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeysCard } from '@/components/KeysCard';
import { NightBand } from '@/components/NightBand';
import { NumberedSteps } from '@/components/NumberedSteps';
import { PointingHand } from '@/components/PointingHand';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { TribeCard } from '@/components/TribeCard';
import { TribeWheel } from '@/components/TribeWheel';
import { cn } from '@/lib/cn';
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
import { FLAMMARION, flammarionSet } from '@/lib/flammarion';
import { GuestOnly, PrimaryAction } from '@/components/HeaderAccount';
import { Quote } from '@/components/Quote';
import { quote } from '@/content/quotes';

// Rebuilt daily, so the Tribes pin shows the sign of the Sun's season (1h).
export const revalidate = 86400;

// The landing page, in the order of the brief's MVP row and the design system's
// Section card: one headline and at most one primary action per section.
//
// The ink landscapes are the background (David, Nov 4 and 8): the hero's wash (h) and the night band's framed
// piece (P1); P5 sits in the footer. The Tribe cards carry Kirstie Connon's paintings, credited in the
// footer. The Keys cards carry the sky: one telescope image per card (1h, design system v23's
// card-grid exception), and the next step one more of its own, Andromeda beside its text (David, Nov 4).
//
// Rhythm (1f, design system v20): below the hero, sections alternate the page tone and the band,
// starting on the page, and the footer ends on the band. Since 4m (David, Nov 8: "see the rhythm?") the
// sections also take turns with a backdrop: How it works an ink landscape beside its steps (P7, in
// place of the 6% texture David could barely see), the 12 Tribes the soft gradient, Find your Keys
// Spitzer's galactic center beside its words, the night band its framed P1, the privacy questions
// another ink landscape (P4), the next step Andromeda, and the footer's own horizon. Contrast, which
// touches the hero, takes none.
export default function HomePage() {
  const season = sunSeasonSign(new Date());
  return (
    <>
      {/* Hero: the misty river wash as wallpaper under the nav, a frosted panel, and pins. */}
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
            <PrimaryAction size="lg" className="mt-8" />
            <GuestOnly>
              <p className="mt-3 type-caption text-ink-500">{hero.note}</p>
            </GuestOnly>
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
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] md:gap-14">
          <div className="min-w-0">
            <Eyebrow>{contrast.eyebrow}</Eyebrow>
            <Headline
              id="contrast-title"
              line={contrast.line}
              accent={contrast.accent}
              className="max-w-[26ch]"
            />
            <Quote quote={quote('as-above')} size="lg" className="mt-8" />
          </div>
          {/* The Flammarion engraving (David, Nov 4): the section's one picture; its credit is in the footer. */}
          <div className="w-full" style={{ maxWidth: `${FLAMMARION.width / 2}px` }}>
            <picture className="block">
              <source type="image/avif" srcSet={flammarionSet.avif} sizes="(width >= 48rem) 30rem, calc(100vw - 2rem)" />
              <source type="image/webp" srcSet={flammarionSet.webp} sizes="(width >= 48rem) 30rem, calc(100vw - 2rem)" />
              <img
                src={flammarionSet.fallback}
                alt={FLAMMARION.alt}
                width={FLAMMARION.width}
                height={FLAMMARION.height}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full rounded-md border border-ink-200 shadow-rest"
              />
            </picture>
          </div>
        </div>
      </Section>

      <Section id="how-it-works" labelledBy="how-it-works-title" band backdrop={{ art: 'p7' }}>
        <Eyebrow>{howItWorks.eyebrow}</Eyebrow>
        <Headline id="how-it-works-title" line={howItWorks.line} accent={howItWorks.accent} />
        <NumberedSteps steps={howItWorks.steps} />
      </Section>

      <Section id="tribes" labelledBy="tribes-title" backdrop={{ gradient: true }}>
        <Eyebrow>{tribes.eyebrow}</Eyebrow>
        <Headline id="tribes-title" line={tribes.line} accent={tribes.accent} />
        <Lede>{tribes.lede}</Lede>
        {/* Two cards a row with the text stacked under the image, then side by side from 40rem;
            three from 64rem and four from 75rem, where a card is wide enough for "Sagittarius" beside
            its badge. */}
        <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 min-[75rem]:grid-cols-4">
          {SIGN_IDS.map((sign) => (
            <li key={sign}>
              <TribeCard sign={sign} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="type-body text-ink-700">{tribes.closing}</p>
          <PrimaryAction />
        </div>
      </Section>

      <Section id="keys" labelledBy="keys-title" band backdrop={{ sky: 'keysCenter' }}>
        <Eyebrow>{keys.eyebrow}</Eyebrow>
        {/* Dawa's 19th-century poster (Nov 7): poster-weight type with one printer's hand (David, Nov 8),
            after the words and pointing back at them, so the words line up with the section (David, Nov 9). */}
        <h2
          id="keys-title"
          className="mb-6 flex items-center gap-3 type-poster text-[2.5rem] leading-[1.05] text-ink-900 md:gap-6 md:text-[4.5rem]"
        >
          <span>{keys.title}</span>
          <PointingHand direction="left" className="w-12 shrink-0 text-ink-900 sm:w-20 md:w-30" />
        </h2>
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

      <Section id="privacy-faq" labelledBy="privacy-faq-title" band backdrop={{ art: 'p4', pos: 'center 30%' }}>
        <Eyebrow>{privacyFaq.eyebrow}</Eyebrow>
        <Headline id="privacy-faq-title" line={privacyFaq.line} accent={privacyFaq.accent} />
        <Faq items={privacyFaq.items} />
      </Section>

      <Section labelledBy="next-step-title">
        <TintPanel sky="andromeda">
          <Eyebrow>{nextStep.eyebrow}</Eyebrow>
          <h2 id="next-step-title" className="type-heading-2 font-normal text-ink-900">
            {nextStep.title}
          </h2>
          <p className="mt-2 max-w-[56ch] text-ink-700">{nextStep.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryAction />
            <Button href={nextStep.secondary.href} variant="secondary">
              {nextStep.secondary.label}
            </Button>
          </div>
        </TintPanel>
      </Section>
    </>
  );
}
