// Next 16's proxy, formerly middleware. On the member paths (2b) it refreshes the Supabase session,
// so pages, which cannot write cookies, see a current one. That refresh is not the session check:
// each page, action, and route still calls getUser itself (invariant 5). Until 1d it also held the
// preview passcode at the door of /sky; no page is gated now. Nothing here reads a body or logs.
import { NextResponse, type NextRequest } from 'next/server';
import { isMemberPath } from '@/lib/preview';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from '@/lib/supabase/env';

export async function proxy(request: NextRequest) {
  if (!isMemberPath(request.nextUrl.pathname)) return NextResponse.next({ request });

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

// A literal, as Next requires. Keep in step with MEMBER_PREFIXES in lib/preview.ts.
export const config = {
  matcher: [
    '/sign-in/:path*',
    '/auth/:path*',
    '/account/:path*',
    '/api/account/:path*',
    '/welcome/:path*',
    '/your-chart/:path*',
  ],
};
