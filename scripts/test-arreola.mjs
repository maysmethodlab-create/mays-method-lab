// Single-case re-test for Arreola-Risa with the new prompts (3-year window,
// restructured research section, italicized journals, P&T exemplars in
// bundle, italics propagated to .docx).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';
const OUT = path.join(ROOT, 'test-output', 'arreola-risa-v3');
const TEMPLATE_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters', 'Template Letters');

fs.mkdirSync(OUT, { recursive: true });

const C = {
  files: ['Antonio Arreola-Risa CV, February 2025.pdf', 'arreola-Risa f-180.pdf'],
  ratings: {
    teachingRating: 'Excellent',
    researchRating: 'Effective',
    serviceRating: 'Excellent',
    overallRating: 'Excellent',
  },
  notes:
    'Outstanding teaching and service this year. Continued strong publication record. Mentorship of doctoral students has been particularly notable.',
};

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
    const buf = fs.readFileSync(path.join(TEMPLATE_DIR, fn));
    fd.append('files', new Blob([buf]), fn);
  }
  const res = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST',
    headers: { cookie },
    body: fd,
  });
  if (!res.ok) throw new Error('extract: ' + (await res.text()));
  return res.json();
}

async function jpost(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(path + ': ' + (await res.text()));
  return res;
}

(async () => {
  console.log('Logging in…');
  await login();
  console.log('Extracting…');
  const ext = await uploadAndExtract(C.files);
  fs.writeFileSync(path.join(OUT, '01-extracted.json'), JSON.stringify(ext, null, 2));
  const sourceDocuments = ext.files
    .map((f) => `===== ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT, '01-source.txt'), sourceDocuments);

  console.log('Identifying…');
  const ident = await (await jpost('/api/evaluation-letters/identify', { sourceDocuments })).json();
  fs.writeFileSync(path.join(OUT, '02-identify.json'), JSON.stringify(ident, null, 2));
  console.log(' name=' + ident.name + ' role=' + ident.roleCategoryId);

  const setup = {
    writerId: 'metters',
    evaluationYear: 2025,
    recipientName: ident.name,
    recipientTitle: ident.title,
    recipientDepartment: ident.department || 'Department of Information and Operations Management',
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
    ...C.ratings,
  };
  fs.writeFileSync(path.join(OUT, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('Research…');
  const research = await (
    await jpost('/api/evaluation-letters/research', { sourceDocuments })
  ).json();
  fs.writeFileSync(path.join(OUT, '03-research-brief.md'), research.brief);

  console.log('Drafting…');
  const draftRes = await jpost('/api/evaluation-letters/draft', {
    setup,
    researchBrief: research.brief,
    writerNotes: C.notes,
  });
  const reader = draftRes.body.getReader();
  const dec = new TextDecoder();
  let letter = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    letter += dec.decode(value, { stream: true });
  }
  fs.writeFileSync(path.join(OUT, '04-letter.md'), letter);

  console.log('Verifying…');
  const ver = await (
    await jpost('/api/evaluation-letters/verify', { letterText: letter, sourceDocuments })
  ).json();
  fs.writeFileSync(path.join(OUT, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(OUT, '05-corrected.md'), ver.correctedText || letter);
  console.log(' lint=' + (ver.lintIssues || []).length);

  console.log('Downloading .docx…');
  const dl = await jpost('/api/evaluation-letters/download', {
    kind: 'letter',
    text: ver.correctedText || letter,
    writerId: 'metters',
    recipientName: ident.name,
  });
  const ab = await dl.arrayBuffer();
  fs.writeFileSync(path.join(OUT, '06-letter.docx'), Buffer.from(ab));
  console.log('Done. Output in ' + OUT);
})();
