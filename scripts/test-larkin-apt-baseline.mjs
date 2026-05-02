#!/usr/bin/env node
/**
 * APT baseline run — generate Sean McGuire's letter for Ryan Larkin
 * (Principal Lecturer, Accounting) via the platform pipeline. Used as
 * a third APT case for Sean (alongside Hurta and Curtsinger) to confirm
 * that the broader exemplar pool plus per-subtype AACSB plus the
 * appendStandardSummary fix all hold for a fresh recipient.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateFile } from './_template-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';

const OUT_DIR = path.join(APP_DIR, 'test-output', 'larkin-apt-baseline');

// CV file basename has a typo in the original ("Larking" not "Larkin").
// _template-files indexes by basename, so we keep the typo as-is.
const FILES = ['Ryan Larking CV.pdf'];

const RATINGS = {
  // From Sean's actual 2024 letter for Larkin (teaching and service excellent).
  teachingRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

// Realistic notes Sean would have written before drafting. Covers the
// teaching range (financial reporting + tax + Flex Online) and the
// service items (ACCT 327 help desk, Distinguished Teaching Award
// selection committee). Forward-look item: continuing to develop the
// tax course for the Flex Online MS Accounting program.
const NOTES = `Outstanding teacher across multiple preps. Teaches both intermediate financial reporting (ACCT 328) and graduate / undergraduate tax. Students line up outside his office to meet with him. Very effective in every course; positive student evaluations across the board. Maintains his CPA license.

Big help on Flex Online MS Accounting program: teaches Income Tax (ACCT 605) and Tax Research (ACCT 680). Significant time investment in development. Wants to develop and execute another tax course for the Flex Online program next year — fully support that goal.

Service: faculty advisor for the ACCT 327 help desk (critical for our students), member of the Association of Former Students University-Level Distinguished Teaching Award Selection Committee. Solid service contributions overall.

Encourage him to proactively seek opportunities for professional interaction related to his teaching assignment beyond the CPA license.`;

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
    const full = templateFile(fn);
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

async function verify(letterText, sourceDocuments, writerNotes) {
  const res = await fetch(`${BASE}/api/evaluation-letters/verify`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ letterText, sourceDocuments, writerNotes }),
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
  console.log('\n=== Ryan Larkin (Sean McGuire / Accounting / APT lecturer) ===');

  // 1. Extract
  console.log('  1/7 extracting…');
  const extracted = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  // 2. Identify
  console.log('  2/7 identifying…');
  const ident = await identify(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '02-identify.json'), JSON.stringify(ident, null, 2));
  console.log(
    `      name=${ident.name} | title=${ident.title?.slice(0, 60) || ''} | dept=${ident.department || ''} | role=${ident.roleCategoryId} | source=${ident.source}`,
  );

  const setup = {
    writerId: 'mcguire',
    evaluationYear: 2024,
    recipientName: ident.name || 'Ryan Larkin',
    recipientTitle: ident.title || 'Principal Lecturer',
    recipientDepartment: 'James Benjamin Department of Accounting',
    roleCategoryId: 'apt-lecturer',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  // 3. Research
  console.log('  3/7 extracting brief…');
  const researchOut = await research(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '03-extracted-brief.md'), researchOut.brief);
  console.log(`      brief ${researchOut.brief.length} chars`);

  // 4. Draft
  console.log('  4/7 drafting…');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  // 5. Verify
  console.log('  5/7 verifying…');
  const ver = await verify(letter, sourceDocuments, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, '05-verify-report.md'), ver.report || '');
  if (ver.correctedText) {
    fs.writeFileSync(path.join(OUT_DIR, '05-corrected.md'), ver.correctedText);
  }
  console.log(`      lint issues = ${(ver.lintIssues || []).length}`);

  const correctedBody = ver.correctedText || letter;
  fs.writeFileSync(path.join(OUT_DIR, '05-corrected-body.md'), correctedBody);

  // 6. Append Summary
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
