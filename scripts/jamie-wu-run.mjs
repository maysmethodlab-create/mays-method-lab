#!/usr/bin/env node
/**
 * Jamie's first-time end-to-end roleplay run for Wei Wu.
 * Mirrors what the UI would POST through every step.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateFile } from './_template-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const OUT_DIR = path.join(APP_DIR, 'test-output', 'jamie-roleplay-wu');
const BASE = 'http://localhost:3000';
const ADMIN_PASSWORD = 'mml-dev-2026';

const FILES = ['Wu, Wei CV.pdf', 'Wu, Wei.pdf', 'Wu, Wei Submission History.pdf'];
const NOTES = "Strong publication year. Acceptance at the Journal of Finance is the headline. Pipeline is healthy with the RFS R&R. Encourage taking on more departmental service as he moves toward full.";
const RATINGS = {
  teachingRating: 'Effective',
  researchRating: 'Excellent',
  serviceRating: 'Effective',
  overallRating: 'Excellent',
};

let COOKIE = '';

function detectKind(name) {
  const n = name.toLowerCase();
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  if (/submission/.test(n)) return 'submission-history';
  if (/self|annual|evaluation|review|f180|f-180|faculty\s*180/.test(n)) return 'self-evaluation';
  return 'other';
}

async function login() {
  const r = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!r.ok) throw new Error(`login ${r.status}`);
  const sc = r.headers.get('set-cookie') || '';
  const m = sc.match(/mml_session=[^;]+/);
  COOKIE = m[0];
  console.log('  ok login');
}

function authJson() { return { cookie: COOKIE, 'Content-Type': 'application/json' }; }

async function extract() {
  const fd = new FormData();
  for (const fn of FILES) {
    const buf = fs.readFileSync(templateFile(fn));
    fd.append('files', new Blob([buf]), fn);
  }
  const r = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST', headers: { cookie: COOKIE }, body: fd,
  });
  if (!r.ok) throw new Error(`extract ${r.status}: ${await r.text()}`);
  return r.json();
}

async function identify(sourceDocuments) {
  const r = await fetch(`${BASE}/api/evaluation-letters/identify`, {
    method: 'POST', headers: authJson(), body: JSON.stringify({ sourceDocuments }),
  });
  if (!r.ok) throw new Error(`identify ${r.status}`);
  return r.json();
}

async function research(sourceDocuments) {
  const r = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST', headers: authJson(), body: JSON.stringify({ sourceDocuments }),
  });
  if (!r.ok) throw new Error(`research ${r.status}`);
  return r.json();
}

async function draft(setup, brief, notes) {
  const r = await fetch(`${BASE}/api/evaluation-letters/draft`, {
    method: 'POST', headers: authJson(),
    body: JSON.stringify({ setup, researchBrief: brief, writerNotes: notes }),
  });
  if (!r.ok || !r.body) throw new Error(`draft ${r.status}`);
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let acc = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
  }
  return acc;
}

async function verify(letterText, sourceDocuments) {
  const r = await fetch(`${BASE}/api/evaluation-letters/verify`, {
    method: 'POST', headers: authJson(),
    body: JSON.stringify({ letterText, sourceDocuments }),
  });
  if (!r.ok) throw new Error(`verify ${r.status}`);
  return r.json();
}

async function appendSummary(payload) {
  const r = await fetch(`${BASE}/api/evaluation-letters/append-summary`, {
    method: 'POST', headers: authJson(), body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`append-summary ${r.status}: ${await r.text()}`);
  return r.json();
}

async function downloadDocx(text, writerId, recipientName) {
  const r = await fetch(`${BASE}/api/evaluation-letters/download`, {
    method: 'POST', headers: authJson(),
    body: JSON.stringify({ kind: 'letter', text, writerId, recipientName }),
  });
  if (!r.ok) throw new Error(`download ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Logging in…');
  await login();

  console.log('Extract…');
  const ex = await extract();
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(ex, null, 2));
  const sourceDocuments = ex.files
    .map(f => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`  ${ex.files.length} files / ${sourceDocuments.length} chars`);

  console.log('Identify…');
  const id = await identify(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '02-identify.json'), JSON.stringify(id, null, 2));
  console.log(`  name=${id.name} | dept=${id.department} | role=${id.roleCategoryId}`);

  const setup = {
    writerId: 'brown',
    evaluationYear: 2025,
    recipientName: id.name,
    recipientTitle: id.title,
    recipientDepartment: id.department,
    roleCategoryId: id.roleCategoryId,
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('Research…');
  const rb = await research(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '03-research-brief.md'), rb.brief);
  console.log(`  brief ${rb.brief.length} chars`);

  console.log('Draft (streaming)…');
  const letter = await draft(setup, rb.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-letter.md'), letter);
  console.log(`  letter ${letter.length} chars`);

  console.log('Verify…');
  const v = await verify(letter, sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.json'), JSON.stringify(v, null, 2));
  if (v.report) fs.writeFileSync(path.join(OUT_DIR, '05-verify-report.md'), v.report);
  if (v.correctedText) fs.writeFileSync(path.join(OUT_DIR, '05-letter-corrected.md'), v.correctedText);
  console.log(`  lint=${(v.lintIssues || []).length}`);

  let finalText = v.correctedText || letter;

  console.log('Append summary…');
  const sum = await appendSummary({
    recipientName: setup.recipientName,
    roleCategoryId: setup.roleCategoryId,
    ...RATINGS,
  });
  fs.writeFileSync(path.join(OUT_DIR, '06-summary.txt'), sum.summary);
  console.log(`  summary ${sum.summary.length} chars`);

  // Strip any existing **Summary** ... signature block first, then append fresh summary
  const sigIdx = finalText.search(/\*\*Summary\*\*/);
  let body = finalText;
  if (sigIdx >= 0) body = finalText.slice(0, sigIdx).trimEnd();
  // Strip lone signature line if present
  body = body.replace(/_{5,}[\s\S]*$/, '').trimEnd();
  const composed = body + '\n\n' + sum.summary + '\n';
  fs.writeFileSync(path.join(OUT_DIR, '07-letter-final.md'), composed);

  console.log('Download docx…');
  const buf = await downloadDocx(composed, 'brown', setup.recipientName);
  fs.writeFileSync(path.join(OUT_DIR, 'letter.docx'), buf);
  console.log(`  wrote letter.docx ${buf.length} bytes`);

  console.log('Done. Output dir:', OUT_DIR);
})();
