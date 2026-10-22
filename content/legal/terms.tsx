// Terms of service, adapted from the Transcript Pro terms as a starting template.
// A draft for Kevin's review: [operator] and [state] stay visible until he
// answers, and the minimum age (18) is flagged for him. Billing waits for Layer 6.

import Link from 'next/link';
import type { LegalSection } from '@/components/LegalPage';
import { CONTACT_EMAIL } from '@/lib/site';

const link = 'text-cobalt-600 underline underline-offset-4';

export const terms = {
  title: 'Terms of service',
  updated: 'September 2026',
  draft: (
    <p>
      This page is a draft for legal review. [operator] stands for the person or company that runs
      AstroTribes, and [state] for the law that governs these terms; both are filled in before
      launch.
    </p>
  ),
  intro: (
    <p>
      These terms cover your use of AstroTribes, run by [operator]. By using the site you agree to
      them. They are written in plain language on purpose. If you have a question, write to{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
        {CONTACT_EMAIL}
      </a>
      .
    </p>
  ),
  sections: [
    {
      id: 'what',
      title: 'What AstroTribes is',
      body: (
        <p>
          AstroTribes is a place to read your chart, learn its language, and find the people who
          share your sky. Astrology here is a way of reflecting and belonging. It is not a
          prediction, and nothing on the site is medical, legal, financial, or psychological advice.
        </p>
      ),
    },
    {
      id: 'accounts',
      title: 'Accounts',
      body: (
        <p>
          Accounts are not open yet. When they open, you must be 18 or over to join, you are
          responsible for what happens under your account, and the details you give about yourself
          must be your own.
        </p>
      ),
    },
    {
      id: 'use',
      title: 'Using AstroTribes well',
      body: (
        <>
          <p>Treat other members with care. Do not:</p>
          <ul>
            <li>
              post or share another person&apos;s birth details or chart without their consent;
            </li>
            <li>harass, impersonate, or mislead other members;</li>
            <li>scrape, copy in bulk, or reach the site by any means other than the website;</li>
            <li>interfere with the site or try to get around its limits.</li>
          </ul>
          <p>We may suspend or close accounts that break these rules.</p>
        </>
      ),
    },
    {
      id: 'content',
      title: 'Your content and ours',
      body: (
        <>
          <p>
            You own what you tell us about yourself. You let us store and use it to run AstroTribes,
            as the{' '}
            <Link href="/privacy" className={link}>
              privacy policy
            </Link>{' '}
            describes, and you can take it back by deleting your account.
          </p>
          <p>
            The glyphs are by Lama Dawa and the paintings by Jane Kwan; they belong to them and are
            used here with their permission. The AstroTribes name, the 28 Keys and their names, the
            design, and the software belong to [operator]. Please do not copy or resell them.
          </p>
        </>
      ),
    },
    {
      id: 'accuracy',
      title: 'Accuracy',
      body: (
        <p>
          Charts are calculated from the details you give. A wrong birth time or place gives a wrong
          chart. Some plain-language readings are drafted with the help of AI and reviewed by
          people; they can still be wrong or incomplete. Take them as a starting point for your own
          reflection.
        </p>
      ),
    },
    {
      id: 'availability',
      title: 'Availability and changes',
      body: (
        <p>
          We work to keep AstroTribes running but cannot promise it never stops. We may change,
          pause, or end features, and we will say so on the site when we do.
        </p>
      ),
    },
    {
      id: 'liability',
      title: 'Disclaimer and limits',
      body: (
        <p>
          AstroTribes is provided as it is, without warranties of any kind. As far as the law
          allows, [operator] is not liable for indirect or consequential losses, or for decisions
          you make based on a reading.
        </p>
      ),
    },
    {
      id: 'ending',
      title: 'Ending',
      body: (
        <p>
          You can stop using AstroTribes at any time, and delete your account once accounts exist.
          We may close accounts that break these terms. The sections on content, accuracy, and
          limits still apply after that.
        </p>
      ),
    },
    {
      id: 'law',
      title: 'Governing law',
      body: <p>These terms are governed by the laws of [state], United States.</p>,
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      body: (
        <p>
          We may update these terms. When we do, we will change the date at the top and note the
          change on this page. Using the site after a change means you accept the new terms.
        </p>
      ),
    },
  ] satisfies LegalSection[],
};
