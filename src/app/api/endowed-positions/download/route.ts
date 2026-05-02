import { NextResponse } from 'next/server';
import { generateEndowedLetterDocx } from '@/lib/endowed-positions/docx-generator';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';
import type { GeneratedParts, MRCVote, SetupData } from '@/lib/endowed-positions/types';

export const runtime = 'nodejs';

type Body = {
  setup: SetupData;
  votes: MRCVote[];
  voteComments?: string;
  parts: GeneratedParts;
};

function safeFilename(s: string): string {
  return s.replace(/[^A-Za-z0-9_\-]+/g, '_').slice(0, 80);
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.setup || !body?.parts) {
    return NextResponse.json({ error: 'setup and parts are required.' }, { status: 400 });
  }

  try {
    const buf = await generateEndowedLetterDocx({
      setup: body.setup,
      votes: body.votes || [],
      voteComments: body.voteComments,
      parts: body.parts,
      letterheadImage: 'mays-default.jpg',
    });
    const namePart = body.setup.candidateName ? `_${safeFilename(body.setup.candidateName)}` : '';
    const filename = `endowed_recommendation${namePart}.docx`;

    return new Response(buf as unknown as BodyInit, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buf.length),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Download generation failed.' },
      { status: 500 },
    );
  }
}
