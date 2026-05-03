#!/usr/bin/env node
/**
 * Stuber 2025 window test — re-run Sarah Stuber's letter with
 * evaluationYear=2025 (using the same source pack that was originally
 * for the 2024 evaluation). The verification: the research section
 * MUST exclude any 2022 paper. Window is 2023-2025.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'stuber-eval2025-window');

const FILES = ['S Stuber CV 20250317 - For Annual Review.pdf'];

const RATINGS = {
  teachingRating: 'Excellent',
  researchRating: 'Excellent',
  serviceRating: 'Excellent',
  overallRating: 'Excellent',
};

const NOTES =
  'Strong contributor in tax research. Continues to push toward top journals. Service is appropriate for her stage.';

const EVAL_YEAR = 2025;

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

async function research(sourceDocuments, evaluationYear) {
  const res = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ sourceDocuments, evaluationYear }),
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
  console.log(`\n=== Sarah Stuber (eval year ${EVAL_YEAR}, window ${EVAL_YEAR - 2}-${EVAL_YEAR}) ===`);

  console.log('  1/4 extracting…');
  const extracted = await uploadAndExtract(FILES);
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source-documents.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  console.log('  2/4 identifying…');
  const ident = await identify(sourceDocuments);
  fs.writeFileSync(path.join(OUT_DIR, '02-identify.json'), JSON.stringify(ident, null, 2));
  console.log(
    `      name=${ident.name} | role=${ident.roleCategoryId}`,
  );

  const setup = {
    writerId: 'mcguire',
    evaluationYear: EVAL_YEAR,
    recipientName: ident.name || 'Sarah Stuber',
    recipientTitle: ident.title || 'Associate Professor',
    recipientDepartment: 'James Benjamin Department of Accounting',
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('  3/4 research…');
  const researchOut = await research(sourceDocuments, EVAL_YEAR);
  fs.writeFileSync(path.join(OUT_DIR, '03-research-brief.md'), researchOut.brief);
  console.log(`      brief ${researchOut.brief.length} chars`);

  console.log('  4/4 drafting…');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  // ---- Year-window verification (the actual test) ----
  const brief = researchOut.brief;
  const draftText = letter;

  // Find any 2022 (or earlier) reference in the research-relevant sections
  const has2022InBrief = /\b2022\b/.test(brief);
  const has2022InDraft = /\b2022\b/.test(draftText);
  const hasPre2022InBrief = /\b(2021|2020|2019|2018|2017)\b/.test(brief);
  const hasPre2022InDraft = /\b(2021|2020|2019|2018|2017)\b/.test(draftText);

  // Pull lines mentioning years to inspect
  const yearLinesBrief = brief
    .split('\n')
    .filter((l) => /\b(20\d{2})\b/.test(l))
    .slice(0, 30);
  const yearLinesDraft = draftText
    .split('\n')
    .filter((l) => /\b(20\d{2})\b/.test(l))
    .slice(0, 30);

  fs.writeFileSync(
    path.join(OUT_DIR, '99-year-audit.md'),
    `# Year-window audit (evaluationYear=${EVAL_YEAR}, window=${EVAL_YEAR - 2}-${EVAL_YEAR})

## Brief
- contains "2022": ${has2022InBrief}
- contains "2021/earlier": ${hasPre2022InBrief}

### Year-mentioning lines in brief (first 30)
${yearLinesBrief.map((l) => `- ${l}`).join('\n')}

## Draft
- contains "2022": ${has2022InDraft}
- contains "2021/earlier": ${hasPre2022InDraft}

### Year-mentioning lines in draft (first 30)
${yearLinesDraft.map((l) => `- ${l}`).join('\n')}
`,
  );

  console.log('\n--- year-window check ---');
  console.log(`brief contains 2022: ${has2022InBrief}`);
  console.log(`brief contains 2021 or earlier: ${hasPre2022InBrief}`);
  console.log(`draft contains 2022: ${has2022InDraft}`);
  console.log(`draft contains 2021 or earlier: ${hasPre2022InDraft}`);
  console.log(`\nFull audit in: ${OUT_DIR}/99-year-audit.md`);
})();
