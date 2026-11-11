// Your chart's short cards and the member links in the main nav (5c), held as text and data: the page
// needs a session and a database, so it is not rendered here.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PLANET_PAGES, TEASER_MAX, paragraphs, teaserLine } from '@/content/planets';
import { knownFor } from '@/content/tribe-dawa';
import { TRIBE_WORDS, tribePage } from '@/content/tribes';
import { SIGN_IDS } from '@/lib/keys';
import { MEMBER_NAV, PRIMARY_NAV } from '@/lib/site';

const read = (file: string) => readFileSync(path.join(process.cwd(), file), 'utf8');

describe('a short card on Your chart (5c)', () => {
  it('starts with one sentence of the text, never the whole of a long one', () => {
    for (const planet of PLANET_PAGES) {
      for (const text of [...Object.values(planet.signs), ...Object.values(planet.houses)]) {
        const teaser = teaserLine(text)!;
        expect(teaser.length, planet.body).toBeGreaterThan(0);
        expect(paragraphs(text)[0].startsWith(teaser.replace(/…$/, '')), planet.body).toBe(true);
        expect((teaser.match(/[.?](?:\s|$)/g) ?? []).length, teaser).toBeLessThanOrEqual(1);
      }
    }
    expect(teaserLine(undefined)).toBeUndefined();
  });

  it('ends on a whole sentence or at a word, never cut by the card (the audit, Nov 11)', () => {
    let shortened = 0;
    for (const planet of PLANET_PAGES) {
      for (const text of [...Object.values(planet.signs), ...Object.values(planet.houses)]) {
        const teaser = teaserLine(text)!;
        const first = paragraphs(text)[0];
        if (teaser.endsWith('…')) {
          shortened += 1;
          const kept = teaser.slice(0, -1);
          expect(kept.length, teaser).toBeLessThanOrEqual(TEASER_MAX);
          // The cut falls between words, and no comma or colon is left hanging before the mark.
          expect(first[kept.length], teaser).toMatch(/[\s,;:]/);
          expect(kept, teaser).toMatch(/[\p{L}\p{N}.’”)]$/u);
        } else {
          expect(teaser, teaser).toMatch(/[.?!’”)]$/);
        }
      }
    }
    expect(shortened).toBeGreaterThan(0);
    // The clamp that cut a line mid-word is gone: the words decide where a teaser ends.
    expect(read('app/(public)/your-chart/page.tsx')).not.toMatch(/key-card-teaser[^"]*line-clamp/);
  });

  it('keeps the whole text one tap away in a native <details>, with the summary over the closed card', () => {
    const page = read('app/(public)/your-chart/page.tsx');
    expect(page).toMatch(/<details data-key-card=""/);
    expect(page).toMatch(/className=\{cn\('key-card', /);
    const css = read('app/globals.css');
    expect(css).toMatch(/\.key-card > details > summary \{[^}]*position: absolute;[^}]*inset: 0;/);
    // "Read more" stands at the card's foot, and once open the summary is only the strip there.
    expect(css).toMatch(/\.key-card > details > summary \{[^}]*align-items: flex-end;/);
    expect(css).toMatch(/\.key-card > details\[open\] > summary \{[^}]*top: auto;/);
    // A link inside a closed card sits above the summary, so it can be followed.
    expect(css).toMatch(/\.key-card-link \{[^}]*z-index: 1;/);
  });
});

describe('a group of one card (David, Nov 11)', () => {
  it('shares its row on desktop, and keeps both labels for the jump bar', () => {
    const page = read('app/(public)/your-chart/page.tsx');
    // The last two groups stand side by side from lg, each under its own heading.
    expect(page).toMatch(/group\.id === 'healing' && sharesRow/);
    expect(page).toMatch(/\{label\(group\)\}[\s\S]*\{label\(lastGroup\)\}/);
    expect(page).toContain('id={`your-group-${of.id}`}');
  });

  it("never leaves a group's last card alone in its row: it takes the whole row (5e)", () => {
    const page = read('app/(public)/your-chart/page.tsx');
    expect(page).toMatch(/return bodies\.length % 2 === 1 \? bodies\[bodies\.length - 1\] : undefined;/);
    expect(page).toMatch(/cn\('key-card', wide && 'lg:col-span-2'\)/);
    // No star card stands loose in the grid any more.
    expect(page).not.toMatch(/sizes="20rem"/);
  });

  it('shows each star card once on the page (David, Nov 11: "cancer plate twice")', () => {
    const page = read('app/(public)/your-chart/page.tsx');
    // The Sun sign's is the one beside the Keys introduction, so no card shows it again.
    expect(page).toMatch(/backdrop=\{\{ print: `plate-\$\{sun\.sign\}` \}\}/);
    expect(page).toMatch(/const platesShown = new Set<SignId>\(\[sun\.sign\]\);/);
    expect(page).toMatch(/if \(!sign \|\| platesShown\.has\(sign\)\) return;/);
    // Wide cards choose first (theirs shows closed), then the rest in page order.
    expect(page).toMatch(/wides\.forEach\(claimPlate\);\s*groupsShown\.flatMap\(\(group\) => cardsIn\(group\.id\)\)\.forEach\(claimPlate\);/);
    // Every star card a card shows comes from that one plan.
    expect(page.match(/id=\{`plate-\$\{[^}]+\}`\}/g)).toEqual(['id={`plate-${sign}`}', 'id={`plate-${plate}`}']);
    expect(page).toMatch(/plate=\{wide \? plateOf\.get\(planet\.body\) : undefined\}/);
  });

  it('fills the last row of the next steps and of Learn, whatever the count', () => {
    const css = read('app/globals.css');
    expect(css).toMatch(/\.fill-rows > :nth-child\(3n \+ 1\):nth-last-child\(2\),\s*\.fill-rows > :nth-child\(3n \+ 2\):last-child \{\s*grid-column: span 3;/);
    expect(css).toMatch(/\.fill-rows > :nth-child\(3n \+ 1\):last-child \{\s*grid-column: 1 \/ -1;/);
    for (const file of ['app/(public)/your-chart/page.tsx', 'app/(public)/learn/page.tsx', 'app/(public)/learn/[slug]/page.tsx']) {
      expect(read(file), file).toMatch(/className="[^"]*\bfill-rows\b/);
    }
  });
});

describe("Your chart's side list (5d)", () => {
  it('stands beside the groups from lg, where the jump bar steps aside', () => {
    const page = read('app/(public)/your-chart/page.tsx');
    expect(page).toMatch(/<div className="rail-scope relative">/);
    expect(page).toMatch(/hidden lg:block[\s\S]*<ChartRail /);
    expect(page).toMatch(/<nav aria-label=\{yourChartCopy\.keys\.jump\} className="lg:hidden">/);
    expect(read('app/globals.css')).toMatch(/@media \(width >= 64rem\) \{\s*\.rail-scope > section > div:last-child \{\s*padding-left:/);
    // Text over the pictures at the sections' feet sits on a panel.
    expect(read('components/ChartRail.tsx')).toMatch(/className=\{cn\('panel-frost /);
  });
});

describe('the 12 Tribes page (5d)', () => {
  it('is where the Tribes link leads, from every page', () => {
    expect(PRIMARY_NAV[0]).toEqual({ href: '/tribes', label: 'Tribes' });
    const page = read('app/(public)/tribes/page.tsx');
    expect(page).toContain('<SignGlyphSprite />');
  });

  it('says more about each Tribe than the landing grid, in words the Tribe pages already hold', () => {
    const page = read('app/(public)/tribes/page.tsx');
    expect(page).toMatch(/<TribeGuide sign=\{sign\} \/>/);
    expect(page).toMatch(/dawa\.slogans\.join/);
    // What each Tribe is known for is Dawa's own hello line, without the opening all twelve share.
    expect(page).toMatch(/knownFor\(sign\)/);
    for (const sign of SIGN_IDS) {
      const known = knownFor(sign);
      expect(known, sign).toBeTruthy();
      expect(known, sign).not.toMatch(/famous throughout|\.$/);
      expect(known![0], sign).toBe(known![0].toUpperCase());
    }
    // The landing keeps its grid of paintings and links here.
    expect(read('app/(public)/page.tsx')).toMatch(/<Button href=\{tribes\.more\.href\} variant="secondary">/);
    expect(read('content/landing.tsx')).toMatch(/more: \{ href: '\/tribes', label: /);
  });

  it("shows a member's own three only to a member, read by named columns and never a degree", () => {
    expect(read('app/(public)/tribes/page.tsx')).toMatch(/<TintPanel className="member-only /);
    const trio = read('components/YourTrio.tsx');
    expect(trio).toMatch(/\.select\('body, sign'\)/);
    expect(trio).not.toMatch(/adminClient|console\.|select\(.\*/);
  });
});

describe("a member's name in the header (David, Nov 11)", () => {
  it('is never cut short: the photo stands alone and the whole name leads the user menu', () => {
    const account = read('components/HeaderAccount.tsx');
    expect(account).not.toMatch(/className=[^>]*\btruncate\b/);
    expect(account).toMatch(/<p data-account-name=""[^>]*break-words/);
  });
});

describe("the Oracle's Consult (David, Nov 11)", () => {
  it("stands inside the hexagram's card, at its foot", () => {
    const page = read('app/(public)/oracle/page.tsx');
    expect(page).toMatch(/<\/HexagramReading>[\s\S]*<div className="oracle-consult">[\s\S]*<\/article>/);
    expect(page).not.toMatch(/TintPanel/);
    expect(read('app/globals.css')).toMatch(/\.oracle-consult \{\s*margin-top: auto;/);
  });
});

describe('the member links in the main nav (5c)', () => {
  it('lead with Your chart and show only to a signed-in member', () => {
    expect(MEMBER_NAV[0]).toEqual({ href: '/your-chart', label: 'Your chart' });
    expect(read('components/NavLinks.tsx')).toMatch(/MEMBER_NAV\.includes\(link\) \? 'member-only'/);
    expect(read('app/globals.css')).toMatch(/html:not\(\[data-member\]\) \.member-only \{\s*display: none;/);
  });

  it('uses the short labels for everyone (David, Nov 11)', () => {
    expect(PRIMARY_NAV.map((link) => link.label)).toEqual(['Tribes', 'Keys', 'Oracle', "Today's sky", 'Learn']);
  });
});

describe('links that keep their promise (the audit, Nov 11)', () => {
  it('never drop a reader onto the homepage from another page', () => {
    // The homepage's own pin leads to the 12 Tribes page, like the nav and the section's button.
    expect(read('content/landing.tsx')).toMatch(/href: '\/tribes', title: 'Find your Tribe'/);
    for (const file of ['content/keys-page.ts', 'content/tribes.ts', 'content/welcome.ts', 'content/clans.ts', 'lib/site.ts']) {
      expect(read(file), file).not.toMatch(/['"`]\/#/);
    }
    // The 28 Keys page answers the birth time question in place.
    const keys = read('app/(public)/keys/page.tsx');
    expect(keys).toMatch(/<details className="group[^"]*">[\s\S]*?keysPage\.strip\.more\.label[\s\S]*?birthTimeAnswer/);
    expect(keys).toMatch(/item\.id === 'faq-birth-time'/);
  });

  it('lines a quiet button up with the text above it, at every size', () => {
    expect(read('components/Button.tsx')).toMatch(/variant === 'tertiary' \? sizes\[size\]\.replace\(/);
  });

  it('lets the user menu grow to fit a long name before it wraps', () => {
    expect(read('components/HeaderAccount.tsx')).toMatch(/w-max[^"']*max-w-\[min\(20rem,calc\(100vw-2rem\)\)\]/);
  });
});

describe('the member pages (5e, David, Nov 11: "no bg for main section")', () => {
  it('carry an ink landscape at the right from lg, never under words', () => {
    const layout = read('app/(public)/members/layout.tsx');
    expect(layout).toMatch(/<div data-backdrop-from="lg" className="backdrop-region">\s*<BackdropLayer backdrop=\{\{ art: 'p8'[^}]*\}\} reach="screen" \/>/);
    const css = read('app/globals.css');
    expect(css).toMatch(/@media \(width < 64rem\) \{\s*\[data-backdrop-from="lg"\] > \.backdrop-layer\[data-reach="screen"\] \{\s*display: none;/);
    expect(css).toMatch(/\[data-backdrop-from="lg"\] > \.backdrop-layer\[data-reach="screen"\] \{[^}]*height: min\(calc\(100% - 8rem\), 44rem\);/);
    // What stands in the right column of a member page is on a card.
    expect(read('components/HelloPanel.tsx')).toMatch(/id="hello"[\s\S]{0,120}className="[^"]*bg-surface-200[^"]*"/);
    expect(read('app/(public)/members/messages/page.tsx')).toMatch(/<aside className="[^"]*bg-surface-200[^"]*">/);
  });
});

describe("a Tribe's people in a sentence", () => {
  it('keep their capital letter ("Meet your fellow Scorpios")', () => {
    for (const words of Object.values(TRIBE_WORDS)) {
      const titles = tribePage.opening.items(words.fellows, 'Scorpio').map((item) => item.title);
      expect(titles.some((title) => title.includes(words.fellows)), words.fellows).toBe(true);
      expect(words.fellows[0]).toBe(words.fellows[0].toUpperCase());
    }
  });
});
