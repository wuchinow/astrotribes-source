// A page of its own for each planet whose Keys Dawa has written out in full (David, Nov 4): his
// introduction, then the planet in each of the twelve signs (its sign key) and each of the twelve
// houses (its house key). Each member sees their own two lines on Your chart. Key names come from
// lib/keys.ts and arrive as arguments; nothing here types one.
//
// Jupiter: Dawa's "Jupiter Signs and House Keys" (Drive, Nov 3), his words verbatim but for
// punctuation fitted to the copy rules (no exclamation marks, no dashes standing in for commas).
// David, Nov 4: "make calls" on Dawa's open items so he can review the site rather than a message.
// So his introduction's facts were checked and three fixed (Galileo's telescope, "strong evidence"
// for Copernicus as NASA puts it, and "forbade him to publish", the 1633 ban), and Sagittarius and
// Capricorn took a second quality like the other ten signs. The 115 moons stand: NASA's Jupiter
// facts page gives that count.
//
// Every other planet (Nov 4): its sign and house lines from Dawa's own Keys docs (Drive, Oct 4 to
// Oct 23), where he has written them, fitted to the copy rules the same way, with a key name in his
// text lowercased (the lint keeps key names to lib/keys.ts); and an introduction drafted in the
// style of his Jupiter one, in `draft`, shown under a draft note until he rewrites or approves it.
// Mars keeps his own opening paragraph as its `intro`.
//
// Nov 6 (David): everything still missing is drafted in his voice in content/planet-drafts.ts, merged
// in below (`withDrafts`) and shown like his own words, with no draft mark on the site; the list for
// Dawa to review is a Notion page. Chiron and the two Nodes have pages from that day, all drafts.

import type { BodyId, HouseNumber, SignId } from '@/lib/keys';
import type { SkyId } from '@/lib/sky';
import { PLANET_DRAFTS } from './planet-drafts';
import { the, The } from './the';

export interface PlanetContent {
  body: BodyId;
  /** The path segment under /keys. A body id, never a key name. */
  slug: string;
  /** The telescope picture beside the hero's words (lib/sky.ts), credited in the footer. None for
   * Chiron and the Nodes, which have no NASA photo of their own. */
  sky?: SkyId;
  /** The picture's window, a Tailwind aspect class typed whole so Tailwind sees it. */
  aspect?: 'aspect-[4/5]' | 'aspect-square' | 'aspect-[2/1]';
  /** Dawa's introduction, one string per paragraph. */
  intro: readonly string[];
  /** PLACEHOLDER: an introduction drafted for Dawa to rewrite or approve, shown after his own (no mark since Nov 6). */
  draft: readonly string[];
  /** His line for the planet in each sign, where he has written one. */
  signs: Readonly<Partial<Record<SignId, string>>>;
  /** His line for the planet in each house, where he has written one. */
  houses: Readonly<Partial<Record<HouseNumber, string>>>;
  /** His words over the signs or the houses as a whole, where he has written them (paragraphs split by a blank line). */
  signsNote?: string;
  housesNote?: string;
  /** Who wrote Dawa's words, for the foot of the page; empty where it is all drafted. Never says draft (David, Nov 6). */
  source: string;
  reviewed: boolean;
}

const jupiter: PlanetContent = {
  body: 'jupiter',
  slug: 'jupiter',
  sky: 'jupiter',
  aspect: 'aspect-[4/5]',
  intro: [
    'Jupiter is our solar system’s largest planet, and is the “ruler” of Sagittarius, the sign appropriately associated with expansion, exploration, and reaching beyond what is close at hand, so enlarging our perspective. It is about abundance, growth, expansion, exploration and optimism as well as being loose and free in expression, through humor and other means.',
    'Jupiter has 115 moons (and counting) with the four largest being the first extraterrestrial moons visible to humans (with the aid of Galileo’s homemade telescope). These four moons are significant because observing their movements and positions gave Galileo strong evidence that Copernicus was correct in stating that the Earth was not the center of the universe. For his troubles, the Roman Catholic Church put Galileo under house arrest for the rest of his life and forbade him to publish.',
    'The four Galilean moons are Ganymede (the largest, even larger than the planet Mercury), followed by Callisto, Io, and Europa. Great ideas for names for a pet or even a racehorse.',
    'Galileo was an Italian professor and his teachings were considered heretical by the Church. Interestingly on the evening of January 7, 1610 when he made his ground shifting observations, both the Moon and Jupiter itself were in the sign of Gemini. The Sun of course was in Capricorn (Jan 7) and almost certainly the rising sign was Leo.',
    'Astrologically Jupiter takes about 12 years to make its journey through the entire 12 signs of the Zodiac. In other words it spends close to a year on average in each sign. Just as we have a famous Saturn return every 28-29 years, we have a “Jupiter return” every 12 years, so when we are 12 ish we have our initial Jupiter return, and then when we are about 24 years of age, 36 years old, 48, 60, 72 etc. The Romans called Jupiter Jove, and the ancient Greeks called Jupiter Zeus.',
  ],
  signs: {
    aries: 'The advantage that Jupiter in Aries conveys is enthusiasm and courage.',
    taurus: 'The advantage that Jupiter in Taurus conveys is patience and calmness.',
    gemini: 'The advantage that Jupiter in Gemini conveys is a combination of versatility and flexibility.',
    cancer: 'The advantage that Jupiter in Cancer conveys is nurturing and sensitivity.',
    leo: 'The advantage that Jupiter in Leo conveys is confidence and creativity.',
    virgo: 'The advantage that Jupiter in Virgo conveys is precision and mindfulness.',
    libra: 'The advantage that Jupiter in Libra conveys is balance and fairness.',
    scorpio: 'The advantage that Jupiter in Scorpio conveys is resilience and renewal.',
    sagittarius: 'The advantage that Jupiter in Sagittarius conveys is discovery and generosity.',
    capricorn: 'The advantage that Jupiter in Capricorn conveys is determination and discipline.',
    aquarius: 'The advantage that Jupiter in Aquarius conveys is individuality and innovation.',
    pisces: 'The advantage that Jupiter in Pisces conveys is empathy and openness.',
  },
  houses: {
    1: 'Jupiter in the 1st brings opportunity through one’s mode of self expression.',
    2: 'Jupiter in the 2nd brings opportunity through resources.',
    3: 'Jupiter in the 3rd brings opportunity through communication and connections.',
    4: 'Jupiter in the 4th house brings opportunity through belonging and roots.',
    5: 'Jupiter in the 5th house brings opportunity through creativity and joy.',
    6: 'Jupiter in the 6th brings opportunity through service and skills.',
    7: 'Jupiter in the 7th brings opportunity through synergy.',
    8: 'Jupiter in the 8th house brings opportunity through investigation and intimacy.',
    9: 'Jupiter in the 9th brings opportunity through adventure and optimism.',
    10: 'Jupiter in the 10th brings opportunity through diligence and drive.',
    11: 'Jupiter in the 11th brings opportunity through vision and allies.',
    12: 'Jupiter in the 12th brings opportunity through intuition and reflection.',
  },
  draft: [],
  source: 'The introduction and the first line for each sign and house by Dawa.',
  reviewed: false,
};

const sun: PlanetContent = {
  body: 'sun',
  slug: 'sun',
  sky: 'sun',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'The Sun is a star, the one at the center of our solar system. It is about 109 times as wide as the Earth and holds more than 99 percent of all the mass in the solar system, so in a real sense everything else here, us included, is a rounding error. Its light takes a little over eight minutes to reach us.',
    'Astrologically the Sun is the heart of the chart: your core identity and the qualities you naturally express. It moves through all twelve signs in a year, spending about a month in each, which is why most people know their Sun sign before anything else in their chart. It is the “ruler” of Leo, the sign of warmth, confidence, and generosity.',
    'Every year, on or near your birthday, the Sun comes back to the exact place it held when you were born. Astrologers call this your solar return, and many treat it as a personal new year. The ancient Greeks called the Sun Helios, and the Romans called it Sol.',
  ],
  signs: {
    aries: 'Aries is the first sign of the zodiac, and is quite literally where things start. Aries is the beginning of spring, when life energy is awakening and stirring. As an Aries one must learn to trust one’s instincts. The thing to learn is how to stay mindful. Mindfulness is our biggest need, because if we can combine our best qualities, our pioneering spirit and our undaunted courage to leap into the unknown, and infuse them with mindfulness and self-awareness, then hopefully we can land on our feet and point a way forward that others might be too cautious to try. This is the way to prevent accidents and other Aries mishaps and missteps.\n\nImpulsive, intuitive, bold, and undaunted by warnings or cautions, Aries needs to charge forward, initiating and leading the charge. Our tribe is the purest embodiment of raw fire: burning bridges and starting anew. Aries is sometimes challenging for others, but for ourselves it means being true to ourselves and boldly carrying forth our own truth, no matter the consequences. And yes, we are known for our impatience. We often don’t stick around long enough to see the fruits of our endeavors, because our cosmic job is to start new things, not necessarily to finish them.\n\nOur exact opposite is the super careful, ever cautious Libra, weighing each choice before acting. Aries embodies the self, the soul’s emergence into the world, while Libra embodies the “us”: shared truth, always considering consequences and the effect our choices have on others. Aries often burns bridges while Libra strives to build and maintain them.',
    taurus: 'Taurus is fixed earth. Taurus needs to embrace her strength, which is steadiness and a sense of presence. Taurean presence is firmly grounded in the here and now. This is the practical spiritual strength, or superpower, of Taurus.\n\nTaurus must have nature. This is an essential nutrient for all members of the Taurean tribe: both the physical world of nature and animals as well. Taurus’ challenge and opportunity is to learn flexibility and the ability to pivot when things invariably change. Taurus can change, but only after careful consideration, and then it is done with full commitment to the new plan. This careful consideration is what relates the Taurus tribe with the Libra tribe, since both tribes are strongly tied to the planet Venus. Venusian energy is primarily about harmony, balance, and gracefulness, and tends to avoid impulsiveness and rash behavior.\n\nTaurus holds on to things, beliefs, values, items. Taurus is the most loyal, reliable, and trustworthy of signs. Taurus tribe members are often set in their ways: when something works we like to stick with it. Predictability and consistency are our core values. Taurus tribe members are often physically strong and hard working. We are often very good at construction, building things, and saving money. Our allies are the other earth signs, Virgo and Capricorn. We also resonate with the other “fixed” modalities: Leo, Scorpio, and Aquarius.',
    gemini: 'Ah, the fleeting immediacy of experience. The poetry of constant motion, entertainment, light, quick, clever. Good with hands and with the gift of gab, the Gemini twins are all about interaction. Talking, joking, storytelling. Changing. Changing a lot. Frequently changing. Constantly changing. Unpredictable, unreliable. Innocent. “What, me worry?” The life of the party. Hard to keep up with.\n\nGemini is air, the realm of thought, constantly noticing things, interacting, and flexible: fun, not too serious, and light-hearted. Did we say changing?',
    cancer: 'Cancer is the embodiment of the mother. The mother is kindness, warmth, caring, and the wetness of feelings, emotions, vulnerability, and protection (defense). Members of the Cancer tribe have the spiritual opportunity to work on learning how to become more objective about things, circumstances, situations, and people. Safety and trust are key words that resonate with Cancer tribe people. Cancers spend more time looking inward than most other tribes. They also prefer to avoid conflict, rather than initiate it.\n\nThe symbolism of crabs is appropriate: they have a hard shell for protection. This is a great metaphor. Avoidance of conflict is important, for Cancers are acutely aware of their vulnerability (crabs and lobsters and other crustaceans tend to be delicious targets to many). Sidestepping or dancing away from conflict or confrontation is the human version of how crabs walk: they go forward mostly by going sideways. Water is their home. Fun fact: a preponderance of this tribe (all genders) avidly seek out and indulge in hot baths and hot springs.\n\nCancer’s opposite is Capricorn, the mountain goat and pragmatist with the fish tail and body. Cancer and Capricorn are a yin and yang duality. Cancer naturally aligns with the other two water signs, Scorpio and especially Pisces, with whom it feels safest and understood. The Cancer tribe is governed by the Moon and will be strongly influenced by the monthly lunar phases and cycles, conjunctions, eclipses, and so on.',
    leo: 'Leo is the outward lion, full of confidence, different talents, self-assuredness, and a big heart. The lion’s blind spot may be acknowledging or looking at one’s own wounds. The Sun’s radiance always shines outward. The lion’s spiritual job is to always keep the heart pure and one’s actions clean. If one does so, then the universe smiles on you. There’s good reason a family or tribe of lions is called a pride.\n\nOpposite Leo is the cool detachment of Aquarius. Cats are amazing at landing on their feet, and Leos often have a popular and seemingly charmed life. Because of their Sun-like gifts, Leos often have an innate understanding of the solar beauty in others.',
    virgo: 'Virgo is the broom, the sweeper away of all that is dirty, dusty, or out of place. Virgo pays close attention to details: to fixing the problem, but first to identify the problem. Careful observation and precision in most things: these are Virgo’s superpowers.\n\nVirgo’s big challenge is learning how to drop their judgments and opinions of others, especially when they see the flaws and shortcomings of others. Virgo’s spiritual opportunity is learning tolerance and humility. Opposite Pisces, the boundary-less fish.',
    libra: 'The tightrope walker, the balancer, the peacemaker, the artist. Children of Venus, muse and source of beauty, elegance, style. Yet often indecisive and insecure: the gift and curse of seeing both sides, weighing, weighing. Sometimes (often) unable to decide, and often spending a lot of time fence sitting. But always charming, considerate, and social.',
    scorpio: 'There is always a deeper meaning, a deeper layer: something underneath, not said, not revealed. Scorpio wants to find out. Scorpio wants to know. Knowing equals power. The undercover agent. The competitor. The comparer.\n\nScorpio and the next sign, Sagittarius, are both explorers, but Scorpio’s explorations tend to be more inward, the realms of human motivation and behavior, while Sagittarius’s explorations tend to be more outward directed, as in literally traveling and having adventures. Scorpio is also the inward expression of the planet Mars, while Aries is the more outward expression of Martian energy. Scorpio also has the added connection with Pluto, the outermost planet of hidden mysteries and a symbol of death and spiritual rebirth.\n\nScorpio can fixate on the mysteries of existence, starting with what makes people tick. Scorpio often cares a lot about intention. Scorpio also deals with the paradox of how and when to hold on and when to let go. Its opposite is Taurus, which is more challenged when it comes to letting go, whereas Scorpio is about transcendence. Taurus is stand your ground and stay in your lane; stay where you are. Scorpio is about letting go. Letting go gracefully, without resentment or worse, is the spiritual letting go. Attachments can make this very difficult indeed.\n\nTaurus is fixed earth and Scorpio is fixed water. Water is the element associated with the sphere of the emotions. Fixed or harnessed water becomes extremely powerful. Scorpio’s shadow side is that when it perceives threats or aggression or unfairness, it can hold on to strong resentment, even to the point of plotting revenge or paybacks. The stinger of the scorpion is always ready to defend itself, and keeps a calculated and cautious, healthy distance between oneself and potentially dangerous adversaries. This distance is good for examining and evaluating but not so great for true intimacy.',
    sagittarius: 'Fun and adventure is the name of the game for the centaur’s tribe. Exploration and open-minded camaraderie are gifts of the galloping horse; optimism and joyful celebration are driving forces guided by a positive outlook. This is the realm of Jupiter, the planet symbolic of expansion. The Sag tribe loves parties and is a gregarious and welcoming group. Sagittarians also enjoy travel and any opportunity to experience something new. Up for fun. Up for learning. Up for trying anything new, for new circumstances add to the rich vein of experiences that the tribe embraces. As might be guessed, Sagittarians are often willing or eager gamblers, using their optimism and willingness to take risks.\n\nThe bow’s arrow travels far and fast, covering ground in an instant. This is not a warrior’s arrow but the symbol of the explorer, adventurer, traveler, or philosopher. The Sagittarian does not appreciate constraints or limits, but needs to learn how to appropriately rein in one’s high spirit when called for, for not all people, circumstances, and events are ready for such high, unfiltered energy.',
    capricorn: 'The goat-fish is one of the least understood signs of the zodiac, yet the Capricorn tribe is often appreciated for their willingness to do the hard jobs that no one else is up for. Determination and pragmatism are hallmarks of this sign, which has the most unusual and awkward combination of symbols in the entire zodiac. The sea-goat is a paradox and a mystery, since goats are not made for swimming and fish are not made for mountain climbing. The result of this mythological hybrid creature is the symbolism for working hard. The front goat half is great at scaling mountains but has to paddle hard to keep afloat, while the fish tail is great for propelling through water but is out of its element when trying to ascend rocky ground. As a result the sea-goat must work extra hard and stay determined to succeed, whether in the mountains of the workplace and career (materialism) or in the watery environment of the emotions and interpersonal relationships.\n\nSaturn, the planet of seriousness, hard work, discipline, and boundaries, is the planet traditionally associated with Capricorn. Capricorn is truly an often misunderstood sign: serious, hard-working, responsible, and ultimately often successful at meeting her goals. One of Capricorn’s life lessons is to learn how to “lighten up” and laugh at oneself. Sometimes you have to stop and smell the roses; life can otherwise seem like an endless struggle of trying too hard to achieve “success”.',
    aquarius: 'The water bearer is often thought to be a water sign, but is actually an air sign (along with the Gemini and Libra tribes). The symbol is the conveyor of water, the necessary element for growing and supporting life, pouring out of a large jug, urn, or originally, a hollowed-out gourd: one of the first tools invented and crafted by early humanity at the dawn of our species. So Aquarius is appropriately associated with technology, as well as the universal gift of giving.\n\nAquarians are often accused of being too heady, somewhat aloof in their views and ideals. Aquarians tend to be big thinkers and proponents of forward or progressive thinking. Uranus is the planet of eccentricity and innovation and has the strongest direct connection with the water bearer. This is the sign that will be underlying and influencing the next two thousand plus years of humanity’s journey. Advanced technology such as AI will rapidly continue to insinuate itself into virtually every aspect of human life, changing everything we now think of as “normal”. Many members of the Aquarian tribe will be leaders, visionaries, and architects of the various revolutions that will be emerging in the years to come.',
    pisces: 'You cannot remove fish from their watery environment and expect them to thrive or even live long; they are basically inseparable from their surroundings. Astrologically the energy of Pisces is similar: there is little or no separation between the environment and its inhabitants. Members of the Pisces tribe are immersed in their environment. The people you interact with, your immediate environment, the vibes: everything merges together, and occasionally perspective and boundaries are blurred or lost entirely. Pisces tribe members tend to embody varying degrees of “flow states” and usually operate by default from a place of intuition or “gut feelings” rather than relying on logic or analytical reasoning.\n\nNeptune is the associated planet of Pisces, and is symbolic of intuitive, non-physical realms of knowing, including what are often called “psychic” phenomena. The highest use of Neptunian energy resonates with the energetic principle that we call “compassion”. The lower vibratory energy of Neptune causes confusion, delusion, and illusion. Beware of negative compulsions that can lead to self-harm, such as alcohol and drug use.',
  },
  houses: {
    1: 'The first house is where you begin. It is where you establish your identity, your sense of a “self”. This is the “I”: your place in the world. It is influenced by the sign on the ascendant (the cusp of the first house).',
    2: 'The second house is what you value. It is your resources; it is what belongs to you. The second house relates you to your world, your environment, to physical reality.',
    3: 'The third house is how you interact with your environment. It is what you notice. It is the people and places and events in your immediate vicinity; it is how you communicate and intersect with your siblings, friends, and acquaintances. The third house is how you are wired, and how you think and express yourself.',
    4: 'The fourth house is your roots. It is your family, your genetic and cultural heritages, and your sense of belonging: feeling a part of something that relates to security and safety.',
    5: 'The fifth house is where you express yourself creatively. It is your area of expertise, your gift, your artistic self. It is how and what you create in this world, including your children (if you have any).',
    6: 'The sixth house is associated with our life’s work in service or helping others. It is where we find ourselves learning life skills, including cooking, nutrition, health, nursing, and even accounting, bookkeeping, organizing, and other ways to assist others.',
    7: 'The seventh house is all about partnerships. It is the “we” counterpoint to the “I” of the first house (the first and seventh houses are opposite each other). It is indicative of our “significant other” and can refer to a marriage or life partner as well as a best friend or even a business partner.',
    8: 'The eighth house is where we explore the emotional waters of relationship (the previous house). This house is a key to how we do transformation, letting go, compromise, and cooperation. The dark side of our relationship with relationships can lead to competition, resentment, envy, and jealousy. Here is where we distill our experiences and hopefully learn how to elevate our consciousness as an outcome of our relationships. This is also a house of mysteries that often leads one into questions and quests (the ninth house).',
    9: 'There’s more to being here than just killing time and taking up space. There are questions to be answered, explorations to be taken, investigations, looking, questioning, seeking. This is the essence of the ninth house: the quest, the journey. This is where we expand ourselves, from the physical (pushing ourselves in sports, yoga, gymnastics, travel, and so on) to philosophy, metaphysics, and spiritual growth.',
    10: 'The tenth house marks the pinnacle of the chart, what is often called the “midheaven”. It is the summit of our social and societal roles. The tenth house governs our careers, our standing or place in our social circles or larger community. Professionals of all kinds, teachers, business people, actors, and others who stand out in a crowd are associated with the tenth house.',
    11: 'The eleventh house is all about looking ahead. It is the future, and our vision or dreams about it. This is the place where dreaming, strategizing, planning, organizing, and mobilizing occur. This is the area of group thinking and collective vision. It is a place of co-creating a better world.',
    12: 'The twelfth house is the “last” house and brings a cycle of unfolding to its conclusion. It is about integrating the experiences of incarnation, and preparation for a new beginning: spiritual rebirth. It is also where we face the challenges of letting go of past or unhealthy patterns and habits: relinquishment and surrender. The twelfth is the realm of the unconscious: the unaddressed, the unacknowledged, the subconscious mind, the realm of dreams.',
  },
  housesNote: 'If your Sun is in a house, that house is strongly emphasized as integral to your core identity. It is how you most deeply manifest your tribe’s energy. Whichever planet or point is in a house, it is expressed through that house’s meaning.',
  source: 'Sign lines by Dawa (The twelve signs, Nov 5) and house lines by Dawa (The Houses, Nov 5).',
  reviewed: false,
};

const moon: PlanetContent = {
  body: 'moon',
  slug: 'moon',
  sky: 'moon',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'The Moon is Earth’s only natural satellite, a little more than a quarter of the Earth’s width and about 239,000 miles away. It always shows us the same face, and its pull is what raises the ocean’s tides.',
    'Astrologically the Moon is your emotional nature: how you respond, what comforts you, and what you reach for when things feel uncertain. It is the fastest mover in the chart, passing through all twelve signs in about 27 days and spending roughly two and a half days in each. It is the “ruler” of Cancer, the sign of home and belonging.',
    'From new Moon to full and back again takes about 29 and a half days, a rhythm people have kept time by for as long as there have been calendars. In July 1969 Apollo 11 put the first people on its surface, and twelve astronauts in all have walked there. The Greeks called the Moon Selene, and the Romans called her Luna.',
  ],
  signs: {
    aries: 'Having the Moon in Aries generally means that a person’s emotional nature can be volatile, spontaneous, independent, and intuitive. Aries moons can be impatient and often anticipate questions and situations. There may be an impulsive aspect to your decision making. Emotions tend to be felt intensely and passionately. Aries moon people often like excitement and are willing to encounter new places, experiences, and situations.',
    taurus: 'The emotional quality associated with the Moon in Taurus is grounded, consistent, steady, calm, and often predictable or reliable. Taurus energy likes comfort and familiarity and is appreciative of good food, nature, and sensory pleasures. People with a Taurus moon are often capable of taking their time making decisions, based on practical considerations rather than immediate gratification. This placement of the Moon also helps people finish tasks, and most Taurus moon people are loyal and dependable. They can be hard working, especially with physical tasks. On the negative side there can be a tendency to be stubborn or resistant to change.',
    gemini: 'Members of the Gemini clan tend to have a lively and curious emotional nature. Gemini moons generally enjoy mental stimulation, exchanging ideas, and communicating with others. Your clanmates are typically open-minded and adaptable, and can enjoy different points of view, often at the same time. Gemini moons like variety and are quick on the draw. Many of your clanmates are very good at expressing feelings through words and connect with others through shared experiences, common interests, and an open-minded curiosity. People with Gemini moons often have many friends, and are often quite chatty.',
    cancer: 'The Moon is most at home in Cancer. Where it is in your chart (your hearth) tells you a lot about your emotional desires and where you seek fulfillment. The Cancer clan is characterized by being naturally nurturing, empathetic, and very sensitive to the vibes of others. People with the Moon in Cancer typically have a strong intuition and an awareness of the intentions of others, as well as the ability to perceive threats or ill will. Cancer seeks safety and protection, often with a strong cherishing of one’s home and personal space. Cancer is often drawn to water, and many Cancer people (tribe and clan) like to swim, take baths, and perhaps visit hot springs.',
    leo: 'People in the Leo clan tend to have a warm, expressive, and dramatic emotional nature. Leo often (unconsciously) craves recognition and appreciation for who they are and what they do. People with a Leo moon are typically emotionally generous, freely giving support, protection, and affection to their friends and loved ones. The Leo clan also has a lot of creativity, particularly in art, dance, theatre, music, and other crafts. Leo moon people often have a strong flair for the dramatic.',
    virgo: 'Virgo clan members share an analytical and practical approach to their emotions and relationships. Virgo is well known for being helpful and of service, as well as paying close attention to the details of daily life. Virgo clanmates often like things to be neat, clean, and orderly. You can be more modest and reserved (cautious) in expressing feelings, and show care through practical or thoughtful gestures and actions. Virgo moon people often desire emotional clarity and predictability, and can sometimes be critical of those who disappoint them or don’t live up to their standards.',
    libra: 'People with the Moon in Libra often have an emotional need for harmony, balance, peace, and connection in their relationships. You are quite good at being diplomatic and always strive to create a harmonious and peaceful environment. Conflict and strife in general are distasteful for the Libra clan. Instead, you are sensitive to the emotional needs of others and strive to comfort others and bring fairness, cooperation, and mutual understanding to relationships, whether romantic or platonic. Many members of the Libra clan struggle with decision making or asserting themselves because they always want to appear fair. Librans are typically quite social and gracious, and are attentive to the needs of others.',
    scorpio: 'The Scorpio clan is full of people who tend to experience their emotions with great intensity, depth, and passion. Scorpio moon people often have a powerful emotional presence and are often highly intuitive, looking at others to get a read on their motivations and “where they are coming from”. Your clan typically really values emotional honesty and sharing. On the other hand, Scorpio moon individuals often keep their own emotions somewhat concealed or private, sensing there is power in the hidden. The Scorpio clan is renowned for its sarcasm and ability to cut through the bull and get to the core of the matter. If your Moon is in Scorpio, find your hearth (the Moon’s house) to find what area of your life is full of buried treasure or emotional triggers. This is also the area of your life that can be transformed through finding the emotional strength to let go of the need for control.',
    sagittarius: 'Your clan is characterized by an adventurous, optimistic, and fun-loving spirit. The Moon in Sagittarius indicates a need for freedom and spontaneity, and a love of exploring new places as well as ideas. Sagittarian moon people tend to be open-minded and enthusiastic, often have a great sense of humor, and really enjoy themselves when the opportunity presents itself. Sagittarian moon people are often gregarious, enjoying social events, sports, travel, studying, and reading.',
    capricorn: 'People in your clan often have a well-developed sense of responsibility and a grounded and practical approach to life and to dealing with their emotions. Your clanmates value stability and like to have predictability and some control over their surroundings. Capricorn moon people operate by evaluating the possible outcomes of situations, interactions, and personal relationships. Capricorns are hard-working, disciplined, and reliable, and are typically quite goal oriented: once they set their sights on something they tend to be quite persistent until they have accomplished their goal.',
    aquarius: 'People with the Moon in Aquarius tend to have an emotionally independent nature. You can also appear unconventional or unusual to mainstream society. Your clan values freedom and fairness: justice for all.\n\nYour clanmates are often drawn to social causes or movements, and there is typically a strong sense of community, with a need for sharing ideals, beliefs, and a common vision. Aquarian moon people are sometimes characterized as “aloof” or detached, but you actually care about humanity more than most signs. Your clan’s identity comes from being part of something bigger. Aquarian energy is emerging faster and faster, and your clan might have insights that resonate with the larger cosmic cycle we know as “the Age of Aquarius”. People of the Aquarius clan can help us understand and navigate this emerging astrological new age.',
    pisces: 'This clan is the most empathetic and sensitive of all moon signs. Pisces moon people are also intuitive and can be quite psychic as well. Pisces moons are less grounded than the other clans, which allows you to travel through intuitive channels. Often your clan shows strong feelings of compassion and a desire to be of service and help to others. The spiritual life and the world of imagination, dreams, and visionary symbolism are richly abundant in many of your clanmates. Pisces moons can have very loose or seemingly nonexistent boundaries, and can become emotionally lost if there are no other grounding influences in the horoscope. Pisces moon clan members may get confused or deceived by others because of their naive and trusting nature.',
  },
  signsNote: 'The Moon is traditionally thought of as the indicator of your emotional (watery) world. It is intuition, visceral (knee jerk) responses, emotions, vulnerability, and relationship dynamics; also family, origins, roots, safety, and comfort.\n\nYour clan is also influenced by your tribe, just as the Moon, as we see it from Earth, reflects the light of the Sun. For example, a person with a Leo Moon and an Aries Sun is very different from a Leo Moon person with a Capricorn Sun.\n\nThe other main thing to keep in mind when exploring your clan is your hearth, the house your Moon is in. It tells what part of your life is most triggered when your emotional buttons are pressed.',
  houses: {
    1: 'The moon here finds ease and comfort in self expression. One spontaneously expresses the qualities of the clan when challenged or threatened.',
    2: 'The moon here reacts to experiences with a strong sense of the clan’s values and resources.',
    3: 'The moon here gives the clan’s sign a platform and voice to express itself. There are usually quick emotional responses and the ability to talk things through. There are typically many triggers in the immediate environment that elicit visceral feelings.',
    4: 'The moon here implies a need for safety, comfort and ease. Usually people with their hearth in the 4th house have strong family or cultural bonds. Tradition, rituals, and predictability are very important.',
    5: 'People with their hearth in the 5th house are warm hearted and generous. Creativity and play are ways they can safely express their emotional landscape.',
    6: 'Feeling useful and of service are important touchstones and guiding principles for people with this hearth position. Consistency and reliability are important values that reinforce emotional stability and safety. There is often a motherly, nurturing and protective quality with this hearth. Health and healing are usually highlighted.',
    7: 'Your emotional world is based on the quality of your relationships. There is a need for bonding and sharing. Inner self worth and value comes from the approval and resonance one has with one’s partner(s).',
    8: 'If your hearth is in the 8th house you have the ability to see through the eyes of others, especially those you have the closest relationships with. There may be a sense of competitiveness. Emotional reactions are often deep and intense and one’s cards are kept close to one’s vest. There is a sense of holding back and there is usually a strong need for privacy and feeling respected.',
    9: 'Here, the moon’s position indicates that one’s self value is tied strongly to having a big picture understanding of things. There is often a wish for more: for travel, new experiences, and exploration of all kinds. Personal growth is a theme here and people with their hearth in this house often enjoy reading and learning. Sports, including hiking, and anything that pushes one further into expanding one’s horizons are often appreciated.',
    10: 'If your moon is in the 10th house there is often an ambition for success and recognition. One may have an inner competitiveness that pushes you towards succeeding at personal goals that you set for yourself. You probably don’t shrink from challenges but take them as opportunities to prove to yourself and others what you are capable of achieving.',
    11: 'People with an 11th house moon have strong principles and beliefs and often lofty or idealistic goals. If your hearth is in the 11th house you probably like to surround yourself with others who share and reinforce your beliefs. You think more in terms of what the future could or should look like. You may be a bit disappointed with how things are in the present because you see the potential that is yet to come.',
    12: 'The moon in the 12th house is deep, private, and often hidden to oneself. There is a strong intuition and active subconscious life that can feel out of place in the “real world”. People with their hearth in the 12th house often have profound and very realistic dreams that may be messages from their unfinished business. There may be unwanted experiences from the past that remain unacknowledged.',
  },
  source: 'Sign lines by Dawa (his summary paragraphs for each sign, Nov 6) and house lines by Dawa (The Moon’s 12 houses).',
  reviewed: false,
};

const mercury: PlanetContent = {
  body: 'mercury',
  slug: 'mercury',
  sky: 'mercury',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'Mercury is the smallest planet in our solar system and the closest to the Sun. It races around the Sun in just 88 days, which may explain its reputation. It is even a little smaller than Ganymede, Jupiter’s largest moon.',
    'Seen from Earth, Mercury never strays far from the Sun, so it shows up only low in the sky just after sunset or just before sunrise. Astrologically it is your communication style and the way your mind engages. It is the “ruler” of two signs, Gemini and Virgo: the quick talker and the careful editor.',
    'Three or four times a year Mercury appears to move backward against the stars for about three weeks. This is Mercury retrograde, famous for crossed wires, lost keys, and delayed emails, and a good time to reread before you hit send. The Romans named the planet for the messenger of the gods, with wings on his sandals; the Greeks called him Hermes.',
  ],
  signs: {
    aries: 'One usually speaks forcefully and often rushes one’s words, speaking before the ideas are even completed. Many times Mercury in Aries interrupts others because they are in a rush to get their ideas out. Mercury in Aries is creative and thinks faster than others and can be impatient and impulsive.',
    taurus: 'This voice is typically calm, measured, thoughtful, steady and patient. There can sometimes be a stubborn quality that hesitates to embrace new thoughts and ideas.',
    gemini: 'This is Mercury’s natural voice: in Gemini Mercury finds its home and is quick witted, clever, and sharp. The mind is fast and moves from one subject to the next, often without finishing the first thought. This sign for Mercury can be easily distracted but is usually good with dexterity, words, music, languages, accents, and games.',
    cancer: 'Mercury in Cancer often speaks by identifying with the emotional needs of others. There is a tone of caring and sympathy and emotional resonance rather than intellectual reasoning. There is also an intuitive, felt communication style.',
    leo: 'Mercury in the Lion’s sign has a flair for the dramatic. Communication is expressive, using the hands and facial expressions as much as the voice. There is often a sense of getting attention and liking the limelight.',
    virgo: 'This is a careful style of communication, focusing on the precise choosing of words to convey the exact intended meaning. This is also a very matter of fact, no nonsense, get to the point style of thinking and communication. There is sometimes a tendency to be judgemental or intolerant of others if they don’t match one’s expectations or standards.',
    libra: 'Mercury in Libra tends to be fair minded and tolerant, and likes to always keep the peace. The shadow side of Libra is its infamous indecisiveness and non committal approach to just about everything. Mercury in Libra can procrastinate because it cannot make up its mind. Choosing one option means rejection of the other and in the mind of Libra and Mercury, that’s a cardinal sin.',
    scorpio: 'When Mercury’s voice is in Scorpio the communication style can be sharp, cutting, and sarcastic. Mercury in Scorpio can also probe deep, asking hard, personal questions in its search to uncover “the truth” by getting to the bottom of things. Scorpio here means questioning things, including the motives and agendas of others.',
    sagittarius: 'Mercury in Sagittarius’s voice is optimistic, fun loving, and free spirited. This voice is often loud and accompanied by plenty of jokes and laughter.',
    capricorn: 'Mercury in Capricorn tends to be practical and oriented towards finding solutions, problem solving, and reaching goals. A bit more serious overall than the fire signs but not necessarily a wet blanket. Just happens to be more focused on results than partying.',
    aquarius: 'If one’s voice is in Aquarius, there tends to be a mind that likes philosophizing and speculation. Mercury in Aquarius enjoys intellectual stimulation, especially pondering “what ifs”, other ideals and dreams. Mercury in Aquarius likes the “big ideas”. Sometimes they seem like they are ready to fly off into another realm. Earth bound reality is a bummer (or at least, boring) for this Mercury.',
    pisces: 'Mercury in Pisces is mentally dreamy, perhaps even a bit ungrounded and lives part of the time in a world of ideals, dreams and fantasy. This is a strongly intuitive pairing, and is good for poets, song writers, and artists, depending on what house it is in. Mercury in Pisces also is able to mimic or reflect the speaking style and content of those who they are interacting with.',
  },
  houses: {
    1: 'In the 1st house Mercury’s voice is geared strongly towards self expression as related to “I, me, mine” and there is a tendency to think about things strictly in terms of how they affect “me”. One often communicates or dresses in a very unique and individualistic way. The style of this expression is dependent on the voice, the sign Mercury is in.',
    2: 'One’s voice in this house indicates that one’s ability to communicate is a strong personal attribute. Here one tends to think in terms of his or her resources and values and how things can be used to further one’s security.',
    3: 'Mercury’s voice feels very at home in the 3rd house. Here Mercury is all about communication, expressing oneself as directly and completely as possible. The sign or “voice” of Mercury will influence the style of one’s communication. There is a lot of attention and interaction with one’s surroundings, people, and environment.',
    4: 'Mercury’s voice in the 4th house turns the mind to matters of security, and protection of one’s personal space and territory. There can be a sort of defensive stance and a perception of one’s vulnerability in general. This is also associated with a warm, protective and nurturing attitude towards one’s family and loved ones.',
    5: 'Here one’s voice is confident, creative, and warm. There is often a dramatic flair to how one expresses oneself and one typically enjoys being the focus of attention. Mercury in this house is often good at story telling and jokes.',
    6: 'Mercury’s voice here is geared towards being helpful and supportive of others. There is often an interest in training or participating in some skill or vocation. There is also a tendency to pay attention to details and fine work.',
    7: 'Mercury’s voice here is attuned to one’s partner. There is a strong focus on interaction, be it verbal or otherwise. One notices closely what their partner is doing or saying and there is a strong interest in shared experiences.',
    8: 'Mercury’s voice in the 8th house often takes a behind the scenes role. There is a strong curiosity with this placement and a questioning of the motives and activities of one’s partners and associates. The voice may be sarcastic and may work out of a sense of competitiveness or envy. There is typically interest or curiosity in so-called “hidden” things including the occult, sexuality, and power struggles between people.',
    9: 'Mercury’s voice in the 9th is interested in learning and improving one’s knowledge, experience, and wisdom. There may be an interest in philosophy or religion or pursuing higher education and degrees. This is traditionally considered an optimistic and hopeful placement for Mercury.',
    10: 'Mercury’s voice in the 10th house is concerned with success, achievement, and one’s role in community or society. When Mercury is in this house there is often a sense of duty or ambition, and one takes responsibilities and jobs seriously. This is a good placement for people with positions of leadership and authority.',
    11: 'Mercury’s voice in the 11th house finds one speaking for groups. There is an affinity for sharing ideas and mapping out strategies and plans for the future. Mercury in the 11th is good at thinking grandly, with interesting ideas and beliefs that may not be quite “mainstream”.',
    12: 'Mercury’s voice in the 12th house is often muted: one keeps a lot of one’s inner dialog under wraps and not spoken out loud. There is a sense of the importance of one’s privacy and protecting one’s personal inner space. Sometimes one feels isolated or separated from others. Dreams are often quite vivid and meaningful when Mercury is in this house.',
  },
  source: 'Sign and house lines by Dawa.',
  reviewed: false,
};

const venus: PlanetContent = {
  body: 'venus',
  slug: 'venus',
  sky: 'venus',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'Venus is the brightest planet in our sky, bright enough to stand out just after sunset or just before sunrise, which is why it has long been called the evening star and the morning star. It is close to the Earth in size, but its thick clouds trap so much heat that it is the hottest planet in the solar system, hotter even than Mercury.',
    'It is also the odd one out. Venus spins backward compared with most of the planets, and so slowly that its day is longer than its year.',
    'Astrologically Venus is what you are attracted to and where you find beauty. It is the “ruler” of Taurus, with its love of comfort and the senses, and of Libra, with its love of harmony and fairness. Every eight years Venus comes back to nearly the same place in our sky, tracing a five-petaled pattern that stargazers have admired for centuries. The Romans named it for their goddess of love; the Greeks called her Aphrodite.',
  ],
  signs: {
    aries: 'Venus in Aries resonates with speed, impulse and immediacy. There is an affinity with pioneering energy, newness and boldness. This is the classic act first, think later. With romance this might lead to impulsive or sudden flashes of passion and “love at first sight”. This sign connects with adrenalin producing activities: think extreme rock climbing, parachuting, and downhill ski racing. Plays with fire, literally and figuratively.',
    taurus: 'Here Venus likes it slow, steady and reliable. There is a strong love and affinity for nature and all things natural. Gardening and landscaping and definitely pets. Resonates with animals in general. Loyal and consistent are key values. Prefers safety to whiplash. Comfort, good food (quality and quantity), and nice things, such as home furnishings and cars, matter.',
    gemini: 'The resonance created here by Venus in Gemini is playful, a bit of a trickster. Big into the spoken or written word. Games, communication, tricks and puns are fun and compelling. This isn’t about depth or seriousness: Venus in Gemini resonates with diversity and juggling. Keep it moving and keep it interesting is Venus in Gemini’s motto.',
    cancer: 'Venus in Cancer resonates with anything associated with the home, water, comfort, children, and nostalgia. Hot baths are a frequent must, with or without bath salts and a candle. Venus in Cancer also resonates with cooking (and eating).',
    leo: 'Venus in Leo resonates with creativity. You are probably into the arts, acting, and putting on a good show. Can be a drama prince or princess, or a drama king or queen. Can be very supportive and loving, and good with kids.',
    virgo: 'Venus in Virgo resonates with quality and details. There is definitely a resonance with noticing when things are not up to one’s standards. There are finely tuned values and beliefs. Sometimes a bit rigid and uncompromising. Generally good with detailed work such as sewing, crafts, musical or artistic techniques and anything that requires mindfulness and careful attention. Diet, nutrition, and health in general are other points of resonance. Often good with numbers, balancing checkbooks, and accounting. Can be a bit OCD. Does not resonate well with chaos, messiness, invasiveness.',
    libra: 'Here Venus resonates with fairness and balance. Venus in Libra resonates with cautiousness, never rushing or impulsive when it comes to decision making time. Venus in Libra loves art of all kinds and has a deep need for balance and beauty. A resonance with music, good taste, symmetry. Does not resonate with pressure, stress, or aggression.',
    scorpio: 'Venus in Scorpio resonates with mystery. This combination likes to dig into things, and get to the bottom of stuff. Resonates with juicy gossip, who gets the upper hand, and what motivates people to do what they do. Usually has a strong resonance with the occult, anything hidden, and sexuality. Conspiracy theories are intriguing and believable.',
    sagittarius: 'Here Venus resonates with adventure, adrenalin, philosophy or religious spirituality, and for many, sports (as a participant more than just as a spectator). There is a resonance with travel and anything that adds to one’s resume of life experiences. Venus in Sagittarius might like to try bungee jumping or going up in a hot air balloon. Often pursues higher education and learning.',
    capricorn: 'Venus in Capricorn resonates with goals and their pursuit. There is often a resonance with anything that requires hard work, discipline, and responsibility (and accountability). Resonates with being practical. Does not resonate with risk taking and gambling.',
    aquarius: 'Venus in Aquarius resonates with the future. There is a resonance with thinking beyond the norms. This combination of planet and sign is eccentric and freedom loving. There is a resonance with others who share similar beliefs and goals. Often a resonance with political or social movements that are aligned with lofty and altruistic values.',
    pisces: 'Venus in Pisces resonates with dreams, grandiose wishes, and extreme sensitivity. Often resonates with those around oneself, taking on the energy of others. Also often resonates with alcohol and/or drugs. Venus in Pisces has an empathy and compassion that can be dreamy and boundless.',
  },
  houses: {
    1: 'Venus in the 1st house indicates value in self-expression. The presence of Venus here signifies an attention on presenting oneself in a way that reflects the positive qualities of its sign. One values or is attracted to being fair, graceful, and mindful in one’s appearance and demeanor. There is usually a strong physical attractiveness or magnetism when Venus is in the first house at birth.',
    2: 'Here Venus attracts or is attracted to accumulating resources: personal inner resources as well as “outer” things such as material possessions, money, etc. Here Venus attracts whatever the sign it is in signifies as a resource or attribute. Venus in the 2nd is attracted to stability and practicality.',
    3: 'Venus in the 3rd house usually signifies a person who values knowledge and skills. There is an attraction to communication, words, games: in short, interaction of all sorts. There is a strong curiosity and people with their Venus in the 3rd tend to be omnivorous; they easily learn a bit about many different subjects. The attraction is towards many unrelated things.',
    4: 'Here Venus is attracted to the home, parents, tradition, and culture. Venus in the 4th wants to feel safe and grounded, and for many people there is reassurance in having a strong relationship with one’s family and roots.',
    5: 'Venus in the 5th is attracted to art, music, acting, and anything that involves bringing out one’s inner gifts of creativity and inventiveness. When Venus is in this house one’s flair and knack for drama are usually not too far away. There is also a magnetic and confident quality that is often very willing to help others, including children, to grow or reach their potential or develop their talents.',
    6: 'Here Venus is drawn towards professions or activities that serve others. There is often an attraction to healing arts, nutrition, and health in general. Often too there is a knack for domestic activities such as cooking, organizing, numbers, gardening, and other things that require attention and mindfulness. There is a natural attraction towards cleanliness and orderliness and organization.',
    7: 'Venus in the 7th indicates attraction towards relationship, particularly getting close with someone and bonding. Marriage or some form of committed relationship is important when Venus is in the 7th. The attraction is for sharing, rather than doing things solo. One is attracted to another because it creates a larger sense of “wholeness”.',
    8: 'Venus in the 8th is attracted to all things that are deep and hidden. There’s real drama between people and Venus in the 8th likes to get involved in the drama, no shyness there. There is often an attraction to many of the mysteries of existence, which can range from the occult, UFOs, sexuality, and spirituality to conspiracies galore.',
    9: 'Venus in the 9th house is attracted to adventure, taking chances, exploration, travel, and growth. The 9th house is associated with fun and sports on one hand and philosophy and religion on the other, both forms of expansion: Venus is attracted to sports for the body and philosophy for the mind.',
    10: 'Venus in the 10th is attracted to your accomplishments in the world. The attraction here means setting goals and working hard to get there from here. The attraction is for discipline, a strong work ethic, having goals, and staying focused and motivated. There is often an interest or attraction in leadership and status.',
    11: 'Venus in the 11th is attracted to shared hopes and dreams. This is the house of vision, and when Venus is in this house one focuses on future ideals, dreams, and beliefs. The 11th house is where we have ideals and idealism and believe they are achievable: it’s where we stand up for what is possible, not what is practical, but what could make a better, brighter future. Venus here is also attracted to finding others, partners and teammates, who share one’s beliefs and values so there can be a synergy that supports us in working to make those dreams reality.',
    12: 'Venus in the 12th house is attracted to finishing unfinished business. This is the realm of the unconscious, where unresolved issues and karma want to bubble up from wherever they are locked up. Venus in the 12th is drawn into situations of isolation or solitude, even in the midst of others. Dreams, deep meditative states, and buried karmic patterns live in the 12th and Venus can allow us to make friends with these patterns and states of mind. There is usually some sort of spiritual attraction when Venus is found in this house, or we find ourselves drawn to self-help or psychological guidance.',
  },
  source: 'Sign and house lines by Dawa.',
  reviewed: false,
};

const mars: PlanetContent = {
  body: 'mars',
  slug: 'mars',
  sky: 'mars',
  aspect: 'aspect-square',
  intro: [
    'Mars reveals how we express our inner energies. Our inner warrior shows our strength, courage, boldness, and initiative. Mars gives us tools and energy to accomplish our wishes. Its sign shows the style of our activity. The house it’s in shows where our Mars is most likely to be triggered, employed, and expressed.',
  ],
  draft: [
    'Mars is the fourth planet from the Sun, about half as wide as the Earth. Its red is rust: iron in its dust and rocks. It has the tallest volcano in the solar system, Olympus Mons, about two and a half times the height of Mount Everest, and two small moons, Phobos and Deimos, whose names mean fear and dread.',
    'Mars takes nearly two years to go around the Sun, so it spends about two months in each sign, and longer when it turns retrograde, which it does about every two years. It is the “ruler” of Aries, the sign of beginnings and courage. The Romans named it for their god of war; the Greeks called him Ares.',
  ],
  signs: {
    aries: 'This is the natural place for Mars, and here the warrior doesn’t hold back. There is power, conviction, and boldness here. The warrior in Aries isn’t shy or hesitant. Mars in Aries may also jump to conclusions: no time to waste.',
    taurus: 'The inner warrior in Taurus has a stronger and quieter approach to warriorship, but is persistent and has the strength of outlasting opponents. Mars in Taurus is steady, consistent, and a reliable ally.',
    gemini: 'The inner warrior in Gemini uses words and speed as energetic forces. This warrior is quick and unpredictable. A trickster.',
    cancer: 'The inner warrior in Cancer understands emotional vulnerability and sensitivity. The battle element here is water (feelings) and Mars in Cancer will withdraw or go into defense mode when threatened or attacked. There is well constructed armor on this warrior: the crab’s shell can take many forms.',
    leo: 'The inner warrior in Leo is proud and a bit flashy. Mars expresses Leo energy creatively, and channels its energy into art, music and other forms of self expression. The warrior in Leo prefers to charm than fight, winning with magnetism, charisma, and confidence.',
    virgo: 'The inner warrior in Virgo is precise, particular, and decisive. There is an accuracy to one’s actions and direction: one is strongly opinionated and has clear boundaries that must be respected and obeyed.',
    libra: 'The inner warrior in Libra acts out of fairness and justice. In Libra, Mars can be indecisive and hesitant to act. Traditionally this is considered an awkward and poor place for Mars’ activities, but the benefit of Mars in Libra is a gift and an appreciation for art, aesthetics, beauty, and balance. Mars in Libra allows the inner warrior to be a surprisingly good diplomat.',
    scorpio: 'The inner warrior in Scorpio waits for the right opportunity to act. Mars in Scorpio often acts in a way that can catch others off guard. Things surface when the time is right and Mars in Scorpio will strike with a keen sense of the vulnerability of others. Mars in Scorpio is good for professions that require strength or power, such as police and military, and fields such as doctoring (surgery in particular is associated with this inner warrior combination) and detective work. Mars in Scorpio keeps an eye on others, often with a sense of curiosity or suspicion.',
    sagittarius: 'The inner warrior in Sagittarius is expressed through an open minded and adventurous personality. Mars in Sagittarius likes to explore and expand one’s horizons. This is generally an optimistic, fun loving energy that typically loves travel, sports, speed, and daring. In some people this energy can be turned towards reading, studying, and pursuing religion, law or philosophy and towards understanding the bigger picture.',
    capricorn: 'The inner warrior in Capricorn turns one’s energy towards accomplishing goals. This is a combination with a strong work ethic, quiet determination, and a strong sense of responsibility.',
    aquarius: 'Mars in Aquarius is geared towards accomplishing things in a manner that may be unconventional or unexpected. There is a strong protection over one’s ideals and values and this warrior often puts a lot of energy into proving one’s point or convincing others of their stance and beliefs. This is an energy that faces the future and is willing to put energy into helping create a new and better world.',
    pisces: 'Mars in Pisces sometimes finds itself lost or confused. The energy of Mars in watery, intuitive Pisces is best channeled through compassion and empathy rather than through outward action. The other aspect of Mars in Pisces is energy directed through artistic directions, such as music and making art. Mars in Pisces is intuitive energy that is centered around feeling. This is a good combination for spiritual work, especially when centered on kindness, compassion, and selfless service.',
  },
  houses: {
    1: 'Mars in the first indicates there is energy for self expression. One is typically dynamic and strong in one’s personality and in one’s appearance there is either confidence, arrogance, bravado, or impulsiveness, depending on the sign (type of warrior) and any key aspects to other planets.',
    2: 'Mars in the 2nd house expresses a more earth based or grounded expression of its energies. There is often energy expended in the acquisition or enjoyment of one’s toys and other resources. One is protective of what you already have and on the lookout for new things to possess.',
    3: 'Mars in the 3rd house is usually interactive, communicative, and inquisitive. There is an interest in learning new skills, tricks, language, and other diverse interests. Mars in the 3rd is often curious and restless.',
    4: 'Mars in the 4th is more home based. The Mars warrior in this house is more of a guardian and protector and defender of one’s territory, culture, and traditions. Swimming and water based sports and activities are often enjoyed.',
    5: 'When Mars is located in the 5th house there is usually a strong talent in one or more of the arts: music, drawing or painting, sculpture, or other creative endeavors, depending on what sign it is in. This is also a good house for working with kids.',
    6: 'In this house Mars often shows a strong interest in medicine, health in general, and sports. Physical therapy, nursing, yoga, tai chi, gymnastics and other physical or body-centric activities are often strong interests.',
    7: 'This is the house of partnership and Mars in this house usually indicates a strong participatory and active relationship with a significant partner. The nature of the partnership is indicated by the sign (style of inner warrior) of Mars in this house. Sports and other activities that require the team work of two (sometimes more) people working together is how Mars likes to express its energy in this house.',
    8: 'Mars in this house often exhibits a competitive or judgemental nature. There is also often a need for joining with a partner to work behind the scenes towards some goal or purpose. Mars in the 8th can have deep entanglements legally, sexually, or in terms of power dynamics.',
    9: 'Mars in the 9th house is often involved in sports, athletics generally, travel, exploration, and for some, reading, studying, higher education, and the pursuit of degrees in law or philosophy or religion and spirituality. Mars in the 9th tends to be adventurous, fun loving, and willing to take risks to discover new thrills.',
    10: 'When Mars is in the 10th house in a birth chart, that person is often focused on career or other achievements. Mars in this house wants to excel and reap the rewards of “success”, both monetarily but also in terms of gaining recognition and approval in their field or community.',
    11: 'Mars in the 11th house puts energy into group endeavors, especially those involved in some idealistic dream or goal. The 11th house is often interested in politics or other types of social goals and movements that have the potential to create a better future for society, the environment, and the world.',
    12: 'Mars in this house is often hidden and behind the scenes. This is a place where one’s energy is directed inward and expresses the subconscious or spiritual from a place of solitude or introspection. You might find that your impulses are sabotaged or blocked by seemingly karmic forces.',
  },
  source: 'Sign and house lines and the first paragraph of the introduction by Dawa.',
  reviewed: false,
};

const saturn: PlanetContent = {
  body: 'saturn',
  slug: 'saturn',
  sky: 'saturn',
  aspect: 'aspect-[2/1]',
  intro: [],
  draft: [
    'Saturn is the second largest planet in our solar system and the farthest one you can easily see without a telescope. Its rings are made mostly of ice, in pieces from specks of dust to chunks the size of a house. The main rings stretch about 175,000 miles across yet in most places are only about 30 feet thick. Saturn is so light for its size that it would float, given a big enough bathtub.',
    'Saturn takes about 29 and a half years to go around the Sun, spending about two and a half years in each sign. The famous Saturn return comes near ages 29 and 58, when Saturn arrives back where it was at your birth, and it often brings a reckoning with what you have built and what you are ready to take responsibility for. It is the “ruler” of Capricorn, the sign of structure and patience.',
    'Saturn has more moons than any other planet, hundreds at last count. The largest, Titan, is bigger than Mercury and has lakes of liquid methane. The Romans named Saturn for their god of farming and time, honored every December at the festival of Saturnalia; the Greeks called him Kronos.',
  ],
  signs: {
    aries: 'The challenge of Saturn in Aries is impatience and impulsiveness.',
    taurus: 'The challenge of Saturn in Taurus is inertia and stubbornness.',
    gemini: 'The challenge of Saturn in Gemini is distraction.',
    cancer: 'The challenge of Saturn in Cancer is sensitivity and vulnerability.',
    leo: 'The challenge of Saturn in Leo is overconfidence and pride.',
    virgo: 'The challenge of Saturn in Virgo is perfectionism and rigidity.',
    libra: 'The challenge of Saturn in Libra is indecisiveness.',
    scorpio: 'The challenge of Saturn in Scorpio is control and obsession.',
    sagittarius: 'The challenge of Saturn in Sagittarius is restlessness.',
    capricorn: 'The challenge of Saturn in Capricorn is seriousness and inflexibility.',
    aquarius: 'The challenge of Saturn in Aquarius is detachment.',
    pisces: 'The challenge of Saturn in Pisces is boundaries.',
  },
  houses: {
    1: 'The lesson Saturn in the 1st house reveals is self acceptance and self image.',
    2: 'The lesson Saturn in the 2nd house teaches is resourcefulness and sufficiency.',
    3: 'The lesson Saturn in the 3rd house teaches is clarity and discernment.',
    4: 'The lesson Saturn in the 4th house teaches is attachment and emotional growth.',
    5: 'The lesson Saturn in the 5th house teaches is creative expression.',
    6: 'The lesson Saturn in the 6th house teaches is judgement.',
    7: 'The lesson Saturn in the 7th house teaches is commitment and compromise.',
    8: 'The lesson Saturn in the 8th house teaches is trust and surrender.',
    9: 'The lesson Saturn in the 9th house teaches is moderation.',
    10: 'The lesson Saturn in the 10th house teaches is persistence.',
    11: 'The lesson Saturn in the 11th house teaches is cooperation and grounding.',
    12: 'The lesson Saturn in the 12th house teaches is integration.',
  },
  source: 'The first line for each sign and house by Dawa.',
  reviewed: false,
};

const uranus: PlanetContent = {
  body: 'uranus',
  slug: 'uranus',
  sky: 'uranus',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'Uranus was the first planet discovered with a telescope, by William Herschel in 1781. Until then everyone assumed the planets ended at Saturn. It is an ice giant, about four times as wide as the Earth, and its blue green color comes from methane in its atmosphere.',
    'Uranus is tipped on its side, so it rolls around the Sun like a ball rather than spinning like a top. Each of its poles gets about 42 years of sunlight followed by 42 years of darkness. Only one spacecraft has ever visited: Voyager 2, in 1986.',
    'Uranus takes about 84 years to go around the Sun and spends about seven years in each sign, so everyone born within a few years of you shares its sign: it marks your generation’s leap. It is the “ruler” of Aquarius, the sign of invention and the unexpected. The planet is named for Ouranos, the Greek god of the sky.',
  ],
  signs: {
    aries: 'The Uranus in Aries generation initiates an entire new 84 year cycle.',
    taurus: 'The Uranus in Taurus generation: a leap in how we relate to the natural world.',
    gemini: 'The Uranus in Gemini generation: a leap in communication, media, and information.',
    cancer: 'The Uranus in Cancer generation: a leap in traditional home values.',
    leo: 'The Uranus in Leo generation: a leap in self-actualization and creativity.',
    virgo: 'The Uranus in Virgo generation: a leap in health, nutrition, healing, and technology.',
    libra: 'The Uranus in Libra generation: a leap in gender roles and equality.',
    scorpio: 'The Uranus in Scorpio generation: a leap in drug use and sexuality, and in skepticism.',
    sagittarius: 'The Uranus in Sagittarius generation: a leap in risk taking, extreme sports, and play.',
    capricorn: 'The Uranus in Capricorn generation: a leap in corporate and societal traditions.',
    aquarius: 'The Uranus in Aquarius generation: a leap in tech and networking.',
    pisces: 'The Uranus in Pisces generation: a leap in dissolving old boundaries; the loss of traditional identities and roles.',
  },
  houses: {
    1: 'Uranus in the 1st is your frontier of creating a new identity.',
    2: 'Uranus in the 2nd is your frontier with resources.',
    3: 'Uranus in the 3rd is your frontier of how you uniquely communicate and interact.',
    4: 'Uranus in the 4th is the frontier where you question and challenge your roots.',
    5: 'Uranus in the 5th is the frontier where you create newness.',
    6: 'Uranus in the 6th is the frontier of your unique contribution to helping others.',
    7: 'Uranus in the 7th is your frontier of how you do relationships on your own terms.',
    8: 'Uranus in the 8th is the frontier where you relate to others from a place of independence.',
    9: 'Uranus in the 9th is the frontier where you develop your own unique understanding and philosophy of life.',
    10: 'Uranus in the 10th is the frontier where you fit into society and your community.',
    11: 'Uranus in the 11th is the frontier where you dream the future into being.',
    12: 'Uranus in the 12th is the subconscious frontier where you follow your dreams and pursue your path.',
  },
  source: 'Sign and house lines by Dawa (Uranus in Signs and Houses, Oct 6).',
  reviewed: false,
};

const neptune: PlanetContent = {
  body: 'neptune',
  slug: 'neptune',
  sky: 'neptune',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'Neptune was the first planet found by mathematics before anyone saw it. Astronomers noticed Uranus drifting from its expected path and worked out where an unseen planet had to be, and in 1846 Johann Galle found Neptune almost exactly where Urbain Le Verrier said it would be.',
    'It is the farthest planet from the Sun, a deep blue world with the fastest winds in the solar system, more than 1,200 miles an hour. Voyager 2 flew past in 1989, the only spacecraft to visit.',
    'Neptune takes about 165 years to go around the Sun, so it finished its first full orbit since its discovery only in 2011. It spends about fourteen years in each sign, which makes its sign your generation’s collective spirit. It is the “ruler” of Pisces, the sign of dreams and compassion. The Romans named it for their god of the sea; the Greeks called him Poseidon.',
  ],
  signs: {
    aries: 'Neptune in Aries brings bold initiatives.',
    taurus: 'Neptune in Taurus brings enduring truth.',
    gemini: 'Neptune in Gemini brings diverse narratives.',
    cancer: 'Neptune in Cancer brings connectedness.',
    leo: 'Neptune in Leo brings confident creativity.',
    virgo: 'Neptune in Virgo brings selfless service.',
    libra: 'Neptune in Libra brings fairness, peace, and beauty.',
    scorpio: 'Neptune in Scorpio brings depth and honesty.',
    sagittarius: 'Neptune in Sagittarius brings freedom and exploration.',
    capricorn: 'Neptune in Capricorn brings practical solutions.',
    aquarius: 'Neptune in Aquarius brings universal values.',
    pisces: 'Neptune in Pisces brings universal empathy.',
  },
  houses: {
    1: 'Neptune in the 1st opens self image.',
    2: 'Neptune in the 2nd loosens grasping.',
    3: 'Neptune in the 3rd opens communication.',
    4: 'Neptune in the 4th broadens roots.',
    5: 'Neptune in the 5th channels creativity.',
    6: 'Neptune in the 6th channels service.',
    7: 'Neptune in the 7th softens boundaries around relationship.',
    8: 'Neptune in the 8th blurs relationship dynamics.',
    9: 'Neptune in the 9th expands horizons.',
    10: 'Neptune in the 10th elevates calling.',
    11: 'Neptune in the 11th inspires vision.',
    12: 'Neptune in the 12th thins veils.',
  },
  source: 'The first line for each sign and house by Dawa.',
  reviewed: false,
};

const pluto: PlanetContent = {
  body: 'pluto',
  slug: 'pluto',
  sky: 'pluto',
  aspect: 'aspect-square',
  intro: [],
  draft: [
    'Pluto was discovered in 1930 by Clyde Tombaugh, a 24-year-old astronomer at Lowell Observatory in Arizona. Its name was suggested by Venetia Burney, an eleven-year-old schoolgirl in England. In 2006 astronomers reclassified it as a dwarf planet; astrologers, for the most part, never stopped counting it.',
    'In July 2015 the New Horizons spacecraft flew past and found mountains of water ice and a great pale plain shaped like a heart.',
    'Pluto takes about 248 years to go around the Sun. Its orbit is so stretched that it spends anywhere from about twelve to more than thirty years in a sign, so its sign marks a whole generation’s evolution. It is the “ruler” of Scorpio, the sign of depth and renewal. The Romans named it for their god of the underworld; the Greeks called him Hades.',
  ],
  signs: {
    leo: 'The Pluto in Leo generation: transformation through creative self expression.',
    virgo: 'The Pluto in Virgo generation: transformation through boundaries.',
    libra: 'The Pluto in Libra generation: transformation through consideration.',
    scorpio: 'The Pluto in Scorpio generation: transformation through radical honesty.',
    sagittarius: 'The Pluto in Sagittarius generation: transformation through expanding vistas.',
    capricorn: 'The Pluto in Capricorn generation: transformation through discipline.',
    aquarius: 'The Pluto in Aquarius generation: transformation through technology.',
    pisces: 'The Pluto in Pisces generation: transformation through transcendental love.',
  },
  houses: {
    1: 'Pluto in the 1st house: rebirth through reinventing the self.',
    2: 'Pluto in the 2nd house: rebirth through values and resources.',
    3: 'Pluto in the 3rd: rebirth through new experiences.',
    4: 'Pluto in the 4th: rebirth through leaving home.',
    5: 'Pluto in the 5th: reinvention of creative endeavors.',
    6: 'Pluto in the 6th: rebirth through sacrifice and service.',
    7: 'Pluto in the 7th: rebirth through new relationships.',
    8: 'Pluto in the 8th: rebirth through intense experience.',
    9: 'Pluto in the 9th: embracing new beliefs.',
    10: 'Pluto in the 10th: new or deeper careers.',
    11: 'Pluto in the 11th: joining new groups and shared beliefs.',
    12: 'Pluto in the 12th: rebirth through processing unconscious patterns.',
  },
  source: 'The first line for Leo to Pisces and for each house by Dawa.',
  reviewed: false,
};

// The Galactic Center (3x, Nov 6): a point, not a planet, at about 27 degrees Sagittarius for everyone,
// so it has one key, its house, and no lines for the signs. Dawa's introduction and house lines from
// "Galactic Heart Point" (Drive, April 25, 2025), the newer of his two versions (the other is "Galactic
// Center Point", April 8, 2025; the house lines match), fitted to the copy rules; his "GH" is written
// out as the Galactic Center, the name the site uses.
const galacticCenter: PlanetContent = {
  body: 'galacticCenter',
  slug: 'galactic-center',
  sky: 'galacticCenter',
  aspect: 'aspect-square',
  intro: [
    'The precise center, or heart, of our galaxy is located at 27 degrees Sagittarius. This is the actual rotational center of the Milky Way galaxy, which our solar system revolves around.',
    'Our solar system (the Sun, the planets and their moons, the asteroid belt, and various other objects) takes approximately 225 to 250 million years to go once around this vast spinning island of stars called our galaxy. This trip by our solar system around the galaxy is known as a galactic year.',
    'This heart center point directs us to the ultimate source of the Milky Way’s cosmic energy, representing inspiration, transformation, spiritual insights, and higher consciousness, as well as direct insight into the universe’s mysteries.',
    'It could be called the Godhead. The heart of the galaxy. The galactic third eye (wisdom). Whatever it is, when you find the location of 27 degrees Sagittarius in your horoscope, that house indicates a genuine opportunity for true cosmic energy or wisdom to flow through you.',
    'This is a “blessing” energy: whichever house 27 degrees Sagittarius falls in is in some way blessed by this point. Planets near the Galactic Center can indicate a person with a strong sense of intuition and a drive to seek deeper spiritual truths, and can lead to a unique perspective on personal growth and collective evolution. Generally things flow and manifest well in that house.',
    'In some natal charts the location of the Galactic Center by house may manifest as an urge to contribute to something greater than oneself, and can inspire individuals to explore philosophical or spiritual paths in a quest for truth.',
    'The center of our home galaxy may point us in the direction where the secrets of the universe lie. This is the source of all, the cosmic furnace, the source of love. It is also the point in our horoscope that aligns with this energy, and is represented as the third eye of wisdom and divine inspiration.',
  ],
  draft: [],
  signs: {},
  houses: {
    1: 'The Galactic Center in the 1st house: your appearance reflects cosmic consciousness. Looks matter.',
    2: 'The Galactic Center in the 2nd house: your connection with the natural and material world needs to be in harmony with the greater good. Saving the environment, protecting nature, and using your resources (money and so on) are a positive focus for you.',
    3: 'The Galactic Center in the 3rd house: your gift of communication is important. Writing, translating, poetry, and other art forms are all ways you can channel messages of divine love and wisdom.',
    4: 'The Galactic Center in the 4th house: your family and home of origin are important contributors to your sense of “place” in the cosmos.',
    5: 'The Galactic Center in the 5th house: you can channel cosmic and divine inspiration through art, creativity, and love.',
    6: 'The Galactic Center in the 6th house: cleaning, nursing, and helping others are all ways to be in service to the divine. Karma yoga.',
    7: 'The Galactic Center in the 7th house: relationships can be a doorway to the sacred. Honor your partner.',
    8: 'The Galactic Center in the 8th house: intimacy and sharing are gateways to the universal energy. Meditation on death, rebirth, sexual energy, and relationship are all keys to wisdom.',
    9: 'The Galactic Center in the 9th house: a thirst or hunger for truth and wisdom. Travel might be irresistible.',
    10: 'The Galactic Center in the 10th house: your career, your role within your community, your status and standing are all important ways for you to “channel” the universal wisdom and message for humanity.',
    11: 'The Galactic Center in the 11th house: you can help support and foster the universal messages for humanity by working with existing organizations or groups.',
    12: 'The Galactic Center in the 12th house: deep messages of divine inspiration, help, and wisdom are buried deep within your subconscious or universal mind. Dreams and meditation can help unlock important messages.',
  },
  source: 'Introduction and house lines by Dawa (Galactic Heart Point).',
  reviewed: false,
};

// Chiron and the Nodes (Nov 6): every word drafted in Dawa's voice (content/planet-drafts.ts).
const drafted = (body: BodyId, slug: string): PlanetContent => ({
  body,
  slug,
  intro: [],
  draft: PLANET_DRAFTS[body]?.intro ?? [],
  signs: {},
  houses: {},
  source: '',
  reviewed: false,
});
const northNode = drafted('northNode', 'north-node');
const southNode = drafted('southNode', 'south-node');
const chiron = drafted('chiron', 'chiron');

/** Dawa's line, then the line drafted for him; or the draft alone where he has none. */
const joined = (his: string | undefined, ours: string | undefined) => (his && ours ? `${his}\n\n${ours}` : (his ?? ours));

/** A planet with its drafted lines (content/planet-drafts.ts) merged into its signs and houses. */
function withDrafts(planet: PlanetContent): PlanetContent {
  const drafts = PLANET_DRAFTS[planet.body];
  if (!drafts) return planet;
  const signs: Partial<Record<SignId, string>> = { ...planet.signs };
  for (const [sign, line] of Object.entries(drafts.signs ?? {}) as [SignId, string][]) signs[sign] = joined(planet.signs[sign], line);
  const houses: Partial<Record<HouseNumber, string>> = { ...planet.houses };
  for (const [key, line] of Object.entries(drafts.houses ?? {})) {
    const house = Number(key) as HouseNumber;
    houses[house] = joined(planet.houses[house], line);
  }
  return { ...planet, signs, houses };
}

/** The planets with a page, in the order of lib/keys.ts, with their drafted lines merged in. */
export const PLANET_PAGES: readonly PlanetContent[] = [
  sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, northNode, southNode, chiron, galacticCenter,
].map(withDrafts);

export const planetPage = (body: BodyId): PlanetContent | undefined => PLANET_PAGES.find((p) => p.body === body);

export const planetHref = (planet: PlanetContent) => `/keys/${planet.slug}`;

export { the, The } from './the';

/** Paragraphs of a line or note, split by a blank line. */
export const paragraphs = (text: string): string[] => text.split('\n\n');

/** A line for the chart's tap panel: its first paragraph, cut to two sentences when that runs long. */
export const panelLine = (text: string | undefined): string | undefined => {
  if (!text) return undefined;
  const [first, second] = paragraphs(text);
  // A one-line key (Jupiter's, Saturn's) takes the start of the paragraph after it (Dawa, Nov 5: "very brief").
  if (first.length < 160 && second) return `${first} ${cut(second, 2)}`;
  return first.length <= 320 ? first : cut(first, 2);
};

/** The first sentences of a paragraph. */
const cut = (paragraph: string, count: number) =>
  (paragraph.match(/[^.?]+[.?]+(?:[”’)]+)?(?:\s+|$)/g) ?? [paragraph]).slice(0, count).join('').trim();

// PLACEHOLDER: the planet page's own words around Dawa's. A key name arrives as an argument.
export const planetPageCopy = {
  eyebrow: 'The 28 Keys',
  /** The page title: "Jupiter, its two Keys" */
  metaTitle: (planet: string) => `${planet}, its two Keys`,
  description: (planet: string) => `${The(planet)} in each of the twelve signs and each of the twelve houses.`,
  introTitle: (planet: string) => `About ${the(planet)}`,
  signsTitle: (planet: string) => `${planet} in the signs`,
  housesTitle: (planet: string) => `${planet} in the houses`,
  /** "Your Gift is the sign Jupiter was in when you were born." */
  signsLede: (keyName: string, planet: string) => `Your ${keyName} is the sign ${the(planet)} was in when you were born.`,
  housesLede: (keyName: string, planet: string) =>
    `Your ${keyName} is the house ${the(planet)} was in. It needs your birth time.`,
  houseLabel: (roman: string, name: string) => `House ${roman}, ${name}`,
  /** Where Dawa has not yet written the lines for a section. */
  signsComing: (planet: string) => `Dawa’s lines for ${the(planet)} in each sign are still to come.`,
  housesComing: (planet: string) => `Dawa’s lines for ${the(planet)} in each house are still to come.`,
  back: 'All 28 Keys',
  more: (planet: string) => `More about ${the(planet)}`,
  yourChart: { href: '/your-chart', label: 'See yours on Your chart' },
};
