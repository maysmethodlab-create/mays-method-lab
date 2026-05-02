// Re-runs the Agrawal case that Rich's role-play agent flagged. Verifies:
//  (a) the two-agent verify pipeline now corrects fabrications (no SCMT 364)
//  (b) the sanitizer leaves date ranges alone (FY2023–FY2025 stays)
//  (c) the sanitizer no longer orphans lowercase sentence starts.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateFile } from './_template-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';
const OUT = path.join(APP_DIR, 'test-output', 'agrawal-after-bugfix');

fs.mkdirSync(OUT, { recursive: true });

const FILES = ['agrawal cv.pdf', 'agrawal f180.pdf'];
const RATINGS = {
  teachingRating: 'Effective',
  researchRating: 'Effective',
  serviceRating: 'Effective',
  overallRating: 'Effective',
};
const NOTES =
  'Solid contributor. PhD mentoring with Mayukh Majumdar is a real strength. Concern: more national-level service would help his case for full. Encourage him to target POM and MSOM.';

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
  const ext = await uploadAndExtract(FILES);
  fs.writeFileSync(path.join(OUT, '01-extracted.json'), JSON.stringify(ext, null, 2));
  const sourceDocuments = ext.files
    .map((f) => `===== ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT, '01-source.txt'), sourceDocuments);

  console.log('Identify…');
  const ident = await (
    await jpost('/api/evaluation-letters/identify', { sourceDocuments })
  ).json();
  fs.writeFileSync(path.join(OUT, '02-identify.json'), JSON.stringify(ident, null, 2));

  const setup = {
    writerId: 'metters',
    evaluationYear: 2025,
    recipientName: ident.name || 'Anupam Agrawal, Ph.D.',
    recipientTitle: ident.title || 'Associate Professor',
    recipientDepartment:
      ident.department || 'Department of Information and Operations Management',
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
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
    writerNotes: NOTES,
  });
  const reader = dr.body.getReader();
  const dec = new TextDecoder();
  let letter = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    letter += dec.decode(value, { stream: true });
  }
  fs.writeFileSync(path.join(OUT, '04-draft.md'), letter);

  console.log('Verify (hallucination + style agents)…');
  const ver = await (
    await jpost('/api/evaluation-letters/verify', { letterText: letter, sourceDocuments })
  ).json();
  fs.writeFileSync(path.join(OUT, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(OUT, '05-verify-report.md'), ver.report);
  fs.writeFileSync(path.join(OUT, '05-corrected-final.md'), ver.correctedText);
  console.log(' lint=' + (ver.lintIssues || []).length);

  console.log('Append summary…');
  const sum = await (
    await jpost('/api/evaluation-letters/append-summary', {
      recipientName: setup.recipientName,
      roleCategoryId: setup.roleCategoryId,
      ...RATINGS,
    })
  ).json();
  const final = `${ver.correctedText.replace(/\s+$/, '')}\n\n${sum.summary}\n`;
  fs.writeFileSync(path.join(OUT, '06-final.md'), final);

  console.log('Download…');
  const dl = await jpost('/api/evaluation-letters/download', {
    kind: 'letter',
    text: final,
    writerId: 'metters',
    recipientName: setup.recipientName,
  });
  const ab = await dl.arrayBuffer();
  fs.writeFileSync(path.join(OUT, 'letter.docx'), Buffer.from(ab));

  // ===== Bug-fix assertions =====
  const flags = [];
  // Bug A: no fabricated SCMT 364 in the corrected/final letter
  if (/SCMT\s*364/i.test(final))
    flags.push('FAIL: corrected letter still mentions SCMT 364 (the fabricated course number)');
  if (/350\s*students/i.test(final))
    flags.push('FAIL: corrected letter still mentions 350 students (the fabricated enrollment)');

  // Bug B: year ranges should keep dashes (or at least say "to") not commas-between-years
  if (/\(\s*\d{4}\s*,\s*\d{4}\s*\)/.test(final))
    flags.push('FAIL: a year range got collapsed to "(YYYY, YYYY)" — sanitizer dash bug');
  if (/FY\d{4}\s*[-–—]\s*FY\d{4}/.test(final))
    console.log(' ✓ FY year ranges preserved');

  // Bug C: no orphan lowercase sentence starts
  const orphans = final.match(/[.!?]\s+[a-z]\w+/g);
  if (orphans && orphans.length > 0)
    flags.push(`FAIL: orphan lowercase sentence starts: ${orphans.slice(0, 3).join(' | ')}`);

  // Output verdict
  console.log('\n========== BUG-FIX VERDICT ==========');
  if (flags.length === 0) {
    console.log('✓ All assertions passed. Verify pipeline now ships fact-corrected text.');
  } else {
    flags.forEach((f) => console.log(f));
  }
  fs.writeFileSync(path.join(OUT, 'verdict.txt'), flags.join('\n') || 'PASS');
})();
