import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ArticleNode } from '@/lib/article-html';
import { cn } from '@/lib/cn';

// One of Dawa's articles in full (4w), from the tree lib/article-html.ts reads out of his feed. Every
// element is made here as React, so nothing from the feed reaches the page as HTML.

const linkClass = 'text-cobalt-600 underline underline-offset-4 hover:decoration-2';

function render(node: ArticleNode, key: number): ReactNode {
  if (typeof node === 'string') return node;
  const children = node.children.map(render);
  switch (node.tag) {
    case 'p':
      return <p key={key}>{children}</p>;
    case 'h2':
      return (
        <h2 key={key} className="pt-4 type-heading-2 text-ink-900">
          {children}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={key} className="pt-2 type-heading-3 text-ink-900">
          {children}
        </h3>
      );
    case 'em':
      return <em key={key}>{children}</em>;
    case 'strong':
      return (
        <strong key={key} className="font-semibold text-ink-900">
          {children}
        </strong>
      );
    case 'a':
      return node.href!.startsWith('/') ? (
        <Link key={key} href={node.href!} className={linkClass}>
          {children}
        </Link>
      ) : (
        <a key={key} href={node.href} className={linkClass}>
          {children}
        </a>
      );
    case 'br':
      return <br key={key} />;
    case 'hr':
      return <hr key={key} className="my-4 border-ink-200" />;
    case 'blockquote':
      return (
        <blockquote key={key} className="space-y-4 border-l-2 border-gold-500 pl-5 italic">
          {children}
        </blockquote>
      );
    case 'ul':
      return (
        <ul key={key} className="ml-5 list-disc space-y-2">
          {children}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="ml-5 list-decimal space-y-2">
          {children}
        </ol>
      );
    case 'li':
      return (
        <li key={key} className="pl-1">
          {children}
        </li>
      );
    case 'img':
      return (
        // Substack's own image hosts only (lib/article-html.ts); sizes are unknown, so no next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={node.src} alt={node.alt ?? ''} loading="lazy" className="h-auto max-w-full rounded-md" />
      );
  }
}

export function ArticleBody({ nodes, className }: { nodes: readonly ArticleNode[]; className?: string }) {
  return (
    <div data-article-body="" className={cn('max-w-measure space-y-5 type-body text-ink-700', className)}>
      {nodes.map(render)}
    </div>
  );
}
