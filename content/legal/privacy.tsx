// Privacy policy, adapted from the Transcript Pro policy as a starting template.
// A draft for Kevin's review: [operator] and [state] stay visible until he
// answers, the minimum age (18) is flagged for him, and so is the analytics line (1i).

import Link from 'next/link';
import type { LegalSection } from '@/components/LegalPage';
import { CONTACT_EMAIL } from '@/lib/site';

const mail = (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-cobalt-600 underline underline-offset-4">
    {CONTACT_EMAIL}
  </a>
);

export const privacy = {
  title: 'Privacy policy',
  updated: 'September 2026',
  draft: (
    <p>
      This page is a draft for legal review. [operator] stands for the person or company that runs
      AstroTribes, and [state] for the law that governs it; both are filled in before launch. The
      line on Vercel Web Analytics is new and waits for the same review.
    </p>
  ),
  intro: (
    <>
      <p>
        AstroTribes is a home for people who share a sky: your chart, the keys in it, and the people
        who share them. This page explains what we collect, why, and what happens to it. We have
        kept it short and plain on purpose. AstroTribes is run by [operator].
      </p>
      <p>
        Your birth date, time, and place are sensitive. Together they rebuild your whole chart, and
        unlike a password you can never change them. We treat them that way from the start.
      </p>
    </>
  ),
  sections: [
    {
      id: 'today',
      title: 'What we collect today',
      body: (
        <>
          <p>
            Right now AstroTribes has no accounts, so it holds nothing about you. A few things
            happen when you visit:
          </p>
          <ul>
            <li>
              <strong>One small cookie, only if you change how the site looks.</strong> A cookie
              called <code className="type-data-sm">at-appearance</code> holds your display settings
              only (mood, painting, wash strength, and text size), is set only when you change one,
              and is never used for tracking.
            </li>
            <li>
              <strong>One more cookie, only if you have the preview passcode.</strong> While the free
              chart is in preview, a cookie called{' '}
              <code className="type-data-sm">at-preview</code> keeps it open on this device for 30
              days. It holds a scrambled form of the passcode, not the passcode, and nothing about
              you.
            </li>
            <li>
              <strong>Our host&apos;s request logs.</strong> Vercel, which hosts the site, keeps
              short logs of each request, including your IP address and the page you asked for, to
              run the site and protect it from abuse. The free chart sends your details in the body
              of the request, never in the page address, so they are not in these logs.
            </li>
          </ul>
          <p>
            We count page visits with Vercel Web Analytics. It sets no cookies and does not identify
            you. We use no advertising and no tracking cookies.
          </p>
        </>
      ),
    },
    {
      id: 'free-chart',
      title: 'Your free chart',
      body: (
        <>
          <p>
            You give your birth date, time (or tell us you don&apos;t know it), and place. Your
            browser sends only the date, the time, and the place&apos;s map coordinates to our
            server, which works out your Sun, Moon, and Rising and sends back the three signs. The
            name of the place stays on your screen.
          </p>
          <p>
            <strong>The free chart stores and logs nothing.</strong> Your details are used for that
            one calculation and then discarded. They are not saved, not written to a log, not sent
            to any analytics, and not kept in your browser: reload the page and the form is empty.
          </p>
          <p>
            To stop abuse, we count how often each connection asks, for a few minutes at a time. The
            count is kept against a scrambled form of your IP address, in memory only, and is
            forgotten within the hour.
          </p>
          <p>
            <strong>Finding your birthplace.</strong> As you type a place, our server sends the
            letters you have typed, and nothing else, to Geoapify, a place-search service. This is
            the one thing about your birth that leaves our server. Geoapify receives the text from
            our server, not from your browser, so it never sees your IP address. It keeps logs of
            the requests it receives for up to 24 hours, on servers in the European Union (
            <a
              href="https://www.geoapify.com/privacy-policy/"
              className="text-cobalt-600 underline underline-offset-4"
            >
              Geoapify&apos;s privacy policy
            </a>
            ). Its place data comes from{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="text-cobalt-600 underline underline-offset-4"
            >
              OpenStreetMap
            </a>
            , by OpenStreetMap contributors.
          </p>
          <p>
            <strong>Sharing.</strong> If you share your result, the link carries your three signs
            and nothing else: no date, no time, no place.
          </p>
        </>
      ),
    },
    {
      id: 'accounts',
      title: 'When accounts open',
      body: (
        <>
          <p>
            Joining will be optional. When it opens, this policy will be updated first, and it will
            keep these promises:
          </p>
          <ul>
            <li>
              Your birth date, time, and place are readable by you alone. No other member ever sees
              them.
            </li>
            <li>You choose who can see your chart, and you can keep it private.</li>
            <li>
              You can download everything we hold about you, and delete your account at any time.
              Deleting it removes your chart, your birth details, and everything tied to them.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'testing',
      title: 'How we test the site',
      body: (
        <p>
          We never use real people&apos;s birth details to build or test AstroTribes. The members
          you may see in a preview are invented, clearly marked as demo members, and removed before
          real members join.
        </p>
      ),
    },
    {
      id: 'others',
      title: 'Who else handles your data',
      body: (
        <>
          <p>
            Today, two services. Vercel hosts the site. Geoapify finds your birthplace for the free
            chart and receives only the text you type in the place field, as described above. As
            features open, each new service that handles your data (for the database and sign-in)
            is named here before it goes live, with what it receives.
          </p>
          <p>
            We do not sell your information, share it for advertising, or send marketing email. We
            share it with no one else unless the law requires it.
          </p>
        </>
      ),
    },
    {
      id: 'age',
      title: 'Age',
      body: (
        <p>
          AstroTribes is for people 18 and over, and we do not knowingly collect information from
          anyone younger. If you believe someone under 18 has given us their details, write to us
          and we will remove them.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: (
        <p>
          If we change this policy in a way that matters, we will update the date at the top and
          note the change on this page before it applies.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      body: (
        <p>
          Questions about your privacy go to {mail}. The{' '}
          <Link href="/contact" className="text-cobalt-600 underline underline-offset-4">
            contact page
          </Link>{' '}
          has more.
        </p>
      ),
    },
  ] satisfies LegalSection[],
};
