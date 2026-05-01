import { NextResponse } from 'next/server';
import { generateLetterDocx, generateEmailDocx } from '@/lib/evaluation-letters/docx-generator';
import { getWriter } from '@/lib/evaluation-letters/writers';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';

type Body = {
  kind: 'letter' | 'email';
  text: string;
  writerId?: string;
  recipientName?: string;
};

function safeFilename(s: string): string {
  return s.replace(/[^A-Za-z0-9_\-]+/g, '_').slice(0, 80);
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.kind || !body?.text) {
    return NextResponse.json({ error: 'kind and text are required.' }, { status: 400 });
  }

  const writer = body.writerId ? getWriter(body.writerId) : undefined;
  const namePart = body.recipientName ? `_${safeFilename(body.recipientName)}` : '';

  try {
    const buf =
      body.kind === 'letter'
        ? await generateLetterDocx({
            letterText: body.text,
            letterhead: writer?.department,
            letterheadImage: writer?.letterheadImage,
          })
        : await generateEmailDocx(body.text);

    const filename = `${body.kind === 'letter' ? 'evaluation_letter' : 'accompanying_email'}${namePart}.docx`;

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
