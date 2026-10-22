import { oracleCopy } from '@/content/oracle/copy';
import { cn } from '@/lib/cn';
import type { Hexagram, Trigram } from '@/lib/iching';
import { HexagramLines } from './HexagramLines';

interface HexagramFrameProps {
  hexagram: Hexagram;
  upper: Trigram;
  lower: Trigram;
  /** The heading's id, for aria-labelledby. */
  headingId?: string;
  as?: 'h2' | 'h3';
  /** The ember numeral: only on the one hexagram per screen that carries it. */
  numeral?: boolean;
  changing?: readonly boolean[];
  className?: string;
}

/**
 * The framed header after Brian Browne Walker's reading screen (design system, Reading card): a
 * hairline ink frame around the title (the characters and the modern pinyin), the two trigrams
 * (pinyin and image), and the six lines with the number above them.
 * The characters are aria-hidden: the heading gives the name in text.
 */
export function HexagramFrame({
  hexagram,
  upper,
  lower,
  headingId,
  as: Tag = 'h2',
  numeral = false,
  changing,
  className,
}: HexagramFrameProps) {
  return (
    <div className={cn('hexagram-frame', className)}>
      <Tag id={headingId} className="hexagram-title">
        <span className="hexagram-no">
          {oracleCopy.hexagram} {hexagram.number}
          <span className="sr-only">: </span>
        </span>
        <span aria-hidden="true" lang="zh-Hant" className="hexagram-chars">
          {hexagram.chinese}
        </span>
        <span className="hexagram-pinyin">{hexagram.pinyin}</span>
      </Tag>
      <dl className="hexagram-trigrams">
        <div>
          <dt className="sr-only">{oracleCopy.above}</dt>
          <dd>
            {upper.pinyin}, {upper.image}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{oracleCopy.below}</dt>
          <dd>
            {lower.pinyin}, {lower.image}
          </dd>
        </div>
      </dl>
      <HexagramLines
        number={hexagram.number}
        lines={hexagram.lines}
        numeral={numeral}
        changing={changing}
        className={changing ? 'w-[6.5rem] md:w-[7.75rem]' : 'w-[5.5rem] md:w-[6.75rem]'}
      />
    </div>
  );
}
