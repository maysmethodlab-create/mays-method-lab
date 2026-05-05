#!/usr/bin/env node
/**
 * Three-case TT smoke test — verify the rating-placeholder fix and the
 * deterministic journal-tier classifier across three departments:
 *   - Sarah Stuber (Accounting / Sean McGuire)
 *   - Wei Wu (Finance / Jamie Brown)
 *   - Antonio Arreola-Risa (I&O / Rich Metters)
 *
 * For each case the test runs the full pipeline (extract → identify →
 * research → draft → verify → append-summary) and checks:
 *   1. The brief has Section A (Top-Tier) and Section B (Other
 *      Publications) — the new two-section research structure.
 *   2. tierWarnings from the deterministic classifier audit is empty
 *      (no hallucinated A-tier classifications).
 *   3. The draft body contains all four [*_RATING_SENTENCE] placeholders.
 *   4. The final letter (after append-summary) contains all four rating
 *      sentences in their substituted form ("I assess your ... as ...").
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

const EVAL_YEAR = 2025;

const CASES = [
  {
    label: 'Stuber (Accounting/McGuire)',
    outDir: 'tt-three/stuber',
    files: ['S Stuber CV 20250317 - For Annual Review.pdf'],
    setup: {
      writerId: 'mcguire',
      recipientName: 'Sarah B. Stuber, Ph.D.',
      recipientTitle: 'Associate Professor',
      recipientDepartment: 'James Benjamin Department of Accounting',
      roleCategoryId: 'tt-associate-professor',
    },
    ratings: { teachingRating: 'Excellent', researchRating: 'Excellent', serviceRating: 'Excellent', overallRating: 'Excellent' },
    notes: 'Strong contributor in tax research. Continues to push toward top journals. Service is appropriate for her stage.',
  },
  {
    label: 'Wei Wu (Finance/Brown)',
    outDir: 'tt-three/wu',
    files: ['Wu, Wei CV.pdf', 'Wu 2024 Annual Review.pdf'],
    setup: {
      writerId: 'brown',
      recipientName: 'Wei Wu, Ph.D.',
      recipientTitle: 'Associate Professor',
      recipientDepartment: "Adam C. Sinn '00 Department of Finance",
      roleCategoryId: 'tt-associate-professor',
    },
    ratings: { teachingRating: 'Effective', researchRating: 'Effective', serviceRating: 'Effective', overallRating: 'Effective' },
    notes: 'Solid researcher. Continue building toward top journals.',
  },
  {
    label: 'Arreola-Risa (I&O/Metters)',
    outDir: 'tt-three/arreola',
    files: ['Antonio Arreola-Risa CV, February 2025.pdf', 'arreola-Risa f-180.pdf'],
    setup: {
      writerId: 'metters',
      recipientName: 'Antonio Arreola-Risa, Ph.D.',
      recipientTitle: 'Associate Professor',
      recipientDepartment: 'Department of Information and Operations Management',
      roleCategoryId: 'tt-associate-professor',
    },
    ratings: { teachingRating: 'Excellent', researchRating: 'Effective', serviceRating: 'Effective', overallRating: 'Effective' },
    notes: 'Resurgence in research with Bo Li. Service needs increased involvement at conference and society level.',
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
  SESSION_COOKIE = (res.headers.get('set-cookie') || '').match(/mml_session=[^;]+/)?.[0] || '';
  if (!SESSION_COOKIE) throw new Error('no session cookie');
}

function authHeaders(json = false) {
  return { cookie: SESSION_COOKIE, ...(json ? { 'Content-Type': 'application/json' } : {}) };
}

async function uploadAndExtract(filenames) {
  const fd = new FormData();
  for (const fn of filenames) {
    const buf = fs.readFileSync(templateFile(fn));
    fd.append('files', new Blob([buf]), fn);
  }
  const res = await fetch(`${BASE}/api/evaluation-letters/extract`, { method: 'POST', headers: { cookie: SESSION_COOKIE }, body: fd });
  if (!res.ok) throw new Error(`extract failed ${res.status}`);
  return res.json();
}

async function research(sourceDocuments, evaluationYear, recipientDepartment) {
  const res = await fetch(`${BASE}/api/evaluation-letters/research`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ sourceDocuments, evaluationYear, recipientDepartment }),
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

async function appendSummary(setup, letterText) {
  const res = await fetch(`${BASE}/api/evaluation-letters/append-summary`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({
      writerId: setup.writerId,
      recipientName: setup.recipientName,
      roleCategoryId: setup.roleCategoryId,
      letterText,
      teachingRating: setup.teachingRating,
      researchRating: setup.researchRating,
      serviceRating: setup.serviceRating,
      overallRating: setup.overallRating,
    }),
  });
  if (!res.ok) throw new Error(`append-summary failed ${res.status}: ${await res.text()}`);
  return res.json();
}

function detectKind(name) {
  const n = name.toLowerCase();
  if (/peer|comments?\s+(?:from|by|of|junior|senior|associate|tenured|faculty|other)|review\s+comments|other\s+faculty/.test(n)) return 'peer-comments';
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  if (/self|annual|evaluation|f180|faculty\s*180/.test(n)) return 'self-evaluation';
  return 'other';
}

async function runCase(c) {
  const outDir = path.join(APP_DIR, 'test-output', c.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`\n=== ${c.label} ===`);

  console.log('  extract…');
  const extracted = await uploadAndExtract(c.files);
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(outDir, '01-source.txt'), sourceDocuments);

  console.log('  research…');
  const researchOut = await research(sourceDocuments, EVAL_YEAR, c.setup.recipientDepartment);
  fs.writeFileSync(path.join(outDir, '02-brief.md'), researchOut.brief);
  fs.writeFileSync(path.join(outDir, '02-tier-warnings.json'), JSON.stringify(researchOut.tierWarnings || [], null, 2));

  const setup = { ...c.setup, evaluationYear: EVAL_YEAR, ...c.ratings };

  console.log('  draft…');
  const letter = await draft(setup, researchOut.brief, c.notes);
  fs.writeFileSync(path.join(outDir, '03-draft.md'), letter);

  console.log('  append-summary…');
  const sum = await appendSummary(setup, letter);
  const finalLetter = sum.letter || letter;
  fs.writeFileSync(path.join(outDir, '04-final.md'), finalLetter);

  // ===== Audits =====
  const brief = researchOut.brief;
  const tierWarnings = researchOut.tierWarnings || [];

  // Brief structure: A. Top-Tier and B. Other Publications must both
  // appear as section headers
  const briefHasTopTier = /###\s*A\.?\s+Top-?Tier\s+Journal\s+Articles/i.test(brief);
  const briefHasOtherPubs = /###\s*B\.?\s+Other\s+Publications/i.test(brief);

  // Draft body should contain all four placeholders OR (after append-summary
  // already substituted) the four rating sentences
  const draftHasPlaceholders =
    /\[RESEARCH_RATING_SENTENCE\]/.test(letter) &&
    /\[TEACHING_RATING_SENTENCE\]/.test(letter) &&
    /\[SERVICE_RATING_SENTENCE\]/.test(letter) &&
    /\[OVERALL_RATING_SENTENCE\]/.test(letter);

  // Final letter should contain all four substituted rating sentences
  const finalHasResearch = /assess your research performance as/i.test(finalLetter);
  const finalHasTeaching = /assess your teaching as/i.test(finalLetter);
  const finalHasService = /assess your service as/i.test(finalLetter);
  const finalHasOverall = /you have demonstrated\s+\w+\s+performance/i.test(finalLetter);
  const allFinalRatings = finalHasResearch && finalHasTeaching && finalHasService && finalHasOverall;

  const result = {
    case: c.label,
    briefHasTopTier,
    briefHasOtherPubs,
    tierWarningsCount: tierWarnings.length,
    tierWarnings,
    draftHasPlaceholders,
    finalHasResearch,
    finalHasTeaching,
    finalHasService,
    finalHasOverall,
    pass:
      briefHasTopTier &&
      briefHasOtherPubs &&
      tierWarnings.length === 0 &&
      draftHasPlaceholders &&
      allFinalRatings,
  };
  fs.writeFileSync(path.join(outDir, '99-audit.json'), JSON.stringify(result, null, 2));
  return result;
}

(async () => {
  console.log('Logging in…');
  await login();
  console.log('  ✓ logged in');

  const results = [];
  for (const c of CASES) {
    try {
      results.push(await runCase(c));
    } catch (e) {
      console.error(`  ✗ ${c.label}: ${e.message}`);
      results.push({ case: c.label, error: e.message, pass: false });
    }
  }

  console.log('\n========== SCOREBOARD ==========');
  for (const r of results) {
    const status = r.pass ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}  ${r.case}`);
    if (!r.pass && !r.error) {
      console.log(`         briefA=${r.briefHasTopTier} briefB=${r.briefHasOtherPubs} placeholders=${r.draftHasPlaceholders} ratings=R${r.finalHasResearch?'✓':'✗'}/T${r.finalHasTeaching?'✓':'✗'}/S${r.finalHasService?'✓':'✗'}/O${r.finalHasOverall?'✓':'✗'} warnings=${r.tierWarningsCount}`);
      if (r.tierWarningsCount > 0) {
        for (const w of r.tierWarnings) console.log(`           - ${w}`);
      }
    } else if (r.error) {
      console.log(`         error: ${r.error}`);
    }
  }
  const allPass = results.every((r) => r.pass);
  console.log(`\nOverall: ${allPass ? 'ALL PASS — ready to ship' : 'FAIL — see details above'}`);
  process.exit(allPass ? 0 : 1);
})();
