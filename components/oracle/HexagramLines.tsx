import { oracleCopy } from '@/content/oracle/copy';
import { cn } from '@/lib/cn';

interface HexagramLinesProps {
  number: number;
  /** Bottom line first; 1 is unbroken. */
  lines: readonly number[];
  /** Set the number above the lines in ember-500, the one red on the screen (Walker's mark plus number). */
  numeral?: boolean;
  /** Changing lines, bottom first, marked in ink: a ring on a moving nine, a cross on a moving six. */
  changing?: readonly boolean[];
  className?: string;
}

const BAR = 5;
const GAP = 10;
const WIDTH = 96;
const HEIGHT = BAR * 6 + GAP * 5;

/**
 * The six lines drawn clean, bottom line at the bottom, with the ember numeral above them, never
 * behind them, so the number and the lines each read on their own (David, Oct 21).
 */
export function HexagramLines({ number, lines, numeral = false, changing, className }: HexagramLinesProps) {
  const words = lines.map((line) => (line ? oracleCopy.lineWords.unbroken : oracleCopy.lineWords.broken)).join(', ');
  return (
    <div className="hexagram-lines flex flex-col items-center gap-2">
      {numeral ? (
        <span aria-hidden="true" className="hexagram-numeral">
          {number}
        </span>
      ) : null}
      <svg
        role="img"
        aria-label={oracleCopy.lineWords.figure(number, words)}
        viewBox={`-4 -4 ${WIDTH + 8 + (changing ? 22 : 0)} ${HEIGHT + 8}`}
        className={cn('block h-auto shrink-0', className)}
      >
        {lines.map((line, i) => {
          const y = HEIGHT - BAR - i * (BAR + GAP);
          const moving = changing?.[i];
          return (
            <g key={i}>
              {line ? (
                <rect className="hexagram-bar" x={0} y={y} width={WIDTH} height={BAR} />
              ) : (
                <>
                  <rect className="hexagram-bar" x={0} y={y} width={WIDTH * 0.42} height={BAR} />
                  <rect className="hexagram-bar" x={WIDTH * 0.58} y={y} width={WIDTH * 0.42} height={BAR} />
                </>
              )}
              {moving ? (
                line ? (
                  <circle className="hexagram-mark" cx={WIDTH + 14} cy={y + BAR / 2} r={5} />
                ) : (
                  <path className="hexagram-mark" d={`M${WIDTH + 9} ${y - 1}l10 10m0 -10l-10 10`} />
                )
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
