import type { ReactNode } from 'react';
import { oracleCopy } from '@/content/oracle/copy';
import type { Hexagram } from '@/lib/iching';

interface HexagramReadingProps {
  hexagram: Hexagram;
  /** Heading level for the parts ("The judgment", "The image"). */
  partAs?: 'h3' | 'h4';
  /**
   * The daily card: the judgment only. The image and the six line texts open in a modal from the
   * card's button (HexagramMore, passed as children; a daily reading has no changing lines).
   * Consult shows the judgment and the image.
   */
  fold?: boolean;
  /** What sits between the reading and its source note (Consult's changing lines, the daily card's button). */
  children?: ReactNode;
  /** The source note; Consult shows it once, under the last reading. */
  note?: boolean;
}

/**
 * After the framed header, Walker's order: one italic line, then the reading at measure. The italic
 * line is a phrase quoted from Legge; the reading is his judgment and his image, verbatim. Under it,
 * the quiet ink-500 note that says whose words these are and that ours are on the way.
 */
export function HexagramReading({ hexagram, partAs: Part = 'h3', fold = false, children, note = true }: HexagramReadingProps) {
  const { reading } = hexagram;
  const [judgment, ...rest] = reading.body;
  const part = (p: { heading: string; text: string }) => (
    <section key={p.heading} className="mt-7">
      <Part className="mb-2 type-label text-ink-500">{p.heading}</Part>
      <p className="type-body text-ink-700">{p.text}</p>
    </section>
  );
  return (
    <>
      <p className="oracle-line">{reading.line}</p>
      <div className="max-w-measure">
        {part(judgment)}
        {fold ? null : rest.map(part)}
        {children}
        {note ? (
          <p className="mt-8 type-caption text-ink-500">
            {reading.credit}
            {reading.reviewed ? null : ` ${oracleCopy.onItsWay}`}
          </p>
        ) : null}
      </div>
    </>
  );
}

