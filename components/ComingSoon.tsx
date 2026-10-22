import type { FramedId, WashId } from '@/lib/art';
import { ArtWash } from './ArtWash';
import { Button } from './Button';
import { FramedArt } from './FramedArt';
import { Eyebrow, Headline } from './Section';

interface ComingSoonProps {
  line: string;
  accent: string;
  body: string;
  /** The page's own wash behind a frosted panel. */
  wash?: WashId;
  /** Or a framed piece beside the panel, on plain paper: a wash beside it would touch it. */
  framed?: FramedId;
}

/** A page that exists before its feature does: one panel, a way home, and one of Jane's pieces. */
export function ComingSoon({ line, accent, body, wash, framed }: ComingSoonProps) {
  const panel = (
    <div className={framed ? 'max-w-[36rem]' : 'panel-frost max-w-[36rem] p-6 md:p-10'}>
      <Eyebrow>Coming soon</Eyebrow>
      <Headline as="h1" line={line} accent={accent} />
      <p className="max-w-[56ch] type-body-lg text-ink-700">{body}</p>
      <Button href="/" variant="tertiary" className="mt-6 -ml-2">
        Back to the home page
      </Button>
    </div>
  );

  if (framed) {
    return (
      <div className="mx-auto grid min-h-[70dvh] max-w-content items-center gap-10 px-4 pt-31 pb-16 md:grid-cols-[minmax(0,36rem)_auto] md:gap-16 md:px-6 md:pt-38 md:pb-24">
        {panel}
        <FramedArt id={framed} sizes="(width >= 48rem) 20rem, 60vw" eager className="w-full" />
      </div>
    );
  }

  return (
    <ArtWash piece={wash ?? 'h'} top>
      <div className="mx-auto flex min-h-[70dvh] max-w-content items-center px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        {panel}
      </div>
    </ArtWash>
  );
}
