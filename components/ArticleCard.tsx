import Link from 'next/link';
import { learnCopy as copy, learnHref, type Article } from '@/content/articles';
import { longDate } from '@/content/famous';
import { cn } from '@/lib/cn';

/**
 * One article as a card that opens its page on the site (4w): the whole card is the link (people
 * click a card's title far more than a "read more"), with the article's opening lines, or the
 * excerpt while the feed cannot be read.
 */
export function ArticleCard({ article, eyebrow }: { article: Article; eyebrow?: string }) {
  return (
    <li>
      <Link
        href={learnHref(article)}
        className="flex h-full flex-col rounded-md border border-ink-200 bg-surface-200 p-4 text-ink-700 no-underline shadow-rest transition-shadow duration-200 hover:shadow-warm md:p-6"
      >
        {eyebrow ? <p className="type-label text-ink-500">{eyebrow}</p> : null}
        <h3 className="mt-1 type-heading-3 text-ink-900">{article.title}</h3>
        {article.opening || article.excerpt ? (
          <p className="mt-2 line-clamp-5 type-body-sm">{article.opening || article.excerpt}</p>
        ) : null}
        <p className="mt-auto flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-4">
          <time dateTime={article.date} className="type-caption text-ink-500">
            {longDate(article.date)}
          </time>
          <span className="type-ui text-cobalt-600">{copy.read}</span>
        </p>
      </Link>
    </li>
  );
}


/** Over an article that lists Key names Dawa has changed since (4w): where today's names are. */
export function OlderKeysNote({ className }: { className?: string }) {
  return (
    <p data-older-keys="" className={cn('max-w-measure rounded-md border border-ink-200 bg-surface-200 px-4 py-3 type-body-sm text-ink-700', className)}>
      {copy.olderKeysNote}{' '}
      <Link href="/keys" className="text-cobalt-600 underline underline-offset-4">
        {copy.olderKeysLink}
      </Link>
      .
    </p>
  );
}
