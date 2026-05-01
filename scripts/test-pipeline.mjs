#!/usr/bin/env node
/**
 * Pipeline test harness — runs Extract → Identify → Research → Draft → Verify
 * against Rich Metters' uploaded test cases and writes each phase's output to
 * test-output/<case>/ for review.
 *
 * Run: node scripts/test-pipeline.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev-2026';
const OUT_DIR = path.join(ROOT, 'test-output');

const TEMPLATE_DIR = path.join(
  ROOT,
  'apps',
  'Annual Evaluation Letters',
  'Template Letters',
);

/**
 * Test cases derived from filenames in Template Letters/. Each case names the
 * person, their expected role category id, the writer (Rich Metters), and the
 * files that go in.
 */
const CASES = [
  {
    slug: 'agrawal',
    name: 'Manish Agrawal (associate)',
    expectedRole: 'tt-associate-professor',
    writerId: 'metters',
    files: ['agrawal cv.pdf', 'agrawal f180.pdf'],
    ratings: {
      teachingRating: 'Effective',
      researchRating: 'Effective',
      serviceRating: 'Effective',
      overallRating: 'Effective',
    },
    notes:
      'Solid contributor. PhD mentoring is a strength. Looking for more national-level service in the coming year.',
  },
  {
    slug: 'arreola-risa',
    name: 'Antonio Arreola-Risa (associate)',
    expectedRole: 'tt-associate-professor',
    writerId: 'metters',
    files: ['Antonio Arreola-Risa CV, February 2025.pdf', 'arreola-Risa f-180.pdf'],
    ratings: {
      teachingRating: 'Excellent',
      researchRating: 'Effective',
      serviceRating: 'Excellent',
      overallRating: 'Excellent',
    },
    notes:
      'Outstanding teaching and service this year. Continued strong publication record. Mentorship of doctoral students has been particularly notable.',
  },
  {
    slug: 'curtsinger',
    name: 'Curtsinger (lecturer)',
    expectedRole: 'apt-lecturer',
    writerId: 'metters',
    files: ['Curtsinger.docx', 'curtsinger f180.pdf'],
    ratings: {
      teachingRating: 'Excellent',
      serviceRating: 'Effective',
      overallRating: 'Excellent',
    },
    notes:
      'Great teaching ratings. Active in coordinating sections. AACSB activities are well documented.',
  },
  {
    slug: 'phinney',
    name: 'Phinney (senior lecturer)',
    expectedRole: 'apt-lecturer',
    writerId: 'metters',
    files: ['Phinney Resume - March 2025.docx', 'phinney f180.pdf'],
    ratings: {
      teachingRating: 'Excellent',
      serviceRating: 'Excellent',
      overallRating: 'Excellent',
    },
    notes:
      'Senior lecturer with significant program leadership. Mentors junior instructors. Continues to maintain industry currency.',
  },
  // Jamie Brown (Finance) cases — include CV, F180, and Submission History
  {
    slug: 'wu',
    name: 'Wei Wu (Jamie / Finance)',
    expectedRole: 'tt-associate-professor',
    writerId: 'brown',
    files: ['Wu, Wei CV.pdf', 'Wu, Wei.pdf', 'Wu, Wei Submission History.pdf'],
    ratings: {
      teachingRating: 'Effective',
      researchRating: 'Excellent',
      serviceRating: 'Effective',
      overallRating: 'Excellent',
    },
    notes:
      'Strong publication year. Pipeline is healthy. Encourage taking on more departmental service.',
  },
  {
    slug: 'cziraki',
    name: 'Peter Cziraki (Jamie / Finance)',
    expectedRole: 'tt-associate-professor',
    writerId: 'brown',
    files: [
      'Cziraki, Peter CV - May.pdf',
      'Cziraki, Peter.pdf',
      'Cziraki, Peter Submission History.pdf',
    ],
    ratings: {
      teachingRating: 'Effective',
      researchRating: 'Effective',
      serviceRating: 'Effective',
      overallRating: 'Effective',
    },
    notes:
      'Solid year. Submission history shows persistent effort. Continue pushing top-tier papers through the cycle.',
  },
];

let SESSION_COOKIE = '';

async function login() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const setCookie = res.headers.get('set-cookie') || '';
  // Extract just mml_session=...
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
  // Build multipart form-data manually
  const fd = new FormData();
  for (const fn of filenames) {
    const full = path.join(TEMPLATE_DIR, fn);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing test file: ${full}`);
    }
    const buf = fs.readFileSync(full);
    fd.append('files', new Blob([buf]), fn);
  }
  const res = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST',
    headers: { cookie: SESSION_COOKIE },
    body: fd,
  });
  if (!res.ok) {
    throw new Error(`extract failed ${res.status}: ${await res.text()}`);
  }
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
  if (!res.ok || !res.body) {
    throw new Error(`draft failed ${res.status}: ${await res.text()}`);
  }
  // Stream to a string
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

async function downloadDocx(text, writerId, recipientName) {
  const res = await fetch(`${BASE}/api/evaluation-letters/download`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ kind: 'letter', text, writerId, recipientName }),
  });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function runCase(c) {
  const dir = path.join(OUT_DIR, c.slug);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n=== ${c.name} ===`);

  // 1. Extract
  console.log('  1/5  extracting…');
  const extracted = await uploadAndExtract(c.files);
  fs.writeFileSync(path.join(dir, '01-extracted.json'), JSON.stringify(extracted, null, 2));
  const sourceDocuments = extracted.files
    .map(
      (f) =>
        `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`,
    )
    .join('\n\n');
  fs.writeFileSync(path.join(dir, '01-source-documents.txt'), sourceDocuments);
  console.log(`       ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  // 2. Identify
  console.log('  2/5  identifying recipient…');
  const ident = await identify(sourceDocuments);
  fs.writeFileSync(path.join(dir, '02-identify.json'), JSON.stringify(ident, null, 2));
  console.log(
    `       name=${ident.name} | title=${ident.title?.slice(0, 60) || ''} | dept=${ident.department || ''} | role=${ident.roleCategoryId} | source=${ident.source}`,
  );
  const roleMatch = ident.roleCategoryId === c.expectedRole ? '✓' : '✗';
  console.log(`       expected role=${c.expectedRole} ${roleMatch}`);

  // Build setup using identify results, falling back to defaults
  const setup = {
    writerId: c.writerId,
    evaluationYear: 2025,
    recipientName: ident.name || c.name,
    recipientTitle: ident.title || '',
    recipientDepartment:
      ident.department || 'Department of Information and Operations Management',
    roleCategoryId: ident.roleCategoryId || c.expectedRole,
    ...c.ratings,
  };
  fs.writeFileSync(path.join(dir, '02-setup.json'), JSON.stringify(setup, null, 2));

  // 3. Research
  console.log('  3/5  generating research brief…');
  const researchOut = await research(sourceDocuments);
  fs.writeFileSync(path.join(dir, '03-research-brief.md'), researchOut.brief);
  console.log(`       brief ${researchOut.brief.length} chars`);

  // 4. Draft (streaming)
  console.log('  4/5  drafting letter (streaming)…');
  const letter = await draft(setup, researchOut.brief, c.notes);
  fs.writeFileSync(path.join(dir, '04-letter.md'), letter);
  console.log(`       letter ${letter.length} chars`);

  // 5. Verify
  console.log('  5/5  verifying…');
  const ver = await verify(letter, sourceDocuments);
  fs.writeFileSync(path.join(dir, '05-verify.json'), JSON.stringify(ver, null, 2));
  fs.writeFileSync(path.join(dir, '05-verify-report.md'), ver.report || '');
  if (ver.correctedText) {
    fs.writeFileSync(path.join(dir, '05-letter-corrected.md'), ver.correctedText);
  }
  console.log(`       lint issues = ${(ver.lintIssues || []).length}`);

  // 6. Download .docx
  const finalText = ver.correctedText || letter;
  const buf = await downloadDocx(finalText, c.writerId, setup.recipientName);
  fs.writeFileSync(path.join(dir, '06-letter.docx'), buf);
  console.log(`       wrote .docx (${buf.length} bytes)`);

  return {
    case: c.slug,
    identifiedRole: ident.roleCategoryId,
    expectedRole: c.expectedRole,
    roleMatch: ident.roleCategoryId === c.expectedRole,
    name: ident.name,
    title: ident.title,
    department: ident.department,
    identifySource: ident.source,
    briefChars: researchOut.brief.length,
    letterChars: letter.length,
    lintIssues: (ver.lintIssues || []).length,
  };
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

  const results = [];
  for (const c of CASES) {
    try {
      results.push(await runCase(c));
    } catch (e) {
      console.error(`  ✗ ${c.slug} failed:`, e.message);
      results.push({ case: c.slug, error: e.message });
    }
  }

  console.log('\n========= SUMMARY =========');
  for (const r of results) {
    if (r.error) {
      console.log(`  ✗ ${r.case}: ${r.error}`);
    } else {
      console.log(
        `  ${r.roleMatch ? '✓' : '✗'} ${r.case.padEnd(15)} role=${r.identifiedRole}/${r.expectedRole} via ${r.identifySource}, brief=${r.briefChars}c, letter=${r.letterChars}c, lint=${r.lintIssues}`,
      );
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(results, null, 2));
  console.log(`\nOutputs saved to: ${OUT_DIR}`);
})();
