import { NextResponse } from 'next/server';
import { SESSION_COOKIE, buildSessionToken } from '@/lib/auth';

// Google OAuth — callback endpoint.
//
// Receives `code` and `state` from Google, validates state against the
// previously-set httpOnly cookie, exchanges the code for tokens, fetches
// the userinfo, enforces the @tamu.edu domain restriction, then sets the
// same `mml_session` cookie shape used by the password flow so all
// downstream admin routes work without modification.

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'mml_oauth_state';
const NEXT_COOKIE = 'mml_oauth_next';
const ALLOWED_DOMAIN = 'tamu.edu';

function publicBaseUrl(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  return `${proto}://${host}`;
}

function callbackUrl(req: Request): string {
  return `${publicBaseUrl(req)}/api/auth/google/callback`;
}

function clearOauthCookies(res: NextResponse) {
  const expire = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };
  res.cookies.set(STATE_COOKIE, '', expire);
  res.cookies.set(NEXT_COOKIE, '', expire);
}

function redirectError(req: Request, code: string) {
  const res = NextResponse.redirect(`${publicBaseUrl(req)}/login?error=${code}`);
  clearOauthCookies(res);
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    return redirectError(req, 'oauth');
  }
  if (!code || !state) {
    return redirectError(req, 'oauth');
  }

  // Validate state against cookie.
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieMap = new Map<string, string>();
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.split('=');
    if (!k) continue;
    cookieMap.set(k.trim(), rest.join('=').trim());
  }
  const storedState = cookieMap.get(STATE_COOKIE);
  const nextPath = cookieMap.get(NEXT_COOKIE) || '/admin';

  if (!storedState || storedState !== state) {
    return redirectError(req, 'oauth');
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirectError(req, 'oauth-not-configured');
  }

  // Exchange code for tokens.
  let accessToken: string | null = null;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl(req),
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!tokenRes.ok) {
      return redirectError(req, 'oauth');
    }
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    accessToken = tokenJson.access_token || null;
  } catch {
    return redirectError(req, 'oauth');
  }

  if (!accessToken) {
    return redirectError(req, 'oauth');
  }

  // Fetch userinfo.
  let email = '';
  let emailVerified = false;
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!infoRes.ok) {
      return redirectError(req, 'oauth');
    }
    const info = (await infoRes.json()) as {
      email?: string;
      email_verified?: boolean;
      hd?: string;
    };
    email = (info.email || '').toLowerCase();
    emailVerified = info.email_verified === true;
  } catch {
    return redirectError(req, 'oauth');
  }

  // Enforce @tamu.edu + verified email.
  const isTamu = email.endsWith(`@${ALLOWED_DOMAIN}`);
  if (!isTamu || !emailVerified) {
    return redirectError(req, 'domain');
  }

  // Build the same session token the password flow produces.
  const token = buildSessionToken();
  const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/admin';
  const res = NextResponse.redirect(`${publicBaseUrl(req)}${safeNext}`);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 12 * 60 * 60, // 12 hours
  });
  clearOauthCookies(res);
  return res;
}
