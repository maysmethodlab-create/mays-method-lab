import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Audit log writer for the Faculty Guidelines Chatbot. One JSONL line per
 * request, dated YYYY-MM-DD, written under data/audit/<bucket>/.
 *
 * Schema (one row per request):
 *   {
 *     ts:            ISO timestamp,
 *     userHash:      sha256(session-cookie || "anon") truncated to 12 chars,
 *     question:      latest user message,
 *     draft:         pass-1 model output,
 *     final:         pass-2 verifier output (the response actually sent),
 *     citations:     extracted "Per Mays Faculty Guidelines ..." citations,
 *     sourceVersion: label for the source document version used.
 *   }
 *
 * The directory is gitignored. If the write fails we swallow the error and
 * keep the request alive; auditing must never block a user reply.
 */

export type AuditEntry = {
  bucket: string;
  question: string;
  draft: string;
  final: string;
  sourceVersion: string;
  /** Optional opaque user identifier; will be hashed before writing. */
  userKey?: string;
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function todayUtc(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hashUser(userKey: string | undefined): string {
  const seed = (userKey || 'anon').toString();
  return crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12);
}

/**
 * Pull "Per Mays Faculty Guidelines ..." citations out of a response. The
 * verify pass enforces this exact citation prefix, so we just regex for it.
 */
export function extractCitations(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  const re = /Per Mays Faculty Guidelines[^\n]*/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[0].trim());
  }
  return out;
}

export function writeAuditEntry(entry: AuditEntry): void {
  try {
    const root = process.cwd();
    const dir = path.join(root, 'data', 'audit', entry.bucket);
    ensureDir(dir);
    const file = path.join(dir, `${todayUtc()}.jsonl`);
    const row = {
      ts: new Date().toISOString(),
      userHash: hashUser(entry.userKey),
      question: entry.question,
      draft: entry.draft,
      final: entry.final,
      citations: extractCitations(entry.final),
      sourceVersion: entry.sourceVersion,
    };
    fs.appendFileSync(file, JSON.stringify(row) + '\n', 'utf8');
  } catch {
    // Auditing must never block a reply. Swallow the error.
  }
}
