import 'server-only';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';
import { scanDeck } from '@/lib/pptx/deck-scanner';

export const runtime = 'nodejs';
// File reading + XML walk is fast (no LLM). 30 seconds is plenty.
export const maxDuration = 30;

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB — bigger ceiling than the
// converter, since the analyzer needs to handle decks the converter would
// reject (e.g., decks the user uploads to find out whether they SHOULD
// be converted).

/**
 * Deck Analyzer scan endpoint.
 *
 * Accepts a multipart upload with field "file" (a .pptx or .pptm).
 * Returns a structured scan report covering reliability of conversion
 * (per element type, per slide, with traffic-light recommendation) and
 * accessibility issues (missing alt text, vague hyperlink text, slides
 * without titles, tables without header rows).
 *
 * Pure static analysis — no LLM calls, no file persistence, no
 * downstream conversion. The user uploads → server scans → server
 * returns JSON → client renders the report. Nothing is stored.
 */
export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Expected multipart/form-data with a "file" field.' },
      { status: 400 },
    );
  }

  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'No file uploaded under the "file" field.' },
      { status: 400 },
    );
  }

  const fileName =
    file instanceof File && typeof file.name === 'string' ? file.name : 'upload.pptx';

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is too large (${Math.round(file.size / 1024 / 1024)} MB). Limit: 50 MB.` },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const report = await scanDeck({ fileName, buffer });
  return NextResponse.json(report);
}
