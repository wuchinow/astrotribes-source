import { Fragment } from 'react';

/**
 * Copy with Dawa's italics: a word between asterisks, as in "uniquely *you*", is set in italics.
 * Only that; anything else in the text shows as written.
 */
export function Stressed({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>));
}
