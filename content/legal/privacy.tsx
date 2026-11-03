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
  updated: 'November 2026',
  draft: (
    <p>
      This page is a draft for legal review. [operator] stands for the person or company that runs
      AstroTribes, and [state] for the law that governs it; both are filled in before launch. The
      line on Vercel Web Analytics and the Nov 3 change (the free chart now needs an account) wait
      for the same review.
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
      title: 'What we collect when you visit',
      body: (
        <>
          <p>
            If you only look around, AstroTribes holds nothing about you. A few things happen when
            you visit:
          </p>
          <ul>
            <li>
              <strong>One small cookie, only if you change how the site looks.</strong> A cookie
              called <code className="type-data-sm">at-appearance</code> holds your display settings
              only (mood, painting, wash strength, and text size), is set only when you change one,
              and is never used for tracking.
            </li>
            <li>
              <strong>One more cookie, only if you have the preview passcode.</strong> For the pages
              still in preview, a cookie called{' '}
              <code className="type-data-sm">at-preview</code> keeps them open on this device for 30
              days. It holds a scrambled form of the passcode, not the passcode, and nothing about
              you.
            </li>
            <li>
              <strong>Our host&apos;s request logs.</strong> Vercel, which hosts the site, keeps
              short logs of each request, including your IP address and the page you asked for, to
              run the site and protect it from abuse. Your birth details travel in the body of the
              request, never in the page address, so they are not in these logs.
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
      title: 'Your free chart and your account',
      body: (
        <>
          {/* PLACEHOLDER (Nov 3): the chart now needs an account, for Kevin to review. */}
          <p>
            Your chart is free. It needs an account, but no payment and no subscription. You sign
            in with Google, choose the name other members see, then give your birth date, time (or
            tell us you don&apos;t know it), and place.
          </p>
          <p>
            <strong>What an account stores.</strong> Your email address, the name you choose, and
            who can see your chart. Google also shares your Google name and photo with our sign-in
            service, which keeps them with your sign-in record. We never use your Google name. Your
            photo shows beside your name at the top of the page while you are signed in, loaded
            from Google.
          </p>
          <p>
            <strong>Your birth details.</strong> When you save them, we keep your birth date, your
            birth time if you give one, your birthplace as you picked it, its map coordinates, and
            its time zone. Only you can read them. No other member ever sees them. From them our
            server works out your placements, the sign and house of each body in your chart, and
            keeps those too. Other members never see a degree. Signs and houses can narrow down
            when and where someone was born, so they follow the visibility you choose, and they
            start private.
          </p>
          <p>
            You can change your birth details once an hour. You can download everything we hold
            about you, and delete your account at any time. Deleting it removes your chart, your
            birth details, and everything tied to them.
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
            <strong>Sharing.</strong> If you share your chart, the link carries your three signs
            and nothing else: no date, no time, no place.
          </p>
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
          {/* PLACEHOLDER (2b): for Kevin to review. */}
          <p>
            For team sign-in, Supabase holds accounts and the database, and Google confirms who you
            are when you choose to sign in with Google.
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
