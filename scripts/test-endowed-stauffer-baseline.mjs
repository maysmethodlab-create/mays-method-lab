// Smoke test for the Endowed Positions Letter Writer.
//
// Picks Jon Stauffer (New Endowed Professorship, Information & Operations
// Management), uploads his CV and dept-head letter, supplies a fake 4-1
// vote in favor of Professorship, runs draft → verify → download, and
// saves all artifacts under apps/Endowed Positions Letter Writer/test-output/stauffer-baseline.
//
// Prereqs: dev server running on http://localhost:3000 with ANTHROPIC_API_KEY set.
//   Override BASE_URL or ADMIN_PASSWORD via env vars if needed.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_OUT = path.join(
  ROOT,
  'apps',
  'Endowed Positions Letter Writer',
  'test-output',
  'stauffer-baseline',
);
fs.mkdirSync(APP_OUT, { recursive: true });

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';

// The user's Source Materials live outside the repo. We resolve them
// relative to the OneDrive root.
const STAUFFER_DIR = path.resolve(
  ROOT,
  '..',
  '..',
  'Senior Associate Dean',
  'RESEARCH',
  'Endowed Positions',
  'Process for Endowed Letters',
  'FY27 Endowed Packets',
  'New Endowed',
  'Jon Stauffer',
);
const STAUFFER_FILES = [
  'JonStauffer_cv professorship.pdf',
  'Stauffer DH letter for professorship.docx',
];

let cookie = '';

async function login() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error('login failed: ' + res.status);
  const setCookie = res.headers.get('set-cookie') || '';
  const m = setCookie.match(/mml_session=[^;]+/);
  cookie = m ? m[0] : '';
}

async function uploadAndExtract(filenames) {
  const fd = new FormData();
  for (const fn of filenames) {
    const full = path.join(STAUFFER_DIR, fn);
    if (!fs.existsSync(full)) {
      throw new Error(`Source file not found: ${full}`);
    }
    const buf = fs.readFileSync(full);
    fd.append('files', new Blob([buf]), fn);
  }
  const res = await fetch(`${BASE}/api/endowed-positions/extract`, {
    method: 'POST',
    headers: { cookie },
    body: fd,
  });
  if (!res.ok) throw new Error('extract: ' + (await res.text()));
  return res.json();
}

async function jpost(p, body, expectStream = false) {
  const res = await fetch(BASE + p, {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(p + ': ' + (await res.text()));
  if (expectStream) return res;
  return res.json();
}

const SETUP = {
  candidateId: 'jon-stauffer',
  candidateName: 'Jon Stauffer',
  candidateDepartment: 'Department of Information and Operations Management',
  candidateDeptCode: 'INFO',
  candidateCurrentTitle: 'Associate Professor',
  candidateCurrentEndowedPosition: 'None',
  candidateDepartmentHead: 'Rich Metters',
  recommendedPositionName: 'Pat & Tom Powers Endowed Professorship',
  recommendedEndowedPosition: 'Professorship',
  nominationType: 'new-professorship',
  termYears: 5,
  memoDate: new Date().toISOString().slice(0, 10),
  fiscalYear: 2027,
};

const VOTES = [
  { memberId: 'ahmed', choice: 'professorship' },
  { memberId: 'johnson', choice: 'professorship' },
  { memberId: 'oliva-info', choice: 'professorship' },
  { memberId: 'jones', choice: 'professorship' },
  { memberId: 'boswell', choice: 'no-position', comment: 'Strong record but I would prefer to revisit at the next cycle.' },
];

(async () => {
  console.log(`Output dir: ${APP_OUT}`);
  console.log('1. Logging in…');
  await login();

  console.log('2. Uploading and extracting…');
  const ext = await uploadAndExtract(STAUFFER_FILES);
  fs.writeFileSync(path.join(APP_OUT, '01-extracted.json'), JSON.stringify(ext, null, 2));
  const sourceDocuments = ext.files
    .filter((f) => !f.error)
    .map((f) => `===== ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(APP_OUT, '01-source.txt'), sourceDocuments);

  console.log('3. Drafting…');
  const draftRes = await jpost(
    '/api/endowed-positions/draft',
    { setup: SETUP, votes: VOTES, sourceDocuments },
    true,
  );
  const reader = draftRes.body.getReader();
  const dec = new TextDecoder();
  let acc = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
  }
  fs.writeFileSync(path.join(APP_OUT, '02-draft-raw.txt'), acc);
  // Extract the model JSON sentinel
  const o = acc.indexOf('<<<MODEL_JSON>>>');
  const c = acc.indexOf('<<<END_MODEL_JSON>>>');
  let parts;
  let assembled = acc;
  if (o >= 0 && c > o) {
    parts = JSON.parse(acc.slice(o + '<<<MODEL_JSON>>>'.length, c));
    assembled = acc.slice(0, o) + acc.slice(c + '<<<END_MODEL_JSON>>>'.length);
  } else {
    parts = {
      subjectLine: '(model JSON missing — placeholder mode?)',
      openingSentence: '',
      summaryReasonsClause: '',
      achievementParagraph: '',
    };
  }
  fs.writeFileSync(path.join(APP_OUT, '03-parts.json'), JSON.stringify(parts, null, 2));
  fs.writeFileSync(path.join(APP_OUT, '04-assembled.md'), assembled);

  console.log('4. Verifying (sanitizer)…');
  const ver = await jpost('/api/endowed-positions/verify', { letterText: assembled });
  fs.writeFileSync(path.join(APP_OUT, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(APP_OUT, '05-corrected.md'), ver.correctedText || assembled);

  console.log('5. Downloading .docx…');
  const dl = await fetch(`${BASE}/api/endowed-positions/download`, {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ setup: SETUP, votes: VOTES, parts }),
  });
  if (!dl.ok) throw new Error('download: ' + (await dl.text()));
  const ab = await dl.arrayBuffer();
  fs.writeFileSync(path.join(APP_OUT, '06-letter.docx'), Buffer.from(ab));

  console.log(`Done. Artifacts in ${APP_OUT}`);
})().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
