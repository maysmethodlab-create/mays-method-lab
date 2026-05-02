import { NextResponse } from 'next/server';
import { sanitizeLetter } from '@/lib/evaluation-letters/sanitize';
import { lintLetter } from '@/lib/evaluation-letters/writing-rules';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';

type Body = {
  letterText: string;
};

/**
 * Lightweight verify pass for the Endowed Positions memo. The boilerplate
 * is fixed, so we only need the deterministic local sanitizer (banned
 * words, em-dashes, AI-language patterns). No Claude call, no fact-check.
 */
export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.letterText) {
    return NextResponse.json({ error: 'letterText is required.' }, { status: 400 });
  }

  const sanitized = sanitizeLetter(body.letterText);
  const postLint = lintLetter(sanitized.text);

  return NextResponse.json({
    correctedText: sanitized.text,
    sanitizerChanges: sanitized.changes,
    lintIssues: postLint,
    report: `Local sanitizer pass:
- Swapped ${sanitized.changes.bannedWords} banned word(s)
- Swapped ${sanitized.changes.phrases} banned phrase(s)
- Removed ${sanitized.changes.dashes} em/en dash(es)
- Broke ${sanitized.changes.yourRuns} run(s) of "Your"/"You" sentence openers

Lint after sanitize: ${postLint.length === 0 ? 'clean' : `${postLint.length} remaining`}`,
  });
}
