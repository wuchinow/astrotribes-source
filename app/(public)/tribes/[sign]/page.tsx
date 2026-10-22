import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { KeyChip } from '@/components/KeyChip';
import { NightBand } from '@/components/NightBand';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { TribeBadge } from '@/components/TribeBadge';
import { TribeCard, windowBoxStyle } from '@/components/TribeCard';
import { TRIBE_WORDS, tribePage as copy } from '@/content/tribes';
import { FRAMED, TRIBE_CROPS } from '@/lib/art';
import { imageSet } from '@/lib/art-assets';
import { KEYS, SIGN_IDS, SIGNS, signDates, type SignId } from '@/lib/keys';
import { PRIMARY_ACTION } from '@/lib/site';

// The 12 Tribe pages (3a), from David's "warm community" direction (Oct 21), reworked after a UX
// pass: every section is finished content today (the sign's signature, how the keys split a Tribe,
// questions to bring, the element family), and what arrives with members is one band, said as a
// promise rather than as empty placeholders. Static: no database.
//
// Jane's art, one piece per region: the hero is the sign's own window of P2, wider than its card's
// (so each Tribe has its own painting), the night band carries P8, the element family's cards their
// P2 windows, and the next step's painted edge P4. Members' gallery art (Jane Kwan's and Kirstie
// Connon's among it) comes with layer 3.
//
// Rhythm: the hero on surface-hero, then the page tone and the band alternating. No textures: the
// hero's painting is a window of P2, which has no texture cut.
export const dynamicParams = false;

export function generateStaticParams() {
  return SIGN_IDS.map((sign) => ({ sign }));
}

const isSign = (value: string): value is SignId => (SIGN_IDS as readonly string[]).includes(value);

export async function generateMetadata({ params }: PageProps<'/tribes/[sign]'>): Promise<Metadata> {
  const { sign } = await params;
  if (!isSign(sign)) return {};
  const name = SIGNS[sign].name;
  return { title: copy.metaTitle(name), description: copy.description(name) };
}

/** The hero's window: a 3:2 cut of P2 around the sign's card window, kept inside the painting. */
function heroWindow(sign: SignId): readonly [number, number, number, number] {
  const [, , cutW, cutH] = FRAMED.p2.cuts.crop.box;
  const [x, y, w, h] = TRIBE_CROPS[sign];
  const [W, H] = [450, 300];
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return [clamp(x + w / 2 - W / 2, cutW - W), clamp(y + h / 2 - H / 2, cutH - H), W, H];
}

const textLink = 'inline-flex min-h-touch items-center gap-2 type-ui text-cobalt-600 underline-offset-4 hover:underline';

export default async function TribePage({ params }: PageProps<'/tribes/[sign]'>) {
  const { sign } = await params;
  if (!isSign(sign)) notFound();

  const def = SIGNS[sign];
  const words = TRIBE_WORDS[sign];
  const name = def.name;
  const element = copy.element[def.element];
  const index = SIGN_IDS.indexOf(sign);
  const previous = SIGN_IDS[(index + 11) % 12];
  const next = SIGN_IDS[(index + 1) % 12];
  const family = SIGN_IDS.filter((s) => SIGNS[s].element === def.element);
  const others = family.filter((s) => s !== sign).map((s) => SIGNS[s].name);
  const strips = {
    '--strip-sm': imageSet('p2', 'crop', 512),
    '--strip-lg': imageSet('p2', 'crop', 1024),
  } as CSSProperties;

  return (
    <>
      <div className="bg-surface-hero">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 pt-31 pb-14 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-14 md:px-6 md:pt-38 md:pb-20">
          <div className="min-w-0">
            <Eyebrow>
              {copy.hero.eyebrow} · {signDates(sign)}
            </Eyebrow>
            <Headline as="h1" size="xl" line={copy.hero.line} accent={copy.hero.accent(name)} />
            <Lede>{words.tagline}</Lede>
            <div className="mt-6">
              <TribeBadge sign={sign} element={def.element} label={`${element} · ${words.symbol}`} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button href={PRIMARY_ACTION.href} size="lg">
                {PRIMARY_ACTION.label}
              </Button>
              <p className="type-caption text-ink-500">{copy.hero.note}</p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="tribe-window aspect-[3/2] w-full max-w-full rounded-md border border-ink-200 shadow-rest"
            style={{ ...strips, ...windowBoxStyle(heroWindow(sign)) }}
          />
        </div>
      </div>

      <Section labelledBy="signature-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="min-w-0">
            <Eyebrow>{copy.signature.eyebrow}</Eyebrow>
            <Headline id="signature-title" line={copy.signature.line(name)} accent={copy.signature.accent} />
            <ul role="list" className="mt-6 grid max-w-[34rem] grid-cols-2 gap-x-6 gap-y-1">
              {words.traits.map((trait) => (
                <li key={trait} className="font-display text-[1.625rem] leading-snug text-ink-900 md:text-[2rem]">
                  {trait}
                </li>
              ))}
            </ul>
            <figure className="mt-10 border-l-2 border-gold-500 pl-5">
              <figcaption className="type-label text-ink-500">{copy.signature.smileLabel}</figcaption>
              <blockquote className="mt-2 max-w-[40ch] font-display text-[1.375rem] italic leading-snug text-ink-900">
                {words.smile}
              </blockquote>
            </figure>
          </div>
          <dl className="grid content-start border-b border-ink-200">
            {[
              [copy.signature.facts.dates, signDates(sign)],
              [copy.signature.facts.element, element],
              [copy.signature.facts.mode, copy.mode[def.mode]],
              [copy.signature.facts.symbol, words.symbol],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[8rem_1fr] gap-3 border-t border-ink-200 py-3">
                <dt className="type-label text-ink-500">{label}</dt>
                <dd className="type-body-sm text-ink-900">{value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-ink-200 py-3">
              <dt className="type-label text-ink-500">{copy.signature.facts.ruler}</dt>
              <dd className="type-body-sm text-ink-700">
                <span className="font-semibold text-ink-900">{words.ruler.name}</span>
                <span className="mt-1 block">{words.ruler.line}</span>
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section labelledBy="people-title" band>
        <Eyebrow>{copy.people.eyebrow}</Eyebrow>
        <Headline id="people-title" line={copy.people.line} accent={copy.people.accent(12 * 12 * 12)} />
        <Lede>{copy.people.lede(name)}</Lede>
        <ul role="list" className="mt-8 grid gap-6 md:grid-cols-3">
          {(['moonSign', 'risingSign', 'sunHouse'] as const).map((key) => (
            <li key={key} className="rounded-md border border-ink-200 bg-surface-200 p-5 shadow-rest">
              <KeyChip keyId={key} showGloss />
            </li>
          ))}
        </ul>
        <p className="mt-6 type-body-sm text-ink-700">
          {copy.people.sum(KEYS.moonSign.name, KEYS.risingSign.name, KEYS.sunHouse.name)}
        </p>
        <Button href={PRIMARY_ACTION.href} variant="tertiary" className="mt-2 -ml-2">
          {copy.people.action}
          <span aria-hidden="true">{'→'}</span>
        </Button>
      </Section>

      <Section labelledBy="fire-title">
        <Eyebrow>{copy.fire.eyebrow(name)}</Eyebrow>
        <Headline id="fire-title" line={copy.fire.line} accent={copy.fire.accent} />
        <Lede>{copy.fire.lede}</Lede>
        <ol role="list" className="mt-8 grid gap-x-8 border-b border-ink-200 md:grid-cols-3">
          {words.prompts.map((prompt, i) => (
            <li key={prompt} className="grid grid-cols-[3rem_1fr] gap-x-3 border-t border-ink-200 py-6">
              <span aria-hidden="true" className="step-numeral">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-display text-[1.25rem] leading-snug text-ink-900">{prompt}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <NightBand
            id="opening-title"
            eyebrow={copy.opening.eyebrow}
            title={copy.opening.title(name)}
            items={copy.opening.items(words.fellows, name)}
            art="p8"
          />
        </div>
      </Section>

      <Section labelledBy="family-title" band>
        <Eyebrow>{copy.family.eyebrow(element)}</Eyebrow>
        <Headline id="family-title" line={copy.family.line} accent={copy.family.accent} />
        <Lede>{copy.family.lede(name, element, others.join(copy.family.and))}</Lede>
        <ul role="list" className="mt-8 grid max-w-[44rem] grid-cols-2 gap-3 md:gap-4" style={strips}>
          {family.filter((s) => s !== sign).map((s) => (
            <li key={s}>
              <TribeCard sign={s} />
            </li>
          ))}
        </ul>
        <nav aria-label={copy.neighbors.label} className="mt-6 flex flex-wrap justify-between gap-4">
          <Link href={`/tribes/${previous}`} className={textLink}>
            <span aria-hidden="true">{'←'}</span>
            <span className="sr-only">{copy.neighbors.previous}: </span>
            {SIGNS[previous].name}
          </Link>
          <Link href={`/tribes/${next}`} className={textLink}>
            <span className="sr-only">{copy.neighbors.next}: </span>
            {SIGNS[next].name}
            <span aria-hidden="true">{'→'}</span>
          </Link>
        </nav>
      </Section>

      <Section labelledBy="next-step-title">
        <TintPanel art="p4">
          <Eyebrow>{copy.nextStep.eyebrow}</Eyebrow>
          <h2 id="next-step-title" className="type-heading-2 font-normal text-ink-900">
            {copy.nextStep.title}
          </h2>
          <p className="mt-2 max-w-[56ch] text-ink-700">{copy.nextStep.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={PRIMARY_ACTION.href}>{PRIMARY_ACTION.label}</Button>
            <Button href={copy.nextStep.secondary.href} variant="secondary">
              {copy.nextStep.secondary.label}
            </Button>
          </div>
        </TintPanel>
      </Section>
    </>
  );
}
