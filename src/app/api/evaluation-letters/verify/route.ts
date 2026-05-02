import { NextResponse } from 'next/server';
import { DEFAULT_MODEL, getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { hallucinationPrompt, verifyPrompt } from '@/lib/evaluation-letters/prompts';
import { lintLetter } from '@/lib/evaluation-letters/writing-rules';
import { sanitizeLetter } from '@/lib/evaluation-letters/sanitize';
import { placeholderNotice, requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';
export const maxDuration = 240;

type Body = {
  letterText: string;
  sourceDocuments: string;
  /** Writer's first-hand notes (forward-look plans, co-teaching, etc.).
   *  These are ground truth for the Hallucination Agent — without them,
   *  it flags forward-look claims as fabrications because they do not
   *  appear in the recipient's CV/F180. */
  writerNotes?: string;
};

/**
 * Two-agent verify pipeline:
 *
 *   1. Hallucination Agent — fact-checks every claim against source docs and
 *      produces a fact-corrected letter. Single job: kill fabrications.
 *   2. Style Agent — operates on the fact-corrected letter; fixes em-dashes,
 *      banned words, "Your"/"You" runs. Single job: kill AI-language patterns.
 *   3. Local Sanitizer — deterministic last-mile cleanup that runs over
 *      whatever the Style Agent emits.
 *
 * What the user downloads is the output of step 3.
 */

function extractFenced(text: string, fallback: string): string {
  // Prefer the LAST fenced block in the response, in case the AI used a
  // smaller fence earlier in its report.
  const matches = [...text.matchAll(/```[\w-]*\n([\s\S]*?)```/g)];
  const last = matches[matches.length - 1];
  return last ? last[1].trim() : fallback;
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.letterText) {
    return NextResponse.json({ error: 'letterText is required.' }, { status: 400 });
  }

  if (!isApiKeyConfigured()) {
    const sanitized = sanitizeLetter(body.letterText);
    const postLint = lintLetter(sanitized.text);
    return NextResponse.json({
      report: `${placeholderNotice('Verify')}
## Hallucination check
(Claude would compare every claim in the letter against the uploaded source documents.)

## Style check
(Claude would catch banned words and structural AI-language patterns.)

## Local sanitizer
- Swapped ${sanitized.changes.bannedWords} banned word(s)
- Swapped ${sanitized.changes.phrases} banned phrase(s)
- Removed ${sanitized.changes.dashes} em/en dash(es)
- Broke ${sanitized.changes.yourRuns} run(s) of "Your"/"You" sentence openers

## Verdict
${postLint.length === 0 ? 'READY TO SEND (sanitizer-only check passed)' : 'NEEDS REVISION (some lint remains)'}
`,
      correctedText: sanitized.text,
      lintIssues: postLint,
      sanitizerChanges: sanitized.changes,
    });
  }

  try {
    const client = getClient();

    // ---- Phase 3a: Hallucination Agent ----
    const hp = hallucinationPrompt({
      letterText: body.letterText,
      sourceDocuments: body.sourceDocuments || '',
      writerNotes: body.writerNotes || '',
    });
    const hRes = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 5000,
      system: hp.system,
      messages: [{ role: 'user', content: hp.user }],
    });
    const hReport = hRes.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');
    const factCorrected = extractFenced(hReport, body.letterText);

    // ---- Phase 3b: Style Agent (operates on the fact-corrected letter) ----
    const sp = verifyPrompt({ letterText: factCorrected });
    const sRes = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 5000,
      system: sp.system,
      messages: [{ role: 'user', content: sp.user }],
    });
    const sReport = sRes.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');
    const styleCorrected = extractFenced(sReport, factCorrected);

    // ---- Phase 3c: Local Sanitizer (deterministic safety net) ----
    const sanitized = sanitizeLetter(styleCorrected);
    const postLint = lintLetter(sanitized.text);

    const combinedReport = `# Hallucination Agent — Factual Audit

${hReport}

---

# Style Agent — AI-Language Audit

${sReport}

---

**Local sanitizer pass** (deterministic, runs after both agents):
- Swapped ${sanitized.changes.bannedWords} banned word(s)
- Swapped ${sanitized.changes.phrases} banned phrase(s)
- Removed ${sanitized.changes.dashes} em/en dash(es)
- Broke ${sanitized.changes.yourRuns} run(s) of "Your"/"You" sentence openers

**Lint after sanitize**: ${postLint.length === 0 ? 'clean ✓' : `${postLint.length} remaining (${postLint.map((i) => i.match).slice(0, 5).join(', ')})`}`;

    return NextResponse.json({
      report: combinedReport,
      correctedText: sanitized.text,
      lintIssues: postLint,
      sanitizerChanges: sanitized.changes,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Verify phase failed.' },
      { status: 500 },
    );
  }
}
