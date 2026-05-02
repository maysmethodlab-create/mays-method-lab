import { NextResponse } from 'next/server';
import { extractText } from '@/lib/evaluation-letters/extract-text';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';

/**
 * Multipart upload endpoint for the Endowed Positions app.
 * Reuses the same `extractText()` and rate-limit/auth helpers as the
 * Annual Evaluation Letters app.
 */
export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const files = form.getAll('files');
  if (!files.length) {
    return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
  }

  const out: Array<{
    id: string;
    filename: string;
    text: string;
    size: number;
    error?: string;
  }> = [];

  for (const f of files) {
    if (!(f instanceof Blob)) continue;
    const filename = (f as File).name || 'upload.bin';
    try {
      const buf = Buffer.from(await f.arrayBuffer());
      const result = await extractText({ filename, buffer: buf });
      out.push({
        id: crypto.randomUUID(),
        filename: result.filename,
        text: result.text,
        size: result.size,
      });
    } catch (e) {
      out.push({
        id: crypto.randomUUID(),
        filename,
        text: '',
        size: 0,
        error: e instanceof Error ? e.message : 'Failed to extract text.',
      });
    }
  }

  return NextResponse.json({ files: out });
}
