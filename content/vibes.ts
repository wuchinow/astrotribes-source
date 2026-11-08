// The 12 Vibe pages' words (4l, Nov 8; Dawa's Nov 7 note 21, plan claude.ai/artifact/U5pJhfRWF1AoY11oBHdQpV).
//
// Dawa's own: his "12 Vibes" doc (Drive, Oct 14): the rising sign introduced in two paragraphs, and one
// line per sign, his words but for punctuation and spelling fitted to the copy rules ("ascendant",
// commas for his dashes). The key name is never typed here (the lint keeps key names to lib/keys.ts):
// his intro takes it as an argument, and his “Style” (an older name) is written lowercase.
//
// Ours, drafted in his voice for him to review on the live site (David, Nov 8: we make the calls, no
// draft mark on the site; listed in the Notion page "Drafts for Dawa to review"): one fuller paragraph
// per sign, built from his line, in `VIBE_DRAFTS`. The page copy (headings, notes) is ours, PLACEHOLDER.

import type { SignId } from '@/lib/keys';

/** Dawa's introduction to the rising sign ("12 Vibes", Oct 14). `vibe` is the key's name. */
export const vibeIntro = (vibe: string): readonly string[] => [
  'The ascendant is the sign of the zodiac that was rising on the eastern horizon at the time of birth for the horoscope. It is called the ascendant because it is the sign that was emerging and rising from just below the horizon to visibility. It is also known as your “rising sign”.',
  `In AstroTribes the ascendant is your “${vibe}” or style that you present to the world. It is how the world sees your appearance.`,
];

/** Dawa's line for each rising sign ("12 Vibes", Oct 14). */
export const VIBE_LINES: Record<SignId, string> = {
  aries: 'Quick, speedy, sudden decisions and choices, impulsive, decisive, can appear combative, assertive, or aggressive.',
  taurus: 'Slow, steady, cautious, sensual. Prone to muscular, strong or large body type.',
  gemini: 'Appears quick witted, often expressive or talkative. Often thinner body type.',
  cancer: 'Cautious, prickly, sensitive and protective vibe.',
  leo: 'Attractive, flair, dramatic air, appears confident.',
  virgo: 'Sensitive, clean, well groomed, fine features, tends to be thinner.',
  libra: 'Attractive, graceful, social, careful and cautious.',
  scorpio: 'Mysterious and sensitive. Prefers to stay out of the limelight. Attractive, persuasive and magnetic.',
  sagittarius: 'Fun loving, adventurous, loud laughter, tends to be larger bodied.',
  capricorn: 'Serious, determined, conservative, ambitious, hard working.',
  aquarius: 'Offbeat, can dress or appear eccentrically. Has own sense of style, strongly individualistic.',
  pisces: 'Soft and watery appearance, blends with environment, surroundings, people.',
};

// PLACEHOLDER: drafted in Dawa's voice from his line (Nov 8), for him to rewrite or approve. Shown like
// his own words, with no draft mark (David, Nov 6); listed in Notion "Drafts for Dawa to review".
export const VIBE_DRAFTS: Record<SignId, string> = {
  aries:
    'People with Aries rising meet the world head first. Others notice the speed: quick movements, quick answers, and a readiness to act before the room has settled. The Aries vibe usually reads as confident and bold, and sometimes as more combative than the person inside actually feels. First impressions are strong and direct. The gift of this vibe is courage that others can see; the lesson is learning when to pause before charging in.',
  taurus:
    'The Taurus vibe is calm, steady, and unhurried. People with Taurus rising move at their own pace and are rarely rushed into anything. Others often experience them as reliable and grounding, a solid presence in a room. There is usually a sensual quality too: an appreciation for good textures, good food, and comfortable clothes. The shadow side of this vibe can look like stubbornness, but it often comes from caution and a wish to be sure before moving.',
  gemini:
    'Gemini rising people come across as bright, curious, and quick on their feet. They talk easily, ask lots of questions, and seem interested in everything at once. Others notice the wit and the restless energy of a mind that is always moving. The Gemini vibe can look youthful at any age. Sometimes it is hard to tell what a Gemini rising person really feels, because the conversation has already moved on to the next interesting thing.',
  cancer:
    'The Cancer vibe is sensitive and protective. People with Cancer rising often meet the world carefully, a little guarded at first, like the crab in its shell. Once trust is there the warmth comes through, and they are often caring and nurturing toward the people around them. Others may sense moods that shift with the emotional weather. Home, family, and feeling safe tend to shape how this vibe shows up in public.',
  leo:
    'People with Leo rising tend to be noticed. There is a flair, a warmth, and often a dramatic air in how they carry themselves, whether or not they are looking for the spotlight. Others usually read the Leo vibe as confident and generous. Many Leo rising people take real care with their appearance, and there is often something regal or theatrical in their style. Underneath there can be a deep need to be appreciated for who they are.',
  virgo:
    'The Virgo vibe is clean, careful, and well put together. People with Virgo rising often appear modest and reserved, with a quiet attention to detail that others pick up on quickly. They tend to notice what needs doing and how it could be done better. Others often experience them as helpful, thoughtful, and a little shy at first. The sensitivity of this vibe can show up as nervous energy, or as a strong wish to get things right.',
  libra:
    'Libra rising people come across as graceful, pleasant, and socially at ease. They often have an eye for beauty and balance, in how they dress and in how they arrange their surroundings. Others experience the Libra vibe as charming and diplomatic, someone who smooths over tension and makes people feel welcome. There is also a careful, cautious side: Libra rising people like to weigh things before committing, and may hold back a strong opinion to keep the peace.',
  scorpio:
    'The Scorpio vibe is magnetic and a little mysterious. People with Scorpio rising prefer to observe before revealing much of themselves, and others can sense that there is more going on beneath the surface. They tend to be perceptive and persuasive, and their presence can feel intense even when they are quiet. Privacy matters to this vibe. Trust is earned slowly, but once it is given, Scorpio rising people are deeply loyal.',
  sagittarius:
    'People with Sagittarius rising meet the world with enthusiasm and good humor. The Sagittarius vibe is open, adventurous, and fun loving, often with a big laugh that carries across a room. Others experience them as friendly, optimistic, and ready for whatever comes next, whether that is a trip, a new idea, or a long talk about the meaning of it all. This vibe can be blunt at times, honest to a fault, and restless when life feels too small.',
  capricorn:
    'The Capricorn vibe is serious, capable, and composed. People with Capricorn rising often seem older than their years when they are young, and many grow lighter and more playful as they age. Others experience them as determined, responsible, and hard working, someone who can be counted on. There is often a reserve at first meeting. Underneath it is a dry sense of humor and a steady ambition to build something that lasts.',
  aquarius:
    'Aquarius rising people stand out by being themselves. The Aquarius vibe is offbeat and individual, often with a personal style that ignores the trends of the moment. Others experience them as friendly, curious, and a bit unpredictable, interested in ideas, causes, and people from every walk of life. The first impression can be cool or detached, but it usually covers a real concern for fairness and for the wider human family.',
  pisces:
    'The Pisces vibe is soft, gentle, and fluid. People with Pisces rising often blend into their surroundings, picking up the moods of the people and places around them. Others experience them as kind, dreamy, and easy to be with, though sometimes hard to pin down. There is often an artistic or spiritual quality in how they present themselves. Because this vibe is so receptive, Pisces rising people do well with time alone, to sort out which feelings are actually their own.',
};
