#!/usr/bin/env node
/**
 * APT baseline run — generate Sean McGuire's letter for Natalie Allen
 * (Principal Lecturer, Accounting) via the platform pipeline. Used as
 * a Senior/Principal Lecturer validation case for Sean. Allen's packet
 * has no CV/F180 in inventory, so the letter itself stands in as the
 * source-document.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'allen-apt-baseline');

// No CV/F180 in inventory — fall back to the letter text itself.
const FILES = ['Allen_Annual_Review_2024.txt'];

const RATINGS = {
  // From Sean's actual 2024 letter for Allen (teaching and service excellent).
  teachingRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

// Realistic notes Sean would have written before drafting. Focuses on
// scale of teaching impact (3,000+ students), the technology / critical
// thinking workshops, and the named service items (ACCT 210/230 Help Desk,
// ACCT 230 textbook adoption committee chair, BSC and Christian Business
// Leaders advising, Aggie Way Engagement, APT P&R Committee).
const NOTES = `Truly remarkable teacher. Taught over 3,000 students last year between large-section ACCT 209/229 sections and the honors section of ACCT 230 (overload). Equally effective with both large and small sections. Student feedback is exceptional given the size and rigor of the course. We literally have a study area named in her honor in the Roberts Building.

She invests heavily in current technology and critical-thinking pedagogy: attended ChatGPT and critical-thinking workshops this past year and is bringing what she learned back into ACCT 230. Provides leadership to younger lecturers in the department.

Service: faculty coordinator for the ACCT 210/ACCT 230 Help Desk, committee chair for ACCT 230 textbook adoption, faculty advisor for Business Student Council and Christian Business Leaders, member of the Aggie Way Engagement Program and Mays' APT Promotion and Review Committee.

Forward-look: continue developing assessments and activities for blended courses, and continue the curriculum-redesign engagement. Encourage her to keep pursuing professional-development workshops.`;

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
  console.log('  logged in');
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

function detectKind(name) {
  const n = name.toLowerCase();
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  if (/self|annual|evaluation|review|f180|f-180|faculty\s*180/.test(n))
    return 'self-evaluation';
  return 'other';
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Logging in...');
  await login();
  console.log('\n=== Natalie Allen (Sean McGuire / Accounting / APT principal lecturer) ===');

  console.log('  1/6 extracting...');
  const extracted = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} - ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  const setup = {
    writerId: 'mcguire',
    evaluationYear: 2024,
    recipientName: 'Natalie Allen',
    recipientTitle: 'Principal Lecturer',
    recipientDepartment: 'James Benjamin Department of Accounting',
    roleCategoryId: 'apt-lecturer',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('  2/6 extracting brief...');
  const researchOut = await research(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '03-extracted-brief.md'), researchOut.brief);
  console.log(`      brief ${researchOut.brief.length} chars`);

  console.log('  3/6 drafting...');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  console.log('  4/6 verifying...');
  const ver = await verify(letter, sourceDocuments, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.json'), JSON.stringify(ver, null, 2));
  if (ver.correctedText) fs.writeFileSync(path.join(OUT_DIR, '05-corrected.md'), ver.correctedText);
  const correctedBody = ver.correctedText || letter;

  console.log('  5/6 append-summary...');
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

  console.log(`\nDone. Outputs in: ${OUT_DIR}`);
})();
