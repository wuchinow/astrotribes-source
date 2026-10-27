import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArtWash } from '@/components/ArtWash';
import { GlyphIcon } from '@/components/GlyphIcon';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { LocalWhen } from '@/components/sky/LocalWhen';
import { MoonDisc } from '@/components/sky/MoonDisc';
import { MoonStrip } from '@/components/sky/MoonStrip';
import { ElementDisc } from '@/components/TribeBadge';
import { skyCopy } from '@/content/sky';
import { GLYPHS } from '@/lib/glyphs';
import { BODIES, SIGNS, type BodyId } from '@/lib/keys';
import { MOON_DAYS, todaySky, type Change, type SkyBody } from '@/lib/today-sky';

export const metadata: Metadata = { title: skyCopy.metaTitle, description: skyCopy.description };

// Built on the server and rebuilt at most hourly. Nothing here is about the visitor: no cookie is
// read, no birth details, nothing stored or sent. Times are shown in the visitor's own zone.
export const revalidate = 3600;

/** 3°05′: degrees and minutes within the sign. */
const degrees = ({ degree, minute }: SkyBody) => `${degree}°${String(minute).padStart(2, '0')}′`;

/** Dawa's glyph for a body, or nothing: an image-tool stand-in is never shown (as on the 28 Keys page). */
function BodyGlyph({ body, size, className }: { body: BodyId; size: 24 | 48; className?: string }) {
  return GLYPHS[body].credit !== null ? <GlyphIcon glyph={body} size={size} className={className} /> : null;
}

interface LightProps {
  body: 'sun' | 'moon';
  at: SkyBody;
  line: string;
  children?: ReactNode;
}

/** The Sun or the Moon in the night band: its sign with the sign's glyph in an element disc, the degree, and one line. */
function Light({ body, at, line, children }: LightProps) {
  const sign = SIGNS[at.sign];
  return (
    <article data-light={body}>
      <div className="flex items-center gap-3">
        <BodyGlyph body={body} size={48} className="-ml-1 text-on-night" />
        <h3 className="font-display text-[1.75rem] leading-tight font-normal text-on-night">
          {skyCopy.inSign(BODIES[body].name, sign.name)}
        </h3>
      </div>
      <p className="mt-3 flex items-center gap-2 type-body-sm text-on-night-soft">
        <ElementDisc sign={at.sign} element={sign.element} />
        <span>
          {skyCopy.element(skyCopy.elements[sign.element])} · {degrees(at)}
        </span>
      </p>
      <p className="mt-3 max-w-[40ch] type-body text-on-night-soft">{line}</p>
      {children}
    </article>
  );
}

function changeText(change: Change) {
  const body = BODIES[change.body].name;
  if (change.kind === 'ingress') return skyCopy.soon.ingress(body, SIGNS[change.to].name);
  return skyCopy.soon[change.turns](body, SIGNS[change.sign].name);
}

/**
 * Today's sky (1d): the Sun and the Moon side by side in the night band with the Moon's next ten
 * days, then where every planet is, then what changes in the next seven days. Every fact comes from
 * skyNow through lib/today-sky.ts. Public since 1d: it no longer sits behind the passcode.
 *
 * Art: Jane's P10 behind the hero for now. The inked Milky Way (design system v21) replaces it once
 * its full-page cut exists, and then the page carries no Jane wash.
 */
export default function SkyPage() {
  const sky = todaySky(new Date());
  const { moon } = sky;

  return (
    <>
      <ArtWash piece="p10" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          <div className="panel-frost max-w-[36rem] p-6 md:p-10">
            <Eyebrow>{skyCopy.eyebrow}</Eyebrow>
            <Headline as="h1" line={skyCopy.headline.line} accent={skyCopy.headline.accent} />
            <Lede>{skyCopy.lede}</Lede>
            <p className="mt-4 type-caption text-ink-500">
              {skyCopy.updated} <LocalWhen at={sky.at} />, {skyCopy.updatedNote}
            </p>
          </div>
        </div>
      </ArtWash>

      <div className="border-t border-ink-200">
        <div className="mx-auto grid max-w-content gap-14 px-4 py-14 md:px-6 md:py-16">
          {/* The page's one night band: the two lights and the Moon's days. */}
          <section
            aria-labelledby="lights"
            className="rounded-[12px] bg-night-900 px-6 py-8 text-on-night night:border night:border-ink-200 md:px-10 md:py-10"
          >
            <p className="mb-6 type-label text-on-night-soft">{skyCopy.sunMoon.label}</p>
            <h2 id="lights" className="sr-only">
              {skyCopy.sunMoon.heading}
            </h2>
            <div className="grid gap-10 md:grid-cols-2">
              <Light body="sun" at={sky.sun} line={skyCopy.sunLine} />
              <Light body="moon" at={moon} line={skyCopy.moonLine}>
                <p className="mt-5 flex items-center gap-3 type-body-sm text-on-night">
                  <MoonDisc illumination={moon.illumination} waning={moon.waning} size={32} />
                  <span>
                    <span className="font-semibold">{skyCopy.phases[moon.phase]}</span>
                    {', '}
                    {skyCopy.lit(Math.round(moon.illumination * 100))}
                  </span>
                </p>
                <p className="mt-2 max-w-[40ch] type-body-sm text-on-night-soft">{skyCopy.phaseLines[moon.phase]}</p>
              </Light>
            </div>

            <h2 className="mt-12 mb-5 font-display text-[1.5rem] leading-tight font-normal text-on-night">
              {skyCopy.moonDays.heading}
            </h2>
            <MoonStrip days={sky.moonDays} lunations={sky.lunations} length={MOON_DAYS} />
          </section>

          <section aria-labelledby="planets">
            <Eyebrow>{skyCopy.planets.label}</Eyebrow>
            <Headline id="planets" line={skyCopy.planets.heading} />
            <ul className="mt-6 divide-y divide-ink-200 rounded-[12px] border border-ink-200 bg-surface-200 px-4 shadow-rest md:px-8">
              {sky.planets.map(({ id, body }) => (
                <li
                  key={id}
                  data-planet={id}
                  className="grid gap-x-6 gap-y-2 py-5 md:grid-cols-[10rem_18rem_minmax(0,1fr)] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center">
                      <BodyGlyph body={id} size={24} className="text-ink-900" />
                    </span>
                    <h3 className="type-heading-3 text-ink-900">{BODIES[id].name}</h3>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-2 type-body text-ink-900">
                    <GlyphIcon glyph={body.sign} size={24} className="text-ink-700" />
                    <span>{SIGNS[body.sign].name}</span>
                    <span className="text-ink-500">{degrees(body)}</span>
                    {body.retrograde ? (
                      <span data-retrograde="" className="type-label text-ink-500">
                        {skyCopy.planets.retrograde}
                      </span>
                    ) : null}
                  </p>
                  <p className="type-body-sm text-ink-700">
                    {body.retrograde ? skyCopy.retrogradeLines[id] : skyCopy.planetLines[id]}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-[60ch] type-caption text-ink-500">{skyCopy.planets.retrogradeNote}</p>
          </section>

          <section aria-labelledby="soon">
            <Eyebrow>{skyCopy.soon.label}</Eyebrow>
            <Headline id="soon" line={skyCopy.soon.heading} />
            <div className="mt-6 rounded-[12px] border border-ink-200 bg-surface-200 px-4 shadow-rest md:px-8">
              {sky.changes.length === 0 ? (
                <p className="py-5 type-body text-ink-700">{skyCopy.soon.none}</p>
              ) : (
                <ul className="divide-y divide-ink-200">
                  {sky.changes.map((change) => (
                    <li
                      key={`${change.kind}-${change.body}-${change.at}`}
                      data-change={change.kind}
                      className="grid gap-x-6 gap-y-1 py-5 md:grid-cols-[14rem_minmax(0,1fr)] md:items-center"
                    >
                      <p className="type-body-sm text-ink-500">
                        <LocalWhen at={change.at} />
                      </p>
                      <p className="flex items-center gap-3 type-body text-ink-900">
                        <BodyGlyph body={change.body} size={24} className="text-ink-900" />
                        {changeText(change)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
