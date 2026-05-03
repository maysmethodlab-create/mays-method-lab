import { NextResponse } from 'next/server';
import { CHEAP_MODEL, getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { researchPrompt } from '@/lib/evaluation-letters/prompts';
import { placeholderNotice, requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';
export const maxDuration = 120;

type Body = {
  sourceDocuments: string;
  /** The performance year being evaluated (e.g. 2025). Required so the
   *  research brief can hard-exclude pre-window content (papers, courses,
   *  service activities outside the relevant window). */
  evaluationYear?: number;
};

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.sourceDocuments) {
    return NextResponse.json(
      { error: 'sourceDocuments is required.' },
      { status: 400 },
    );
  }

  // Default to (currentYear - 1) when caller omits the year. Eval letters
  // written today are for last year's performance.
  const evaluationYear =
    typeof body.evaluationYear === 'number' && Number.isFinite(body.evaluationYear)
      ? body.evaluationYear
      : new Date().getFullYear() - 1;

  const { system, user } = researchPrompt({
    sourceDocuments: body.sourceDocuments,
    evaluationYear,
  });

  if (!isApiKeyConfigured()) {
    return NextResponse.json({
      brief: `${placeholderNotice('Research')}
## Basic Information
- Full Name: (would be extracted from source documents)
- Title / Role: (would be extracted)
- Department: (would be extracted)
- Role Category: (would be extracted)

## Research and Scholarly Accomplishments
(would list every publication, R&R, working paper, presentation, grant, and award found in the documents)

## Teaching and Student-Facing Accomplishments
(would list courses, evaluations, mentoring, awards)

## Service and Administrative Accomplishments
(would list committees, editorial roles, service contributions)

## Goals for the Upcoming Year
(would list every goal stated by the recipient)

## Key Themes and Patterns
(2-3 themes across materials)

## Raw Numbers and Facts
- (every specific number, date, name extracted)

— end of placeholder —`,
    });
  }

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: CHEAP_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    return NextResponse.json({ brief: text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Research phase failed.' },
      { status: 500 },
    );
  }
}
