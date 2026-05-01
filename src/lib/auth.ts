import { cookies } from 'next/headers';
import crypto from 'crypto';

// TODO: Replace with TAMU CAS SSO (https://cas.tamu.edu).
// Users will authenticate via their NetID. The session payload will then carry
// { netid, role, displayName } instead of the simple boolean used by the v1 password gate.

export const SESSION_COOKIE = 'mml_session';

const sessionSecret = () =>
  process.env.SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  'mays-method-lab-dev-secret-change-me';

const expectedAdminPassword = () => process.env.ADMIN_PASSWORD || '';

function signToken(payload: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('hex');
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Validate a password attempt against the configured ADMIN_PASSWORD.
 */
export function verifyAdminPassword(attempt: string): boolean {
  const expected = expectedAdminPassword();
  if (!expected) return false;
  if (!attempt) return false;
  // Pad to equal length to keep timing comparison safe.
  const a = Buffer.from(attempt);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Build a signed session token: "<issuedAt>.<sig>".
 */
export function buildSessionToken(): string {
  const issuedAt = Date.now().toString();
  const sig = signToken(issuedAt);
  return `${issuedAt}.${sig}`;
}

/**
 * Verify the cookie token; expires after 12 hours.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [issuedAt, sig] = parts;
  if (!issuedAt || !sig) return false;
  const expectedSig = signToken(issuedAt);
  if (!timingSafeEqual(sig, expectedSig)) return false;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;
  const ageMs = Date.now() - issued;
  const maxAgeMs = 12 * 60 * 60 * 1000; // 12 hours
  return ageMs >= 0 && ageMs <= maxAgeMs;
}

/**
 * Async — must be called from a server component / route handler.
 * Returns true if the request carries a valid session cookie.
 */
export function isAuthenticated(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
