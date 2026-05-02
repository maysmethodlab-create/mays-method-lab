import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateFile } from './_template-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';
const OUT = path.join(APP_DIR, 'test-output', 'wu-v3');

fs.mkdirSync(OUT, { recursive: true });

const C = {
  files: ['Wu, Wei CV.pdf', 'Wu, Wei.pdf', 'Wu, Wei Submission History.pdf'],
  ratings: {
    teachingRating: 'Effective',
    researchRating: 'Excellent',
    serviceRating: 'Effective',
    overallRating: 'Excellent',
  },
  notes:
    'Strong publication year. Pipeline is healthy. Encourage taking on more departmental service.',
};

let cookie = '';

async function login() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  const setCookie = res.headers.get('set-cookie') || '';
  cookie = (setCookie.match(/mml_session=[^;]+/) || [''])[0];
}
async function uploadAndExtract(filenames) {
  const fd = new FormData();
  for (const fn of filenames) {
    const buf = fs.readFileSync(templateFile(fn));
    fd.append('files', new Blob([buf]), fn);
  }
  const res = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST',
    headers: { cookie },
    body: fd,
  });
  return res.json();
}
async function jpost(p, b) {
  return fetch(BASE + p, {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(b),
  });
}

(async () => {
  console.log('Login + extract…');
  await login();
  const ext = await uploadAndExtract(C.files);
  fs.writeFileSync(path.join(OUT, '01-extracted.json'), JSON.stringify(ext, null, 2));
  const sourceDocuments = ext.files
    .map((f) => `===== ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT, '01-source.txt'), sourceDocuments);

  console.log('Identify…');
  const ident = await (await jpost('/api/evaluation-letters/identify', { sourceDocuments })).json();
  fs.writeFileSync(path.join(OUT, '02-identify.json'), JSON.stringify(ident, null, 2));

  const setup = {
    writerId: 'brown',
    evaluationYear: 2025,
    recipientName: ident.name,
    recipientTitle: ident.title,
    recipientDepartment: ident.department || "Adam C. Sinn '00 Department of Finance",
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
    ...C.ratings,
  };
  fs.writeFileSync(path.join(OUT, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('Research…');
  const research = await (
    await jpost('/api/evaluation-letters/research', { sourceDocuments })
  ).json();
  fs.writeFileSync(path.join(OUT, '03-brief.md'), research.brief);

  console.log('Draft…');
  const dr = await jpost('/api/evaluation-letters/draft', {
    setup,
    researchBrief: research.brief,
    writerNotes: C.notes,
  });
  const reader = dr.body.getReader();
  const dec = new TextDecoder();
  let letter = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    letter += dec.decode(value, { stream: true });
  }
  fs.writeFileSync(path.join(OUT, '04-letter.md'), letter);

  console.log('Verify…');
  const ver = await (
    await jpost('/api/evaluation-letters/verify', { letterText: letter, sourceDocuments })
  ).json();
  fs.writeFileSync(path.join(OUT, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(OUT, '05-corrected.md'), ver.correctedText || letter);
  console.log(' lint=' + (ver.lintIssues || []).length);

  console.log('Download…');
  const dl = await jpost('/api/evaluation-letters/download', {
    kind: 'letter',
    text: ver.correctedText || letter,
    writerId: 'brown',
    recipientName: ident.name,
  });
  const ab = await dl.arrayBuffer();
  fs.writeFileSync(path.join(OUT, '06-letter.docx'), Buffer.from(ab));
  console.log('Done: ' + OUT);
})();
