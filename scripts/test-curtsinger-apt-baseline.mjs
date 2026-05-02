#!/usr/bin/env node
/**
 * APT baseline run — generate Rich Metters' letter for Wanda Curtsinger
 * (Senior Lecturer, Information & Operations) via the platform pipeline.
 * Used as the second APT case (after Hurta) to test whether the per-writer
 * style overrides give Rich's voice the right structure.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'curtsinger-apt-baseline');

const FILES = ['curtsinger f180.pdf', 'Curtsinger.docx'];

const RATINGS = {
  teachingRating: 'Effective',
  serviceRating: 'Excellent',
  overallRating: 'Effective',
};

const NOTES = `Teaching huge classes well — ISTM 210 and ISTM 209 (business minor, 2,000+ students). Solid teaching performance, ratings 8th of 15 and 12th of 16. Outstanding in service: Aggie Honor Council, Aggie Achieve connection, Aggie Anglers advisor, BUSN 101 redevelopment committee.

16 self-improvement events attended this year — highly commendable. Wonderful person to be around, approachable, collegial, asset to the department. Wanda takes on one of the hardest teaching loads in the department.

Goal next year: continue strong service. If she has particularly positive experiences from any of the 16 self-improvement events, share with INFO faculty.`;

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
  console.log('Logging in…');
  await login();
  console.log('\n=== Wanda Curtsinger (Rich Metters / Information & Ops / APT lecturer) ===');

  console.log('  1/6 extracting…');
  const extracted = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  const setup = {
    writerId: 'metters',
    evaluationYear: 2024,
    recipientName: 'Wanda Curtsinger',
    recipientTitle: 'Senior Lecturer',
    recipientDepartment: 'Department of Information and Operations Management',
    roleCategoryId: 'apt-lecturer',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('  2/6 extracting brief…');
  const researchOut = await research(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '03-extracted-brief.md'), researchOut.brief);
  console.log(`      brief ${researchOut.brief.length} chars`);

  console.log('  3/6 drafting…');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  console.log('  4/6 verifying…');
  const ver = await verify(letter, sourceDocuments, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.json'), JSON.stringify(ver, null, 2));
  if (ver.correctedText) fs.writeFileSync(path.join(OUT_DIR, '05-corrected.md'), ver.correctedText);
  const correctedBody = ver.correctedText || letter;

  console.log('  5/6 append-summary…');
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
