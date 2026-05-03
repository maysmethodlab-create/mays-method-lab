#!/usr/bin/env node
/**
 * APT baseline run — generate Sean McGuire's letter for Amy Hurta
 * (Lecturer, Accounting) via the platform pipeline. Used as the first
 * APT case for diff-vs-ground-truth so we know what the existing APT
 * skill files miss before we upgrade them.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'hurta-apt-baseline');

const FILES = ['CV-Amy-Hurta-202508.pdf'];

const RATINGS = {
  // From Sean's actual 2024 letter for Hurta (teaching and service as excellent).
  teachingRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

// Realistic notes Sean would have written before drafting — observations,
// not the letter's conclusions. These reflect what an APT case looks like
// in practice: a paragraph of teaching highlights and a few service items.
const NOTES = `Outstanding teaching year. Loved teaching ACCT 405 with her — students had a great experience. Excellent in ACCT 489 communications. Took on Introduction to Tax as a new prep this year. Also teaching in the Flex Online MS Accounting program — Partnership Taxation (ACCT 689/612) and Communications (ACCT 689/664). Significant time investment in online development.

Great team player, deep dedication to students. Maintains her CPA license. Stated goals: continue to improve courses, expand ACCT 421 into a three-hour course. Encourage her to seek mentoring from more experienced instructors and attend teaching workshops.

Service: discussed tax-track PPA students this past summer, BUSN 101 mentoring, volunteered to proctor exams for the Student Testing Center during final exams.

Forward-look (specifics that MUST appear verbatim in the closing): she is teaching ACCT 405 again in Fall 2025 and we will be co-teaching it; she is expanding ACCT 421 into a three-hour course next academic year. The closing paragraph must name Fall 2025, ACCT 405, and the ACCT 421 three-hour expansion.`;

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
  console.log('\n=== Amy Hurta (Sean McGuire / Accounting / APT lecturer) ===');

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
    evaluationYear: 2025,
    recipientName: ident.name || 'Amy Hurta',
    recipientTitle: ident.title || 'Lecturer',
    recipientDepartment: 'James Benjamin Department of Accounting',
    roleCategoryId: 'apt-lecturer',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  // 3. Research / Extract brief
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
