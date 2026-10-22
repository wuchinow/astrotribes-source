// The preview passcode at the door (Next 16's proxy, formerly middleware). Pages without the
// cookie go to /preview; APIs get a 401. The gated routes check again themselves (lib/preview.ts),
// so this is the first check, not the only one. Nothing here reads a body or logs.
import { NextResponse, type NextRequest } from 'next/server';
import { PREVIEW_COOKIE, isPreviewToken } from '@/lib/preview';

export function proxy(request: NextRequest) {
  if (isPreviewToken(request.cookies.get(PREVIEW_COOKIE)?.value)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'preview_required' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const url = new URL('/preview', request.url);
  url.searchParams.set('next', pathname.startsWith('/sky') ? '/sky' : '/chart');
  const response = NextResponse.redirect(url, 307);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

// A literal, as Next requires. Keep in step with GATED_PREFIXES in lib/preview.ts.
export const config = {
  matcher: ['/chart/:path*', '/sky/:path*', '/api/chart/:path*', '/api/place/:path*'],
};
