import 'server-only';
import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/evaluation-letters/api-helpers';
import { writeAuditEntry } from '@/lib/audit-log';
import { SESSION_COOKIE } from '@/lib/auth';
import { runPipeline } from '@/lib/pptx/pipeline';
import { isApiKeyConfigured } from '@/lib/evaluation-letters/claude';

export const runtime = 'nodejs';
// LLM pipeline + file write can take a while on a 30+ slide deck; bump
// the duration ceiling so the request doesn't time out mid-pass.
export const maxDuration = 300;

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'pptx-uploads');
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'pptx-outputs');

/**
 * PowerPoint Reformatter pipeline endpoint.
 *
 * Accepts a multipart upload with a single .pptx file under field
 * "file". Saves the upload to data/pptx-uploads/, runs the six-step
 * pipeline on Claude Haiku, writes the branded .pptx and the
 * accessibility text report to data/pptx-outputs/, and returns JSON
 * with download URLs.
 *
 * Both folders are gitignored. Output IDs are random so URLs are
 * not enumerable.
 */

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function makeId(): string {
  const ts = Date.now();
  const rnd = crypto.randomBytes(6).toString('hex');
  return `${ts}-${rnd}`;
}

function readSessionUserKey(): string {
  try {
    return cookies().get(SESSION_COOKIE)?.value || 'anon';
  } catch {
    return 'anon';
  }
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  if (!isApiKeyConfigured()) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
      { status: 503 },
    );
  }

  // Parse multipart upload.
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart upload.' }, { status: 400 });
  }
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file" field.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Limit is ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.` },
      { status: 413 },
    );
  }
  // Accept .pptx by extension; PowerPoint sometimes ships an empty MIME.
  const inputName = file.name || 'upload.pptx';
  if (!/\.pptx$/i.test(inputName)) {
    return NextResponse.json({ error: 'Only .pptx files are supported.' }, { status: 415 });
  }

  // Persist the upload (so we can re-run on demand and trace issues).
  await ensureDir(UPLOAD_DIR);
  await ensureDir(OUTPUT_DIR);
  const id = makeId();
  const inputPath = path.join(UPLOAD_DIR, `${id}.pptx`);
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(inputPath, inputBuffer);

  // Run the six-step pipeline.
  let result: Awaited<ReturnType<typeof runPipeline>>;
  try {
    result = await runPipeline({ fileBuffer: inputBuffer });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Pipeline failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Write outputs.
  const outBaseName = `${id}-mays-branded.pptx`;
  const reportBaseName = `${id}-accessibility.txt`;
  const outPath = path.join(OUTPUT_DIR, outBaseName);
  const reportPath = path.join(OUTPUT_DIR, reportBaseName);
  await fs.writeFile(outPath, result.pptxBuffer);
  await fs.writeFile(reportPath, result.accessibilityText, 'utf8');

  // Audit log.
  writeAuditEntry({
    bucket: 'pptx-reformatter',
    question: `upload: ${inputName}`,
    draft: JSON.stringify({
      slideCount: result.pipeline.synthesized.slideCount,
      deckSummary: result.pipeline.synthesized.deckSummary,
    }),
    final: JSON.stringify({
      output: outBaseName,
      report: reportBaseName,
      score: result.pipeline.accessibility.report.score,
      passed: result.pipeline.accessibility.report.passedCount,
      autoFixed: result.pipeline.accessibility.report.autoFixedCount,
      needsReview: result.pipeline.accessibility.report.needsReviewCount,
    }),
    sourceVersion: 'PowerPoint Reformatter v1 (Claude Haiku 4.5)',
    userKey: readSessionUserKey(),
  });

  return NextResponse.json({
    ok: true,
    id,
    pptxUrl: `/api/apps/pptx-reformatter/download/${id}/pptx`,
    accessibilityReportUrl: `/api/apps/pptx-reformatter/download/${id}/report`,
    slideCount: result.pipeline.plan.slideCount,
    sourceSlideCount: result.pipeline.synthesized.slideCount,
    accessibilityScore: result.pipeline.accessibility.report.score,
    passedCount: result.pipeline.accessibility.report.passedCount,
    autoFixedCount: result.pipeline.accessibility.report.autoFixedCount,
    needsReviewCount: result.pipeline.accessibility.report.needsReviewCount,
  });
}
