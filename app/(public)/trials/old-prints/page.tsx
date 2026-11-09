import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OldPrint } from '@/components/OldPrint';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { CARTOONS, PLATES, oldPrintSet } from '@/lib/old-prints';

export const metadata: Metadata = { title: 'Old print trials' };

// A trial page for David (4m, Nov 8: "not sure if they work as bg images. maybe preview a few for me").
// The Urania's Mirror cards and the Grandville engravings shown six ways, so he can pick before any
// goes sitewide. Branch previews only: production answers not found. The words are PLACEHOLDER.

const src = (id: string) => `url("${oldPrintSet(id).fallback}")`;

/** A print as a backdrop picture beside the words, the same layer the section backdrops use. */
function PrintBackdrop({ id, pos }: { id: string; pos?: string }) {
  const style = { '--bd-sm': src(id), '--bd-lg': src(id), ...(pos ? { '--bd-pos': pos } : {}) } as CSSProperties;
  return <div aria-hidden="true" data-kind="art" data-side="right" className="backdrop-layer" style={style} />;
}

function Option({ letter, title, note }: { letter: string; title: string; note: string }) {
  return (
    <>
      <Eyebrow>{`Option ${letter}`}</Eyebrow>
      <Headline line={title} />
      <Lede>{note}</Lede>
    </>
  );
}

const Filler = ({ children }: { children?: ReactNode }) => (
  <p className="mt-4 max-w-measure text-ink-700">
    {children ??
      'Sample words stand in here for a real section, so you can see how a paragraph reads beside the picture. Your Sun, your Moon, and your rising sign each say something different about you.'}
  </p>
);

export default function OldPrintTrials() {
  if (process.env.VERCEL_ENV === 'production') notFound();
  return (
    <>
      <div className="bg-surface-hero">
        <div className="mx-auto max-w-content px-4 pt-31 pb-10 md:px-6 md:pt-38">
          <Eyebrow>Trials, branch preview only</Eyebrow>
          <Headline as="h1" line="Old prints," accent="six ways." />
          <Lede>
            The 1824 star cards from Urania’s Mirror and Grandville’s 1844 engravings, tried as backgrounds, framed
            pictures, and pictures beside words. Pick the ones you like by letter.
          </Lede>
        </div>
      </div>

      {/* A: a whole region as wallpaper, at the hero wash strength, words on a frosted panel. */}
      <div className="wash-region border-t border-ink-200">
        <div
          className="wash-layer"
          aria-hidden="true"
          style={{ backgroundImage: src('cartoon-comet'), backgroundSize: 'cover', backgroundPosition: 'center 30%' } as CSSProperties}
        />
        <div className="mx-auto max-w-content px-4 py-16 md:px-6 md:py-24">
          <div className="panel-frost max-w-[36rem] p-6 md:p-10">
            <Option letter="A" title="Engraving as wallpaper" note="Grandville’s comet across the whole band, at the same strength as the homepage hero, with the words on a frosted panel." />
          </div>
        </div>
      </div>

      {/* B and C: beside the words, the same way the ink landscapes now sit. */}
      <Section band className="backdrop-region">
        <PrintBackdrop id="cartoon-eclipse" pos="center 40%" />
        <Option letter="B" title="Engraving beside the words" note="Grandville’s eclipse fading in at the right, like the new ink landscape sections. On a phone it sits under the words." />
        <Filler />
        <div className="h-36 xl:hidden" />
      </Section>

      <Section className="backdrop-region">
        <PrintBackdrop id="plate-aries" />
        <Option letter="C" title="Star card beside the words" note="The Aries card from Urania’s Mirror, the same treatment as B." />
        <Filler />
        <div className="h-36 xl:hidden" />
      </Section>

      {/* D: framed, full strength, beside the words. */}
      <Section band>
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div>
            <Option letter="D" title="Framed beside the words" note="Full strength and whole, as on the Tribe pages now. Engraving shown; a star card works the same way." />
            <Filler />
            <Filler>A second paragraph, so you can see the picture against a longer run of words.</Filler>
          </div>
          <OldPrint id="cartoon-star" alt={CARTOONS.star.alt} sizes="(width >= 48rem) 22rem, calc(100vw - 2rem)" />
        </div>
      </Section>

      {/* E: a small picture set into the paragraph, the words running around it. */}
      <Section>
        <Option letter="E" title="Small, set into the text" note="A smaller print the paragraph wraps around, like an old almanac." />
        <div className="mt-6 max-w-measure text-ink-700">
          <OldPrint
            id="plate-pisces"
            alt={PLATES.pisces.alt}
            sizes="14rem"
            className="float-right mb-3 ml-5 w-[11rem] md:w-[14rem]"
          />
          <p>
            Sample words stand in here. The two fish of Pisces are tied by one long ribbon, swimming two ways at once.
            Your Sun, your Moon, and your rising sign together make one of 1,728 ways to be you, and the paragraph
            keeps running around the card until it clears it.
          </p>
          <p className="mt-4">
            A second paragraph shows how the text comes back to the full width once it passes the picture, so a long
            page reads as words and pictures in turn rather than one block.
          </p>
        </div>
      </Section>

      {/* F: in a panel's edge, like the next step panels. */}
      <Section band>
        <div className="grid gap-6 md:grid-cols-2">
          <TintPanel className="h-full">
            <Option letter="F" title="In a card" note="A star card at the top of a card, like the Keys cards’ space photos." />
          </TintPanel>
          <div className="overflow-hidden rounded-[12px] border border-ink-200 bg-surface-200">
            <OldPrint id="plate-leo" alt={PLATES.leo.alt} sizes="(width >= 48rem) 32rem, 100vw" className="max-w-none" />
            <p className="p-6 text-ink-700">Leo’s card from 1824, two lions in the stars, as the head of a card.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
