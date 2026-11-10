'use server';
// The account page's writes (2b, 3g). Each checks the session itself (invariant 5)
// and acts only on the verified member's own id, never on an id from the form.
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cleanDisplayName } from '@/lib/display-name';
import { isVisibility } from '@/lib/visibility';
import { takeRateLimit } from '@/lib/rate-limit';
import { adminClient } from '@/lib/supabase/admin';
import { memberClient } from '@/lib/supabase/server';

const signedInMember = async () => {
  if (!takeRateLimit('account', await headers()).ok) redirect('/account?error=limit');
  const supabase = await memberClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/sign-in');
  return { supabase, user: data.user };
};

export async function saveDisplayName(form: FormData): Promise<void> {
  const { supabase, user } = await signedInMember();
  // The welcome steps (2c) send the member on to their birth details; the account page stays put.
  const page = form.get('next') === 'welcome' ? '/welcome' : '/account';
  const name = cleanDisplayName(form.get('display_name'));
  if (!name) redirect(`${page}?error=name`);
  // The member's own grant (update of display_name) and RLS (own row) do the rest.
  const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
  if (error) redirect(`${page}?error=name`);
  // From the welcome steps, the name is the last first-time step, so the chart opens the welcome guide.
  redirect(page === '/welcome' ? '/welcome?joined=1' : '/account?saved=name');
}

/**
 * Who can see the member's chart (3g). The member's own grant (update of visibility) and RLS (own
 * row) do the rest; 0001's check constraint refuses anything but the three levels.
 */
export async function saveVisibility(form: FormData): Promise<void> {
  const { supabase, user } = await signedInMember();
  const level = form.get('visibility');
  if (!isVisibility(level)) redirect('/account?error=visibility#visibility');
  const { error } = await supabase.from('profiles').update({ visibility: level }).eq('id', user.id);
  if (error) redirect('/account?error=visibility#visibility');
  redirect('/account?saved=visibility#visibility');
}

/** Deletes the auth user with the secret key; 0001's cascade removes profile, birth data, placements. */
export async function deleteAccount(form: FormData): Promise<void> {
  const { supabase, user } = await signedInMember();
  if (form.get('confirm') !== 'delete') redirect('/account/delete?error=confirm');
  const { error } = await adminClient().auth.admin.deleteUser(user.id);
  if (error) redirect('/account/delete?error=delete');
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // The user is gone; the cookies are cleared below either way.
  }
  const store = await cookies();
  for (const { name } of store.getAll()) if (name.startsWith('sb-')) store.delete(name);
  redirect('/');
}
