// Two jobs (Next 16's proxy, formerly middleware). On the member paths (2b) it refreshes the
// Supabase session, so pages, which cannot write cookies, see a current one. That refresh is not
// the session check: each page, action, and route still calls getUser itself (invariant 5).
//
// On the gated paths (the /sky stub) it is the preview passcode at the door: pages without the
// cookie go to /preview. The page checks again itself (lib/preview.ts). Nothing here reads a body
// or logs.
import { NextResponse, type NextRequest } from 'next/server';
import { PREVIEW_COOKIE, isMemberPath, isPreviewToken, returnPathFor } from '@/lib/preview';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from '@/lib/supabase/env';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMemberPath(pathname)) {
    let response = NextResponse.next({ request });
    if (supabaseConfigured()) {
      // Supabase's pattern: a refreshed token goes onto the request (so this render sees it) and
      // onto a fresh response (so the browser keeps it).
      const supabase = createServerClient(supabaseUrl()!, supabasePublishableKey()!, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(list) {
            for (const { name, value } of list) request.cookies.set(name, value);
            response = NextResponse.next({ request });
            for (const { name, value, options } of list) response.cookies.set(name, value, options);
          },
        },
      });
      try {
        await supabase.auth.getClaims();
      } catch {
        // No session to refresh, or Supabase unreachable: the page's own check decides.
      }
    }
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  if (isPreviewToken(request.cookies.get(PREVIEW_COOKIE)?.value)) {
    const response = NextResponse.next({ request });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  const url = new URL('/preview', request.url);
  url.searchParams.set('next', returnPathFor(pathname));
  const response = NextResponse.redirect(url, 307);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

// A literal, as Next requires. Keep in step with GATED_PREFIXES and MEMBER_PREFIXES in lib/preview.ts.
export const config = {
  matcher: [
    '/sky/:path*',
    '/sign-in/:path*',
    '/auth/:path*',
    '/account/:path*',
    '/api/account/:path*',
    '/welcome/:path*',
    '/your-chart/:path*',
  ],
};
