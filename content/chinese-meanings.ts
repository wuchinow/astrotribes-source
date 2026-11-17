// What the member's Chinese animal and element mean (5h, Dawa's Nov 15 note 1). PLACEHOLDER: our words,
// after the traditional character of each animal and element, listed in Notion "Drafts for Dawa to
// review". Shown only on the member's own chart, where the animal and element appear together: other
// members see the animal alone (0008), since the two together name the birth year.

import type { ANIMALS, ELEMENTS } from '@/lib/chinese-zodiac';

type Animal = (typeof ANIMALS)[number];
type Element = (typeof ELEMENTS)[number];

export const ANIMAL_MEANINGS: Record<Animal, string> = {
  Rat: 'Quick, resourceful, and charming. You spot an opening before anyone else and know how to make the most of it.',
  Ox: 'Steady, patient, and strong. You keep going long after others stop, and people trust you to finish what you start.',
  Tiger: 'Brave, warm, and restless. You stand up for what matters and bring energy to every room you walk into.',
  Rabbit: 'Gentle, tactful, and perceptive. You keep the peace, read people well, and make others feel at ease.',
  Dragon: 'Bold, generous, and full of life. You dream big, and your confidence lifts the people around you.',
  Snake: 'Wise, calm, and intuitive. You think deeply, choose your moments with care, and see beneath the surface.',
  Horse: 'Free, lively, and open hearted. You love movement and adventure, and you need room to run.',
  Goat: 'Kind, creative, and sensitive. You bring beauty and care to the people and places around you.',
  Monkey: 'Clever, playful, and inventive. You solve problems in ways no one expects and keep life interesting.',
  Rooster: 'Honest, observant, and hardworking. You notice every detail, speak your mind, and take pride in doing things well.',
  Dog: 'Loyal, fair, and protective. You stand by your people and care deeply about what is right.',
  Pig: 'Warm, generous, and easygoing. You enjoy life’s pleasures and share them freely with others.',
};

export const ELEMENT_MEANINGS: Record<Element, string> = {
  Wood: 'Wood is growth: you reach outward, start new things, and help others grow with you.',
  Fire: 'Fire is passion: you bring warmth, drive, and a spark that others catch.',
  Earth: 'Earth is balance: you are grounded and practical, the one others lean on.',
  Metal: 'Metal is strength of will: you are clear, determined, and hold firmly to your values.',
  Water: 'Water is flow: you adapt, listen, and find your way around any obstacle.',
};
