import { NextResponse } from 'next/server';
import { DEFAULT_MODEL, getClient, isApiKeyConfigured } from '@/lib/evaluation-letters/claude';
import { coerceIdentifyJson, regexIdentify } from '@/lib/evaluation-letters/identify';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';
export const maxDuration = 30;

type Body = { sourceDocuments: string };

const SYSTEM = `You identify the recipient of an annual performance evaluation letter from their self-evaluation and CV.

Return ONLY a JSON object (no commentary, no code fence) with these keys:

{
  "name": "<full legal name with degree suffix if present, e.g. 'Jane Smith, Ph.D.'>",
  "title": "<exact academic title, e.g. 'Associate Professor of Marketing'>",
  "department": "<full department name, e.g. 'Department of Marketing'>"
}

If a value cannot be determined from the documents, use null. Do not invent.`;

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

  // Trim to keep the call cheap — first 6000 chars usually contain the header.
  const text = body.sourceDocuments.slice(0, 6000);

  if (!isApiKeyConfigured()) {
    const result = regexIdentify(text);
    return NextResponse.json({ ...result, source: 'regex' });
  }

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 200,
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    });
    const raw = response.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');
    const result = coerceIdentifyJson(raw);
    // Backfill anything the LLM missed using the regex pass.
    if (!result.name || !result.title || !result.department) {
      const fallback = regexIdentify(text);
      result.name = result.name || fallback.name;
      result.title = result.title || fallback.title;
      result.department = result.department || fallback.department;
      result.roleCategoryId = result.roleCategoryId || fallback.roleCategoryId;
    }
    return NextResponse.json({ ...result, source: 'llm' });
  } catch {
    // Always degrade gracefully to regex.
    const result = regexIdentify(text);
    return NextResponse.json({ ...result, source: 'regex-fallback' });
  }
}
