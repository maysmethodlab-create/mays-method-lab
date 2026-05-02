#!/usr/bin/env node
/**
 * Rich-as-himself walkthrough — drives the Evaluation Letter Writer end-to-end
 * for Anupam Agrawal so we can review what Rich would actually see and feel.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateFile } from './_template-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const OUT = path.join(APP_DIR, 'test-output', 'rich-roleplay-agrawal');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:3000';
const PASSWORD = 'mml-dev-2026';

let COOKIE = '';
async function login() {
  const r = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });
  if (!r.ok) throw new Error('login failed: ' + r.status);
  const sc = r.headers.get('set-cookie') || '';
  COOKIE = (sc.match(/mml_session=[^;]+/) || [''])[0];
  console.log('  logged in');
}
const J = () => ({ cookie: COOKIE, 'Content-Type': 'application/json' });

function detectKind(name) {
  const n = name.toLowerCase();
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  if (/self|annual|evaluation|review|f180|f-180|faculty\s*180/.test(n)) return 'self-evaluation';
  return 'other';
}

async function extract(files) {
  const fd = new FormData();
  for (const f of files) {
    const buf = fs.readFileSync(templateFile(f));
    fd.append('files', new Blob([buf]), f);
  }
  const r = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST',
    headers: { cookie: COOKIE },
    body: fd,
  });
  if (!r.ok) throw new Error('extract failed ' + r.status + ': ' + (await r.text()));
  return r.json();
}

async function research(sourceDocuments) {
  const r = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST',
    headers: J(),
    body: JSON.stringify({ sourceDocuments }),
  });
  if (!r.ok) throw new Error('research failed ' + r.status + ': ' + (await r.text()));
  return r.json();
}

async function draft(setup, brief, notes) {
  const r = await fetch(`${BASE}/api/evaluation-letters/draft`, {
    method: 'POST',
    headers: J(),
    body: JSON.stringify({ setup, researchBrief: brief, writerNotes: notes }),
  });
  if (!r.ok || !r.body) throw new Error('draft failed ' + r.status + ': ' + (await r.text()));
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let acc = '';
  let dotN = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
    if (++dotN % 30 === 0) process.stdout.write('.');
  }
  process.stdout.write('\n');
  return acc;
}

async function verify(letterText, sourceDocuments) {
  const r = await fetch(`${BASE}/api/evaluation-letters/verify`, {
    method: 'POST',
    headers: J(),
    body: JSON.stringify({ letterText, sourceDocuments }),
  });
  if (!r.ok) throw new Error('verify failed ' + r.status + ': ' + (await r.text()));
  return r.json();
}

async function appendSummary(p) {
  const r = await fetch(`${BASE}/api/evaluation-letters/append-summary`, {
    method: 'POST',
    headers: J(),
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error('append-summary failed ' + r.status + ': ' + (await r.text()));
  return r.json();
}

async function download(text, writerId, recipientName) {
  const r = await fetch(`${BASE}/api/evaluation-letters/download`, {
    method: 'POST',
    headers: J(),
    body: JSON.stringify({ kind: 'letter', text, writerId, recipientName }),
  });
  if (!r.ok) throw new Error('download failed ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

(async () => {
  console.log('Rich Metters role-play — Agrawal evaluation letter');
  await login();

  // Step 1 — writer = Rich, year = 2025 (we just record this; UI displays it)
  const writerId = 'metters';
  const year = 2025;

  // Step 2 — pick Anupam Agrawal from dropdown (INFO dept).
  // The picker passes back name/title/dept/email straight from faculty-roster.json.
  const recipient = {
    name: 'Anupam Agrawal',
    title: 'Associate Professor',
    department: 'Department of Information and Operations Management',
    email: 'aagrawal@mays.tamu.edu',
    roleCategoryId: 'tt-associate-professor',
  };
  console.log(`  picked: ${recipient.name} — ${recipient.title} (${recipient.department})`);

  const writerNotes =
    'Solid contributor. PhD mentoring with Mayukh Majumdar is a real strength. Concern: more national-level service would help his case for full. Encourage him to target POM and MSOM.';

  // Upload + extract
  console.log('  extracting CV + F180...');
  const ex = await extract(['agrawal cv.pdf', 'agrawal f180.pdf']);
  fs.writeFileSync(path.join(OUT, '01-extracted.json'), JSON.stringify(ex, null, 2));
  const sourceDocuments = ex.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT, '01-source-documents.txt'), sourceDocuments);
  console.log(`    ${ex.files.length} files, ${sourceDocuments.length} chars`);

  // Step 3 — Research → Draft → Verify
  console.log('  research brief...');
  const rb = await research(sourceDocuments);
  fs.writeFileSync(path.join(OUT, '02-research-brief.md'), rb.brief);
  console.log(`    ${rb.brief.length} chars`);

  const setup = {
    writerId,
    evaluationYear: year,
    recipientName: recipient.name,
    recipientTitle: recipient.title,
    recipientDepartment: recipient.department,
    roleCategoryId: recipient.roleCategoryId,
    teachingRating: 'Effective',
    researchRating: 'Effective',
    serviceRating: 'Effective',
    overallRating: 'Effective',
  };
  fs.writeFileSync(path.join(OUT, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('  drafting (streaming)...');
  const letter = await draft(setup, rb.brief, writerNotes);
  fs.writeFileSync(path.join(OUT, '03-letter.md'), letter);
  console.log(`    letter ${letter.length} chars`);

  console.log('  verifying...');
  const vr = await verify(letter, sourceDocuments);
  fs.writeFileSync(path.join(OUT, '04-verify.json'), JSON.stringify(vr, null, 2));
  if (vr.report) fs.writeFileSync(path.join(OUT, '04-verify-report.md'), vr.report);
  if (vr.correctedText) fs.writeFileSync(path.join(OUT, '04-letter-corrected.md'), vr.correctedText);
  console.log(`    lint issues = ${(vr.lintIssues || []).length}`);

  // Step 3.5 — Append summary (ratings)
  console.log('  appending summary...');
  const sum = await appendSummary({
    recipientName: recipient.name,
    roleCategoryId: recipient.roleCategoryId,
    teachingRating: 'Effective',
    researchRating: 'Effective',
    serviceRating: 'Effective',
    overallRating: 'Effective',
  });
  fs.writeFileSync(path.join(OUT, '05-summary.md'), sum.summary);
  console.log(`    summary ${sum.summary.length} chars`);

  const bodyText = vr.correctedText || letter;
  const finalText = `${bodyText.trim()}\n\n${sum.summary.trim()}\n`;
  fs.writeFileSync(path.join(OUT, '06-final-letter.md'), finalText);

  // Step 4 — Download .docx
  console.log('  downloading .docx...');
  const buf = await download(finalText, writerId, recipient.name);
  const docxPath = path.join(OUT, 'letter.docx');
  fs.writeFileSync(docxPath, buf);
  console.log(`    wrote ${buf.length} bytes -> ${docxPath}`);

  console.log('\nDONE.');
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
