import { NextResponse } from 'next/server';
import { DEFAULT_MODEL, getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { emailPrompt } from '@/lib/evaluation-letters/prompts';
import { getWriter } from '@/lib/evaluation-letters/writers';
import { placeholderNotice, requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';
export const maxDuration = 90;

type Body = {
  writerId: string;
  recipientName: string;
  ccName: string;
  letterText: string;
};

function firstNameOf(full: string): string {
  return full.split(/\s+/)[0]?.replace(/[^A-Za-z'-]/g, '') || full;
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.writerId || !body?.recipientName || !body?.letterText) {
    return NextResponse.json(
      { error: 'writerId, recipientName, and letterText are required.' },
      { status: 400 },
    );
  }

  const writer = getWriter(body.writerId);
  if (!writer) {
    return NextResponse.json({ error: 'Unknown writer.' }, { status: 400 });
  }

  if (!isApiKeyConfigured()) {
    return NextResponse.json({
      email: `${placeholderNotice('Email')}
Subject: Annual Performance Review

Dear ${firstNameOf(body.recipientName)},

Thank you for our recent meeting and for the thoughtful self-evaluation you submitted. I have written a letter that captures our discussion and the goals we set together for the coming year.

(With a real ANTHROPIC_API_KEY, this email would mention 2-3 specific highlights from the letter and close with a warm, personal note.)

I am copying ${body.ccName || 'Dean Sharp'}. The formal letter will be sent for your signature and personnel file.

Warm regards,
${writer.firstName}
`,
    });
  }

  const { system, user } = emailPrompt({
    writerName: writer.name,
    writerFirstName: writer.firstName,
    recipientName: body.recipientName,
    recipientFirstName: firstNameOf(body.recipientName),
    ccName: body.ccName || 'Dean Sharp',
    letterText: body.letterText,
  });

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 700,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const email = response.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');
    return NextResponse.json({ email });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Email phase failed.' },
      { status: 500 },
    );
  }
}
