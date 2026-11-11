import { SUN_STORIES } from '@/content/sun-stories';
import { TRIBE_DAWA, starList } from '@/content/tribe-dawa';
import { TRIBE_WORDS, tribePage as copy } from '@/content/tribes';
import { houseOf, SIGNS, signDates, type SignId } from './keys';
import { PLATES } from './old-prints';
import { helloColumns, type HelloColumns, type HelloColumnsInput } from './tribe-columns';

/** A Tribe's facts, in the order its page lists them; `lead` is the ruling planet's name, above its line. */
export function tribeFacts(sign: SignId): HelloColumnsInput['facts'] {
  const def = SIGNS[sign];
  const words = TRIBE_WORDS[sign];
  const dawa = TRIBE_DAWA[sign];
  const house = houseOf(dawa.house);
  const labels = copy.signature.facts;
  return [
    { label: labels.dates, value: signDates(sign) },
    { label: labels.latin, value: dawa.latin.text },
    { label: labels.element, value: copy.element[def.element] },
    { label: labels.mode, value: copy.mode[def.mode] },
    { label: labels.symbol, value: words.symbol },
    { label: labels.ruler, value: words.ruler.line, lead: words.ruler.name },
    { label: labels.house, value: `${house.roman} ${house.name}: ${house.question}` },
    { label: labels.season, value: dawa.season.text },
    { label: labels.stars, value: starList(dawa.stars) },
  ];
}

/** What a Tribe page's first section holds, as lib/tribe-columns.ts weighs it. */
export function tribeHelloInput(sign: SignId): HelloColumnsInput {
  const dawa = TRIBE_DAWA[sign];
  return {
    hello: dawa.hello,
    story: SUN_STORIES[sign].split('\n\n'),
    facts: tribeFacts(sign),
    didYouKnow: dawa.didYouKnow,
    caption: copy.signature.plate.line(SIGNS[sign].name),
    plate: PLATES[sign].size,
  };
}

/** Where the star card and "Did you know?" stand on this Tribe's page. */
export function tribeHelloColumns(sign: SignId): HelloColumns {
  return helloColumns(tribeHelloInput(sign));
}
