// The landing page's words, section by section. Dawa writes the site copy; until
// his arrives, every block marked PLACEHOLDER holds ours, and swapping his in
// is a change to this file only. Nothing here shows the word "placeholder" on
// the page. Key names come from lib/keys.ts through KeyChip, never typed here.

import type { BandItem } from '@/components/NightBand';
import type { FaqItem } from '@/components/Faq';
import type { Step } from '@/components/NumberedSteps';

interface Block {
  /** True until Dawa's copy replaces ours. */
  placeholder: boolean;
}

export const hero = {
  placeholder: true, // PLACEHOLDER: "Welcome home" until Dawa picks a tagline (open decision 4)
  eyebrow: 'Free. No payment, no subscription.',
  line: 'Welcome',
  accent: 'home',
  /** Two sentences, each on its own line. */
  lede: ['Astrology gives you identity.', 'AstroTribes gives you belonging.'],
  /** One quiet line under the button (1h, AT-11). */
  note: 'Sign in with Google, then add your birth details. About a minute.',
  pins: [
    { href: '/oracle', title: 'Daily Oracle', line: 'One hexagram, one card', mark: 'hexagram' },
    // The 12 Tribes page, like the nav's link and the pin beside it, which opens a page too (it jumped
    // down this page to the Tribes section, which stays and ends with its own link to that page).
    { href: '/tribes', title: 'Find your Tribe', line: 'Twelve homes, one is yours', mark: 'sign' },
  ],
} satisfies Block & Record<string, unknown>;

// PLACEHOLDER: the hero's wheel of the 12 Tribes (1l), from lg up. Sign names come from lib/keys.ts.
export const wheel = {
  placeholder: true,
  label: 'The 12 Tribes',
  season: 'The Sun is in',
  focus: 'The Tribe of',
  visit: (sign: string) => `Visit the ${sign} Tribe`,
  link: (sign: string, dates: string) => `${sign} Tribe, ${dates}`,
} satisfies Block & Record<string, unknown>;

export const contrast = {
  placeholder: true, // PLACEHOLDER: Dawa writes the words (design system, Aristotle lessons)
  eyebrow: 'What this is',
  line: 'More than a daily horoscope.',
  accent: 'A home for the people who share your sky.',
} satisfies Block & Record<string, unknown>;

export const howItWorks = {
  placeholder: true, // PLACEHOLDER: headline and steps
  eyebrow: 'How it works',
  line: 'Your chart, your keys,',
  accent: 'your people.',
  steps: [
    {
      category: 'Your chart',
      title: 'Get your three.',
      body: 'Sign in free, then add your birth date, time, and place. Sun, Moon, and Rising, each in a few plain lines.',
      more: { href: '#faq-birth-time', label: 'Why we ask for your birth time' },
    },
    {
      category: 'Your keys',
      title: 'Unlock all 28.',
      body: 'The Sun, the Moon, and every planet give you two Keys, each with a meaning.',
      more: { href: '/keys', label: 'What the 28 Keys are' },
    },
    {
      category: 'Your people',
      title: 'Meet your Tribe.',
      body: 'Twelve Tribes, one for each Sun sign. See who shares your sky.',
      more: { href: '#faq-who-sees', label: 'Who can see your chart' },
    },
  ] satisfies Step[],
} satisfies Block & Record<string, unknown>;

export const tribes = {
  placeholder: true, // PLACEHOLDER: headline, lede, caption
  eyebrow: 'The 12 Tribes',
  line: 'Twelve homes.',
  accent: 'One is yours.',
  lede: 'Your Tribe is your Sun sign.',
  /** Under the grid, with the primary action beside it (1h). The dates are the usual ones; this says so. */
  closing: 'Born near a change of sign? Your chart knows for sure.',
  /** To the 12 Tribes page, which says more about each (David, Nov 11). */
  more: { href: '/tribes', label: 'More about the 12 Tribes' },
} satisfies Block & Record<string, unknown>;

export const keys = {
  placeholder: true, // PLACEHOLDER: headline, lede, and the link to the 28 Keys page
  eyebrow: 'The 28 Keys',
  // Dawa's words (Nov 7), set in poster type after a pointing hand.
  title: 'Find your Keys',
  // The line from Dawa's 28 Keys introduction (Nov 7).
  lede: 'Each Key unlocks a piece of your horoscope. These five come from your Sun, Moon, and Rising. Join, and the other 23 open up.',
  /** Under the cards, to the page that lists all 28 (1k). */
  more: { href: '/keys', label: 'See all 28 Keys' },
} satisfies Block & Record<string, unknown>;

export const humanHands = {
  placeholder: true, // PLACEHOLDER: the four items
  eyebrow: 'What stays true',
  title: 'Made by human hands.',
  items: [
    { title: "Dawa's glyphs", body: 'Every sign and planet, brushed in sumi ink.' },
    // The painters' credit lives here and in the footer, not under each piece (David, Sep 25 and Nov 4).
    // Since Nov 8 (David) the ground is public domain ink landscapes; Kirstie's are the Tribes'.
    { title: 'The paintings', body: 'Kirstie Connon painted the twelve Tribes. Old Chinese and Japanese ink landscapes, now in the public domain, are the ground every page stands on.' },
    {
      title: 'Your data is yours',
      body: 'Birth details are private. You choose who sees your chart.',
    },
    { title: 'Plain language', body: 'No jargon without a one-line meaning beside it.' },
  ] satisfies BandItem[],
} satisfies Block & Record<string, unknown>;

export const privacyFaq = {
  placeholder: true, // PLACEHOLDER: headline and answers; the answers stay true to the Privacy page
  eyebrow: 'Your privacy',
  line: 'Plain answers.',
  accent: 'Before you ask.',
  items: [
    {
      id: 'faq-birth-time',
      question: 'Why do you ask for my birth time?',
      // Dawa's answer (Nov 7), lightly edited for punctuation. Key names stay out of it (copy rules), so
      // his "(Vibe)" and "Portal, Vibe" read as the rising sign and the Galactic Center here.
      answer: (
        <p>
          Your time of birth is what dials in the orientation of your horoscope. Without an accurate
          time of birth it is nearly impossible to determine your rising sign and the signs for each
          house. Therefore without your time of birth, we cannot determine any of the house Keys
          with confidence. We can usually still determine most or all of the sign Keys for the
          planets, Chiron, and the nodes of the Moon. However your rising sign’s Key, the Galactic
          Center’s Key, and your planets’ house Keys will be missing. For completeness’ sake, we hope
          you can find your time of birth{'!'}
        </p>
      ),
    },
    {
      id: 'faq-who-sees',
      question: 'Who sees what?',
      answer: (
        <p>
          Your birth date, time, and place are yours alone. No other member ever sees them. You
          choose who can see your chart, and you can keep it private.
        </p>
      ),
    },
    {
      id: 'faq-delete',
      question: 'How do I delete my data?',
      answer: (
        <p>
          From your account page you can download everything we hold and delete your account. Your
          chart and birth details go with it.
        </p>
      ),
    },
  ] satisfies FaqItem[],
} satisfies Block & Record<string, unknown>;

export const nextStep = {
  placeholder: true, // PLACEHOLDER: heading and line
  eyebrow: 'Start here',
  title: 'See your sky in a minute.',
  body: 'Free with an account. No payment, no subscription.',
  secondary: { href: '#how-it-works', label: 'How it works' },
} satisfies Block & Record<string, unknown>;

// PLACEHOLDER: the coming-soon lines for pages whose features arrive in Layer 1.
export const comingSoon = {
  chart: {
    line: 'Your free chart',
    accent: 'is almost here.',
    body: 'Sun, Moon, and Rising from your birth details, with nothing stored.',
  },
};
