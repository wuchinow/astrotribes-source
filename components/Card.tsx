import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  title: string;
  titleAs?: 'h2' | 'h3' | 'h4';
  children?: ReactNode;
  /** Image credits and footnotes. */
  caption?: string;
  /** A card that links lifts on hover; a card that does not, never pretends to. */
  href?: string;
  className?: string;
}

/** Paper on paper: surface-200, a hairline border, a barely-there resting shadow. */
export function Card({ title, titleAs: Title = 'h3', children, caption, href, className }: CardProps) {
  const classes = cn(
    'block rounded-md border border-ink-200 bg-surface-200 p-4 text-ink-700 shadow-rest md:p-6',
    href && 'no-underline transition-shadow duration-200 hover:shadow-warm',
    className,
  );

  const body = (
    <>
      <Title className="type-heading-3 text-ink-900">{title}</Title>
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
