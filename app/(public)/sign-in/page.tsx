import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArtWash } from '@/components/ArtWash';
import { Button } from '@/components/Button';
import { Eyebrow, Headline } from '@/components/Section';
import { signInCopy } from '@/content/account';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { startGoogleSignIn } from './actions';

export const metadata: Metadata = { title: signInCopy.title };

/**
 * Sign in (2b): Google only for now (David, Oct 21). Open to anyone since Oct 22
 * (David). A member who is already signed in goes on to the welcome steps (2c).
 */
export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  if (supabaseConfigured()) {
    const { data } = await (await memberClient()).auth.getUser();
    if (data.user) redirect('/welcome');
  }
  const params = await searchParams;
  const error = typeof params.error === 'string' ? signInCopy.errors[params.error] : undefined;

  return (
    <ArtWash piece="h" top>
      <div className="mx-auto flex min-h-[70dvh] max-w-content items-center px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <div className="panel-frost w-full max-w-[36rem] p-6 md:p-10">
          <Eyebrow>{signInCopy.eyebrow}</Eyebrow>
          <Headline as="h1" line={signInCopy.line} accent={signInCopy.accent} />
          <p className="max-w-[56ch] type-body-lg text-ink-700">{signInCopy.body}</p>
          {error ? (
            <p role="alert" className="mt-4 type-body-sm text-ember-500">
              {error}
            </p>
          ) : null}
          <form action={startGoogleSignIn} className="mt-8">
            <Button type="submit">{signInCopy.google}</Button>
          </form>
          <p className="mt-6 max-w-[56ch] type-body-sm text-ink-700">{signInCopy.note}</p>
        </div>
      </div>
    </ArtWash>
  );
}
