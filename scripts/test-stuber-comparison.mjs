#!/usr/bin/env node
/**
 * Stuber comparison run — generate Sean McGuire's letter for Sarah Stuber
 * via the platform pipeline, save every phase, and prep for ground-truth
 * comparison against Sean's actual 2024 letter.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';

const OUT_DIR = path.join(APP_DIR, 'test-output', 'sean-stuber-comparison-v2');
const TEMPLATE_DIR = path.join(APP_DIR, 'Template Letters');

const FILES = ['S Stuber CV 20250317 - For Annual Review.pdf'];

const RATINGS = {
  // From Sean's actual letter
  teachingRating: 'Excellent',
  researchRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

const NOTES =
  'Strong contributor in tax research. Continues to push toward top journals. Service is appropriate for her stage.';

let SESSION_COOKIE = '';

async function login() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const setCookie = res.headers.get('set-cookie') || '';
  const m = setCookie.match(/mml_session=[^;]+/);
  if (!m) throw new Error('no session cookie returned');
  SESSION_COOKIE = m[0];
  console.log('  ✓ logged in');
}

function authHeaders(json = false) {
  return {
    cookie: SESSION_COOKIE,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function uploadAndExtract(filenames) {
  const fd = new FormData();
  for (const fn of filenames) {
    const full = path.join(TEMPLATE_DIR, fn);
    if (!fs.existsSync(full)) throw new Error(`Missing: ${full}`);
    const buf = fs.readFileSync(full);
    fd.append('files', new Blob([buf]), fn);
  }
  const res = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST',
    headers: { cookie: SESSION_COOKIE },
    body: fd,
  });
  if (!res.ok) throw new Error(`extract failed ${res.status}: ${await res.text()}`);
  return res.json();
}

async function identify(sourceDocuments) {
  const res = await fetch(`${BASE}/api/evaluation-letters/identify`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ sourceDocuments }),
  });
  if (!res.ok) throw new Error(`identify failed ${res.status}: ${await res.text()}`);
  return res.json();
}

async function research(sourceDocuments) {
  const res = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ sourceDocuments }),
  });
  if (!res.ok) throw new Error(`research failed ${res.status}: ${await res.text()}`);
  return res.json();
}

async function draft(setup, researchBrief, writerNotes) {
  const res = await fetch(`${BASE}/api/evaluation-letters/draft`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ setup, researchBrief, writerNotes }),
  });
  if (!res.ok || !res.body) throw new Error(`draft failed ${res.status}: ${await res.text()}`);
  const reader = res.body.getReader();
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
  const res = await fetch(`${BASE}/api/evaluation-letters/verify`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ letterText, sourceDocuments }),
  });
  if (!res.ok) throw new Error(`verify failed ${res.status}: ${await res.text()}`);
  return res.json();
}

async function downloadDocx(text, writerId, recipientName) {
  const res = await fetch(`${BASE}/api/evaluation-letters/download`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ kind: 'letter', text, writerId, recipientName }),
  });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function detectKind(name) {
  const n = name.toLowerCase();
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  if (/self|annual|evaluation|review|f180|f-180|faculty\s*180/.test(n))
    return 'self-evaluation';
  return 'other';
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Logging in…');
  await login();
  console.log('\n=== Sarah Stuber (Sean McGuire / Accounting) ===');

  // 1. Extract
  console.log('  1/6 extracting…');
  const extracted = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  // 2. Identify
  console.log('  2/6 identifying…');
  const ident = await identify(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '02-identify.json'), JSON.stringify(ident, null, 2));
  console.log(
    `      name=${ident.name} | title=${ident.title?.slice(0, 60) || ''} | dept=${ident.department || ''} | role=${ident.roleCategoryId} | source=${ident.source}`,
  );

  const setup = {
    writerId: 'mcguire',
    evaluationYear: 2024,
    recipientName: ident.name || 'Sarah Stuber',
    recipientTitle: ident.title || 'Associate Professor',
    recipientDepartment: 'James Benjamin Department of Accounting',
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  // 3. Research
  console.log('  3/6 research…');
  const researchOut = await research(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '03-research-brief.md'), researchOut.brief);
  console.log(`      brief ${researchOut.brief.length} chars`);

  // 4. Draft
  console.log('  4/6 drafting…');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  // 5. Verify
  console.log('  5/6 verifying…');
  const ver = await verify(letter, sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, '05-verify-report.md'), ver.report || '');
  if (ver.correctedText) {
    fs.writeFileSync(path.join(OUT_DIR, '05-corrected.md'), ver.correctedText);
  }
  console.log(`      lint issues = ${(ver.lintIssues || []).length}`);

  const correctedBody = ver.correctedText || letter;
  fs.writeFileSync(path.join(OUT_DIR, '05-corrected-body.md'), correctedBody);

  // 6. Append Summary — substitutes [*_RATING_SENTENCE] placeholders for
  //    Sean's writer-specific structure, OR appends the standard Summary
  //    block for default writers.
  console.log('  6/7 append-summary…');
  const sumRes = await fetch(`${BASE}/api/evaluation-letters/append-summary`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({
      recipientName: setup.recipientName,
      roleCategoryId: setup.roleCategoryId,
      writerId: 'mcguire',
      letterText: correctedBody,
      teachingRating: setup.teachingRating,
      researchRating: setup.researchRating,
      serviceRating: setup.serviceRating,
      overallRating: setup.overallRating,
    }),
  });
  const sumJson = await sumRes.json();
  const finalText = sumJson.letter || `${correctedBody}\n\n${sumJson.summary}\n`;
  fs.writeFileSync(path.join(OUT_DIR, '06-final.md'), finalText);
  console.log(`      final letter ${finalText.length} chars`);

  // 7. Download
  console.log('  7/7 docx…');
  const buf = await downloadDocx(finalText, 'mcguire', setup.recipientName);
  fs.writeFileSync(path.join(OUT_DIR, 'letter.docx'), buf);
  console.log(`      wrote .docx (${buf.length} bytes)`);

  console.log(`\nDone. Outputs in: ${OUT_DIR}`);
})();
