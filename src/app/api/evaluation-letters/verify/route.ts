import { NextResponse } from 'next/server';
import { DEFAULT_MODEL, getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { verifyPrompt } from '@/lib/evaluation-letters/prompts';
import { lintLetter } from '@/lib/evaluation-letters/writing-rules';
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
    return NextResponse.json({
      report: `${placeholderNotice('Verify')}
## Factual Verification
(Claude would compare every claim in the letter against the uploaded source documents.)

## AI Language Issues (local lint, ${lintIssues.length} found)
${lintIssues.length === 0 ? 'No issues detected by the local lint.' : lintIssues.slice(0, 25).map((i) => `- ${i.kind}: "${i.match}" — context: "${i.context}"`).join('\n')}

## Verdict
${lintIssues.length === 0 ? 'READY TO SEND (local lint clean)' : 'NEEDS REVISION (local lint flagged issues)'}
`,
      lintIssues,
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

    // Extract corrected letter if present.
    const fence = text.match(/```[\w-]*\n([\s\S]*?)```/);
    const correctedText = fence ? fence[1].trim() : undefined;

    return NextResponse.json({ report: text, correctedText, lintIssues });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Verify phase failed.' },
      { status: 500 },
    );
  }
}
