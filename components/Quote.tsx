import type { Quote as QuoteData } from '@/content/quotes';
import { cn } from '@/lib/cn';

/** A quote with a gold rule at its left and who said it under it. */
export function Quote({
  quote,
  className,
  size = 'md',
  wide = false,
}: {
  quote: QuoteData;
  className?: string;
  size?: 'md' | 'lg';
  /** A longer quote reads at 56 characters a line instead of 40. */
  wide?: boolean;
}) {
  return (
    <figure className={cn('border-l-2 border-gold-500 pl-5', className)}>
      <blockquote
        className={cn(
          'font-display italic leading-snug text-ink-900',
          wide ? 'max-w-[56ch]' : 'max-w-[40ch]',
          size === 'lg' ? 'text-[1.5rem] md:text-[1.75rem]' : 'text-[1.25rem] md:text-[1.375rem]',
        )}
      >
        {`“${quote.text}”`}
      </blockquote>
      <figcaption className="mt-2 type-body-sm text-ink-700">{quote.by}</figcaption>
    </figure>
  );
}
