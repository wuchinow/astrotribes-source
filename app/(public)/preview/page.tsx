import type { Metadata } from 'next';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Eyebrow, Headline } from '@/components/Section';
import { previewCopy } from '@/content/chart';
import { previewIsOpenable, safeReturnPath } from '@/lib/preview';

export const metadata: Metadata = { title: 'Preview' };

/**
 * The passcode page. A plain form that posts to /api/preview, so it works without JavaScript.
 * The passcode travels in the body only; `next` is one of the gated pages, never a full URL.
 */
export default async function PreviewPage({ searchParams }: PageProps<'/preview'>) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const closed = !previewIsOpenable() || params.error === 'closed';
  const wrong = !closed && params.error === 'wrong';

  return (
    <ArtWash piece="h" top>
      <div className="mx-auto flex min-h-[70dvh] max-w-content items-center px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <div className="panel-frost w-full max-w-[36rem] p-6 md:p-10">
          <Eyebrow>{previewCopy.eyebrow}</Eyebrow>
          <Headline as="h1" line={previewCopy.line} accent={previewCopy.accent} />
          <p className="max-w-[56ch] type-body-lg text-ink-700">
            {closed ? previewCopy.closed : previewCopy.body}
          </p>

          {closed ? null : (
            <form method="post" action="/api/preview" className="mt-8 grid gap-4">
              <input type="hidden" name="next" value={next} />
              <div className="grid gap-2">
                <label htmlFor="passcode" className="font-semibold text-[1rem] text-ink-900">
                  {previewCopy.label}
                </label>
                <input
                  id="passcode"
                  name="passcode"
                  type="password"
                  required
                  maxLength={200}
                  autoComplete="off"
                  className="field-input max-w-[24rem]"
                  aria-invalid={wrong || undefined}
                  aria-describedby={wrong ? 'passcode-error' : undefined}
                />
                {wrong ? (
                  <p id="passcode-error" role="alert" className="type-body-sm text-ember-500">
                    {previewCopy.wrong}
                  </p>
                ) : null}
              </div>
              <div>
                <Button type="submit">{previewCopy.submit}</Button>
              </div>
            </form>
          )}

          <p className="mt-8 type-body-sm text-ink-700">
            {previewCopy.elsewhere}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4">
            <Button href="/oracle" variant="tertiary" className="-ml-2">
              {previewCopy.oracle}
            </Button>
            <Button href="/" variant="tertiary">
              {previewCopy.home}
            </Button>
          </div>
        </div>
      </div>
    </ArtWash>
  );
}
