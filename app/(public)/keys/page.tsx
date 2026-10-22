import type { Metadata } from 'next';
import Link from 'next/link';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyChip } from '@/components/KeyChip';
import { KeyRow } from '@/components/KeyRow';
import { NightBand } from '@/components/NightBand';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { TintPanel } from '@/components/TintPanel';
import { EXAMPLE_CHART } from '@/content/keys-example';
import { keysPage } from '@/content/keys-page';
import { cn } from '@/lib/cn';
import { GLYPHS } from '@/lib/glyphs';
import {
  BODIES,
  BODY_GROUPS,
  HOUSES,
  KEYS,
  KEY_LIST,
  SIGNS,
  bodiesIn,
  houseOf,
  keyFor,
  needsBirthTime,
  type BodyGroup,
  type HouseNumber,
} from '@/lib/keys';
import { PRIMARY_ACTION } from '@/lib/site';

export const metadata: Metadata = { title: keysPage.metaTitle, description: keysPage.description };

/** 'galacticCenter' to 'galactic-center': a group's anchor, from its id, never from a key name. */
const anchor = (group: BodyGroup) => group.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const HOUSES_ID = 'houses';

const { placements: example } = EXAMPLE_CHART;
const surname = EXAMPLE_CHART.name.split(' ').at(-1)!;

/** The house of the example chart that holds the most house keys, said as one sentence with their names. */
function exampleCluster() {
  const byHouse = new Map<HouseNumber, string[]>();
  for (const group of BODY_GROUPS) {
    for (const body of bodiesIn(group.id)) {
      const house = example[body].house;
      const key = keyFor(body, 'house');
      if (house === null || !key) continue;
      byHouse.set(house, [...(byHouse.get(house) ?? []), key.name]);
    }
  }
  const [house, names] = [...byHouse].reduce((a, b) => (b[1].length > a[1].length ? b : a));
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}` : names[0];
  return keysPage.example.cluster(names.length, houseOf(house).roman, houseOf(house).name, list);
}

/**
 * The 28 Keys (1k, built out in 1m): how one placement gives two keys, shown on the example chart's
 * Sun; every key by placement, sign then house, in the design system's six groups, each body with
 * Dawa's line; the twelve houses with their questions and his lines; one whole chart read in keys
 * (content/keys-example.ts, checked against the engine); and how keys connect two charts. Static
 * and public, outside the passcode: no engine at runtime, no data. Names, glosses, lines, groups,
 * and houses all come from lib/keys.ts, so a rename lands here too, and a key Dawa has not
 * confirmed looks like any other.
 *
 * The hero stands on Jane's P10; below it the page is one region on the page tone (so no bands),
 * with a contents list that stays in view at desktop widths, as on the legal pages. Two framed
 * pieces below: P1 in the night band, P3 on the next step's painted edge.
 */
export default function KeysPage() {
  const withTime = KEY_LIST.filter(needsBirthTime).length;
  const sections = [
    { id: keysPage.how.id, title: keysPage.how.contents },
    ...BODY_GROUPS.map((group) => ({ id: anchor(group.id), title: group.name })),
    { id: HOUSES_ID, title: keysPage.houses.contents },
    { id: keysPage.example.id, title: keysPage.example.contents },
    { id: keysPage.connect.id, title: keysPage.connect.contents },
  ];
  const contents = (linkClassName: string) =>
    sections.map((section) => (
      <li key={section.id}>
        <a href={`#${section.id}`} className={linkClassName}>
          {section.title}
        </a>
      </li>
    ));

  const sun = example.sun;
  const sunHouse = houseOf(sun.house!);
  const three = [
    `${SIGNS[example.sun.sign].name} ${KEYS.sunSign.name}`,
    `${SIGNS[example.rising.sign].name} ${KEYS.risingSign.name}`,
    `${SIGNS[example.moon.sign].name} ${KEYS.moonSign.name}`,
  ].join(', ');

  return (
    <>
      <ArtWash piece="p10" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          <div className="panel-frost max-w-[36rem] p-6 md:p-10">
            <Eyebrow>{keysPage.hero.eyebrow}</Eyebrow>
            <Headline as="h1" line={keysPage.hero.line} accent={keysPage.hero.accent} />
            <Lede>{keysPage.hero.lede}</Lede>
          </div>
        </div>
      </ArtWash>

      <div className="border-t border-ink-200">
        <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
          <nav aria-label={keysPage.contents} className="hidden lg:block">
            <div className="sticky top-8">
              <p className="mb-3 type-label text-ink-500">{keysPage.contents}</p>
              <ul>
                {contents('inline-flex min-h-touch items-center type-body-sm text-cobalt-600 underline-offset-4 hover:underline')}
              </ul>
            </div>
          </nav>

          <div>
            {/* One placement as its two keys, before the list: the example chart's Sun. */}
            <section id={keysPage.how.id} aria-labelledby={`${keysPage.how.id}-title`} className="scroll-mt-8">
              <Eyebrow>{keysPage.how.eyebrow}</Eyebrow>
              <Headline id={`${keysPage.how.id}-title`} line={keysPage.how.line} accent={keysPage.how.accent} />
              <p className="max-w-measure text-ink-700">{keysPage.how.body(EXAMPLE_CHART.name)}</p>
              <div
                data-how=""
                className="mt-8 grid gap-6 rounded-[12px] border border-ink-200 bg-surface-200 p-6 shadow-rest md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:p-8"
              >
                <div className="flex items-center gap-3 md:block">
                  {GLYPHS.sun.credit !== null ? <GlyphIcon glyph="sun" size={48} className="-ml-1 text-ink-900" /> : null}
                  <div>
                    <p className="type-heading-3 text-ink-900 md:mt-1">{BODIES.sun.name}</p>
                    <p className="type-body-sm text-ink-500">{keysPage.how.whose(surname)}</p>
                  </div>
                </div>
                <div className="border-t border-ink-200 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                  <p className="mb-2 type-label text-ink-500">{keysPage.how.sign(SIGNS[sun.sign].name)}</p>
                  <KeyChip keyId="sunSign" value={sun.sign} showGloss />
                </div>
                <div className="border-t border-ink-200 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                  <p className="mb-2 type-label text-ink-500">{keysPage.how.house(sunHouse.roman, sunHouse.name)}</p>
                  <KeyChip keyId="sunHouse" value={sun.house!} showGloss />
                </div>
              </div>
            </section>

            {/* Which keys need a birth time, once, in plain words (the design system's summary strip). */}
            <dl className="mt-14 grid grid-cols-2 gap-6 border-y border-ink-200 py-5">
              <div>
                <dt className="type-ui text-ink-900">{keysPage.strip.date.title}</dt>
                <dd className="mt-1 type-body-sm text-ink-700">
                  {keysPage.strip.date.body(KEY_LIST.length - withTime)}
                </dd>
              </div>
              <div>
                <dt className="type-ui text-ink-900">{keysPage.strip.time.title}</dt>
                <dd className="mt-1 type-body-sm text-ink-700">{keysPage.strip.time.body(withTime)}</dd>
              </div>
            </dl>
            <Link
              href={keysPage.strip.more.href}
              className="mt-2 inline-flex min-h-touch items-center type-ui text-cobalt-600 underline-offset-4 hover:underline"
            >
              {keysPage.strip.more.label}
            </Link>

            <nav aria-label={keysPage.contents} className="mt-4 lg:hidden">
              <p className="type-label text-ink-500">{keysPage.contents}</p>
              <ul className="mt-1 flex flex-wrap gap-x-6">
                {contents('inline-flex min-h-touch items-center type-body-sm text-cobalt-600 underline-offset-4 hover:underline')}
              </ul>
            </nav>

            {BODY_GROUPS.map((group, index) => {
              const id = anchor(group.id);
              const lede = keysPage.groupLedes[group.id];
              return (
                <section
                  key={group.id}
                  id={id}
                  aria-labelledby={`${id}-title`}
                  className={cn('scroll-mt-8 border-t border-ink-200 pt-10', index === 0 ? 'mt-6' : 'mt-12')}
                >
                  <h2 id={`${id}-title`} data-group-label="" className="type-heading-2 text-ink-900">
                    {group.name}
                  </h2>
                  {lede ? <p className="mt-2 max-w-measure text-ink-700">{lede}</p> : null}
                  <ul role="list" className="mt-2">
                    {bodiesIn(group.id).map((body) => (
                      <li key={body} className="border-t border-ink-200 first:border-t-0">
                        <KeyRow body={body} notes={keysPage.notes} missing={keysPage.noKey[body]} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            <section
              id={HOUSES_ID}
              aria-labelledby={`${HOUSES_ID}-title`}
              className="mt-12 scroll-mt-8 border-t border-ink-200 pt-10"
            >
              <Eyebrow>{keysPage.houses.eyebrow}</Eyebrow>
              <Headline id={`${HOUSES_ID}-title`} line={keysPage.houses.line} accent={keysPage.houses.accent} />
              <p className="max-w-measure text-ink-700">{keysPage.houses.intro}</p>
              {/* The numbered-item pattern, the numeral Roman: reading across, I to XII. */}
              <ol role="list" className="mt-8 grid gap-x-8 border-b border-ink-200 sm:grid-cols-2 xl:grid-cols-3">
                {HOUSES.map((house) => (
                  <li
                    key={house.number}
                    data-house={house.number}
                    className="grid grid-cols-[4.5rem_1fr] gap-x-3 border-t border-ink-200 py-5"
                  >
                    <span className="step-numeral">
                      <span className="sr-only">{keysPage.houses.numberLabel} </span>
                      {house.roman}
                    </span>
                    <div>
                      <h3 className="font-body text-[1.25rem] font-semibold leading-snug text-ink-900">
                        {house.name}
                      </h3>
                      <p className="mt-1 type-body-sm text-ink-900">{house.question}</p>
                      <p data-house-line="" className="mt-1 type-body-sm text-ink-500">
                        {house.line}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* One whole chart in keys: every body, its sign key and its house key, with the values. */}
            <section
              id={keysPage.example.id}
              aria-labelledby={`${keysPage.example.id}-title`}
              className="mt-14 scroll-mt-8"
            >
              <Eyebrow>{keysPage.example.eyebrow}</Eyebrow>
              <Headline
                id={`${keysPage.example.id}-title`}
                line={keysPage.example.line}
                accent={keysPage.example.accent}
              />
              <p className="max-w-measure text-ink-700">{keysPage.example.intro(EXAMPLE_CHART.born)}</p>

              <figure className="mt-8 border-l-2 border-gold-500 pl-5">
                <blockquote className="font-display text-[1.5rem] leading-snug text-ink-900 italic">
                  {EXAMPLE_CHART.quote}
                </blockquote>
                <figcaption className="mt-2 type-body-sm text-ink-700">
                  {keysPage.example.signature(EXAMPLE_CHART.name, three)}
                </figcaption>
              </figure>

              <div data-example="" className="mt-8 rounded-[12px] border border-ink-200 bg-surface-200 px-5 shadow-rest md:px-8">
                {BODY_GROUPS.map((group) => (
                  <div key={group.id} className="border-t border-ink-200 py-5 first:border-t-0">
                    <p className="type-label text-ink-500">{group.name}</p>
                    <ul role="list" className="mt-1">
                      {bodiesIn(group.id).map((body) => {
                        const at = example[body];
                        const sign = keyFor(body, 'sign');
                        const house = keyFor(body, 'house');
                        return (
                          <li
                            key={body}
                            data-example-body={body}
                            className="grid gap-x-6 gap-y-2 py-2 sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center"
                          >
                            <span className="type-ui text-ink-900">{BODIES[body].name}</span>
                            <span>{sign ? <KeyChip keyId={sign.id} value={at.sign} /> : null}</span>
                            <span className="flex flex-wrap items-center gap-x-3">
                              {house && at.house !== null ? (
                                <>
                                  <KeyChip keyId={house.id} value={at.house} />
                                  <span className="type-body-sm text-ink-500">{houseOf(at.house).name}</span>
                                </>
                              ) : null}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <p data-cluster="" className="mt-6 max-w-measure text-ink-700">
                {exampleCluster()}
              </p>
            </section>

            <section
              id={keysPage.connect.id}
              aria-labelledby={`${keysPage.connect.id}-title`}
              className="mt-14 scroll-mt-8"
            >
              <NightBand
                id={`${keysPage.connect.id}-title`}
                eyebrow={keysPage.connect.eyebrow}
                title={keysPage.connect.title}
                items={keysPage.connect.items({
                  tribe: KEYS.sunSign.name,
                  clan: KEYS.moonSign.name,
                  kingdom: KEYS.sunHouse.name,
                  vibe: KEYS.risingSign.name,
                  voice: KEYS.mercurySign.name,
                })}
                art="p1"
              />
            </section>

            <TintPanel className="mt-14" art="p3">
              <Eyebrow>{keysPage.nextStep.eyebrow}</Eyebrow>
              <h2 className="type-heading-2 font-normal text-ink-900">{keysPage.nextStep.title}</h2>
              <p className="mt-2 max-w-[56ch] text-ink-700">{keysPage.nextStep.body}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={PRIMARY_ACTION.href}>{PRIMARY_ACTION.label}</Button>
                <Button href={keysPage.nextStep.secondary.href} variant="secondary">
                  {keysPage.nextStep.secondary.label}
                </Button>
              </div>
            </TintPanel>
          </div>
        </div>
      </div>
    </>
  );
}
