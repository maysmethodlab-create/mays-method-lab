#!/usr/bin/env node
/**
 * APT baseline run — generate Rich Metters' letter for Rose Berberian
 * (Lecturer, Information & Operations) via the platform pipeline. Used
 * as a Lecturer-tier validation case for Rich (alongside Curtsinger).
 * Berberian's packet has no CV/F180; the letter itself stands in.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'berberian-apt-baseline');

const FILES = ['Berberian_Annual_Review_2025.txt'];

const RATINGS = {
  // From Rich's actual 2025 letter for Berberian: teaching effective.
  teachingRating: 'Effective',
  serviceRating: 'Effective',
  overallRating: 'Effective',
};

// Realistic notes Rich would have written before drafting. Pulls in
// the specific course (SCMT 335 Section 503 Fall 2024), the key student
// feedback (4.38 course / 4.63 instructor / 10th in semester), and the
// faculty concern (4.0 GPR is high — grading criticality watch). Notes
// also reflect the practical real-world experience she brings.
const NOTES = `Rose teaches sections of purchasing to undergraduates, primarily SCMT 335. This past year she taught one section in Fall 2024 (Section 503) and her evaluations are excellent: 4.38 course score, 4.63 instructor score, 10th overall in the department for the semester. 8 of 18 students responded.

Faculty review feedback:
- Students appreciate the practical, real-life industry applications she pulls into the class.
- Adds an invaluable element to our curriculum that the peers appreciate.
- Strong passion for teaching and the students.

One concern from the faculty: the 4.0 class GPR is on the high side and worth keeping an eye on. Encourage Rose to consider grading criticality across future sections so the grade distribution has more variance.

Service is not required at her rank, but she did participate in community events this past cycle. Appreciated.

The dean has asked us to use the "Excellent" adjective on more rare occasions than in the past, so the rating here is Effective in teaching with a clear note of thanks for her positive presence on the team.

Forward-look: continue teaching SCMT 335 with the same real-world industry framing. Consider variance in grade distribution as a developmental area.`;

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

async function verify(letterText, sourceDocuments) {
  const res = await fetch(`${BASE}/api/evaluation-letters/verify`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ letterText, sourceDocuments }),
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
  console.log('\n=== Rose Berberian (Rich Metters / Information & Ops / APT lecturer) ===');

  console.log('  1/6 extracting...');
  const extracted = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} - ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  const setup = {
    writerId: 'metters',
    evaluationYear: 2025,
    recipientName: 'Rose Berberian',
    recipientTitle: 'Lecturer',
    recipientDepartment: 'Department of Information and Operations Management',
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
  const ver = await verify(letter, sourceDocuments);
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
      writerId: 'metters',
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
