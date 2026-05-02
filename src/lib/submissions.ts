/**
 * Submissions storage helpers for the /your-ai-edge intake forms.
 *
 * Each form (contribute-prompt, consultation, join-lab) writes its payload
 * to a JSON file at `data/submissions/{type}/{timestamp}-{id}.json`.
 *
 * The directory is gitignored so PII never lands in source control. Hari
 * reviews submissions by reading the JSON files directly. Approved
 * contributed prompts get a `"approved": true` flag added manually.
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type SubmissionType =
  | 'contribute-prompt'
  | 'consultation'
  | 'join-lab';

const ROOT = process.cwd();
const SUBMISSIONS_DIR = path.join(ROOT, 'data', 'submissions');

function safeFilename(stamp: string, id: string): string {
  // Strip everything but ASCII letters/digits/dashes for filesystem safety.
  return `${stamp}-${id}.json`.replace(/[^A-Za-z0-9._-]/g, '_');
}

export type SavedSubmission<T> = {
  id: string;
  type: SubmissionType;
  receivedAt: string;
  approved?: boolean;
  payload: T;
};

export async function saveSubmission<T>(
  type: SubmissionType,
  payload: T,
): Promise<SavedSubmission<T>> {
  const id = crypto.randomBytes(6).toString('hex');
  const receivedAt = new Date().toISOString();
  const stamp = receivedAt.replace(/[:.]/g, '-');

  const dir = path.join(SUBMISSIONS_DIR, type);
  await fs.mkdir(dir, { recursive: true });

  const filename = safeFilename(stamp, id);
  const fullPath = path.join(dir, filename);

  const record: SavedSubmission<T> = {
    id,
    type,
    receivedAt,
    payload,
  };

  await fs.writeFile(fullPath, JSON.stringify(record, null, 2), 'utf8');
  return record;
}

/**
 * Read all saved JSON submissions of a type. Returns the parsed records.
 * If the directory does not exist, returns an empty array.
 */
export async function readSubmissions<T>(
  type: SubmissionType,
): Promise<SavedSubmission<T>[]> {
  const dir = path.join(SUBMISSIONS_DIR, type);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const results: SavedSubmission<T>[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    try {
      const content = await fs.readFile(path.join(dir, entry), 'utf8');
      const parsed = JSON.parse(content) as SavedSubmission<T>;
      results.push(parsed);
    } catch {
      // Skip unreadable / malformed files. Don't blow up the whole list.
    }
  }
  // Newest first.
  results.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  return results;
}

/* =============================================================
   Submission payload shapes
   ============================================================= */

export type ContributePromptPayload = {
  contributorName: string;
  contributorRole: 'faculty' | 'staff' | 'student';
  promptTitle: string;
  bucket: string;
  promptText: string;
  exampleOutput?: string;
  toolsUsed: string[];
};

export type ConsultationPayload = {
  contributorName: string;
  contributorEmail: string;
  intakeType:
    | 'help-with-something-specific'
    | 'build-me-a-custom-app'
    | 'idea-or-question';
  subject: string;
  details: string;
  bestMeetingTimes?: string;
};

export type JoinLabPayload = {
  contributorName: string;
  contributorEmail: string;
  contributorRole: 'faculty' | 'staff' | 'student' | 'other';
  helpWith: string[];
  whyInterested?: string;
};

/**
 * Read the most recent N approved contributed prompts. Used by the
 * "Recently contributed" row at the top of the Prompts section.
 */
export async function recentApprovedContributedPrompts(
  limit = 5,
): Promise<
  Array<{
    id: string;
    promptTitle: string;
    description: string;
    href: string;
    contributorName: string;
    contributorRole: string;
  }>
> {
  const all = await readSubmissions<ContributePromptPayload>(
    'contribute-prompt',
  );
  const approved = all.filter((r) => r.approved === true);
  return approved.slice(0, limit).map((r) => ({
    id: r.id,
    promptTitle: r.payload.promptTitle,
    description: r.payload.promptText.slice(0, 140) + (r.payload.promptText.length > 140 ? '...' : ''),
    href: `/your-ai-edge/contribute-prompt#${r.id}`,
    contributorName: r.payload.contributorName,
    contributorRole: r.payload.contributorRole,
  }));
}
