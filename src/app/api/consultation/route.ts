import { NextResponse } from 'next/server';
import {
  saveSubmission,
  type ConsultationPayload,
} from '@/lib/submissions';

export const runtime = 'nodejs';

const VALID_INTAKES = new Set([
  'help-with-something-specific',
  'build-me-a-custom-app',
  'idea-or-question',
]);
const MAILTO_RECIPIENT = 'ssridhar@mays.tamu.edu';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

const INTAKE_LABELS: Record<string, string> = {
  'help-with-something-specific': 'Help with something specific',
  'build-me-a-custom-app': 'Build me a custom app',
  'idea-or-question': 'I have an idea or question',
};

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
  const intakeRaw = asString(b.intakeType).trim();
  const subject = asString(b.subject).trim();
  const details = asString(b.details).trim();
  const bestMeetingTimes = asString(b.bestMeetingTimes).trim();

  if (!contributorName || !contributorEmail || !details) {
    return NextResponse.json(
      { error: 'Name, email, and details are required.' },
      { status: 400 },
    );
  }

  const intakeType = (
    VALID_INTAKES.has(intakeRaw) ? intakeRaw : 'help-with-something-specific'
  ) as ConsultationPayload['intakeType'];

  const payload: ConsultationPayload = {
    contributorName,
    contributorEmail,
    intakeType,
    subject,
    details,
    bestMeetingTimes: bestMeetingTimes || undefined,
  };

  const record = await saveSubmission('consultation', payload);

  const subjectLine = `[Your AI Edge] Consultation: ${subject || INTAKE_LABELS[intakeType]}`;
  const lines = [
    `From: ${contributorName} <${contributorEmail}>`,
    `Type: ${INTAKE_LABELS[intakeType]}`,
    ``,
    `Subject: ${subject || '(none)'}`,
    ``,
    `Details:`,
    details,
    ``,
  ];
  if (bestMeetingTimes) {
    lines.push(`Best meeting times:`, bestMeetingTimes, ``);
  }
  lines.push(`Submission id: ${record.id}`);
  const mailto = `mailto:${MAILTO_RECIPIENT}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(lines.join('\n'))}`;

  return NextResponse.json({ ok: true, id: record.id, mailto });
}
