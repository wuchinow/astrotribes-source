// The article before a body's name, in its own small file so the chart wheel (a browser script) can
// use it without carrying the planet pages' words.

/**
 * "the Sun", "the Moon", "the North Node", "Jupiter": the article Dawa asked for (Nov 5, and Nov 7 for
 * every sentence on the site). Every sentence that names a body takes it through here, or through The.
 */
export const the = (name: string) =>
  (['Sun', 'Moon', 'North Node', 'South Node', 'Galactic Center'].includes(name) ? `the ${name}` : name);

/** The same, starting a sentence: "The Sun", "Jupiter". */
export const The = (name: string) => {
  const named = the(name);
  return named.charAt(0).toUpperCase() + named.slice(1);
};
