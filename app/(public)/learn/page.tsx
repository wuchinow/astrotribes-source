import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleBody } from '@/components/ArticleBody';
import { ArticleCard, OlderKeysNote } from '@/components/ArticleCard';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import {
  FEATURED_URL,
  SERIES_TITLE,
  SUBSTACK_URL,
  VIDEOS,
  learnCopy as copy,
  learnHref,
} from '@/content/articles';
import { longDate } from '@/content/famous';
import { wordsIn } from '@/lib/article-html';
import { learnArticles } from '@/lib/substack';

// Dawa's Substack feed is read again at most once an hour (3y).
export const revalidate = 3600;

export const metadata: Metadata = { title: copy.title, description: copy.description };

/**
 * Learn (David, Nov 4): Dawa's articles and a place for his videos once they exist. Since 4w (David,
 * Nov 9) the series' introduction reads in full on the page, by scrolling, under the hero, and every
 * other card opens the article in full on its own page here (/learn/[slug]), not on Substack. Public, no member data. The articles come
 * from his Substack feed, read again at most once an hour (3y, lib/substack.ts). Since 4m (David,
 * Nov 8: break up the text-heavy pages) the hero stands on an ink landscape wash (P6) with its words
 * on a frosted panel, the series takes the soft gradient, and the videos section an ink landscape
 * beside its words while it holds none; the sections still alternate the page tone and the band.
 */
export default async function LearnPage() {
  const { series: SERIES, articles: ARTICLES } = await learnArticles();
  const featuredIndex = SERIES.findIndex((article) => article.url === FEATURED_URL);
  const featured = SERIES[featuredIndex] ?? ARTICLES.find((article) => article.url === FEATURED_URL);
  const after = featuredIndex >= 0 ? SERIES[featuredIndex + 1] : undefined;
  return (
    <>
      <ArtWash piece="p6" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          <div className="panel-frost max-w-[40rem] p-6 md:p-10">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <Headline as="h1" size="xl" line={copy.line} accent={copy.accent} />
            <Lede>{copy.lede}</Lede>
            <div className="mt-8">
              <Button href={SUBSTACK_URL} variant="secondary" newTab>
                {copy.subscribe}
              </Button>
            </div>
          </div>
        </div>
      </ArtWash>

      {featured?.content ? (
        <Section labelledBy="learn-featured">
          <article data-learn-featured="">
            <Eyebrow>{copy.featuredEyebrow}</Eyebrow>
            {featuredIndex >= 0 ? <p className="type-label text-ink-500">{copy.seriesPart(featuredIndex + 1)}</p> : null}
            <h2 id="learn-featured" className="mt-2 type-display-lg text-ink-900">
              {featured.title}
            </h2>
            {featured.excerpt ? <Lede className="mt-3">{featured.excerpt}</Lede> : null}
            <p className="mt-4 type-caption text-ink-500">
              {copy.byline} · <time dateTime={featured.date}>{longDate(featured.date)}</time> ·{' '}
              {copy.minutes(wordsIn(featured.content))}
            </p>
            {featured.olderKeys ? <OlderKeysNote className="mt-6" /> : null}
            <ArticleBody nodes={featured.content} className="mt-8" />
            {after ? (
              <p className="mt-10">
                <Link
                  href={learnHref(after)}
                  className="inline-flex min-h-touch items-center type-ui font-semibold text-cobalt-600 underline-offset-4 hover:underline"
                >
                  {copy.next(after.title)}
                </Link>
              </p>
            ) : null}
          </article>
        </Section>
      ) : null}

      <Section labelledBy="learn-series" backdrop={{ gradient: true }}>
        <Eyebrow>{copy.seriesEyebrow}</Eyebrow>
        <h2 id="learn-series" className="type-display-lg text-ink-900">
          {SERIES_TITLE}
        </h2>
        <Lede className="mt-4">{copy.seriesLede}</Lede>
        <ol role="list" className="fill-rows mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERIES.map((article, index) => (
            <ArticleCard key={article.url} article={article} eyebrow={copy.part(index + 1)} />
          ))}
        </ol>
      </Section>

      <Section band labelledBy="learn-articles">
        <h2 id="learn-articles" className="type-display-lg text-ink-900">
          {copy.articlesHeading}
        </h2>
        <ul role="list" className="fill-rows mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.url} article={article} />
          ))}
        </ul>
      </Section>

      <Section labelledBy="learn-videos" backdrop={VIDEOS.length === 0 ? { art: 'p9' } : undefined}>
        <h2 id="learn-videos" className="type-display-lg text-ink-900">
          {copy.videosHeading}
        </h2>
        {VIDEOS.length === 0 ? (
          <p className="mt-4 max-w-[56ch] type-body-lg text-ink-700">{copy.videosComing}</p>
        ) : (
          <ul role="list" className="mt-10 grid gap-8 md:grid-cols-2">
            {VIDEOS.map((video) => (
              <li key={video.youtubeId}>
                <div className="aspect-video overflow-hidden rounded-md border border-ink-200 bg-surface-200">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                    title={video.title}
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <h3 className="mt-4 type-heading-3 text-ink-900">{video.title}</h3>
                <p className="mt-2 type-body-sm text-ink-700">{video.excerpt}</p>
                <time dateTime={video.date} className="mt-2 block type-caption text-ink-500">
                  {longDate(video.date)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
