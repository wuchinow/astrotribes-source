import type { Metadata } from 'next';
import Link from 'next/link';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { FramedArt } from '@/components/FramedArt';
import { GlyphIcon } from '@/components/GlyphIcon';
import { KeyChip } from '@/components/KeyChip';
import { KeyRow } from '@/components/KeyRow';
import { NightBand } from '@/components/NightBand';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { SkyWindow, type SkyWindowId } from '@/components/SkyWindow';
import { TintPanel } from '@/components/TintPanel';
import { EXAMPLE_CHART } from '@/content/keys-example';
import { keysPage } from '@/content/keys-page';
import { planetHref, planetPage, planetPageCopy } from '@/content/planets';
import { cn } from '@/lib/cn';
import { drawn } from '@/lib/glyphs';
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
import type { FramedId } from '@/lib/art';
import { PrimaryAction } from '@/components/HeaderAccount';
import { Stressed } from '@/components/Stressed';

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
 * The hero stands on P10 (Xie Shichen's winter landscape); below it the page is one region on the page tone (so no bands),
 * with a contents list that stays in view at desktop widths, as on the legal pages. Two framed
 * pieces below: P1 in the night band, P3 on the next step's painted edge.
 */
/**
 * Pictures between the groups, so the long list breaks up (David, Nov 4). Telescope images where the
 * group is about the sky itself (the Galactic Center, which is the Milky Way's core; Journey's Crab Nebula
 * came out on Nov 4 because it is part ESA, not public domain, until a public-domain image replaces it), credited in the footer; one of the ink landscapes where it is about people (the Generational
 * family), credited in the footer like all of hers. Never two in one screen: Identity and Healing,
 * the shortest groups, stay plain.
 */
const GROUP_PICTURES: Partial<Record<BodyGroup, { sky: SkyWindowId } | { art: FramedId }>> = {
  galacticCenter: { sky: 'keysCenter' },
};

function GroupPicture({ group }: { group: BodyGroup }) {
  const picture = GROUP_PICTURES[group];
  if (!picture) return null;
  return 'sky' in picture ? (
    <SkyWindow sky={picture.sky} aspect="aspect-[5/2]" sizes="(width >= 64rem) 50rem, calc(100vw - 2rem)" className="mt-6 mb-4" />
  ) : (
    <FramedArt id={picture.art} sizes="(width >= 40rem) 20rem, calc(100vw - 2rem)" className="mt-6 mb-4 w-full max-w-[20rem]" />
  );
}

export default function KeysPage() {
  const withTime = KEY_LIST.filter(needsBirthTime).length;
  const sections = [
    { id: keysPage.how.id, title: keysPage.how.contents },
    ...BODY_GROUPS.map((group) => ({ id: anchor(group.id), title: group.name })),
    { id: HOUSES_ID, title: keysPage.houses.contents },
    { id: keysPage.example.id, title: keysPage.example.contents },
    { id: keysPage.connect.id, title: keysPage.connect.contents },
    { id: keysPage.glance.id, title: keysPage.glance.contents },
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
            <Lede>
              <Stressed text={keysPage.hero.lede} />
            </Lede>
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
                  {drawn('sun') ? <GlyphIcon glyph="sun" size={72} className="-ml-1 text-ink-900" /> : null}
                  <div>
                    <p className="type-heading-2 text-ink-900 md:mt-1">{BODIES.sun.name}</p>
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
                  <GroupPicture group={group.id} />
                  <ul role="list" className="mt-2">
                    {bodiesIn(group.id).map((body) => {
                      const planet = planetPage(body);
                      return (
                        <li key={body} className="border-t border-ink-200 first:border-t-0">
                          <KeyRow
                            body={body}
                            notes={keysPage.notes}
                            missing={keysPage.noKey[body]}
                            more={planet ? { href: planetHref(planet), label: planetPageCopy.more(BODIES[body].name) } : undefined}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  {group.id === 'generational' ? (
                    <div data-generation-example="" className="mt-6 max-w-measure border-l-2 border-gold-500 pl-5">
                      <h3 className="type-heading-3 text-ink-900">{keysPage.generationExample.title}</h3>
                      {keysPage.generationExample.paragraphs.map((paragraph) => (
                        <p key={paragraph.slice(0, 24)} className="mt-3 type-body text-ink-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
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
                      <h3 className="font-body text-[1.375rem] font-semibold leading-snug text-ink-900">
                        {house.name}
                      </h3>
                      <p className="mt-1 type-body text-ink-900">{house.question}</p>
                      <p data-house-line="" className="mt-1 type-body text-ink-500">
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

            <section
              id={keysPage.glance.id}
              aria-labelledby={`${keysPage.glance.id}-title`}
              className="mt-14 scroll-mt-8"
            >
              <Eyebrow>{keysPage.glance.eyebrow}</Eyebrow>
              <Headline id={`${keysPage.glance.id}-title`} line={keysPage.glance.line} accent={keysPage.glance.accent} />
              <KeysTable />
            </section>

            <TintPanel className="mt-14" art="p3">
              <Eyebrow>{keysPage.nextStep.eyebrow}</Eyebrow>
              <h2 className="type-display-lg text-ink-900">{keysPage.nextStep.title}</h2>
              <p className="mt-2 max-w-[56ch] text-ink-700">{keysPage.nextStep.body}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryAction />
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

/**
 * Dawa's table of the 28 Keys (Nov 7, note 25): one row per planet or point, in the six groups'
 * order, with its glyph, its sign Key, its house Key, and how many Keys it gives, and the tally at
 * the foot. Chips without their meanings: every one is glossed in the groups above. On a phone the
 * house Key sits under the sign Key and the count column drops (the tally stays), so it fits.
 */
function KeysTable() {
  const bodies = BODY_GROUPS.flatMap((group) => bodiesIn(group.id));
  const { columns } = keysPage.glance;
  const head = 'px-3 py-3 text-left type-label text-ink-500';
  return (
    <div className="mt-8 overflow-x-auto rounded-[12px] border border-ink-200 bg-surface-200 shadow-rest">
      <table data-keys-table="" className="w-full border-collapse sm:min-w-[36rem]">
        <caption className="sr-only">{keysPage.glance.caption}</caption>
        <thead>
          <tr className="border-b border-ink-200">
            <th scope="col" className={head}>
              {columns.body}
            </th>
            <th scope="col" className={head}>
              <span className="sm:hidden">{columns.both}</span>
              <span className="hidden sm:inline">{columns.sign}</span>
            </th>
            <th scope="col" className={cn(head, 'hidden sm:table-cell')}>
              {columns.house}
            </th>
            <th scope="col" className={cn(head, 'hidden text-right sm:table-cell')}>
              {columns.count}
            </th>
          </tr>
        </thead>
        <tbody>
          {bodies.map((body) => {
            const sign = keyFor(body, 'sign');
            const house = keyFor(body, 'house');
            return (
              <tr key={body} data-keys-table-row={body} className="border-b border-ink-200">
                <th scope="row" className="px-3 py-3 text-left font-normal">
                  <span className="flex items-center gap-3">
                    {drawn(body) ? (
                      <GlyphIcon glyph={body} size={48} className="text-ink-900" />
                    ) : (
                      <span aria-hidden="true" className="inline-block size-12 shrink-0" />
                    )}
                    <span className="type-body text-ink-900">{BODIES[body].name}</span>
                  </span>
                </th>
                <td className="px-3 py-3">
                  <span className="flex flex-col items-start gap-2">
                    {sign ? <KeyChip keyId={sign.id} /> : null}
                    {house ? (
                      <span className="sm:hidden">
                        <KeyChip keyId={house.id} />
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className="hidden px-3 py-3 sm:table-cell">{house ? <KeyChip keyId={house.id} /> : null}</td>
                <td className="hidden px-3 py-3 text-right type-body whitespace-nowrap text-ink-700 sm:table-cell">
                  {keysPage.glance.count([sign, house].filter(Boolean).length)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="px-3 py-4 text-right font-display text-[1.5rem] text-ink-900">
              {keysPage.glance.total(KEY_LIST.length)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
