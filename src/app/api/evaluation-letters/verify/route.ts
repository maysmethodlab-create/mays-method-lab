import { NextResponse } from 'next/server';
import { DEFAULT_MODEL, getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { verifyPrompt } from '@/lib/evaluation-letters/prompts';
import { lintLetter } from '@/lib/evaluation-letters/writing-rules';
import { sanitizeLetter } from '@/lib/evaluation-letters/sanitize';
import { placeholderNotice, requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';
export const maxDuration = 120;

type Body = {
  letterText: string;
  sourceDocuments: string;
};

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.letterText) {
    return NextResponse.json({ error: 'letterText is required.' }, { status: 400 });
  }

  // Always run the local lint so the UI can show structural issues even without an API key.
  const lintIssues = lintLetter(body.letterText);

  if (!isApiKeyConfigured()) {
    // Even without an API key, run the deterministic sanitizer so the workflow
    // returns a cleaner letter.
    const sanitized = sanitizeLetter(body.letterText);
    const postLint = lintLetter(sanitized.text);
    return NextResponse.json({
      report: `${placeholderNotice('Verify')}
## Factual Verification
(Claude would compare every claim in the letter against the uploaded source documents.)

## Local sanitizer
- Swapped ${sanitized.changes.bannedWords} banned word(s)
- Swapped ${sanitized.changes.phrases} banned phrase(s)
- Removed ${sanitized.changes.dashes} em/en dash(es)
- Broke ${sanitized.changes.yourRuns} run(s) of "Your"/"You" sentence openers

## AI Language Issues (after sanitize)
${postLint.length === 0 ? 'No issues remaining.' : postLint.map((i) => `- ${i.kind}: "${i.match}"`).join('\n')}

## Verdict
${postLint.length === 0 ? 'READY TO SEND (sanitized letter is clean)' : 'NEEDS REVISION (some issues remain after sanitize)'}
`,
      correctedText: sanitized.text,
      lintIssues: postLint,
      sanitizerChanges: sanitized.changes,
    });
  }

  const { system, user } = verifyPrompt({
    letterText: body.letterText,
    sourceDocuments: body.sourceDocuments || '',
  });

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const text = response.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');

    // Extract corrected letter if present; otherwise use the original.
    const fence = text.match(/```[\w-]*\n([\s\S]*?)```/);
    const aiCorrected = fence ? fence[1].trim() : body.letterText;

    // Always run the deterministic sanitizer over whatever text we'll surface.
    const sanitized = sanitizeLetter(aiCorrected);
    const postLint = lintLetter(sanitized.text);

    const sanitizerNote = `

---

**Local sanitizer pass** (deterministic, runs after Claude):
- Swapped ${sanitized.changes.bannedWords} banned word(s)
- Swapped ${sanitized.changes.phrases} banned phrase(s)
- Removed ${sanitized.changes.dashes} em/en dash(es)
- Broke ${sanitized.changes.yourRuns} run(s) of "Your"/"You" sentence openers

**Lint after sanitize**: ${postLint.length === 0 ? 'clean ✓' : `${postLint.length} remaining (${postLint.map((i) => i.match).slice(0, 5).join(', ')})`}`;

    return NextResponse.json({
      report: text + sanitizerNote,
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
