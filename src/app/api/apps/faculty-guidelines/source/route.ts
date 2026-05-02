import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Serves the canonical Mays Faculty Guidelines PDF (October 17, 2025
 * Approved version) behind the same TAMU-member gate as the rest of /apps.
 * The PDF lives at data/sources/mays-faculty-guidelines.pdf and is not
 * exposed under /public so that unauthenticated visitors cannot fetch it.
 */
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const file = path.join(
      process.cwd(),
      'data',
      'sources',
      'mays-faculty-guidelines.pdf',
    );
    const buf = await fs.readFile(file);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'inline; filename="Mays-Faculty-Guidelines-2025-10-17.pdf"',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          'Source PDF is missing on the server. Run "node scripts/_extract-faculty-guidelines.mjs" locally and commit data/sources/mays-faculty-guidelines.pdf.',
      },
      { status: 404 },
    );
  }
}
