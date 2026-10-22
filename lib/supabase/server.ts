// The member's own Supabase client on the server (2b): the publishable key and the session cookies,
// so every query runs as the member under RLS. Pages, server actions, and route handlers make one
// per request, then check the session themselves with getUser (invariant 5).
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { supabasePublishableKey, supabaseUrl } from './env';

/** For pages and server actions. A page cannot write cookies; proxy.ts refreshes the session first. */
export async function memberClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl()!, supabasePublishableKey()!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // A server component: proxy.ts has already refreshed the cookies for this request.
        }
      },
    },
  });
}

/** For route handlers and proxy.ts: reads the request's cookies and writes any refresh onto `response`. */
export function requestClient(request: NextRequest, response?: NextResponse) {
  return createServerClient(supabaseUrl()!, supabasePublishableKey()!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value, options } of list) {
          request.cookies.set(name, value);
          response?.cookies.set(name, value, options);
        }
      },
    },
  });
}
