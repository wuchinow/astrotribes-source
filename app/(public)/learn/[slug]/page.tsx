import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/ArticleBody';
import { ArticleCard, OlderKeysNote } from '@/components/ArticleCard';
import { Button } from '@/components/Button';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { ARTICLES, SERIES, SUBSTACK_URL, learnCopy as copy, learnHref, slugOf } from '@/content/articles';
import { longDate } from '@/content/famous';
import { wordsIn } from '@/lib/article-html';
import { learnArticle } from '@/lib/substack';

// Dawa's Substack feed is read again at most once an hour (3y), so an edit he makes there reaches
// this page within the hour. A post the feed adds later gets its page on the first visit.
export const revalidate = 3600;

export function generateStaticParams() {
  return [...SERIES, ...ARTICLES].map((article) => ({ slug: slugOf(article.url) }));
}

export async function generateMetadata({ params }: PageProps<'/learn/[slug]'>): Promise<Metadata> {
  const found = await learnArticle((await params).slug);
  if (!found) return { title: copy.title };
  return { title: found.article.title, description: found.article.excerpt || copy.description };
}

const linkClass =
  'inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline-offset-4 hover:underline';

/**
 * One of Dawa's articles in full (4w, David, Nov 9: read on the site, not on Substack). The body
 * comes from his feed through lib/article-html.ts; while the feed cannot be read the page shows the
 * excerpt and a link to the post on Substack. Then the next part of the series, his Substack for new
 * articles by email, and the other articles. Public, no member data.
 */
export default async function LearnArticlePage({ params }: PageProps<'/learn/[slug]'>) {
  const found = await learnArticle((await params).slug);
  if (!found) notFound();
  const { article, part, series, articles } = found;
  const next = part ? series[part] : undefined;
  const previous = part && part > 1 ? series[part - 2] : undefined;
  // Keep reading: the rest of the series from a series part, the other articles otherwise.
  const more = (part ? [...series.slice(part), ...series.slice(0, part - 1)] : articles.filter((entry) => entry.url !== article.url)).slice(0, 3);

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Link href="/learn" className={linkClass}>
        {copy.back}
      </Link>
      <article data-learn-article="" className="mt-6">
        <Eyebrow>{part ? copy.seriesPart(part) : copy.articleEyebrow}</Eyebrow>
        <h1 className="max-w-[24ch] type-display-xl text-ink-900">{article.title}</h1>
        {article.excerpt ? <Lede className="mt-4">{article.excerpt}</Lede> : null}
        <p className="mt-4 type-caption text-ink-500">
          {copy.byline} · <time dateTime={article.date}>{longDate(article.date)}</time>
          {article.content ? ` · ${copy.minutes(wordsIn(article.content))}` : null}
        </p>

        {article.olderKeys ? <OlderKeysNote className="mt-6" /> : null}
        {article.content ? (
          <ArticleBody nodes={article.content} className="mt-10" />
        ) : (
          <div className="mt-10 max-w-measure">
            <p className="type-body text-ink-700">{copy.unavailable}</p>
            <div className="mt-6">
              <Button href={article.url} variant="secondary" newTab>
                {copy.readThere}
              </Button>
            </div>
          </div>
        )}

        {next || previous ? (
          <nav aria-label={copy.seriesNav} className="mt-12 flex max-w-measure flex-col gap-1 border-t border-ink-200 pt-6">
            {next ? (
              <Link href={learnHref(next)} className={linkClass}>
                {copy.next(next.title)}
              </Link>
            ) : null}
            {previous ? (
              <Link href={learnHref(previous)} className={linkClass}>
                {copy.previous(previous.title)}
              </Link>
            ) : null}
          </nav>
        ) : null}

        {/* The author box at the article's foot (David's Lean Leap resources pages, Nov 9). */}
        <aside aria-labelledby="learn-about" className="mt-10 max-w-measure rounded-md border border-ink-200 bg-surface-200 p-6">
          <h2 id="learn-about" className="type-heading-3 text-ink-900">
            {copy.aboutHeading}
          </h2>
          <p className="mt-2 type-body text-ink-700">{copy.about}</p>
          <p className="mt-2 type-body text-ink-700">{copy.subscribeLine}</p>
          <div className="mt-4">
            <Button href={SUBSTACK_URL} variant="secondary" newTab>
              {copy.subscribe}
            </Button>
          </div>
        </aside>
      </article>

      {more.length > 0 ? (
        <section aria-labelledby="learn-more" className="mt-16 border-t border-ink-200 pt-12">
          <Headline id="learn-more" line={copy.moreHeading} accent={copy.moreAccent} inline />
          <ul role="list" className="fill-rows mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((entry) => (
              <ArticleCard
                key={entry.url}
                article={entry}
                eyebrow={part ? copy.part(series.indexOf(entry) + 1) : undefined}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
