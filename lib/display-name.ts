// A member's display name (2b): the name other members see, chosen on our own form, never Google's.
/** The name other members see: 1 to 40 characters, the same rule as 0001's check. */
export const cleanDisplayName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const name = value.replace(/\s+/g, ' ').trim();
  return name.length >= 1 && [...name].length <= 40 ? name : null;
};
