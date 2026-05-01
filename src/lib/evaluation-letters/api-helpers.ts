import 'server-only';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

/**
 * Per-instance rate limiter: max 10 requests / minute / client.
 * Sufficient for a single Render instance; replace with Redis for multi-instance.
 */
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function rateLimit(key: string): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - arr[0])) / 1000);
    return { ok: false, retryAfterSec };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true };
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const real = req.headers.get('x-real-ip') || '';
  return (fwd.split(',')[0] || real || 'unknown').trim();
}

export function requireAuth(req: Request): NextResponse | null {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const limit = rateLimit(clientKey(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a minute and retry.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec || 60) } },
    );
  }
  return null;
}

/**
 * Stub responses used when ANTHROPIC_API_KEY is "placeholder", so the workflow
 * can be exercised end-to-end without a real key.
 */
export function placeholderNotice(phase: string): string {
  return `*** PLACEHOLDER OUTPUT — ANTHROPIC_API_KEY not configured ***\n\nThis is a stub response for the ${phase} phase. Set a real ANTHROPIC_API_KEY in .env.local (or in your Render environment) to enable Claude generation.\n`;
}
