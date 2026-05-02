import { NextResponse } from 'next/server';
import { assembleFinalLetter, buildSummarySection } from '@/lib/evaluation-letters/prompts';
import { getRoleCategory, RATING_LEVELS } from '@/lib/evaluation-letters/role-categories';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';

type Body = {
  recipientName: string;
  roleCategoryId: string;
  /** Optional letter body. If present, returned as the final assembled letter
   *  (body + appended Summary block). Kept on the surface for forward-compat
   *  with future writer-specific structures. */
  letterText?: string;
  writerId?: string;
  teachingRating: string;
  researchRating?: string;
  serviceRating?: string;
  overallRating: string;
};

function firstNameOf(full: string): string {
  return full.split(/\s+/)[0]?.replace(/[^A-Za-z'-]/g, '') || full;
}

function isValidRating(r?: string): boolean {
  if (!r) return false;
  return (RATING_LEVELS as readonly string[]).includes(r);
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: 'Missing body.' }, { status: 400 });
  }
  if (!body.recipientName || !body.roleCategoryId || !body.overallRating) {
    return NextResponse.json(
      { error: 'recipientName, roleCategoryId, and overallRating are required.' },
      { status: 400 },
    );
  }
  const role = getRoleCategory(body.roleCategoryId);
  if (!role) {
    return NextResponse.json({ error: 'Unknown role category.' }, { status: 400 });
  }

  const hasResearch = role.required.includes('research');
  if (!isValidRating(body.teachingRating) || !isValidRating(body.overallRating)) {
    return NextResponse.json(
      { error: 'Teaching and Overall ratings are required.' },
      { status: 400 },
    );
  }
  if (hasResearch && !isValidRating(body.researchRating)) {
    return NextResponse.json(
      { error: 'Research rating is required for this role category.' },
      { status: 400 },
    );
  }
  if (role.required.includes('service') && !isValidRating(body.serviceRating)) {
    return NextResponse.json(
      { error: 'Service rating is required for this role category.' },
      { status: 400 },
    );
  }

  const ratingsArgs = {
    writerId: body.writerId,
    recipientFirstName: firstNameOf(body.recipientName),
    hasResearchEvaluation: hasResearch,
    teachingRating: body.teachingRating,
    researchRating: body.researchRating,
    serviceRating: body.serviceRating,
    overallRating: body.overallRating,
  };

  // If the client passed the current letter body, return the fully
  // assembled final letter. Otherwise return just the Summary block.
  if (body.letterText) {
    const letter = assembleFinalLetter({
      letterText: body.letterText,
      ratings: ratingsArgs,
    });
    const summary = buildSummarySection(ratingsArgs);
    return NextResponse.json({ letter, summary });
  }

  const summary = buildSummarySection(ratingsArgs);
  return NextResponse.json({ summary });
}
