import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Google OAuth — start endpoint.
//
// Generates a CSRF state token, stores it in an httpOnly cookie, and redirects
// the user to Google's consent page. The callback will validate the cookie
// against the returned `state` query param.
//
// Domain restriction (@tamu.edu) is enforced on the callback side. The `hd`
// hint sent here just nudges Google's account picker toward the user's TAMU
// account; it is NOT a security boundary on its own.

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'mml_oauth_state';
const NEXT_COOKIE = 'mml_oauth_next';
const STATE_MAX_AGE_SEC = 5 * 60; // 5 minutes

function callbackUrl(req: Request): string {
  const url = new URL(req.url);
  // Prefer x-forwarded-* headers when behind Render's proxy.
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  return `${proto}://${host}/api/auth/google/callback`;
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    // Don't crash; surface a clear error on the login page.
    return NextResponse.redirect(new URL('/login?error=oauth-not-configured', req.url));
  }

  const url = new URL(req.url);
  const nextParam = url.searchParams.get('next') || '/admin';
  // Only allow internal redirects to avoid open-redirect abuse.
  const safeNext = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/admin';

  const state = crypto.randomBytes(32).toString('hex');
  const redirectUri = callbackUrl(req);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('hd', 'tamu.edu');
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('access_type', 'online');

  const res = NextResponse.redirect(authUrl.toString());
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: STATE_MAX_AGE_SEC,
  };
  res.cookies.set(STATE_COOKIE, state, cookieOpts);
  res.cookies.set(NEXT_COOKIE, safeNext, cookieOpts);
  return res;
}
