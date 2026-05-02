#!/usr/bin/env node
/**
 * APT baseline run — generate Wendy Boswell's letter for Ken McFarland
 * (Clinical Associate Professor, Management) via the platform pipeline.
 * Used as the Clinical-Associate validation case for Wendy. McFarland's
 * packet has only the letter; it stands in as the source-document.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'mcfarland-apt-baseline');

const FILES = ['McFarland_Annual_Review_2025.txt'];

const RATINGS = {
  // From Wendy's actual 2025 letter for McFarland: classified as excellent.
  teachingRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

// Realistic notes Wendy would have written before drafting. Pulls in
// the specific course preps (MGMT 422, MGMT 466, MGMT 679), the AEFIS
// teaching ratings, the Aggies-in-Consulting director role, the
// Consulting track coordinator role, and the EMBA / MS ENLD program work.
const NOTES = `Ken teaches several different course preps for the department and college: MGMT 422, MGMT 466, MGMT 679. Student feedback and AEFIS ratings are excellent across all of them. Thank him for what he is doing for students in the classroom and beyond.

Glad he could be involved with Mays' global initiatives and the study-abroad programs this past cycle. Hope that continues.

Service: director of Aggies in Consulting (the student professional org for consulting careers), and serves as the Consulting track coordinator. Both efforts are highly valued by the department and college and take a real time commitment.

Major contributions: continued work for the EMBA and MS ENLD programs. Contributions are broad and deep, and the department greatly appreciates that work.

Forward-look: continue advising Aggies in Consulting, continue the Consulting track coordinator role, and continue the global / study-abroad engagement. Looking forward to seeing the EMBA and MS ENLD work continue at the same level next year.`;

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
  console.log('\n=== Ken McFarland (Wendy Boswell / Management / APT clinical associate) ===');

  console.log('  1/6 extracting...');
  const extracted = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT_DIR, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} - ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  const setup = {
    writerId: 'boswell',
    evaluationYear: 2025,
    recipientName: 'Kenneth P. McFarland',
    recipientTitle: 'Clinical Associate Professor',
    recipientDepartment: 'Department of Management',
    roleCategoryId: 'apt-clinical',
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
      writerId: 'boswell',
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
