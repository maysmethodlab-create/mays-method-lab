#!/usr/bin/env node
/**
 * Verify the peer-comments cross-contamination fix on Arreola-Risa.
 *
 * Source documents:
 *   - Arreola-Risa CV, February 2024.pdf
 *   - arreola-Risa f180.pdf
 *   - comments from full professors.docx  (covers six faculty: Anupam,
 *     Tony, DJ Lee, Ravi Sen, Jon Stauffer, Bin Zhang)
 *
 * The bug: previous brief quoted "Unsatisfactory. Shows no interest in
 * the department" — that line is in ANUPAM's section, not Tony's.
 *
 * After the fix, the brief's peer-comments section must (a) NOT contain
 * any of Anupam's signature collegiality phrases, and (b) NOT contain
 * any of the other four faculty's names as section headers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters');
const BASE = process.env.BASE_URL || 'https://mays-method-lab.onrender.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev2026';
const RUN_LABEL = process.env.RUN_LABEL || '';
const OUT_DIR = path.join(
  APP_DIR,
  'test-output',
  RUN_LABEL ? `arreola-peer-isolation-${RUN_LABEL}` : 'arreola-peer-isolation',
);

const TEMPLATE_DIR = path.join(
  APP_DIR,
  'Template Letters',
  'Information & Operations (Metters)',
  'Arreola-Risa, Antonio [TT]',
);
const FILES = [
  { kind: 'cv',              name: 'Antonio Arreola-Risa CV, February 2025.pdf', path: path.join(TEMPLATE_DIR, 'Antonio Arreola-Risa CV, February 2025.pdf') },
  { kind: 'self-evaluation', name: 'arreola-Risa f-180.pdf',                     path: path.join(TEMPLATE_DIR, 'arreola-Risa f-180.pdf') },
  { kind: 'peer-comments',   name: 'comments from full professors.docx',         path: 'C:\\Users\\shriharisridhar\\Desktop\\test\\comments from full professors.docx' },
];

const EVAL_YEAR = 2025;

let SESSION_COOKIE = '';

async function login() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  SESSION_COOKIE = (res.headers.get('set-cookie') || '').match(/mml_session=[^;]+/)?.[0] || '';
  if (!SESSION_COOKIE) throw new Error('no session cookie');
  console.log('  ✓ logged in');
}

async function uploadAndExtract() {
  const fd = new FormData();
  for (const f of FILES) {
    const buf = fs.readFileSync(f.path);
    fd.append('files', new Blob([buf]), f.name);
  }
  const res = await fetch(`${BASE}/api/evaluation-letters/extract`, {
    method: 'POST',
    headers: { cookie: SESSION_COOKIE },
    body: fd,
  });
  if (!res.ok) throw new Error(`extract failed ${res.status}: ${await res.text()}`);
  return res.json();
}

async function research(sourceDocuments, evaluationYear, recipientDepartment) {
  const res = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST',
    headers: { cookie: SESSION_COOKIE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceDocuments, evaluationYear, recipientDepartment }),
  });
  if (!res.ok) throw new Error(`research failed ${res.status}: ${await res.text()}`);
  return res.json();
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('\n=== Arreola-Risa peer-isolation test (post-prompt-fix) ===');
  console.log(`BASE: ${BASE}\n`);

  await login();

  console.log('extract...');
  const extracted = await uploadAndExtract();
  const sourceDocuments = extracted.files
    .map((f, i) => `===== ${FILES[i].kind.toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source.txt'), sourceDocuments);

  console.log('research...');
  const t0 = Date.now();
  const out = await research(
    sourceDocuments,
    EVAL_YEAR,
    'Department of Information and Operations Management',
  );
  fs.writeFileSync(path.join(OUT_DIR, '02-brief.md'), out.brief);
  console.log(`  brief ${out.brief.length} chars (${Date.now() - t0}ms)\n`);

  // Pull just the peer-comments section out of the brief
  const peerSection = (out.brief.match(
    /## Peer Comments from Other Faculty[\s\S]*?(?=\n## |\n---|\n```|$)/i,
  ) || [''])[0];
  fs.writeFileSync(path.join(OUT_DIR, '03-peer-section.md'), peerSection);

  // Detection patterns
  const ANUPAM_SIGNATURES = [
    /unsatisfactory\.?\s+shows no interest in the department/i,
    /not much of a colleague/i,
    /shows no interest in the department/i,
  ];
  const OTHER_FACULTY_NAMES = [
    /\banupam\b/i,
    /\bagrawal\b/i,
    /\bdj\s+lee\b/i,
    /\bravi\s+sen\b/i,
    /\bjon\s+stauffer\b/i,
    /\bbin\s+zhang\b/i,
  ];

  console.log('=== AUDIT ===');
  let leaks = 0;

  console.log('\n--- Anupam signature phrases (must be absent in Tony\'s brief): ---');
  for (const re of ANUPAM_SIGNATURES) {
    const hits = (peerSection.match(new RegExp(re.source, 'gi')) || []).length;
    const ok = hits === 0;
    if (!ok) leaks += hits;
    console.log(`  ${ok ? '✓' : '✗ LEAK'}  ${re}  (${hits} hits)`);
  }

  console.log('\n--- Other faculty names (must be absent): ---');
  for (const re of OTHER_FACULTY_NAMES) {
    const hits = (peerSection.match(new RegExp(re.source, 'gi')) || []).length;
    const ok = hits === 0;
    if (!ok) leaks += hits;
    console.log(`  ${ok ? '✓' : '✗ LEAK'}  ${re}  (${hits} hits)`);
  }

  console.log(`\n--- Tony's expected phrases (should be present): ---`);
  const TONY_SIGNATURES = [
    /borderline.{0,30}more involvement/i,
    /(always a pleasure to have around|always pleasant)/i,
  ];
  let tonyHits = 0;
  for (const re of TONY_SIGNATURES) {
    const hits = (peerSection.match(new RegExp(re.source, 'gi')) || []).length;
    if (hits > 0) tonyHits += 1;
    console.log(`  ${hits > 0 ? '✓' : '⚠️'}  ${re}  (${hits} hits)`);
  }

  console.log(`\n=== VERDICT: ${leaks === 0 ? '✅ NO CONTAMINATION' : `❌ ${leaks} CROSS-FACULTY LEAKS`} ===`);
  console.log(`\nFull brief: ${path.join(OUT_DIR, '02-brief.md')}`);
  console.log(`Peer section only: ${path.join(OUT_DIR, '03-peer-section.md')}`);
})();
