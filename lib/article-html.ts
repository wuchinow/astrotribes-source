// Dawa's articles in full on Learn (4w, David, Nov 9: "feature an article or several on the website
// without linking to substack"). His Substack feed carries each post's body as HTML. That HTML is
// never put on the page as it is: it is read here into a small tree of the few elements an article
// needs (paragraphs, headings, emphasis, links, lists, quotes, and Substack's own images), and
// components/ArticleBody.tsx renders that tree as React elements. Everything else is dropped:
// scripts, styles, forms (Substack's subscribe widgets), share buttons, inline styles, classes, and
// any attribute but a link's address and an image's source and alt text.

import { SUBSTACK_URL } from '@/content/articles';

export type ArticleTag = 'p' | 'h2' | 'h3' | 'em' | 'strong' | 'a' | 'br' | 'hr' | 'blockquote' | 'ul' | 'ol' | 'li' | 'img';

export interface ArticleElement {
  tag: ArticleTag;
  /** A link's address: http(s) or mailto only; his own posts point to their page on Learn. */
  href?: string;
  /** An image's source: Substack's own image hosts only. */
  src?: string;
  alt?: string;
  children: ArticleNode[];
}

export type ArticleNode = string | ArticleElement;

/** Elements kept, under the name the page uses (b is strong, i is em, h1 and h2 are h2, h4 to h6 are h3). */
const KEEP: Record<string, ArticleTag> = {
  p: 'p',
  h1: 'h2',
  h2: 'h2',
  h3: 'h3',
  h4: 'h3',
  h5: 'h3',
  h6: 'h3',
  em: 'em',
  i: 'em',
  strong: 'strong',
  b: 'strong',
  a: 'a',
  br: 'br',
  hr: 'hr',
  blockquote: 'blockquote',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  img: 'img',
};

/** Elements dropped with everything inside them. */
const DROP = new Set([
  'script', 'style', 'form', 'button', 'input', 'select', 'textarea', 'iframe', 'svg', 'noscript',
  'template', 'video', 'audio', 'object', 'embed', 'head', 'title',
]);

/** Substack's widgets, dropped with everything inside them: subscribe, share, and button blocks. */
const WIDGET = /subscri|share|button-wrap|captioned-button|digest-post|embedded-post|poll-embed/i;

/** Elements with no closing tag. */
const VOID = new Set(['br', 'hr', 'img', 'input', 'source', 'meta', 'link', 'wbr', 'col', 'area']);

/** Image hosts Substack uses for a post's pictures. */
const IMAGE_HOSTS = new Set(['substackcdn.com', 'substack-post-media.s3.amazonaws.com']);

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', mdash: '—', ndash: '–',
};

export const decodeEntities = (text: string) =>
  text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => ENTITIES[name.toLowerCase()] ?? whole);

function attributes(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, double, single, bare] of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    out[name.toLowerCase()] = decodeEntities(double ?? single ?? bare ?? '');
  }
  return out;
}

/** A link's address, if it is a safe one; his own posts go to their page on Learn. */
function safeHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const href = raw.trim();
  if (href.startsWith(`${SUBSTACK_URL}/p/`)) return `/learn/${href.slice(`${SUBSTACK_URL}/p/`.length).split(/[?#/]/)[0]}`;
  return /^(https?:\/\/|mailto:)/i.test(href) ? href : undefined;
}

function safeSrc(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:' && IMAGE_HOSTS.has(url.hostname) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

interface Open {
  tag: ArticleTag | null;
  /** The source element's name, to match its closing tag. */
  name: string;
  node: ArticleElement | null;
  /** Inside a dropped element: nothing is kept until it closes. */
  dropping: boolean;
}

/** Reads a post's HTML into the article tree. Unknown elements are unwrapped; their text is kept. */
export function parseArticleHtml(html: string): ArticleNode[] {
  const root: ArticleElement = { tag: 'p', children: [] };
  const stack: Open[] = [{ tag: null, name: '#root', node: root, dropping: false }];
  const parent = () => {
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].node) return stack[i].node!;
    return root;
  };
  const dropping = () => stack[stack.length - 1].dropping;

  const source = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[|\]\]>/g, '');
  for (const [, text, closing, name, attrs] of source.matchAll(/([^<]+)|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>|</g)) {
    if (text !== undefined || name === undefined) {
      if (!dropping()) {
        const value = decodeEntities(text ?? '<');
        const children = parent().children;
        if (typeof children.at(-1) === 'string') children[children.length - 1] += value;
        else children.push(value);
      }
      continue;
    }
    const tagName = name.toLowerCase();
    if (closing) {
      // Close up to the matching open element; a stray closing tag is ignored.
      const at = stack.findLastIndex((open) => open.name === tagName);
      if (at > 0) stack.length = at;
      continue;
    }
    const selfClosing = VOID.has(tagName) || /\/\s*$/.test(attrs);
    if (dropping()) {
      if (!selfClosing) stack.push({ tag: null, name: tagName, node: null, dropping: true });
      continue;
    }
    const attr = attributes(attrs);
    if (DROP.has(tagName) || WIDGET.test(attr.class ?? '')) {
      if (!selfClosing) stack.push({ tag: null, name: tagName, node: null, dropping: true });
      continue;
    }
    const tag = KEEP[tagName];
    if (!tag) {
      if (!selfClosing) stack.push({ tag: null, name: tagName, node: null, dropping: false });
      continue;
    }
    const element: ArticleElement = { tag, children: [] };
    if (tag === 'a') {
      const href = safeHref(attr.href);
      if (href) element.href = href;
    }
    if (tag === 'img') {
      const src = safeSrc(attr.src);
      if (!src) continue;
      element.src = src;
      element.alt = attr.alt ?? '';
    }
    parent().children.push(element);
    if (!selfClosing) stack.push({ tag, name: tagName, node: element, dropping: false });
  }
  return tidy(root.children);
}

/** The text of a node and everything in it. */
export const textOf = (node: ArticleNode): string =>
  typeof node === 'string' ? node : node.tag === 'br' ? ' ' : node.children.map(textOf).join('');

const BLOCK = new Set<ArticleTag>(['p', 'h2', 'h3', 'hr', 'blockquote', 'ul', 'ol', 'img']);

/**
 * Tidies the tree: text and inline elements left between blocks go into a paragraph, empty
 * paragraphs and links with no address are dropped (their text kept), and runs of spaces are one.
 */
function tidy(nodes: ArticleNode[]): ArticleNode[] {
  const out: ArticleNode[] = [];
  let loose: ArticleNode[] = [];
  const flush = () => {
    if (loose.some((node) => textOf(node).trim())) out.push({ tag: 'p', children: loose });
    loose = [];
  };
  for (const node of nodes.map(clean).flat()) {
    if (typeof node !== 'string' && BLOCK.has(node.tag)) {
      flush();
      if (node.tag === 'hr' || node.tag === 'img' || textOf(node).trim()) out.push(node);
    } else loose.push(node);
  }
  flush();
  return out.map(trimEnds);
}

/** Neighbouring text joined into one string, as an unwrapped link leaves it. */
const joinText = (nodes: ArticleNode[]) =>
  nodes.reduce<ArticleNode[]>((out, node) => {
    const last = out.at(-1);
    if (typeof node === 'string' && typeof last === 'string') out[out.length - 1] = (last + node).replace(/ {2,}/g, ' ');
    else out.push(node);
    return out;
  }, []);

function clean(node: ArticleNode): ArticleNode | ArticleNode[] {
  if (typeof node === 'string') return node.replace(/[ \t\r\n ]+/g, ' ');
  const children = joinText(node.children.map(clean).flat());
  if (node.tag === 'a' && !node.href) return children;
  if ((node.tag === 'blockquote' || node.tag === 'li') && children.some((c) => typeof c !== 'string' && BLOCK.has(c.tag))) {
    return { ...node, children: tidy(children) };
  }
  return { ...node, children };
}

/** No space at the start or end of a block. */
function trimEnds(node: ArticleNode): ArticleNode {
  if (typeof node === 'string' || !BLOCK.has(node.tag)) return node;
  const children = [...node.children];
  const edge = (index: number, side: 'start' | 'end') => {
    const child = children[index];
    if (typeof child === 'string') children[index] = side === 'start' ? child.trimStart() : child.trimEnd();
  };
  if (children.length) {
    edge(0, 'start');
    edge(children.length - 1, 'end');
  }
  return { ...node, children: children.filter((child) => child !== '').map(trimEnds) };
}

const plain = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * A paragraph set all in one emphasis (Substack keeps the editor's bold or italic when text is pasted
 * in): at least nine tenths of its text inside strong, or inside em.
 */
const wrappedIn = (node: ArticleNode): 'strong' | 'em' | undefined => {
  if (typeof node === 'string' || node.tag !== 'p') return undefined;
  const total = textOf(node).replace(/\s+/g, '').length;
  if (total === 0) return undefined;
  for (const tag of ['strong', 'em'] as const) {
    const inside = node.children
      .filter((child) => typeof child !== 'string' && child.tag === tag)
      .map((child) => textOf(child).replace(/\s+/g, '').length)
      .reduce((sum, n) => sum + n, 0);
    if (inside / total >= 0.9) return tag;
  }
  return undefined;
};

const unwrap = (node: ArticleElement, tag: 'strong' | 'em'): ArticleElement => ({
  ...node,
  children: joinText(node.children.flatMap((child) => (typeof child !== 'string' && child.tag === tag ? child.children : [child]))),
});

/**
 * A post's body for the page. The page shows the title and Dawa's subtitle, so where the body opens
 * with them again (as a heading or a paragraph) they are left out. Where most paragraphs are set all
 * in bold or all in italic, that emphasis is taken off, so the article reads as text rather than one
 * long heading. A "heading" longer than a sentence or two is read as the paragraph it is.
 */
export function articleBody(html: string, feedTitle: string, subtitle = ''): ArticleNode[] {
  let nodes = parseArticleHtml(html);
  const repeats = new Set([plain(feedTitle), plain(subtitle)].filter(Boolean));
  for (let i = 0; i < 2 && nodes.length > 1; i++) {
    const first = nodes[0];
    if (typeof first === 'string' || !['h2', 'h3', 'p'].includes(first.tag)) break;
    const text = plain(textOf(first));
    const isRepeat = text && [...repeats].some((repeat) => repeat === text || repeat.startsWith(text));
    if (!isRepeat || (first.tag === 'p' && !wrappedIn(first) && text.length > 60)) break;
    nodes.shift();
  }
  nodes = nodes.map((node) =>
    typeof node !== 'string' && (node.tag === 'h2' || node.tag === 'h3') && textOf(node).length > 120 ? { ...node, tag: 'p' } : node,
  );
  const paragraphs = nodes.filter((node) => typeof node !== 'string' && node.tag === 'p');
  const wrapped = paragraphs.filter((node) => wrappedIn(node));
  if (paragraphs.length > 1 && wrapped.length / paragraphs.length >= 0.75) {
    // Bold and italic can be set one inside the other, so take off each layer in turn.
    return nodes.map((node) => {
      let out = node;
      for (let tag = wrappedIn(out); tag; tag = wrappedIn(out)) out = unwrap(out as ArticleElement, tag);
      return out;
    });
  }
  return nodes;
}

/** The article's opening, for its card: the first paragraph long enough to read as one, cut near 320 characters. */
export function openingOf(nodes: readonly ArticleNode[]): string {
  for (const node of nodes) {
    if (typeof node === 'string' || node.tag !== 'p') continue;
    const text = textOf(node).replace(/\s+/g, ' ').trim();
    if (text.length < 60) continue;
    if (text.length <= 320) return text;
    const cut = text.slice(0, 320);
    return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
  }
  return '';
}

/** The number of words, for the reading time. */
export const wordsIn = (nodes: readonly ArticleNode[]) =>
  nodes.map(textOf).join(' ').split(/\s+/).filter(Boolean).length;
