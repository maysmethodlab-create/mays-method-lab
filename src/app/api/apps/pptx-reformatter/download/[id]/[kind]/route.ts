import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';

/**
 * Authenticated download endpoint for the PowerPoint Reformatter
 * outputs. Both the .pptx and the accessibility .txt live under
 * data/pptx-outputs/ (gitignored). The id is the opaque
 * "{timestamp}-{random}" string returned by the process endpoint;
 * the kind is "pptx" or "report".
 *
 * The route validates the id format (anchored regex, no path
 * traversal) and resolves the resulting path before reading. Any
 * mismatch returns 404 without leaking detail.
 */

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'pptx-outputs');

// Match the id format the process route emits: digits, dash, hex.
const ID_RE = /^\d{10,16}-[a-f0-9]{6,32}$/i;

export async function GET(
  req: Request,
  { params }: { params: { id: string; kind: string } },
) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const { id, kind } = params;
  if (!ID_RE.test(id)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  if (kind !== 'pptx' && kind !== 'report') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const fileName =
    kind === 'pptx' ? `${id}-mays-branded.pptx` : `${id}-accessibility.txt`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  // Sanity check: resolved path must stay within the output directory.
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(OUTPUT_DIR))) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let buf: Buffer;
  try {
    buf = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }

  const contentType =
    kind === 'pptx'
      ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      : 'text/plain; charset=utf-8';
  // Use a Uint8Array view so the Response constructor accepts it across
  // both Node and Edge runtimes (Buffer subclasses Uint8Array on Node).
  const body = new Uint8Array(buf);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-disposition': `attachment; filename="${fileName}"`,
      'cache-control': 'private, no-store',
    },
  });
}
