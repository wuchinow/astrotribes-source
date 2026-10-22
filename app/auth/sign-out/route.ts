// Sign out (2b): a POST from a form, never a link, so nothing can sign a member out by loading a URL.
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/env';
import { requestClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.headers.set('Cache-Control', 'no-store');
  // The free chart's details carried in a tab (2c, lib/carry.ts) go with the session, whichever
  // form signed out. The browser clears this site's storage, not its cookies, so mood stays.
  response.headers.set('Clear-Site-Data', '"storage"');
  if (supabaseConfigured()) {
    try {
      await requestClient(request, response).auth.signOut({ scope: 'local' });
    } catch {
      // The cookies are cleared either way below.
    }
  }
  for (const { name } of request.cookies.getAll()) {
    if (name.startsWith('sb-')) response.cookies.delete(name);
  }
  return response;
}
