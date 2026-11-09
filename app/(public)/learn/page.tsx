import type { Metadata } from 'next';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Eyebrow, Headline, Lede, Section } from '@/components/Section';
import { SERIES_TITLE, SUBSTACK_URL, VIDEOS, learnCopy as copy, type Article } from '@/content/articles';
import { longDate } from '@/content/famous';
import { learnArticles } from '@/lib/substack';

// Dawa's Substack feed is read again at most once an hour (3y).
export const revalidate = 3600;

export const metadata: Metadata = { title: copy.title, description: copy.description };

/** One article as a card that opens the post on Substack. */
function ArticleCard({ article, eyebrow }: { article: Article; eyebrow?: string }) {
  return (
    <li>
      <a
        href={article.url}
        aria-label={copy.readLabel(article.title)}
        className="flex h-full flex-col rounded-md border border-ink-200 bg-surface-200 p-4 text-ink-700 no-underline shadow-rest transition-shadow duration-200 hover:shadow-warm md:p-6"
      >
        {eyebrow ? <p className="type-label text-ink-500">{eyebrow}</p> : null}
        <h3 className="mt-1 type-heading-3 text-ink-900">{article.title}</h3>
        {article.excerpt ? <p className="mt-2 type-body-sm">{article.excerpt}</p> : null}
        <p className="mt-auto flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-4">
          <time dateTime={article.date} className="type-caption text-ink-500">
            {longDate(article.date)}
          </time>
          <span className="type-ui text-cobalt-600">{copy.read}</span>
        </p>
      </a>
    </li>
  );
}

/**
 * Learn (David, Nov 4): Dawa's articles, each a card that opens on his Substack, with no full text
 * copied here, and a place for his videos once they exist. Public, no member data. The articles come
 * from his Substack feed, read again at most once an hour (3y, lib/substack.ts). Since 4m (David,
 * Nov 8: break up the text-heavy pages) the hero stands on an ink landscape wash (P6) with its words
 * on a frosted panel, the series takes the soft gradient, and the videos section an ink landscape
 * beside its words while it holds none; the sections still alternate the page tone and the band.
 */
export default async function LearnPage() {
  const { series: SERIES, articles: ARTICLES } = await learnArticles();
  return (
    <>
      <ArtWash piece="p6" top>
        <div className="mx-auto max-w-content px-4 pt-31 pb-12 md:px-6 md:pt-38 md:pb-16">
          <div className="panel-frost max-w-[40rem] p-6 md:p-10">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <Headline as="h1" size="xl" line={copy.line} accent={copy.accent} />
            <Lede>{copy.lede}</Lede>
            <div className="mt-8">
              <Button href={SUBSTACK_URL} variant="secondary">
                {copy.subscribe}
              </Button>
            </div>
          </div>
        </div>
      </ArtWash>

      <Section labelledBy="learn-series" backdrop={{ gradient: true }}>
        <Eyebrow>{copy.seriesEyebrow}</Eyebrow>
        <h2 id="learn-series" className="type-display-lg text-ink-900">
          {SERIES_TITLE}
        </h2>
        <Lede className="mt-4">{copy.seriesLede}</Lede>
        <ol role="list" className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERIES.map((article, index) => (
            <ArticleCard key={article.url} article={article} eyebrow={copy.part(index + 1)} />
          ))}
        </ol>
      </Section>

      <Section band labelledBy="learn-articles">
        <h2 id="learn-articles" className="type-display-lg text-ink-900">
          {copy.articlesHeading}
        </h2>
        <ul role="list" className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
