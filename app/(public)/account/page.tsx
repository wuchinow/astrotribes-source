import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Eyebrow, Headline } from '@/components/Section';
import { accountCopy } from '@/content/account';
import { visibilityCopy } from '@/content/members';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { DEFAULT_VISIBILITY, VISIBILITY_LEVELS, isVisibility } from '@/lib/visibility';
import { saveDisplayName, saveVisibility } from './actions';

export const metadata: Metadata = { title: accountCopy.title };

/**
 * The account page (2b, 2c, 3g): the member's name (chosen first on the welcome steps, since Google's is
 * never used), their birth details and the way to change them, who can see their chart (3g), the Google email and Sign out,
 * Export my data, and a link to delete the account (its own page), set apart at the end. After a name is saved it offers the
 * way on (the chart), so it needs no Done or Back button. It checks the
 * session itself (invariant 5). One region on the page tone, so no bands.
 */
export default async function AccountPage({ searchParams }: PageProps<'/account'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const [{ data: profile }, { data: birth }] = await Promise.all([
    supabase.from('profiles').select('display_name, visibility').eq('id', user.id).maybeSingle(),
    supabase.from('birth_data').select('birth_date, birth_time, place_label').eq('user_id', user.id).maybeSingle(),
  ]);
  const name = profile?.display_name ?? null;
  // A first visit chooses a name on the welcome steps (2c).
  if (!name) redirect('/welcome');
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : null;
  const saved = params.saved === 'name';
  const visibility = isVisibility(profile?.visibility) ? profile.visibility : DEFAULT_VISIBILITY;
  const visibilitySaved = params.saved === 'visibility';
  const visibilityFailed = error === 'visibility';

  return (
    <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
      <Eyebrow>{accountCopy.eyebrow}</Eyebrow>
      <Headline as="h1" line={accountCopy.line} accent={`${name}.`} />

      <div className="mt-10 grid max-w-[40rem] gap-12">
        <section aria-labelledby="name-heading">
          <h2 id="name-heading" className="type-heading-3 text-ink-900">
            {accountCopy.nameHeading}
          </h2>
          <form action={saveDisplayName} className="mt-4 grid gap-2">
            <label htmlFor="display_name" className="font-semibold text-[1rem] text-ink-900">
              {accountCopy.nameLabel}
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              maxLength={40}
              defaultValue={name}
              autoComplete="off"
              className="field-input max-w-[24rem]"
              aria-invalid={error === 'name' || undefined}
              aria-describedby="display_name-help"
            />
            <p id="display_name-help" className="type-body-sm text-ink-700">
              {error === 'name' ? (
                <span role="alert" className="text-ember-500">
                  {accountCopy.nameInvalid}
                </span>
              ) : saved ? (
                <span role="status">
                  {accountCopy.nameSaved}{' '}
                  <Link href="/your-chart" className="font-semibold text-cobalt-600 underline decoration-gold-500 decoration-2 underline-offset-4">
                    {accountCopy.nameNext}
                  </Link>
                </span>
              ) : (
                accountCopy.nameHelp
              )}
            </p>
            <div className="mt-2">
              <Button type="submit" variant="secondary">
                {accountCopy.nameSave}
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="birth-heading">
          <h2 id="birth-heading" className="type-heading-3 text-ink-900">
            {accountCopy.birthHeading}
          </h2>
          {birth ? (
            <p className="mt-2 type-body text-ink-700">
              {accountCopy.birthSummary(birth.birth_date, birth.birth_time ? birth.birth_time.slice(0, 5) : null, birth.place_label)}
            </p>
          ) : (
            <p className="mt-2 type-body text-ink-700">{accountCopy.birthNone}</p>
          )}
          <p className="mt-2 type-body-sm text-ink-700">{accountCopy.birthPrivate}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button href={birth ? '/welcome?edit=birth' : '/welcome'} variant="secondary">
              {birth ? accountCopy.birthChange : accountCopy.birthAdd}
            </Button>
            {birth ? (
              <Button href="/your-chart" variant="tertiary">
                {accountCopy.birthChart}
              </Button>
            ) : null}
          </div>
        </section>

        {/* 3g: who can see the chart. Three levels, checked by the database (can_view_member, 0001). */}
        <section id="visibility" aria-labelledby="visibility-heading" className="scroll-mt-24">
          <form action={saveVisibility}>
            <fieldset className="grid gap-3" aria-describedby="visibility-what">
              <legend id="visibility-heading" className="type-heading-3 text-ink-900">
                {visibilityCopy.heading}
              </legend>
              <p id="visibility-what" className="type-body-sm text-ink-700">
                {visibilityCopy.what}
              </p>
              {VISIBILITY_LEVELS.map((level) => (
                <label
                  key={level}
                  className="flex min-h-touch cursor-pointer gap-3 rounded-sm border border-ink-200 p-4 text-ink-700 has-[:checked]:border-cobalt-600"
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={level}
                    defaultChecked={level === visibility}
                    className="mt-1 size-5 shrink-0 accent-cobalt-600"
                  />
                  <span>
                    <span className="block font-semibold text-ink-900">{visibilityCopy.levels[level].label}</span>
                    <span className="block type-body-sm">{visibilityCopy.levels[level].body}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button type="submit" variant="secondary">
                {visibilityCopy.save}
              </Button>
              <Button href="/members" variant="tertiary">
                {visibilityCopy.members}
              </Button>
            </div>
            {visibilitySaved ? (
              <p role="status" className="mt-2 type-body-sm text-ink-700">
                {visibilityCopy.saved}
              </p>
            ) : visibilityFailed ? (
              <p role="alert" className="mt-2 type-body-sm text-ember-500">
                {visibilityCopy.failed}
              </p>
            ) : null}
          </form>
        </section>

        <section aria-labelledby="signed-in-heading">
          <h2 id="signed-in-heading" className="type-heading-3 text-ink-900">
            {accountCopy.signedInHeading}
          </h2>
          <p className="mt-2 type-body text-ink-700">
            {accountCopy.emailLabel} <span className="text-ink-900">{user.email}</span>
          </p>
          <form method="post" action="/auth/sign-out" className="mt-4">
            <Button type="submit" variant="secondary">
              {accountCopy.signOut}
            </Button>
          </form>
        </section>

        <section aria-labelledby="export-heading">
          <h2 id="export-heading" className="type-heading-3 text-ink-900">
            {accountCopy.exportHeading}
          </h2>
          <p className="mt-2 type-body text-ink-700">{accountCopy.exportBody}</p>
          <div className="mt-4">
            <Button href="/api/account/export" variant="secondary">
              {accountCopy.exportButton}
            </Button>
          </div>
        </section>

        {/* Set apart at the end, one click away (David, Nov 4): the confirm is a page of its own. */}
        <section aria-labelledby="delete-heading" className="border-t border-ink-200 pt-10">
          <h2 id="delete-heading" className="sr-only">
            {accountCopy.deleteHeading}
          </h2>
          <Link
            href="/account/delete"
            className="inline-flex min-h-touch items-center type-ui text-cobalt-600 underline-offset-4 hover:underline"
          >
            {accountCopy.deleteHeading}
          </Link>
        </section>
      </div>
    </div>
  );
}
