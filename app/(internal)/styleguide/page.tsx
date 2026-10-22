import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChartReading } from '@/components/ChartReading';
import { DraftNote } from '@/components/DraftNote';
import { Faq } from '@/components/Faq';
import { FramedArt } from '@/components/FramedArt';
import { FrostPin } from '@/components/FrostPin';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyChip } from '@/components/KeyChip';
import { Logo } from '@/components/Logo';
import { NightBand } from '@/components/NightBand';
import { NumberedSteps } from '@/components/NumberedSteps';
import { TribeCard } from '@/components/TribeCard';
import { contrastRatio } from '@/lib/contrast';
import { FRAMED, WASHES, WASH_IDS, type FramedId } from '@/lib/art';
import { GLYPHS } from '@/lib/glyphs';
import { BODY_IDS, KEY_LIST, SIGN_IDS } from '@/lib/keys';
import { COLOR_PAIRS, pairApplies, readTokens, type Theme } from '@/lib/tokens';

export const metadata: Metadata = { title: 'Styleguide' };

// Internal: tokens, type, and components in both moods, for review on preview
// deployments. Production returns 404.

const TYPE_STYLES = [
  ['type-display-xl', 'Welcome home'],
  ['type-display-lg', 'Your Sun, Moon, and Rising'],
  ['type-heading-1', 'Page title'],
  ['type-heading-2', 'Section heading'],
  ['type-heading-3', 'Card title'],
  ['type-label', 'Eyebrow label'],
  ['type-body-lg', 'Astrology gives people identity. AstroTribes gives them belonging.'],
  ['type-body', 'Body text at 18px on desktop and 17px on a phone, line height 1.6.'],
  ['type-body-sm', 'Helper text, card body, list items.'],
  ['type-ui', 'Button and nav labels'],
  ['type-caption', 'Card by Pamela Colman Smith, 1909'],
  ['type-data', '14° 32′ Capricorn'],
  ['type-data-sm', 'Sep 23, 2026'],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-ink-200 py-10">
      <h2 className="type-heading-2 text-ink-900">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MoodPanel({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <div
      data-theme={theme}
      className="rounded-md border border-ink-200 bg-surface-100 p-4 text-ink-700 md:p-6"
    >
      <p className="type-label text-ink-500">{theme === 'paper' ? 'Paper' : 'Night'}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function StyleguidePage() {
  if (process.env.VERCEL_ENV === 'production') notFound();

  const tokens = readTokens();
  const colorNames = Object.keys(tokens.paper).filter((name) => tokens.paper[name].startsWith('#'));

  return (
    <main className="mx-auto max-w-content px-4 py-10 md:px-6">
      <p className="type-label text-ink-500">Internal, previews only</p>
      <h1 className="mt-2 type-heading-1 text-ink-900">Styleguide</h1>
      <p className="mt-4 max-w-measure">
        Tokens, type, and the components in both moods, built from the design system (v20, palette v3.4).
      </p>

      <Section title="Colors">
        <div className="grid gap-4 md:grid-cols-2">
          {(['paper', 'night'] as const).map((theme) => (
            <MoodPanel key={theme} theme={theme}>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {colorNames.map((name) => (
                  <li key={name} className="flex items-center gap-2">
                    <span
                      className="size-8 shrink-0 rounded-sm border border-ink-200"
                      style={{ background: `var(--${name})` }}
                    />
                    <span className="min-w-0">
                      <span className="block type-caption text-ink-900">{name}</span>
                      <span className="block type-data-sm text-ink-500">{tokens[theme][name]}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </MoodPanel>
          ))}
        </div>
      </Section>

      <Section title="Contrast">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left type-body-sm">
            <thead>
              <tr className="border-b border-ink-200 text-ink-900">
                <th className="py-2 pr-4 font-semibold">Pair</th>
                <th className="py-2 pr-4 font-semibold">Use</th>
                <th className="py-2 pr-4 font-semibold">Needs</th>
                <th className="py-2 pr-4 font-semibold">Paper</th>
                <th className="py-2 font-semibold">Night</th>
              </tr>
            </thead>
            <tbody>
              {COLOR_PAIRS.map((pair) => {
                const cells = (['paper', 'night'] as const).map((theme) => {
                  const applies = pairApplies(pair, theme);
                  const ratio = contrastRatio(tokens[theme][pair.fg], tokens[theme][pair.bg]);
                  return { theme, applies, ratio, pass: ratio >= pair.min };
                });
                return (
                  <tr key={pair.use} className="border-b border-ink-200">
                    <td className="py-2 pr-4 type-data-sm text-ink-900">
                      {pair.fg} on {pair.bg}
                    </td>
                    <td className="py-2 pr-4">{pair.use}</td>
                    <td className="py-2 pr-4 type-data-sm">{pair.min}:1</td>
                    {cells.map((cell) => (
                      <td key={cell.theme} className="py-2 pr-4 type-data-sm">
                        {cell.applies
                          ? `${cell.ratio.toFixed(1)}:1 ${cell.pass ? 'pass' : 'FAIL'}`
                          : 'not used'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Type">
        <div className="space-y-4">
          {TYPE_STYLES.map(([style, sample]) => (
            <div key={style} className="grid gap-1 md:grid-cols-[10rem_1fr] md:items-baseline">
              <span className="type-data-sm text-ink-500">{style}</span>
              <span className={`${style} text-ink-900`}>{sample}</span>
            </div>
          ))}
          <p className="type-display-lg text-ink-900">
            Find your people. <em className="text-highlight">By the sky you share.</em>
          </p>
        </div>
      </Section>

      <Section title="Components">
        <div className="grid gap-4 md:grid-cols-2">
          {(['paper', 'night'] as const).map((theme) => (
            <MoodPanel key={theme} theme={theme}>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Find your Tribe</Button>
                <Button variant="secondary">See who shares this</Button>
                <Button variant="tertiary">Read more</Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <KeyChip keyId="sunSign" value="leo" href="#key" />
                <KeyChip keyId="moonSign" value="cancer" />
                <KeyChip keyId="risingSign" value="libra" />
                <KeyChip keyId="sunHouse" value={5} />
                <KeyChip keyId="moonHouse" value={4} />
              </div>
              <KeyChip className="mt-4" keyId="northNodeSign" value="aquarius" showGloss />
              <div className="mt-6 grid gap-4">
                <Card title="A card at rest" caption="A caption: a credit or a footnote">
                  Paper on paper: surface-200, a hairline border, a barely-there shadow.
                </Card>
                <Card title="A card that links" href="#card">
                  It lifts on hover.
                </Card>
              </div>
            </MoodPanel>
          ))}
        </div>
      </Section>

      <Section title="Landing patterns">
        <div className="grid gap-4 md:grid-cols-2">
          {(['paper', 'night'] as const).map((theme) => (
            <MoodPanel key={theme} theme={theme}>
              <ul className="grid grid-cols-2 gap-3">
                <li>
                  <TribeCard sign="leo" />
                </li>
                <li>
                  <TribeCard sign="pisces" />
                </li>
              </ul>
              <NumberedSteps
                steps={[
                  {
                    category: 'Your chart',
                    title: 'A numbered item.',
                    body: 'An italic numeral, an ember label, a title, one line.',
                    more: { href: `#faq-sample-${theme}`, label: 'A link to an FAQ item' },
                  },
                ]}
              />
              <Faq
                items={[
                  {
                    id: `faq-sample-${theme}`,
                    question: 'A question?',
                    answer: <p>A plain answer.</p>,
                  },
                ]}
              />
              <div className="mt-6">
                <NightBand
                  eyebrow="The night band"
                  title="One per page."
                  items={[
                    { title: 'on-night', body: 'Titles on night-900.' },
                    { title: 'on-night-soft', body: 'Lines on night-900.' },
                  ]}
                />
              </div>
              <div className="mt-6">
                <DraftNote>
                  <p>A draft note, the one ember on a legal page.</p>
                </DraftNote>
              </div>
            </MoodPanel>
          ))}
        </div>
        <ArtWash piece="h" className="mt-4 overflow-hidden rounded-md">
          <div className="flex flex-wrap gap-3 p-6">
            <FrostPin href="#pin" title="A frosted pin" line="One muted line" />
          </div>
        </ArtWash>
      </Section>

      <Section title="Logo">
        <div className="grid gap-4 md:grid-cols-3">
          <div data-theme="paper" className="grid place-items-center rounded-md bg-surface-100 p-8">
            <Logo className="w-[200px]" />
            <p className="mt-4 type-caption text-ink-500">Deep plum and gold on Paper</p>
          </div>
          <div data-theme="night" className="grid place-items-center rounded-md bg-surface-100 p-8">
            <Logo className="w-[200px]" />
            <p className="mt-4 type-caption text-ink-500">Gold on Night</p>
          </div>
          <div data-theme="night" className="grid place-items-center rounded-md bg-night-900 p-8">
            <Logo tone="gold" className="w-[200px]" />
            <p className="mt-4 type-caption text-on-night-soft">Gold on night-900</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-8">
          {(
            [
              ['w-[96px]', '96'],
              ['w-[48px]', '48'],
              ['w-[24px]', '24'],
            ] as const
          ).map(([width, size]) => (
            <figure key={size} className="grid justify-items-center gap-2">
              <Logo variant="mark" className={width} label={`Sun and moon at ${size}px`} />
              <figcaption className="type-data-sm text-ink-500">{size}</figcaption>
            </figure>
          ))}
          <figure className="grid justify-items-center gap-2">
            <Logo className="w-[160px]" label="Lockup at its 160px minimum" />
            <figcaption className="type-data-sm text-ink-500">160</figcaption>
          </figure>
        </div>
      </Section>

      <Section title="Glyphs (pending Dawa's review)">
        <p className="max-w-measure type-body-sm text-ink-700">
          Signs and planets by Lama Dawa, traced Sep 23. Uranus, Pluto, and Chiron are placeholders
          made with an image tool, not Dawa&apos;s, until he brushes his own. Glyphs without a
          drawing show their text symbol.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-ink-900">
          {SIGN_IDS.map((id) => (
            <GlyphIcon key={id} glyph={id} size={48} label={id} />
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-4 text-ink-900">
          {BODY_IDS.map((id) => (
            <li key={id} className="grid justify-items-center gap-1">
              <GlyphIcon glyph={id} size={48} label={id} />
              <span className="type-caption text-ink-500">
                {GLYPHS[id].placeholder ? 'placeholder' : GLYPHS[id].credit ? 'Dawa' : 'symbol'}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Art wash and frosted panel">
        <p className="max-w-measure type-body-sm text-ink-700">
          Jane Kwan&apos;s washes at the Appearance panel&apos;s strength (30% by default, 0.6 of it on
          Night, half behind a section). All placeholders until Dawa says which can appear.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {WASH_IDS.map((id) => (
            <ArtWash key={id} piece={id} className="overflow-hidden rounded-md">
              <div className="p-6 md:p-8">
                <div className="panel-frost max-w-md p-6">
                  <p className="type-label text-ink-500">{WASHES[id].p ?? 'Hero'}</p>
                  <p className="mt-2 type-heading-3 text-ink-900">{WASHES[id].name}</p>
                  <p className="mt-1 type-caption text-ink-500">Text sits on a panel, never on the art.</p>
                </div>
              </div>
            </ArtWash>
          ))}
        </div>
      </Section>

      <Section title="Reading card with a strip of the wash (the free chart result)">
        <ArtWash piece="p9" className="overflow-hidden rounded-md">
          <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
            <ChartReading body="sun" reading={{ sign: 'leo' }} headingId="sg-sun" strip />
            <ChartReading body="moon" reading={{ sign: 'taurus' }} headingId="sg-moon" strip />
            <ChartReading body="rising" reading={null} headingId="sg-rising" strip />
          </div>
        </ArtWash>
      </Section>

      <Section title="Framed pieces">
        <div className="flex flex-wrap items-start gap-6">
          {(Object.keys(FRAMED) as FramedId[]).map((id) => (
            <FramedArt key={id} id={id} sizes="200px" className="w-[200px]" />
          ))}
        </div>
      </Section>

      <Section title="The 28 Keys">
        <ul className="grid gap-3 md:grid-cols-2">
          {KEY_LIST.map((key) => (
            <li key={key.id}>
              <KeyChip keyId={key.id} showGloss />
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
