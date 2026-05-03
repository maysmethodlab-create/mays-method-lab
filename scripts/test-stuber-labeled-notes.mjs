#!/usr/bin/env node
/**
 * Stuber labeled-notes test — verify the new STANDOUT / GROWTH AREA /
 * SENSITIVE placement guidance lands in the draft and that the
 * hallucination report includes a "Writer's Notes Coverage" section.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'stuber-labeled-notes');

const FILES = ['S Stuber CV 20250317 - For Annual Review.pdf'];
const EVAL_YEAR = 2025;

const RATINGS = {
  teachingRating: 'Excellent',
  researchRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

// Labeled notes with three distinctive nouns we can grep for in the
// draft, one per section.
const NOTES = `STANDOUT:
Her doctoral student mentorship has been outstanding this year. Lauren VanNostrand's progress has been a direct reflection of Sarah's investment in her development.

GROWTH AREA:
Continue building national visibility through invited keynote talks at the top accounting conferences over the next two cycles.

SENSITIVE:
There is a tension around co-authorship dynamics with junior collaborators that should be acknowledged without naming individuals — she should be aware that this is something the department is paying attention to.`;

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
  if (!res.ok) throw new Error(`extract failed ${res.status}`);
  return res.json();
}

async function identify(sourceDocuments) {
  const res = await fetch(`${BASE}/api/evaluation-letters/identify`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ sourceDocuments }),
  });
  if (!res.ok) throw new Error(`identify failed ${res.status}`);
  return res.json();
}

async function research(sourceDocuments, evaluationYear) {
  const res = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ sourceDocuments, evaluationYear }),
  });
  if (!res.ok) throw new Error(`research failed ${res.status}`);
  return res.json();
}

async function draft(setup, researchBrief, writerNotes) {
  const res = await fetch(`${BASE}/api/evaluation-letters/draft`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ setup, researchBrief, writerNotes }),
  });
  if (!res.ok || !res.body) throw new Error(`draft failed ${res.status}`);
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
  if (!res.ok) throw new Error(`verify failed ${res.status}`);
  return res.json();
}

function detectKind(name) {
  const n = name.toLowerCase();
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  return 'other';
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Logging in…');
  await login();
  console.log(`\n=== Stuber labeled-notes test (eval year ${EVAL_YEAR}) ===`);

  console.log('  1/5 extracting…');
  const extracted = await uploadAndExtract(FILES);
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');

  console.log('  2/5 identifying…');
  const ident = await identify(sourceDocuments);

  const setup = {
    writerId: 'mcguire',
    evaluationYear: EVAL_YEAR,
    recipientName: ident.name || 'Sarah Stuber',
    recipientTitle: ident.title || 'Associate Professor',
    recipientDepartment: 'James Benjamin Department of Accounting',
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
    ...RATINGS,
  };

  console.log('  3/5 research…');
  const researchOut = await research(sourceDocuments, EVAL_YEAR);
  fs.writeFileSync(path.join(OUT_DIR, '03-research-brief.md'), researchOut.brief);

  console.log('  4/5 drafting…');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  console.log('  5/5 verify…');
  const ver = await verify(letter, sourceDocuments, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.md'), ver.report || '');
  fs.writeFileSync(path.join(OUT_DIR, '05-corrected.md'), ver.correctedText || '');

  // ---- Audits ----
  const draftLower = letter.toLowerCase();
  const standoutHit =
    /doctoral|mentorship|vannostrand|ph\.?d\.? student/i.test(letter);
  const growthHit = /keynote|invited talk|national visibility/i.test(letter);
  const sensitiveHit = /co-authorship|junior co.?author|collaborator/i.test(letter);

  const reportText = ver.report || '';
  const coverageSectionPresent = /writer'?s notes coverage/i.test(reportText);

  // Try to detect placement: STANDOUT should land in the My Observations
  // section. We look at which paragraph the doctoral-mentorship sentence
  // falls in.
  const observationsIdx = letter.search(/my observations|observations and our discussion/i);
  const standoutIdx = letter.search(/doctoral|mentorship|vannostrand/i);
  const standoutAfterObservations =
    observationsIdx > -1 && standoutIdx > observationsIdx;

  const audit = `# Labeled-notes audit

## Section coverage in the draft
- STANDOUT (doctoral mentorship): ${standoutHit ? 'PRESENT' : 'MISSING'}
- GROWTH AREA (keynote / national visibility): ${growthHit ? 'PRESENT' : 'MISSING'}
- SENSITIVE (co-authorship / junior collaborators): ${sensitiveHit ? 'PRESENT' : 'MISSING'}

## Placement
- STANDOUT appears AFTER "My Observations" section: ${standoutAfterObservations}
  (Observations heading at char ${observationsIdx}, STANDOUT mention at char ${standoutIdx})

## Verify report
- "Writer's Notes Coverage" section present in hallucination report: ${coverageSectionPresent}

## Verbatim draft excerpts
### My Observations section (best-effort extract)
${(() => {
  if (observationsIdx === -1) return '(could not locate)';
  const tail = letter.slice(observationsIdx, observationsIdx + 1500);
  return tail;
})()}
`;

  fs.writeFileSync(path.join(OUT_DIR, '99-audit.md'), audit);

  console.log('\n--- result ---');
  console.log(`STANDOUT in draft: ${standoutHit}`);
  console.log(`GROWTH AREA in draft: ${growthHit}`);
  console.log(`SENSITIVE in draft: ${sensitiveHit}`);
  console.log(`STANDOUT after Observations heading: ${standoutAfterObservations}`);
  console.log(`Coverage section in verify report: ${coverageSectionPresent}`);
  console.log(`\nFull audit: ${OUT_DIR}/99-audit.md`);
})();
