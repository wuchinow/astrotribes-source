import type { ReactNode } from 'react';
import type { TextureCrop, WashId } from '@/lib/art';
import { cn } from '@/lib/cn';

// The page rhythm from the design system's Section card: sections split by a
// hairline and air, an eyebrow, a two-line headline whose second line is italic
// in the highlight color, and a lede. Down a long page, sections alternate the
// page tone and the band, and one or two carry a texture (v3.4, 1f).

interface SectionProps {
  id?: string;
  /** The id of the section's headline, for aria-labelledby. */
  labelledBy?: string;
  /** Sit on the band tone (surface-band) instead of the page, for the rhythm down a long page. */
  band?: boolean;
  /**
   * A texture: the page's own painting, very faint, as ground (6% at the default). Never on a
   * section that touches the hero, and never with a framed piece in the section.
   */
  texture?: { piece: WashId; crop: TextureCrop };
  className?: string;
  children: ReactNode;
}

export function Section({ id, labelledBy, band = false, texture, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'scroll-mt-4 border-t border-ink-200',
        band && 'section-band',
        texture && 'texture-region',
        className,
      )}
    >
      {texture ? (
        <div aria-hidden="true" data-wash={texture.piece} data-crop={texture.crop} className="texture-layer" />
      ) : null}
      <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-16">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mb-4 type-label text-ink-500', className)}>{children}</p>;
}

interface HeadlineProps {
  id?: string;
  /** The roman first line. */
  line: ReactNode;
  /** The italic second line, in the highlight color. */
  accent?: ReactNode;
  as?: 'h1' | 'h2';
  /** xl is the page's one hero headline; lg is every section headline. */
  size?: 'xl' | 'lg';
  /** Keep the accent on the same line ("Welcome home"); otherwise each sentence gets its own line. */
  inline?: boolean;
  className?: string;
}

export function Headline({
  id,
  line,
  accent,
  as: Tag = 'h2',
  size = 'lg',
  inline = false,
  className,
}: HeadlineProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'mb-4 text-ink-900',
        size === 'xl' ? 'type-display-xl' : 'type-display-lg max-w-[22ch]',
        inline && 'whitespace-nowrap',
        className,
      )}
    >
      {line}
      {accent && inline ? ' ' : null}
      {accent ? (
        <em className={cn('font-normal italic text-highlight', !inline && 'block')}>{accent}</em>
      ) : null}
    </Tag>
  );
}

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('max-w-[56ch] type-body-lg text-ink-700', className)}>{children}</p>;
}
