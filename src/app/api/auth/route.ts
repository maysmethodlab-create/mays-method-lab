import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  buildSessionToken,
  verifyAdminPassword,
} from '@/lib/auth';

// In-memory rate limiter — best-effort per-instance throttle.
// On Render single instance this is sufficient; for multi-instance we'd swap to Redis.
const attempts = new Map<string, { count: number; firstAttemptAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const real = req.headers.get('x-real-ip') || '';
  return (fwd.split(',')[0] || real || 'unknown').trim();
}

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const key = clientKey(req);
  if (!rateLimit(key)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const password = (body?.password || '').trim();
  if (!password) {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'placeholder') {
    return NextResponse.json(
      {
        error:
          'Admin password is not yet configured on the server. Set ADMIN_PASSWORD in environment.',
      },
      { status: 503 },
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = buildSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 12 * 60 * 60, // 12 hours
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
