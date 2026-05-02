import { NextResponse } from 'next/server';
import {
  saveSubmission,
  type JoinLabPayload,
} from '@/lib/submissions';

export const runtime = 'nodejs';

const VALID_ROLES = new Set(['faculty', 'staff', 'student', 'other']);
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
  const contributorEmail = asString(b.contributorEmail).trim();
  const contributorRoleRaw = asString(b.contributorRole).trim();
  const helpWith = asStringArray(b.helpWith);
  const whyInterested = asString(b.whyInterested).trim();

  if (!contributorName || !contributorEmail) {
    return NextResponse.json(
      { error: 'Name and email are required.' },
      { status: 400 },
    );
  }

  const contributorRole = (
    VALID_ROLES.has(contributorRoleRaw) ? contributorRoleRaw : 'faculty'
  ) as JoinLabPayload['contributorRole'];

  const payload: JoinLabPayload = {
    contributorName,
    contributorEmail,
    contributorRole,
    helpWith,
    whyInterested: whyInterested || undefined,
  };

  const record = await saveSubmission('join-lab', payload);

  const subject = `[Your AI Edge] Join the Lab: ${contributorName}`;
  const lines = [
    `From: ${contributorName} <${contributorEmail}>`,
    `Role: ${contributorRole}`,
    ``,
    `Wants to help with: ${helpWith.join(', ') || '(none specified)'}`,
    ``,
  ];
  if (whyInterested) {
    lines.push(`Why interested:`, whyInterested, ``);
  }
  lines.push(`Submission id: ${record.id}`);
  const mailto = `mailto:${MAILTO_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

  return NextResponse.json({ ok: true, id: record.id, mailto });
}
