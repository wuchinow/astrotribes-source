import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/Button';
import { Eyebrow, Headline } from '@/components/Section';
import { accountCopy } from '@/content/account';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { deleteAccount } from '../actions';

export const metadata: Metadata = { title: accountCopy.deleteHeading };

/**
 * Delete your account (David, Nov 4): one link from the account page, then this page asks once,
 * by typing delete. The action checks the session itself and deletes the verified id only
 * (invariant 7); this page checks the session too (invariant 5).
 */
export default async function DeleteAccountPage({ searchParams }: PageProps<'/account/delete'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/sign-in');
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : null;

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{accountCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={accountCopy.deleteLine} accent={accountCopy.deleteAccent} />
      <div className="mt-6 max-w-[40rem]">
        <p className="type-body text-ink-700">{accountCopy.deleteBody}</p>
        <form action={deleteAccount} className="mt-6 grid gap-2">
          <label htmlFor="confirm" className="font-semibold text-[1rem] text-ink-900">
            {accountCopy.deleteLabel}
          </label>
          <input
            id="confirm"
            name="confirm"
            type="text"
            required
            autoComplete="off"
            className="field-input max-w-[16rem]"
            aria-invalid={error === 'confirm' || undefined}
            aria-describedby={error === 'confirm' || error === 'delete' ? 'confirm-error' : undefined}
          />
          {error === 'confirm' || error === 'delete' ? (
            <p id="confirm-error" role="alert" className="type-body-sm text-ember-500">
              {error === 'confirm' ? accountCopy.deleteInvalid : accountCopy.deleteFailed}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button type="submit" variant="danger">
              {accountCopy.deleteButton}
            </Button>
            <Link
              href="/account"
              className="inline-flex min-h-touch items-center type-ui text-cobalt-600 underline-offset-4 hover:underline"
            >
              {accountCopy.deleteCancel}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
