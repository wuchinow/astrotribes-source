// PLACEHOLDER, every word of it: lines drafted in Dawa's voice for him to review (David, Nov 6: "draft
// whatever is outstanding in his voice, given all of the writing of his that you have access to").
// Drawn from his own lines elsewhere in content/planets.ts, his twelve signs, his houses, and his
// Galactic Heart Point. Not marked on the site (David, Nov 6: "rather than indicate that they're
// drafts on the live site"); the list for Dawa is a Notion page under astrotribes, "Drafts for Dawa
// to review". When he rewrites or approves a line, it moves into content/planets.ts as his.
//
// Where he has written a line, the draft here follows it as a second paragraph (Jupiter, Saturn,
// Neptune, Pluto: "very brief", he wrote on Nov 5, "on me to expand it a bit"). Where he has none, the
// draft stands alone: Pluto in Aries to Cancer, Chiron, and the two Nodes, each with an introduction.
// No key name is typed here; the lint keeps them to lib/keys.ts.

import type { BodyId, HouseNumber, SignId } from '@/lib/keys';

export interface PlanetDrafts {
  /** An introduction, one string per paragraph, where the planet has none yet. */
  intro?: readonly string[];
  signs?: Readonly<Partial<Record<SignId, string>>>;
  houses?: Readonly<Partial<Record<HouseNumber, string>>>;
}

const jupiter: PlanetDrafts = {
  signs: {
    aries: 'Jupiter here grows by doing. The first step is the big step, and luck tends to favor the one who leaps. The thing to watch is overreach: starting ten things and finishing two.',
    taurus: 'Jupiter here grows slowly and surely, like a garden. Good things come through steady effort, the senses, and the natural world, and they tend to last. Comfort is a blessing as long as it doesn’t turn into a rut.',
    gemini: 'Jupiter here grows through curiosity. Books, conversations, short trips, and the people next door all open doors. The gift is in connecting ideas; the risk is spreading oneself a mile wide and an inch deep.',
    cancer: 'Traditionally this is one of Jupiter’s happiest places. Generosity flows through family, food, and home, and through taking care of others. One’s kitchen table may be the biggest open door in one’s life.',
    leo: 'Jupiter here grows by shining. There is warmth, big heartedness, and a natural sense of theater, and others are uplifted by it. The lesson is to let the light shine on others too.',
    virgo: 'Jupiter here grows in the details. Good fortune comes through skill, craft, health, and being genuinely useful. Small improvements add up to something big.',
    libra: 'Jupiter here grows through others. Partnerships, diplomacy, and a sense of beauty bring opportunity. Fairness is a gift that comes back around.',
    scorpio: 'Jupiter here grows by going deep. Crises become turning points, and what is hidden becomes a resource. There is a talent for research, healing, and other people’s money (in the good sense).',
    sagittarius: 'This is Jupiter’s home sign, and it shows. Travel, teaching, philosophy, and adventure all expand one’s world. Optimism is contagious here; so is the occasional tall tale.',
    capricorn: 'Jupiter here grows by building. Growth comes through patience, structure, and earned authority. It may take a while, but what is built tends to stand.',
    aquarius: 'Jupiter here grows through the group and the future. Friends, networks, causes, and new technology open doors. The gift is seeing what could be, for everyone.',
    pisces: 'Jupiter here grows through faith and imagination. Compassion, music, art, and the spiritual life are where the blessings flow. Boundaries help keep the generosity from leaking away.',
  },
  houses: {
    1: 'Here the opportunity is you: your presence, your enthusiasm, and the way you carry yourself. Doors tend to open when you show up as yourself.',
    2: 'Here the opportunity is in what you have and what you value. Money, possessions, and talents can grow, especially when they are shared generously.',
    3: 'Here the opportunity is in your daily world: siblings, neighbors, short trips, and words. Writing, teaching, and simply talking with people bring luck.',
    4: 'Here the opportunity is at home. Family, heritage, and a sense of place are blessings, and the later part of life is often the most abundant.',
    5: 'Here the opportunity is in play. Art, romance, children, and anything you make for the joy of it bring growth and good fortune.',
    6: 'Here the opportunity is in your work and your health. Being useful, learning a craft, and taking care of the body all pay off.',
    7: 'Here the opportunity comes through others: partners, collaborators, and close friends. One plus one adds up to more than two.',
    8: 'Here the opportunity is in what lies beneath. Shared resources, inheritance, intimacy, and deep inner work can all bring unexpected gifts.',
    9: 'Jupiter is at home here. Travel, study, philosophy, and faith widen your horizons, and the further you go the luckier you tend to get.',
    10: 'Here the opportunity is public. Career, reputation, and leadership can grow large, especially when the work serves something bigger than oneself.',
    11: 'Here the opportunity is in your circle. Friends, groups, and shared dreams carry you forward, and you carry them.',
    12: 'Here the opportunity is quiet and inward. Solitude, dreams, meditation, and helping behind the scenes bring a kind of grace, sometimes described as a guardian angel.',
  },
};

const saturn: PlanetDrafts = {
  signs: {
    aries: 'Saturn asks the warrior to wait. Learning to pause, plan, and finish what one starts turns raw courage into real leadership.',
    taurus: 'Saturn asks the bull to let go of the need for security in things. Learning to adapt, and to trust one’s own worth, turns stubbornness into steadiness.',
    gemini: 'Saturn asks the restless mind to focus. Learning to go deep into one subject, and to say what one means, turns scattered cleverness into real knowledge.',
    cancer: 'Saturn asks the crab to come out of its shell, and sometimes to build a sturdier one. Learning that it is safe to need others, and to be needed, is the work here.',
    leo: 'Saturn asks the lion to earn the spotlight. Learning that one is worthy without applause turns pride into genuine confidence.',
    virgo: 'Saturn asks the perfectionist to accept “good enough”. Learning to be as kind to oneself as one is to others turns criticism into skill.',
    libra: 'Saturn asks the peacemaker to choose. Learning to commit, and to accept that every choice disappoints someone, turns fence sitting into fairness.',
    scorpio: 'Saturn asks the scorpion to loosen its grip. Learning to trust, and to let go of what can’t be controlled, turns intensity into strength.',
    sagittarius: 'Saturn asks the centaur to stay put long enough to see something through. Learning that freedom has a structure turns wandering into wisdom.',
    capricorn: 'Saturn is at home here, which can make it a heavy load. Learning to rest and to laugh at oneself turns ambition into lasting achievement.',
    aquarius: 'Saturn asks the visionary to feel as well as think. Learning to stay connected to real people, not just ideas about people, turns detachment into wise leadership.',
    pisces: 'Saturn asks the fish where it ends and the ocean begins. Learning to hold boundaries without closing one’s heart turns sensitivity into compassion.',
  },
  houses: {
    1: 'Here the work is on how one shows up. There may be shyness or a serious manner early on; with time comes a solid, trustworthy presence.',
    2: 'Here the work is with money and self worth. There may be a fear of not having enough; the lesson is that real security is built, not found.',
    3: 'Here the work is with words and learning. Speaking up may have been hard; patience and practice make one a careful and credible voice.',
    4: 'Here the work is with family and home. There may be heavy responsibilities or distance at the root; one learns to become one’s own solid ground.',
    5: 'Here the work is with play, romance, and creativity. Joy may feel like something to be earned; the lesson is permission to enjoy.',
    6: 'Here the work is in daily habits, health, and service. Discipline comes naturally; the lesson is not to judge oneself, or others, too harshly.',
    7: 'Here the work is in partnership. Relationships may come later or carry real weight; the lesson is that commitment, freely chosen, is a strength.',
    8: 'Here the work is with trust, intimacy, and shared resources. Opening up may feel risky; the lesson is surrender without losing oneself.',
    9: 'Here the work is with belief. One questions everything and trusts nothing secondhand; the lesson is a philosophy that is truly one’s own.',
    10: 'Saturn is at home here. Success is built step by step, sometimes slowly; what is earned this way tends to last.',
    11: 'Here the work is with friends and groups. Belonging may not come easily; a few true friends and shared, grounded goals are the reward.',
    12: 'Here the work is inward. Old fears and hidden patterns surface to be faced; quiet practice, retreat, and reflection turn them into understanding.',
  },
};

const neptune: PlanetDrafts = {
  signs: {
    aries: 'Neptune was in Aries roughly from 1861 to 1875, and returned in 2025 for the generation being born now. Its gift is the courage to begin again: new spiritual paths, and the faith to act on a vision.',
    taurus: 'Neptune was in Taurus roughly from 1874 to 1889. Its gift is a spiritual connection with the land, with craft, and with the beauty of the physical world.',
    gemini: 'Neptune was in Gemini roughly from 1887 to 1902. Its gift is the magic of words and stories, and new ways of sharing them.',
    cancer: 'Neptune was in Cancer roughly from 1901 to 1916. Its gift is a deep feeling for home, homeland, and family, the sense that we all belong somewhere.',
    leo: 'Neptune was in Leo roughly from 1914 to 1929, the generation of the movie star. Its gift is glamour, romance, and the creative dream.',
    virgo: 'Neptune was in Virgo roughly from 1928 to 1943. Its gift is service as a spiritual path: healing, duty, and quiet sacrifice for the common good.',
    libra: 'Neptune was in Libra roughly from 1942 to 1957. Its gift is the ideal of peace and the dream of perfect love, in art, music, and relationship.',
    scorpio: 'Neptune was in Scorpio roughly from 1955 to 1970. Its gift is the courage to look at what is hidden, from psychology to sexuality to the mysteries of death.',
    sagittarius: 'Neptune was in Sagittarius roughly from 1970 to 1984. Its gift is the spiritual seeker: travel, world religions, and the search for meaning beyond one’s own backyard.',
    capricorn: 'Neptune was in Capricorn roughly from 1984 to 1998. Its gift is the vision of a better world that can actually be built, one structure at a time.',
    aquarius: 'Neptune was in Aquarius roughly from 1998 to 2012, the generation that grew up online. Its gift is the dream of a connected humanity.',
    pisces: 'Neptune is at home in Pisces, where it was roughly from 2011 to 2026. Its gift is compassion without borders, and a natural feel for the unseen.',
  },
  houses: {
    1: 'Here one may be something of a chameleon, reflecting back what others want to see. The gift is an artistic, intuitive presence; the work is knowing who one really is.',
    2: 'Here money and possessions can slip through one’s fingers, or matter less than they do to others. The gift is valuing what can’t be bought.',
    3: 'Here the mind is poetic and intuitive, picking up on what isn’t said. The gift is for music, images, and stories; the work is being clear.',
    4: 'Here the sense of home may be hazy, idealized, or hard to pin down. The gift is finding one’s true roots in the spirit, or in all of humanity.',
    5: 'Here creativity flows as if from somewhere else. Music, film, dance, and romance are all doorways to the divine.',
    6: 'Here the daily work wants meaning. Caring, healing, and helping work suit this placement; so does attention to the body’s sensitivity.',
    7: 'Here one may see a partner through rose colored glasses. The gift is devotion and compassion; the work is seeing the real person.',
    8: 'Here the line between oneself and another can dissolve. The gift is deep psychic and emotional intimacy; the work is protecting what is one’s own.',
    9: 'Here the search for meaning can become a calling. Pilgrimage, mysticism, and the study of world traditions are natural.',
    10: 'Here the career wants to inspire. Art, healing, and spiritual work suit this placement, and one’s public image may be a little mysterious.',
    11: 'Here one dreams with others. Groups, causes, and friendships carry an ideal, and sometimes the disappointment of an ideal.',
    12: 'Neptune is at home here. The inner life is rich with dreams and intuition; meditation, retreat, and art are where it pours out.',
  },
};

const pluto: PlanetDrafts = {
  signs: {
    aries: 'The Pluto in Aries generation: transformation through revolt and pioneering.\n\nPluto was in Aries roughly from 1822 to 1853, a time of revolutions, westward migration, and new frontiers. This generation tore down the old order in order to begin again.',
    taurus: 'The Pluto in Taurus generation: transformation through land, money, and industry.\n\nPluto was in Taurus roughly from 1851 to 1884, the age of railroads, factories, and the reshaping of the land itself. This generation transformed what we own and how we make a living.',
    gemini: 'The Pluto in Gemini generation: transformation through new ways of communicating and moving.\n\nPluto was in Gemini roughly from 1882 to 1914, the generation of the telephone, the radio, the automobile, and the first airplanes. The world suddenly got smaller and faster.',
    cancer: 'The Pluto in Cancer generation: transformation through homeland and family.\n\nPluto was in Cancer roughly from 1912 to 1939, the generation that lived through two world wars and the Great Depression. Home, homeland, and family were tested and rebuilt.',
    leo: 'Pluto was in Leo roughly from 1937 to 1958. This generation reinvented the self as something to be created and expressed, from rock and roll to the personal revolution.',
    virgo: 'Pluto was in Virgo roughly from 1956 to 1972. This generation transformed work, health, and the environment, and drew new lines around what is healthy and what is not.',
    libra: 'Pluto was in Libra roughly from 1971 to 1984. This generation transformed relationships: marriage, divorce, equality, and what we owe each other.',
    scorpio: 'Pluto is at home in Scorpio, where it was roughly from 1983 to 1995. This generation faced taboos head on, death, sexuality, and power, and does not flinch from the truth.',
    sagittarius: 'Pluto was in Sagittarius roughly from 1995 to 2008. This generation grew up with the whole world at its fingertips, and is transforming belief, education, and travel.',
    capricorn: 'Pluto was in Capricorn roughly from 2008 to 2024. This generation was born as old institutions were cracking, and will rebuild them from the ground up.',
    aquarius: 'Pluto entered Aquarius in 2023 and 2024 and stays until about 2044. This generation is being born into a world remade by technology and networks, AI included.',
    pisces: 'Pluto will be in Pisces from about 2043 to 2068. This future generation may transform how we understand spirit, compassion, and the boundaries between us.',
  },
  houses: {
    1: 'Here one may go through several complete changes of identity in one lifetime. There is a powerful, sometimes intense presence that others feel.',
    2: 'Here money, possessions, and self worth go through deep cycles of loss and renewal. What is truly valuable is what survives.',
    3: 'Here the mind is penetrating and the words carry weight. Learning, writing, and conversation can change one’s whole outlook.',
    4: 'Here the roots are where the deep changes happen. Family patterns are faced and transformed, sometimes by leaving them behind.',
    5: 'Here creativity is a force of renewal. Art, romance, and children can be intense, passionate, and life changing.',
    6: 'Here the daily routine and the body are where change happens. Work and health habits are periodically torn down and rebuilt.',
    7: 'Here relationships are transformative, sometimes intensely so. A partner may be the catalyst for becoming someone new.',
    8: 'Pluto is at home here. Crisis, intimacy, and endings are doorways to profound renewal, again and again.',
    9: 'Here beliefs are not inherited but forged. A journey, a teacher, or a crisis of faith can change everything.',
    10: 'Here one’s calling may change completely, more than once, and one may hold real power or influence in the world.',
    11: 'Here friends and groups are agents of change. A circle, a movement, or a shared dream can transform one’s life.',
    12: 'Here the deepest change happens out of sight. Old patterns from the unconscious come up to be released, through dreams, therapy, or spiritual practice.',
  },
};

const chiron: PlanetDrafts = {
  intro: [
    'Chiron was discovered in 1977 by Charles Kowal at the Palomar Observatory in California. It is a small icy body, about 130 miles across, that circles the Sun between Saturn and Uranus. Astronomers call objects like it centaurs, because they are part asteroid and part comet.',
    'In Greek mythology Chiron was the wise centaur, a healer and teacher of heroes, including Achilles and Asclepius, the father of medicine. Wounded by a poisoned arrow that would not heal, he became the healer who could not heal himself. Astrologically that is his story in our charts: the place where we are tender, and where, by tending it, we learn to help others.',
    'Chiron takes about 50 years to go around the Sun. Its orbit is so stretched that it spends anywhere from about a year and a half to eight years in a sign. Around age 50 comes the Chiron return, when it arrives back where it was at your birth, often a time of facing old hurts and finding a wiser kind of peace.',
  ],
  signs: {
    aries: 'Chiron in Aries: the tender spot is the right to exist and to take up space. The healing comes through acting with courage anyway, and helping others find their own.',
    taurus: 'Chiron in Taurus: the tender spot is the body, money, and feeling secure. The healing comes through nature, the senses, and discovering one’s worth was never in question.',
    gemini: 'Chiron in Gemini: the tender spot is being heard and understood, and feeling smart enough. The healing comes through finding one’s own voice, and helping others find theirs.',
    cancer: 'Chiron in Cancer: the tender spot is family, belonging, and being cared for. The healing comes through mothering oneself, and making a home where others can feel safe too.',
    leo: 'Chiron in Leo: the tender spot is being seen, and being loved for who one is. The healing comes through creating for the joy of it, and cheering for others.',
    virgo: 'Chiron in Virgo: the tender spot is never feeling good enough, or healthy enough. The healing comes through useful work and gentle self care, and this placement makes a natural healer.',
    libra: 'Chiron in Libra: the tender spot is relationship, fairness, and feeling incomplete alone. The healing comes through balanced partnership, and helping others find peace with each other.',
    scorpio: 'Chiron in Scorpio: the tender spot is trust, betrayal, and loss. The healing comes through facing what is hidden, and this placement can guide others through their darkest times.',
    sagittarius: 'Chiron in Sagittarius: the tender spot is meaning, faith, and belonging to a larger story. The healing comes through travel, study, and a philosophy hard won from experience.',
    capricorn: 'Chiron in Capricorn: the tender spot is achievement, authority, and the weight of responsibility. The healing comes through building something of one’s own, and becoming the mentor one needed.',
    aquarius: 'Chiron in Aquarius: the tender spot is feeling different, an outsider looking in. The healing comes through finding one’s people, and using one’s difference for the good of the group.',
    pisces: 'Chiron in Pisces: the tender spot is boundaries, and feeling everyone’s pain as one’s own. The healing comes through compassion that includes oneself, through art, music, and the spiritual life.',
  },
  houses: {
    1: 'Chiron in the 1st: the tenderness is in how one sees oneself, and how one feels seen. Accepting one’s own face in the mirror is the healing, and it gives others permission to do the same.',
    2: 'Chiron in the 2nd: the tenderness is around money, possessions, and self worth. The healing is learning what one truly values, and that one is enough.',
    3: 'Chiron in the 3rd: the tenderness is around learning, speaking, and being understood, perhaps with siblings. The healing comes through words, and helping others find theirs.',
    4: 'Chiron in the 4th: the tenderness is at home, in family and roots. The healing comes through creating the sense of home one may have missed, for oneself and others.',
    5: 'Chiron in the 5th: the tenderness is around play, creativity, romance, or children. The healing comes through letting the inner child out to play.',
    6: 'Chiron in the 6th: the tenderness is in the body, health, and daily work. The healing often comes through becoming a healer, helper, or teacher of others.',
    7: 'Chiron in the 7th: the tenderness is in close relationships. Partners may bring old hurts to the surface, and with them, the chance to heal together.',
    8: 'Chiron in the 8th: the tenderness is in trust, intimacy, and loss. The healing comes through going deep, and this placement can walk others through crisis.',
    9: 'Chiron in the 9th: the tenderness is around belief, faith, and finding meaning. The healing comes through a philosophy built from one’s own experience.',
    10: 'Chiron in the 10th: the tenderness is around success, recognition, and authority. The healing comes through a calling that makes use of one’s own story.',
    11: 'Chiron in the 11th: the tenderness is around fitting in, friendship, and groups. The healing comes through finding, or building, a community where everyone belongs.',
    12: 'Chiron in the 12th: the tenderness is hidden, sometimes even from oneself. The healing comes through solitude, dreams, and spiritual practice, and through compassion for all who suffer quietly.',
  },
};

const northNode: PlanetDrafts = {
  intro: [
    'The North Node is not a planet but a point: one of the two places where the Moon’s path around the Earth crosses the Sun’s path across our sky. Eclipses happen when a New Moon or a Full Moon falls near one of these points. The other crossing, directly opposite, is the South Node.',
    'In many traditions the Nodes are a dragon. In India the North Node is Rahu, the dragon’s head, and the South Node is Ketu, its tail; in old Western astrology they were Caput Draconis and Cauda Draconis. The dragon’s head is hungry, always reaching forward. Astrologically the North Node is where your growth lies: unfamiliar, sometimes uncomfortable, and deeply rewarding.',
    'The Nodes move backward through the zodiac, taking about 18 and a half years to go all the way around and spending about a year and a half in each sign. Every 18 or 19 years (around ages 18, 37, 56, and 74) comes a nodal return, often a turning point when the direction of one’s life comes into focus.',
  ],
  signs: {
    aries: 'The North Node in Aries: growth comes through independence, courage, and putting oneself first sometimes. The journey is from “we” toward “I”.',
    taurus: 'The North Node in Taurus: growth comes through simplicity, patience, and the body. The journey is from crisis and intensity toward steady, peaceful ground.',
    gemini: 'The North Node in Gemini: growth comes through curiosity, listening, and asking questions. The journey is from having all the answers toward learning from everyone.',
    cancer: 'The North Node in Cancer: growth comes through feeling, family, and letting oneself be cared for. The journey is from achievement and control toward home and the heart.',
    leo: 'The North Node in Leo: growth comes through creativity, play, and stepping into the spotlight. The journey is from blending into the group toward shining as oneself.',
    virgo: 'The North Node in Virgo: growth comes through practical service, routine, and attention to detail. The journey is from drifting and dreaming toward grounded, useful work.',
    libra: 'The North Node in Libra: growth comes through partnership, cooperation, and considering others. The journey is from “I” toward “we”.',
    scorpio: 'The North Node in Scorpio: growth comes through depth, intimacy, and letting go. The journey is from holding on to comfort toward the power of transformation.',
    sagittarius: 'The North Node in Sagittarius: growth comes through faith, travel, and the bigger picture. The journey is from gathering facts toward trusting one’s own truth.',
    capricorn: 'The North Node in Capricorn: growth comes through responsibility, ambition, and standing on one’s own feet. The journey is from the safety of home toward a role in the world.',
    aquarius: 'The North Node in Aquarius: growth comes through friendship, community, and the future. The journey is from the personal spotlight toward the good of the group.',
    pisces: 'The North Node in Pisces: growth comes through faith, compassion, and surrender. The journey is from analyzing and fixing toward trusting the flow.',
  },
  houses: {
    1: 'The North Node in the 1st: growth comes through standing on one’s own and following one’s own lead.',
    2: 'The North Node in the 2nd: growth comes through building one’s own resources and values, apart from others’.',
    3: 'The North Node in the 3rd: growth comes through everyday learning, conversation, and the people close at hand.',
    4: 'The North Node in the 4th: growth comes through home, family, and inner life, more than public success.',
    5: 'The North Node in the 5th: growth comes through creativity, play, romance, and the courage to be seen.',
    6: 'The North Node in the 6th: growth comes through daily work, health, and being of practical service.',
    7: 'The North Node in the 7th: growth comes through partnership and learning to share the journey.',
    8: 'The North Node in the 8th: growth comes through intimacy, shared resources, and deep change.',
    9: 'The North Node in the 9th: growth comes through travel, higher learning, and a faith of one’s own.',
    10: 'The North Node in the 10th: growth comes through a calling, a career, and stepping up in the world.',
    11: 'The North Node in the 11th: growth comes through friends, groups, and shared dreams for the future.',
    12: 'The North Node in the 12th: growth comes through solitude, spiritual practice, and letting go of control.',
  },
};

const southNode: PlanetDrafts = {
  intro: [
    'The South Node is the other end of the dragon: the tail to the North Node’s head. It always sits exactly opposite the North Node, in the opposite sign and the opposite house.',
    'Where the dragon’s head is hungry for what lies ahead, the tail holds what has already been digested. Astrologically the South Node is what comes naturally: talents, habits, and memories you bring with you, some say from past lives. It is the comfort zone, a treasure to draw on and a place to avoid getting stuck.',
    'Eclipses near the South Node are often about release, letting go of what no longer serves. The work is to bring the South Node’s gifts along on the North Node’s journey.',
  ],
  signs: {
    aries: 'The South Node in Aries: the familiar gifts are independence, courage, and quick action. The old habit to release is going it alone.',
    taurus: 'The South Node in Taurus: the familiar gifts are patience, steadiness, and a feel for the physical world. The old habit to release is clinging to comfort and security.',
    gemini: 'The South Node in Gemini: the familiar gifts are a quick mind, words, and many interests. The old habit to release is restless chatter and second guessing.',
    cancer: 'The South Node in Cancer: the familiar gifts are caring, nurturing, and emotional depth. The old habit to release is hiding in the shell of home and family.',
    leo: 'The South Node in Leo: the familiar gifts are creativity, warmth, and confidence. The old habit to release is needing to be the center of attention.',
    virgo: 'The South Node in Virgo: the familiar gifts are skill, precision, and service. The old habit to release is worry, criticism, and trying to control every detail.',
    libra: 'The South Node in Libra: the familiar gifts are grace, diplomacy, and partnership. The old habit to release is losing oneself to keep the peace.',
    scorpio: 'The South Node in Scorpio: the familiar gifts are depth, perception, and the power to transform. The old habit to release is crisis, suspicion, and holding on to old hurts.',
    sagittarius: 'The South Node in Sagittarius: the familiar gifts are faith, adventure, and a philosophical mind. The old habit to release is preaching, and always being somewhere else.',
    capricorn: 'The South Node in Capricorn: the familiar gifts are discipline, responsibility, and leadership. The old habit to release is defining oneself by status and achievement.',
    aquarius: 'The South Node in Aquarius: the familiar gifts are vision, independence, and a feel for the group. The old habit to release is detachment, staying above it all.',
    pisces: 'The South Node in Pisces: the familiar gifts are compassion, imagination, and intuition. The old habit to release is escapism and drifting.',
  },
  houses: {
    1: 'The South Node in the 1st: what comes naturally is self reliance. The old pattern is doing everything oneself; the treasure is a strong sense of who one is.',
    2: 'The South Node in the 2nd: what comes naturally is building security. The old pattern is attachment to possessions; the treasure is a solid sense of one’s worth.',
    3: 'The South Node in the 3rd: what comes naturally is information and talk. The old pattern is endless fact gathering; the treasure is a quick and versatile mind.',
    4: 'The South Node in the 4th: what comes naturally is home and family. The old pattern is staying in the nest; the treasure is a deep emotional root.',
    5: 'The South Node in the 5th: what comes naturally is creativity and fun. The old pattern is needing applause; the treasure is a generous, playful heart.',
    6: 'The South Node in the 6th: what comes naturally is work and routine. The old pattern is busyness and worry; the treasure is real skill and a willingness to help.',
    7: 'The South Node in the 7th: what comes naturally is partnership. The old pattern is leaning on others; the treasure is a gift for relationship and cooperation.',
    8: 'The South Node in the 8th: what comes naturally is intensity and depth. The old pattern is crisis and control; the treasure is fearlessness in the face of change.',
    9: 'The South Node in the 9th: what comes naturally is belief and adventure. The old pattern is always being on the road, or always being right; the treasure is wisdom.',
    10: 'The South Node in the 10th: what comes naturally is ambition and public life. The old pattern is living for status; the treasure is the ability to lead.',
    11: 'The South Node in the 11th: what comes naturally is friends and groups. The old pattern is losing oneself in the crowd; the treasure is a gift for community.',
    12: 'The South Node in the 12th: what comes naturally is the inner world. The old pattern is withdrawing and escaping; the treasure is a deep spiritual sensitivity.',
  },
};

export const PLANET_DRAFTS: Readonly<Partial<Record<BodyId, PlanetDrafts>>> = {
  jupiter,
  saturn,
  neptune,
  pluto,
  chiron,
  northNode,
  southNode,
};
