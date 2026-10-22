import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArtWash } from '@/components/ArtWash';
import { BirthDetailsForm, type BirthInitial } from '@/components/BirthDetailsForm';
import { Button } from '@/components/Button';
import { Eyebrow, Headline, Lede } from '@/components/Section';
import { WaitNote } from '@/components/WaitNote';
import { accountCopy } from '@/content/account';
import { welcomeCopy } from '@/content/welcome';
import { supabaseConfigured } from '@/lib/supabase/env';
import { memberClient } from '@/lib/supabase/server';
import { saveDisplayName } from '../account/actions';

export const metadata: Metadata = { title: welcomeCopy.title };

/**
 * The welcome steps (2c): the name (Google's is never used), then birth details, then the member's
 * own chart. It shows whichever step is still missing, so a member who leaves halfway picks up
 * where they were; `?edit=birth` reopens the birth step from the account page. Checks the
 * session itself (invariant 5). The member's own birth details are read under RLS, for the
 * form only, on a page that is never cached.
 */
export default async function WelcomePage({ searchParams }: PageProps<'/welcome'>) {
  if (!supabaseConfigured()) redirect('/sign-in?error=off');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/sign-in');

  const params = await searchParams;
  const [{ data: profile }, { data: birth }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('birth_data')
      .select('birth_date, birth_time, place_label, latitude, longitude, updated_at')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);
  const name = profile?.display_name ?? null;
  const edit = params.edit === 'birth' && Boolean(birth);
  if (name && birth && !edit) redirect('/your-chart');

  if (!name) {
    const error = params.error === 'name';
    return (
      <Shell>
        <Eyebrow>{welcomeCopy.step(1)}</Eyebrow>
        <Headline as="h1" line={accountCopy.firstLine} accent={accountCopy.firstAccent} />
        <Lede>{accountCopy.nameNeeded}</Lede>
        <form action={saveDisplayName} className="mt-8 grid gap-2">
          <input type="hidden" name="next" value="welcome" />
          <label htmlFor="display_name" className="font-semibold text-[1rem] text-ink-900">
            {accountCopy.nameLabel}
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={40}
            autoComplete="off"
            className="field-input max-w-[24rem]"
            aria-invalid={error || undefined}
            aria-describedby="display_name-help"
          />
          <p id="display_name-help" className="type-body-sm text-ink-700">
            {error ? (
              <span role="alert" className="text-ember-500">
                {accountCopy.nameInvalid}
              </span>
            ) : (
              accountCopy.nameHelp
            )}
          </p>
          <div className="mt-4">
            <Button type="submit" size="lg">
              {accountCopy.firstSave}
            </Button>
          </div>
        </form>
      </Shell>
    );
  }

  const initial: BirthInitial | null = birth
    ? {
        date: birth.birth_date,
        time: birth.birth_time ? birth.birth_time.slice(0, 5) : null,
        place: { label: birth.place_label, lat: birth.latitude, lon: birth.longitude },
      }
    : null;

  return (
    <Shell>
      <Eyebrow>{edit ? welcomeCopy.editEyebrow : welcomeCopy.step(2)}</Eyebrow>
      <Headline
        as="h1"
        line={edit ? welcomeCopy.editLine : welcomeCopy.birthLine}
        accent={edit ? welcomeCopy.editAccent : welcomeCopy.birthAccent}
      />
      <Lede>{welcomeCopy.lede}</Lede>
      {edit && birth ? <WaitNote changedAt={birth.updated_at} /> : null}
      <BirthDetailsForm initial={initial} edit={edit} />
    </Shell>
  );
}

/** The free chart's frame: the page's wash and one frosted panel. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ArtWash piece="p9" top>
      <div className="mx-auto max-w-content px-4 pt-31 pb-16 md:px-6 md:pt-38 md:pb-24">
        <div className="panel-frost max-w-[40rem] p-6 md:p-10">{children}</div>
      </div>
    </ArtWash>
  );
}
