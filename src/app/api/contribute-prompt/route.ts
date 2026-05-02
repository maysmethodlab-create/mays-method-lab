import { NextResponse } from 'next/server';
import {
  saveSubmission,
  type ContributePromptPayload,
} from '@/lib/submissions';

export const runtime = 'nodejs';

const VALID_ROLES = new Set(['faculty', 'staff', 'student']);
const MAILTO_RECIPIENT = 'ssridhar@mays.tamu.edu';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string');
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const b = (body || {}) as Record<string, unknown>;
  const contributorName = asString(b.contributorName).trim();
  const contributorRoleRaw = asString(b.contributorRole).trim();
  const promptTitle = asString(b.promptTitle).trim();
  const bucket = asString(b.bucket).trim();
  const promptText = asString(b.promptText).trim();
  const exampleOutput = asString(b.exampleOutput).trim();
  const toolsUsed = asStringArray(b.toolsUsed);

  if (!contributorName || !promptTitle || !promptText) {
    return NextResponse.json(
      { error: 'Name, prompt title, and prompt text are required.' },
      { status: 400 },
    );
  }

  const contributorRole = (
    VALID_ROLES.has(contributorRoleRaw) ? contributorRoleRaw : 'faculty'
  ) as ContributePromptPayload['contributorRole'];

  const payload: ContributePromptPayload = {
    contributorName,
    contributorRole,
    promptTitle,
    bucket,
    promptText,
    exampleOutput: exampleOutput || undefined,
    toolsUsed,
  };

  const record = await saveSubmission('contribute-prompt', payload);

  // Build a mailto: link the client opens so the Lab also gets a copy
  // until outbound email is wired up server-side.
  const subject = `[Your AI Edge] New prompt: ${promptTitle}`;
  const lines = [
    `From: ${contributorName} (${contributorRole})`,
    ``,
    `Title: ${promptTitle}`,
    `Bucket: ${bucket}`,
    `Tools used: ${toolsUsed.join(', ') || '(none specified)'}`,
    ``,
    `Prompt text:`,
    promptText,
    ``,
  ];
  if (exampleOutput) {
    lines.push(`Example output:`, exampleOutput, ``);
  }
  lines.push(`Submission id: ${record.id}`);
  const mailto = `mailto:${MAILTO_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

  return NextResponse.json({ ok: true, id: record.id, mailto });
}
