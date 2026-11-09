// The Clan and Vibe pages (4l, Nov 8): Dawa's words reach every sign, the drafts are complete, the
// member lists only narrow what the database already lets a member see, and the famous Moons and
// risings come from the engine.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { planetPage } from '@/content/planets';
import { VIBE_DRAFTS, VIBE_LINES, vibeIntro } from '@/content/vibes';
import { famousCharts, famousWith } from '@/lib/famous';
import { KEYS, SIGN_IDS, type SignId } from '@/lib/keys';
import { MIN_TOTAL, mates } from '@/lib/mates';
import type { PlacementRow } from '@/lib/shared-keys';

describe('the Clan and Vibe pages', () => {
  it('have Dawa’s Moon paragraph and all twelve Hearth lines for every Clan', () => {
    const moon = planetPage('moon')!;
    for (const sign of SIGN_IDS) expect(moon.signs[sign], sign).toBeTruthy();
    for (let house = 1; house <= 12; house++) expect(moon.houses[house as 1]).toBeTruthy();
    // His note on the Clan: the Moon, the Sun lighting the Moon, and the Hearth, in that order.
    const note = moon.signsNote!.split('\n\n');
    expect(note).toHaveLength(3);
    expect(note[1]).toMatch(/reflects the light of the Sun/);
    expect(note[2]).toMatch(/hearth/);
  });

  it('have Dawa’s line and a drafted paragraph for every Vibe, with no em dash or exclamation mark', () => {
    for (const sign of SIGN_IDS) {
      expect(VIBE_LINES[sign], sign).toBeTruthy();
      expect(VIBE_DRAFTS[sign].length, sign).toBeGreaterThan(250);
      expect(`${VIBE_LINES[sign]} ${VIBE_DRAFTS[sign]}`, sign).not.toMatch(/[—!]/);
    }
    expect(vibeIntro(KEYS.risingSign.name)[1]).toContain(`“${KEYS.risingSign.name}”`);
  });

  it('list the famous Moons and risings the engine finds, every famous chart in one of each', () => {
    let moons = 0;
    let risings = 0;
    for (const sign of SIGN_IDS) {
      for (const person of famousWith('moon', sign)) {
        const worked = famousCharts().find((w) => w.chart.slug === person.slug)!;
        expect(worked.placements.find((row) => row.body === 'moon')!.sign).toBe(sign);
        moons++;
      }
      risings += famousWith('rising', sign).length;
    }
    expect(moons).toBe(famousCharts().length);
    expect(risings).toBe(famousCharts().length);
  });

  it('send the member lists through the members list’s own read, never the admin client', () => {
    const page = readFileSync('components/MatesPage.tsx', 'utf8');
    expect(page).toMatch(/visibleMembers\(supabase, user\.id, mine\)/);
    expect(page).toMatch(/auth\.getUser\(\)/);
    expect(page).not.toMatch(/supabase\/admin|SUPABASE_SECRET_KEY|birth_data/);
  });
});

const row = (body: PlacementRow['body'], sign: SignId, house: PlacementRow['house'] = null): PlacementRow => ({ body, sign, house });
const person = (id: string, sun: SignId, moon: SignId, rising?: SignId, moonHouse: PlacementRow['house'] = null) => ({
  id,
  placements: [row('sun', sun), row('moon', moon, moonHouse), ...(rising ? [row('rising', rising)] : [])],
});

describe('Clanmates and Vibemates', () => {
  const mine = [row('sun', 'aries'), row('moon', 'leo', 5), row('rising', 'pisces')];

  it('narrow the visible members to one sign and set apart those who share the viewer’s Tribe, Vibe, or Hearth', () => {
    const members = [
      person('a', 'aries', 'leo'),
      person('b', 'taurus', 'leo', 'pisces'),
      person('c', 'gemini', 'leo', 'virgo', 5),
      person('d', 'aries', 'virgo'),
    ];
    const found = mates(members, mine, 'moon', 'leo');
    expect(found.all.map((m) => m.id)).toEqual(['a', 'b', 'c']);
    expect(found.groups.map((g) => [g.kind, g.value, g.members.map((m) => m.id)])).toEqual([
      ['tribe', 'aries', ['a']],
      ['vibe', 'pisces', ['b']],
      ['hearth', 5, ['c']],
    ]);
    // Three others and the viewer: under five, so no total.
    expect(found.total).toBeNull();
  });

  it('show the total from five up, counting the viewer only when they belong', () => {
    const four = ['a', 'b', 'c', 'd'].map((id) => person(id, 'cancer', 'leo'));
    expect(mates(four, mine, 'moon', 'leo').total).toBe(MIN_TOTAL);
    expect(mates(four, [row('sun', 'aries'), row('moon', 'virgo')], 'moon', 'leo').total).toBeNull();
  });

  it('list only members with a rising sign on a Vibe, and set apart the viewer’s Tribe and Clan', () => {
    const members = [person('a', 'aries', 'virgo', 'pisces'), person('b', 'libra', 'leo', 'pisces'), person('c', 'libra', 'leo')];
    const found = mates(members, mine, 'rising', 'pisces');
    expect(found.all.map((m) => m.id)).toEqual(['a', 'b']);
    expect(found.groups.map((g) => [g.kind, g.members.map((m) => m.id)])).toEqual([
      ['tribe', ['a']],
      ['clan', ['b']],
    ]);
  });

  it('set nothing apart for a viewer with no birth time beyond what they have', () => {
    const noTime = [row('sun', 'aries'), row('moon', 'leo')];
    const found = mates([person('a', 'taurus', 'leo', 'pisces', 5)], noTime, 'moon', 'leo');
    expect(found.groups).toEqual([]);
  });
});

describe('generational families (4r)', () => {
  it('list everyone with the planet in the sign, whatever their Tribe, with the viewer’s Tribe set apart', () => {
    const withPluto = (id: string, sun: SignId, pluto: SignId) => ({
      id,
      placements: [row('sun', sun), row('moon', 'leo'), row('pluto', pluto)],
    });
    const mine = [row('sun', 'aries'), row('moon', 'leo'), row('pluto', 'scorpio')];
    const members = [withPluto('a', 'aries', 'scorpio'), withPluto('b', 'virgo', 'scorpio'), withPluto('c', 'aries', 'libra')];
    const found = mates(members, mine, 'pluto', 'scorpio');
    expect(found.all.map((m) => m.id)).toEqual(['a', 'b']);
    expect(found.groups.map((g) => [g.kind, g.members.map((m) => m.id)])).toEqual([['tribe', ['a']]]);
  });

  it('have a drafted paragraph after Dawa’s line for every Uranus sign, with no em dash or exclamation mark', () => {
    const uranus = planetPage('uranus')!;
    for (const sign of SIGN_IDS) {
      const [his, ours] = uranus.signs[sign]!.split('\n\n');
      expect(his, sign).toMatch(/^The Uranus in/);
      expect(ours, sign).toMatch(/^Uranus (was|is)/);
      expect(ours, sign).not.toMatch(/[—!]/);
    }
  });
});
