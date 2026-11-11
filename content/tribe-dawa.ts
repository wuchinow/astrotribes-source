// Dawa's words for each Tribe page (4f, his Nov 7 notes 17 to 19), from "Tribe pages new stuff"
// (Drive, Nov 6) and "Tribe page content" (Drive, Nov 6, the slogans). His story paragraphs live in
// content/sun-stories.ts, shared with the Sun's sign lines. Fitted to the copy rules only: a dash
// standing in for a comma or colon becomes one, typos and star spellings are mended, his own "!" stays
// (CLAUDE.md), and "tribe" stays lowercase where it names the group (the lint keeps key names to
// lib/keys.ts). Where his doc had no entry, ours is marked `ours` and listed on "Drafts for Dawa to
// review" (Notion).

import type { HouseNumber, SignId } from "@/lib/keys";

export interface Star {
  name: string;
  /** What the name means, where Dawa gave it. */
  meaning?: string;
}

export interface TribeDawa {
  /** The sentence after "Hello Aries:", his words. */
  hello: string;
  /** His fun slogans (Scorpio and Aquarius get two). */
  slogans: readonly string[];
  /** "Aries is Latin for ram." `ours` where his doc had none. */
  latin: { text: string; ours?: true };
  house: HouseNumber;
  /** The season. `ours` where his doc had none. */
  season: { text: string; ours?: true };
  stars: readonly Star[];
  traits: readonly string[];
  shadows: readonly string[];
  /** A light line of his under the traits, where he wrote one. */
  aside?: string;
  /** His "Did you know?" items and loose facts. */
  didYouKnow: readonly string[];
}

export const TRIBE_DAWA: Record<SignId, TribeDawa> = {
  aries: {
    hello:
      "Your tribe is famous throughout the solar system for being the initiators, the beginners, the starters, the leaders, the pioneers. You go to the head of the line. You have a gift of fearless courage, bravery, and a willingness to try new things and take chances. You can be impulsive, even reckless at times, but generally you get things going.",
    slogans: ["A Stampede of Rams"],
    latin: { text: "Aries is Latin for ram." },
    house: 1,
    season: {
      text: "The beginning of spring, and the first sign of the zodiac",
    },
    stars: [{ name: "Hamal", meaning: "the ram’s head" }, { name: "Sheratan" }],
    traits: [
      "Pioneering",
      "Courage",
      "Initiative",
      "Enthusiasm",
      "Risk taking",
      "Impulsive",
      "Sudden",
    ],
    aside: "Rams charge ahead, head down, and butt heads. Ouch!",
    shadows: ["Impulsive", "Impatient", "Reckless", "Inconsiderate"],
    didYouKnow: [
      "The word “Aries” has meant “ram” for over two thousand years.",
    ],
  },
  taurus: {
    hello:
      "Your tribe is famous throughout the solar system for stability, strength, reliability, and consistency. You are known for being dependable. You are the builders, wonderful at creating things that can last. You can be quite stubborn, but this is because you know what you believe and you believe what you know, and you know that patience is a virtue.",
    slogans: ["Herd of Bulls"],
    latin: { text: "Taurus is Latin for bull." },
    house: 2,
    season: { text: "Mid spring", ours: true },
    stars: [
      { name: "Aldebaran", meaning: "the follower, the eye of the bull" },
      { name: "the Pleiades", meaning: "the seven sisters" },
      { name: "the Hyades" },
      { name: "Elnath" },
    ],
    traits: ["Consistent", "Reliable", "Predictable", "Loyal", "Methodical"],
    shadows: ["Stubborn", "Possessive", "Complacent", "Resistant"],
    didYouKnow: [
      "Taurus is an earth sign and a fixed sign: stable, steady, not prone to change.",
      "Focused on the material world, and on enjoying the senses.",
      "Associated with growing things, cultivation, farming and gardening, pets and animals.",
    ],
  },
  gemini: {
    hello:
      "Your tribe is famous throughout the solar system for your creativity, innovation, and your juggling abilities. At times you can appear a bit scattered, but this is because you notice everything at once. You are alert, quick thinking, expressive, and multi-talented.",
    slogans: ["Juggling Geminis"],
    latin: { text: "Gemini is Latin for the twins." },
    house: 3,
    season: { text: "Late spring", ours: true },
    stars: [{ name: "Castor" }, { name: "Pollux" }, { name: "Alhena" }],
    traits: ["Flexible", "Curious", "Versatile", "Adaptable", "Witty"],
    shadows: ["Scattered", "Inconsistent", "Superficial", "Distractible"],
    didYouKnow: [
      "The twins’ names are Castor and Pollux, from Greek mythology.",
      "Castor is a multiple star system: six stars, bound together by gravity.",
    ],
  },
  cancer: {
    hello:
      "Your tribe is famous throughout the solar system for your sensitivity, your nurturing qualities, and your home-making abilities. Your energy is water, and associated with the Moon.",
    slogans: ["Cluster of Crabs"],
    latin: { text: "Cancer is Latin for crab." },
    house: 4,
    season: { text: "Begins at the summer solstice" },
    stars: [
      { name: "the Beehive Cluster (Praesepe)" },
      { name: "Acubens" },
      { name: "Altarf" },
    ],
    traits: ["Nurturing", "Caring", "Protective", "Loyal", "Intuitive"],
    shadows: ["Moody", "Overprotective", "Defensive", "Clingy"],
    didYouKnow: [],
  },
  leo: {
    hello:
      "Your tribe is famous throughout the solar system for your magnetic personality, your self-confidence, and your loving and creative heart. There is a bit of pride in the Lion’s heart; confidence is great, but it might be seen as arrogant and overbearing by some. The Lion does like to be seen and appreciated. But deep down Leo is magnanimous and generous. You know how to see the good in everyone around you, and you draw people to you with your sunny disposition and good cheer. Generally people are attracted to you because your reflection back to them is like a mirror of confidence. A host of talents come naturally to the zodiac’s pride of Lions. Performing, acting, directing, and teaching are all good Leo vocations. Leos are often elected or appointed as heads of departments, businesses, and other organizations.",
    slogans: ["A Pride of Leos"],
    latin: { text: "Leo is Latin for lion.", ours: true },
    house: 5,
    season: { text: "Midsummer" },
    stars: [{ name: "Regulus" }, { name: "Denebola" }, { name: "Algieba" }],
    traits: ["Warm", "Loyal", "Brave", "Charismatic", "Creative"],
    shadows: [
      "Pride",
      "Stubbornness",
      "Need for recognition",
      "Dramatic",
      "Hard to admit mistakes",
    ],
    didYouKnow: [],
  },
  virgo: {
    hello:
      "Your tribe is famous throughout the solar system for your fine attention to detail and your ability to separate the wheat from the chaff. You have strong senses and a clear mind. You might appear judgmental or stuck up to some, but this is because you have very clear boundaries and preferences. You can be quite opinionated, not necessarily a bad thing: you simply know what you like and what you don’t. It’s crystal clear.",
    slogans: ["Precise Circle of Virgos"],
    latin: { text: "Virgo is Latin for maiden.", ours: true },
    house: 6,
    season: { text: "Late summer, the harvest" },
    stars: [
      { name: "Spica" },
      { name: "Porrima" },
      { name: "Vindemiatrix" },
      { name: "Zavijava" },
    ],
    traits: ["Practical", "Analytical", "Dependable", "Organized"],
    shadows: [
      "Perfectionism",
      "Obsessive",
      "Compulsive",
      "Overthinking",
      "Overly critical",
      "Worrying",
      "Anxiety",
    ],
    didYouKnow: [
      "Core themes: improving life through skill, service, careful attention, refinement, and troubleshooting.",
    ],
  },
  libra: {
    hello:
      "Your tribe is famous throughout the solar system for your ability to create harmony and balance. You hold scales to evaluate (weigh) everything so that things are fair and even. When necessary you will recalibrate to get back to center. There is a natural gentleness due to “not wanting to rock the boat” or “upset the apple cart”. This is social sensitivity at its finest.",
    slogans: ["Balanced Scales"],
    latin: { text: "Libra is Latin for scales.", ours: true },
    house: 7,
    season: { text: "Autumn, from the fall equinox" },
    stars: [{ name: "Zubenelgenubi" }, { name: "Zubeneschamali" }],
    traits: [
      "Fair",
      "Considerate",
      "Careful",
      "Reflective",
      "Measured",
      "Social",
    ],
    shadows: ["Indecisive", "Noncommittal", "Procrastinating", "Avoidant"],
    didYouKnow: [],
  },
  scorpio: {
    hello:
      "Your tribe is famous throughout the solar system for its curiosity and its ability to look beneath the surface and behind the veils. Scorpio is the energy that looks at hidden agendas, deeper things, motivations behind the surface, and human interaction dramas.",
    slogans: ["Mysterious Scorpios", "Don’t Tread on Me"],
    latin: { text: "Scorpio is Latin for scorpion.", ours: true },
    house: 8,
    season: { text: "Autumn" },
    stars: [{ name: "Antares" }, { name: "Sargas" }, { name: "Shaula" }],
    traits: [
      "Passionate",
      "Intense",
      "Private",
      "Protective",
      "Secretive",
      "Curious",
    ],
    shadows: [
      "Jealous",
      "Vindictive",
      "Obsessive",
      "Control",
      "Suspicion",
      "Letting go",
    ],
    didYouKnow: [],
  },
  sagittarius: {
    hello:
      "Your tribe is famous throughout the solar system for its open-minded sense of adventure, optimism, love of learning, growth, and expansion.",
    slogans: ["Galloping Centaurs"],
    latin: { text: "Sagittarius is Latin for the archer." },
    house: 9,
    season: { text: "Late autumn", ours: true },
    stars: [{ name: "Nunki" }, { name: "Kaus Australis" }, { name: "Ascella" }],
    traits: ["Expansion", "Exploration", "Optimism", "Gambling", "Adventurous"],
    shadows: ["Careless", "Overpromising", "Restless", "Excessive"],
    didYouKnow: [],
  },
  capricorn: {
    hello:
      "Your tribe is famous throughout the solar system for its determination and practical striving for its goals. Capricorn is an earth sign and is about working hard to achieve whatever it sets its sights on.",
    slogans: ["Climbing Capricorns"],
    latin: {
      text: "Capricorn is from the Latin capricornus, horned goat.",
      ours: true,
    },
    house: 10,
    season: { text: "Begins at the winter solstice", ours: true },
    stars: [{ name: "Deneb Algedi" }, { name: "Nashira" }],
    traits: [
      "Dependable",
      "Ambitious",
      "Hard working",
      "Dedicated",
      "Disciplined",
      "Responsible",
    ],
    shadows: ["Serious", "Workaholic", "Controlling", "Rigid"],
    didYouKnow: [
      "Saturn is the ringed planet, and the outermost planet that could be seen with the unaided eye in ancient times: the boundary. Its rings signify boundaries and limits too.",
      "Saturn’s symbol is the cross of matter sitting atop the crescent of the soul, or consciousness. It speaks of the conditions and limits of physical existence: time, structure, boundaries, responsibilities, discipline, and consequences. This is the realm of karma, of causes and their results.",
      "The principle: you live in a material world, with certain laws and rules, and you must work within its constraints. “The end of the road”.",
      "The glyph resembles a scythe or sickle, a farming tool for the harvest (of karma and deeds). Another name for Saturn was Kronos, the old god of agriculture, the harvest, and time itself. Saturn was probably worshiped by Paleolithic people as they first moved from hunting and gathering to the settled life of farmers.",
    ],
  },
  aquarius: {
    hello:
      "Your tribe is famous throughout the solar system for being the principled visionaries of the zodiac. Aquarius is about universal values of justice. It is the higher octave of Libra, and like Libra, it is an air sign. Air rules the mind, thoughts, and imagination. Aquarius is all about the future, building a new, improved, and better society for all.",
    slogans: ["Cool Aquarians", "Fellowship of Aquarians"],
    latin: { text: "Aquarius is Latin for water bearer.", ours: true },
    house: 11,
    season: { text: "Winter" },
    stars: [
      { name: "Sadalmelik", meaning: "luck of the king" },
      { name: "Sadalsuud", meaning: "auspicious" },
      { name: "Skat" },
    ],
    traits: ["Original", "Independent", "Humanitarian", "Justice", "Inventive"],
    shadows: [
      "Detached",
      "Aloof",
      "Cold",
      "Disconnected from earth",
      "Values theory more than physical reality",
      "Unpredictable",
    ],
    didYouKnow: [],
  },
  pisces: {
    hello:
      "Your tribe is famous throughout the solar system for your fluidity and adaptability. Pisces is the most intuitive and dreamlike sign. The energy is water, free from boundaries, always flowing and adapting to its container.",
    slogans: ["Immersed Pisces"],
    latin: { text: "Pisces is Latin for fish.", ours: true },
    house: 12,
    season: { text: "Late winter", ours: true },
    stars: [
      { name: "Fomalhaut", meaning: "the mouth of the fish" },
      { name: "Alrescha", meaning: "the cord" },
    ],
    traits: ["Empathetic", "Compassionate", "Intuitive", "Imaginative"],
    shadows: [
      "Overly idealistic",
      "Porous boundaries",
      "Escapist",
      "Vague or avoidant",
      "Martyr and savior loops",
    ],
    didYouKnow: [],
  },
};

/** "Hamal (the ram’s head), Sheratan". */
export const starList = (stars: readonly Star[]) =>
  stars
    .map((s) => (s.meaning ? `${s.name} (${s.meaning})` : s.name))
    .join(", ");

/** How every Tribe's hello opens; what follows it, to the first full stop, is what the Tribe is known for. */
const FAMOUS_FOR = /^Your tribe is famous throughout the solar system for (.+?)\.(?:\s|$)/;

/**
 * What a Tribe is known for, in Dawa's words: the rest of his hello's first sentence, with a capital.
 * The 12 Tribes page shows it as a fact, because his sentence itself, twelve times down one page,
 * opened every card with the same eight words.
 */
export const knownFor = (sign: SignId): string | undefined => {
  const rest = TRIBE_DAWA[sign].hello.match(FAMOUS_FOR)?.[1];
  return rest ? rest[0].toUpperCase() + rest.slice(1) : undefined;
};
