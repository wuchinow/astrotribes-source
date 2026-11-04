import type { SignId } from '@/lib/keys';

// Famous charts (3r, Nov 4, David: "let's just build it"): well-known people who have died, for
// members to see their connection points with, while the members list fills up and after. They are
// never shown as members. Each is a deceased historical figure's public birth record, which is
// outside invariant 8 (David, Sep 24), the same as Einstein's chart on the 28 Keys page.
//
// The birth records follow Astro-Databank's published data, rated AA (from a birth certificate or
// record) or A (from the person or family) on the Rodden scale, as known when this was written. They
// were not checked one by one against astro.com, whose pages can't be read from here: `checked`
// flips to true as David or Dawa confirm each. The credit and a read of Astro-Databank's terms
// come before any paywall (David, Nov 4). Times are the local clock at the birthplace; the engine
// finds the zone and uses local mean time before standard time.
//
// PLACEHOLDER: the one-line descriptions are ours, for Dawa to revise. Names only in the line, no
// key names (lib/keys.ts types those).

export type Rodden = 'AA' | 'A';

export interface FamousChart {
  /** The address: /famous/<slug>. */
  slug: string;
  name: string;
  /** One plain line on who they were. PLACEHOLDER. */
  line: string;
  /** The Tribe they are listed under: their Sun sign, checked against the engine by a test. */
  tribe: SignId;
  birth: { date: string; time: string; lat: number; lon: number };
  /** Where, as the page says it. */
  place: string;
  /** The years of birth and death. Everyone here has died. */
  born: number;
  died: number;
  rodden: Rodden;
  /** True once David or Dawa has checked the record on Astro-Databank. */
  checked: boolean;
}

const c = (
  slug: string,
  name: string,
  line: string,
  tribe: SignId,
  date: string,
  time: string,
  lat: number,
  lon: number,
  place: string,
  died: number,
  rodden: Rodden,
): FamousChart => ({
  slug,
  name,
  line,
  tribe,
  birth: { date, time, lat, lon },
  place,
  born: Number(date.slice(0, 4)),
  died,
  rodden,
  checked: false,
});

/** Four per Tribe, in zodiac order. */
export const FAMOUS_CHARTS: readonly FamousChart[] = [
  c('vincent-van-gogh', 'Vincent van Gogh', 'Dutch painter of sunflowers and starry skies', 'aries', '1853-03-30', '11:00', 51.47, 4.66, 'Zundert, Netherlands', 1890, 'AA'),
  c('bette-davis', 'Bette Davis', 'Hollywood actor, twice an Oscar winner', 'aries', '1908-04-05', '23:56', 42.63, -71.32, 'Lowell, Massachusetts', 1989, 'AA'),
  c('marlon-brando', 'Marlon Brando', 'Actor who changed how films are acted', 'aries', '1924-04-03', '23:00', 41.26, -95.94, 'Omaha, Nebraska', 2004, 'AA'),
  c('maya-angelou', 'Maya Angelou', 'Poet and memoirist', 'aries', '1928-04-04', '14:10', 38.63, -90.2, 'St. Louis, Missouri', 2014, 'AA'),

  c('sigmund-freud', 'Sigmund Freud', 'Founder of psychoanalysis', 'taurus', '1856-05-06', '18:30', 49.64, 18.14, 'Příbor, Czech Republic', 1939, 'AA'),
  c('katharine-hepburn', 'Katharine Hepburn', 'Actor, four times an Oscar winner', 'taurus', '1907-05-12', '17:47', 41.76, -72.69, 'Hartford, Connecticut', 2003, 'AA'),
  c('orson-welles', 'Orson Welles', 'Actor and director of Citizen Kane', 'taurus', '1915-05-06', '07:00', 42.58, -87.82, 'Kenosha, Wisconsin', 1985, 'AA'),
  c('audrey-hepburn', 'Audrey Hepburn', 'Actor and UNICEF ambassador', 'taurus', '1929-05-04', '03:00', 50.83, 4.37, 'Ixelles, Belgium', 1993, 'AA'),

  c('marilyn-monroe', 'Marilyn Monroe', 'Actor and screen icon', 'gemini', '1926-06-01', '09:30', 34.05, -118.24, 'Los Angeles, California', 1962, 'AA'),
  c('john-f-kennedy', 'John F. Kennedy', 'The 35th president of the United States', 'gemini', '1917-05-29', '15:00', 42.33, -71.12, 'Brookline, Massachusetts', 1963, 'A'),
  c('prince', 'Prince', 'Musician from Minneapolis', 'gemini', '1958-06-07', '18:17', 44.98, -93.27, 'Minneapolis, Minnesota', 2016, 'AA'),
  c('judy-garland', 'Judy Garland', 'Singer and actor, Dorothy in The Wizard of Oz', 'gemini', '1922-06-10', '06:00', 47.24, -93.53, 'Grand Rapids, Minnesota', 1969, 'AA'),

  c('ernest-hemingway', 'Ernest Hemingway', 'Novelist of The Old Man and the Sea', 'cancer', '1899-07-21', '08:00', 41.89, -87.78, 'Oak Park, Illinois', 1961, 'AA'),
  c('frida-kahlo', 'Frida Kahlo', 'Mexican painter of self-portraits', 'cancer', '1907-07-06', '08:30', 19.35, -99.16, 'Coyoacán, Mexico City', 1954, 'A'),
  c('diana-princess-of-wales', 'Diana, Princess of Wales', 'Princess of Wales and campaigner', 'cancer', '1961-07-01', '19:45', 52.83, 0.51, 'Sandringham, England', 1997, 'A'),
  c('robin-williams', 'Robin Williams', 'Comedian and actor', 'cancer', '1951-07-21', '13:34', 41.88, -87.63, 'Chicago, Illinois', 2014, 'AA'),

  c('carl-jung', 'Carl Jung', 'Swiss psychiatrist who wrote about archetypes', 'leo', '1875-07-26', '19:32', 47.6, 9.32, 'Kesswil, Switzerland', 1961, 'A'),
  c('coco-chanel', 'Coco Chanel', 'Fashion designer', 'leo', '1883-08-19', '16:00', 47.26, -0.08, 'Saumur, France', 1971, 'AA'),
  c('andy-warhol', 'Andy Warhol', 'Pop artist', 'leo', '1928-08-06', '06:30', 40.44, -80.0, 'Pittsburgh, Pennsylvania', 1987, 'A'),
  c('jerry-garcia', 'Jerry Garcia', 'Guitarist of the Grateful Dead', 'leo', '1942-08-01', '12:05', 37.77, -122.42, 'San Francisco, California', 1995, 'AA'),

  c('peter-sellers', 'Peter Sellers', 'Comic actor of the Pink Panther films', 'virgo', '1925-09-08', '06:00', 50.78, -1.09, 'Southsea, England', 1980, 'AA'),
  c('agatha-christie', 'Agatha Christie', 'Mystery novelist', 'virgo', '1890-09-15', '04:00', 50.46, -3.53, 'Torquay, England', 1976, 'A'),
  c('greta-garbo', 'Greta Garbo', 'Swedish actor of silent and early sound films', 'virgo', '1905-09-18', '19:30', 59.33, 18.07, 'Stockholm, Sweden', 1990, 'AA'),
  c('ingrid-bergman', 'Ingrid Bergman', 'Swedish actor, the star of Casablanca', 'virgo', '1915-08-29', '03:30', 59.33, 18.07, 'Stockholm, Sweden', 1982, 'AA'),

  c('friedrich-nietzsche', 'Friedrich Nietzsche', 'German philosopher', 'libra', '1844-10-15', '10:00', 51.24, 12.12, 'Röcken, Germany', 1900, 'AA'),
  c('eleanor-roosevelt', 'Eleanor Roosevelt', 'First lady and champion of human rights', 'libra', '1884-10-11', '11:00', 40.71, -74.01, 'New York, New York', 1962, 'AA'),
  c('t-s-eliot', 'T. S. Eliot', 'Poet of The Waste Land', 'libra', '1888-09-26', '07:45', 38.63, -90.2, 'St. Louis, Missouri', 1965, 'AA'),
  c('john-lennon', 'John Lennon', 'Songwriter of the Beatles', 'libra', '1940-10-09', '18:30', 53.41, -2.98, 'Liverpool, England', 1980, 'A'),

  c('pablo-picasso', 'Pablo Picasso', 'Spanish painter and sculptor', 'scorpio', '1881-10-25', '23:15', 36.72, -4.42, 'Málaga, Spain', 1973, 'AA'),
  c('indira-gandhi', 'Indira Gandhi', 'Prime minister of India', 'scorpio', '1917-11-19', '23:11', 25.44, 81.85, 'Prayagraj (Allahabad), India', 1984, 'A'),
  c('grace-kelly', 'Grace Kelly', 'Actor, then Princess of Monaco', 'scorpio', '1929-11-12', '05:31', 39.95, -75.17, 'Philadelphia, Pennsylvania', 1982, 'AA'),
  c('carl-sagan', 'Carl Sagan', 'Astronomer and host of Cosmos', 'scorpio', '1934-11-09', '17:05', 40.65, -73.95, 'Brooklyn, New York', 1996, 'AA'),

  c('louisa-may-alcott', 'Louisa May Alcott', 'Novelist of Little Women', 'sagittarius', '1832-11-29', '00:30', 40.04, -75.17, 'Germantown, Pennsylvania', 1888, 'A'),
  c('walt-disney', 'Walt Disney', 'Animator and studio founder', 'sagittarius', '1901-12-05', '00:35', 41.88, -87.63, 'Chicago, Illinois', 1966, 'AA'),
  c('bruce-lee', 'Bruce Lee', 'Martial artist and actor', 'sagittarius', '1940-11-27', '07:12', 37.79, -122.41, 'San Francisco, California', 1973, 'AA'),
  c('jimi-hendrix', 'Jimi Hendrix', 'Guitarist and songwriter', 'sagittarius', '1942-11-27', '10:15', 47.61, -122.33, 'Seattle, Washington', 1970, 'AA'),

  c('martin-luther-king-jr', 'Martin Luther King Jr.', 'Minister and civil rights leader', 'capricorn', '1929-01-15', '12:00', 33.75, -84.39, 'Atlanta, Georgia', 1968, 'A'),
  c('elvis-presley', 'Elvis Presley', 'Singer, the king of rock and roll', 'capricorn', '1935-01-08', '04:35', 34.26, -88.7, 'Tupelo, Mississippi', 1977, 'A'),
  c('muhammad-ali', 'Muhammad Ali', 'Boxer, three times heavyweight champion', 'capricorn', '1942-01-17', '18:35', 38.25, -85.76, 'Louisville, Kentucky', 2016, 'AA'),
  c('janis-joplin', 'Janis Joplin', 'Blues and rock singer', 'capricorn', '1943-01-19', '09:45', 29.88, -93.94, 'Port Arthur, Texas', 1970, 'AA'),

  c('lewis-carroll', 'Lewis Carroll', "Author of Alice's Adventures in Wonderland", 'aquarius', '1832-01-27', '03:48', 53.34, -2.63, 'Daresbury, England', 1898, 'A'),
  c('virginia-woolf', 'Virginia Woolf', 'Novelist of Mrs Dalloway', 'aquarius', '1882-01-25', '12:15', 51.5, -0.18, 'London, England', 1941, 'A'),
  c('franklin-d-roosevelt', 'Franklin D. Roosevelt', 'The 32nd president of the United States', 'aquarius', '1882-01-30', '20:45', 41.78, -73.93, 'Hyde Park, New York', 1945, 'AA'),
  c('james-dean', 'James Dean', 'Actor in Rebel Without a Cause', 'aquarius', '1931-02-08', '02:00', 40.56, -85.66, 'Marion, Indiana', 1955, 'AA'),

  c('victor-hugo', 'Victor Hugo', 'French novelist of Les Misérables', 'pisces', '1802-02-26', '22:30', 47.24, 6.02, 'Besançon, France', 1885, 'AA'),
  c('albert-einstein', 'Albert Einstein', 'Physicist of relativity', 'pisces', '1879-03-14', '11:30', 48.4, 10, 'Ulm, Germany', 1955, 'AA'),
  c('elizabeth-taylor', 'Elizabeth Taylor', 'Actor and AIDS campaigner', 'pisces', '1932-02-27', '02:00', 51.56, -0.18, 'London, England', 2011, 'AA'),
  c('kurt-cobain', 'Kurt Cobain', 'Singer and guitarist of Nirvana', 'pisces', '1967-02-20', '19:20', 46.98, -123.82, 'Aberdeen, Washington', 1994, 'AA'),
];

/** The famous chart for a name on a Tribe page, when there is one. */
export const famousByName = (name: string): FamousChart | undefined => FAMOUS_CHARTS.find((f) => f.name === name);

export const famousBySlug = (slug: string): FamousChart | undefined => FAMOUS_CHARTS.find((f) => f.slug === slug);
