import { oracleCopy } from '@/content/oracle/copy';
import { card, cardArt } from '@/lib/oracle';

/**
 * The day's card, as one of the Oracle's pair (1i): Pamela Colman Smith's 1909 art centred on top,
 * framed as the subject with its credit under it, then the card's name, Waite's upright meaning in
 * full, and his note (the reversed meaning stays in the data). One WebP at twice the 240px it is
 * shown at, width and height set, lazy: it loads with the first screen, and the days not shown
 * never load it (their blocks are display: none).
 */
export function TarotCard({ id, headingId }: { id: string; headingId: string }) {
  const c = card(id);
  const art = cardArt(id)!;
  return (
    <article aria-labelledby={headingId} className="oracle-card panel-frost">
      <figure className="mx-auto mb-7 w-60 max-w-full">
        {/* One pre-cut, content-hashed WebP (scripts/tarot-art.mjs); the image optimizer adds nothing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={art.src}
          alt={c.alt}
          width={art.width}
          height={art.height}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-[9px] shadow-rest"
        />
        <figcaption className="mt-2 text-center type-caption text-ink-500">{oracleCopy.cardCredit}</figcaption>
      </figure>
      <p className="mb-2 type-label text-ink-500">{oracleCopy.cardEyebrow}</p>
      <h2 id={headingId} className="type-heading-1 text-ink-900">
        {c.name}
      </h2>
      <p className="mt-4 max-w-measure type-body text-ink-700">{c.reading.upright}</p>
      <p className="mt-8 type-caption text-ink-500">
        {c.reading.credit}
        {c.reading.reviewed ? null : ` ${oracleCopy.onItsWay}`}
      </p>
    </article>
  );
}
