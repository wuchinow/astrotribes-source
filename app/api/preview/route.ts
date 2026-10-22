// The passcode form's target. A plain form post, so it works without JavaScript: right passcode,
// cookie and back to the gated page; wrong one, back to /preview with an error. Rate-limited
// against guessing. The passcode is compared as an HMAC and never logged.
//
// GET answers one question for the Appearance panel: may this visitor see Tune (1f)? Yes only with
// a valid at-preview cookie. It reads no body, sets nothing, logs nothing, and is never cached.
import { NextResponse, type NextRequest } from 'next/server';
import {
  hasPreviewAccess,
  passcodeMatches,
  previewCookie,
  previewIsOpenable,
  previewToken,
  safeReturnPath,
} from '@/lib/preview';
import { takeRateLimit } from '@/lib/rate-limit';

const MAX_PASSCODE = 200;

const back = (request: NextRequest, next: string, error?: 'wrong' | 'closed') => {
  const url = new URL('/preview', request.url);
  url.searchParams.set('next', next);
  if (error) url.searchParams.set('error', error);
  return NextResponse.redirect(url, 303);
};

export function GET(request: NextRequest) {
  let tune = false;
  try {
    tune = hasPreviewAccess(request.cookies);
  } catch {
    tune = false;
  }
  return NextResponse.json({ tune }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: NextRequest) {
  try {
    const limit = takeRateLimit('passcode', request.headers);
    if (!limit.ok) {
      return new Response('Too many tries. Wait 15 minutes, then try the passcode again.', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'Retry-After': String(limit.retryAfter),
        },
      });
    }

    const form = await request.formData();
    const next = safeReturnPath(form.get('next'));
    if (!previewIsOpenable()) return back(request, next, 'closed');

    const attempt = form.get('passcode');
    if (typeof attempt !== 'string' || attempt.length === 0 || attempt.length > MAX_PASSCODE) {
      return back(request, next, 'wrong');
    }
    if (!passcodeMatches(attempt)) return back(request, next, 'wrong');

    const response = NextResponse.redirect(new URL(next, request.url), 303);
    response.cookies.set(previewCookie(previewToken(process.env.PREVIEW_PASSCODE!)));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return back(request, '/sign-in', 'wrong');
  }
}
