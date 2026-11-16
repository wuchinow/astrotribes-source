import { LIFT } from '@/lib/motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  title: string;
  /** A glyph or small mark before the title (5g: the Moon's and Dawa's Rising glyph on the 12 Tribes page). */
  icon?: ReactNode;
  titleAs?: 'h2' | 'h3' | 'h4';
  children?: ReactNode;
  /** Image credits and footnotes. */
  caption?: string;
  /** A card that links lifts on hover; a card that does not, never pretends to. */
  href?: string;
  className?: string;
}

/** Paper on paper: surface-200, a hairline border, a barely-there resting shadow. */
export function Card({ title, icon, titleAs: Title = 'h3', children, caption, href, className }: CardProps) {
  const classes = cn(
    'block rounded-md border border-ink-200 bg-surface-200 p-4 text-ink-700 shadow-rest md:p-6',
    href && `no-underline ${LIFT}`,
    className,
  );

  const body = (
    <>
      {icon ? (
        <div className="flex items-center gap-3">
          {icon}
          <Title className="type-heading-3 text-ink-900">{title}</Title>
        </div>
      ) : (
        <Title className="type-heading-3 text-ink-900">{title}</Title>
      )}
      {children ? <div className="mt-2 type-body-sm">{children}</div> : null}
      {caption ? <p className="mt-3 type-caption text-ink-500">{caption}</p> : null}
    </>
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <article className={classes}>{body}</article>
  );
}
