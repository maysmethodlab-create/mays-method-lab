#!/usr/bin/env node
/**
 * Arreola-Risa second-pass smoke test — verify two new fixes from Rich
 * Metters' second round of feedback:
 *   1. Journal-tier classification uses Appendix J + FT50, not the
 *      previous embedded short list. Non-A-list journals should NOT be
 *      labeled A-tier in the brief.
 *   2. Peer comments (uploaded as a source document) appear in the
 *      research brief and survive the hallucination check, producing a
 *      "Comments from Other Faculty" section in the final letter.
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

const OUT_DIR = path.join(APP_DIR, 'test-output', 'arreola-risa-rich-v2');

const FILES = [
  'Antonio Arreola-Risa CV, February 2025.pdf',
  'arreola-Risa f-180.pdf',
  'Annual review comments of associate profs.docx',
];

const EVAL_YEAR = 2025;

const RATINGS = {
  teachingRating: 'Excellent',
  researchRating: 'Effective',
  serviceRating: 'Effective',
  overallRating: 'Effective',
};

const NOTES = `STANDOUT:
Tony's resurgence in research with Bo Li is a genuine bright spot. The trajectory of the last two years shows real momentum.

GROWTH AREA:
Increase service involvement at the conference and society level — session chairing, track chairing, or society officer roles would strengthen the case for full.

SENSITIVE:
Service has been thin for some time and needs to be addressed without making it the dominant note of the letter.`;

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

function authHeaders(json = false) {
  return {
    cookie: SESSION_COOKIE,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function uploadAndExtract(filenames) {
  const fd = new FormData();
  for (const fn of filenames) {
    const buf = fs.readFileSync(templateFile(fn));
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
  if (/peer|comments?\s+(?:from|by|of|junior|senior|associate|tenured|faculty|other)|review\s+comments|other\s+faculty/.test(n)) return 'peer-comments';
  if (/cv|vita|curriculum|resume/.test(n)) return 'cv';
  if (/self|annual|evaluation|f180|faculty\s*180/.test(n)) return 'self-evaluation';
  return 'other';
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Logging in…');
  await login();
  console.log(`\n=== Arreola-Risa Rich v2 (eval year ${EVAL_YEAR}) ===`);

  console.log('  1/5 extracting…');
  const extracted = await uploadAndExtract(FILES);
  const sourceDocuments = extracted.files
    .map((f) => `===== ${detectKind(f.filename).toUpperCase()} — ${f.filename} =====\n${f.text}`)
    .join('\n\n');
  fs.writeFileSync(path.join(OUT_DIR, '01-source.txt'), sourceDocuments);
  console.log(`      ${extracted.files.length} files, ${sourceDocuments.length} chars`);

  console.log('  2/5 identifying…');
  const ident = await identify(sourceDocuments);

  const setup = {
    writerId: 'metters',
    evaluationYear: EVAL_YEAR,
    recipientName: ident.name || 'Antonio Arreola-Risa, Ph.D.',
    recipientTitle: ident.title || 'Associate Professor',
    recipientDepartment:
      ident.department || 'Department of Information and Operations Management',
    roleCategoryId: ident.roleCategoryId || 'tt-associate-professor',
    ...RATINGS,
  };
  fs.writeFileSync(path.join(OUT_DIR, '02-setup.json'), JSON.stringify(setup, null, 2));

  console.log('  3/5 research…');
  const researchOut = await research(sourceDocuments, EVAL_YEAR, setup.recipientDepartment);
  fs.writeFileSync(path.join(OUT_DIR, '03-brief.md'), researchOut.brief);
  console.log(`      brief ${researchOut.brief.length} chars`);

  console.log('  4/5 drafting…');
  const letter = await draft(setup, researchOut.brief, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '04-draft.md'), letter);
  console.log(`      letter ${letter.length} chars`);

  console.log('  5/5 verify…');
  const ver = await verify(letter, sourceDocuments, NOTES);
  fs.writeFileSync(path.join(OUT_DIR, '05-verify.md'), ver.report || '');
  fs.writeFileSync(path.join(OUT_DIR, '05-corrected.md'), ver.correctedText || '');

  // ===== Audits =====
  const brief = researchOut.brief;
  const draftText = letter;
  const verifyText = ver.report || '';
  const correctedText = ver.correctedText || '';

  // Audit 1: Brief uses tier labels
  const briefHasTierLabels = /\*\*A-TIER \(dept A-list\)\*\*|\*\*A-TIER \(FT50\)\*\*|\*\*other A-level/i.test(brief);

  // Audit 2: Brief has "Peer Comments from Other Faculty" section
  const briefPeerSection = /## Peer Comments from Other Faculty/i.test(brief);

  // Audit 3: Brief peer section is populated (not "None provided.")
  const briefPeerPopulated = (() => {
    const m = brief.match(/## Peer Comments from Other Faculty\s+([\s\S]*?)(?=\n##|\n---|\n```|$)/i);
    if (!m) return false;
    return !/none provided/i.test(m[1]);
  })();

  // Audit 4: Final letter has "Comments from Other Faculty" section
  const finalText = correctedText || draftText;
  const letterPeerSection = /\*\*Comments from Other Faculty\*\*/i.test(finalText);

  // Audit 5: Verify report does NOT flag peer-comment claims as fabricated
  // Look for any claim flagged FABRICATED that quotes peer-comment-style content.
  const peerKeywords = ['service', 'societ', 'conference', 'session chair', 'track chair', 'Bo Li', 'resurgence'];
  const fabricatedRegion = (() => {
    const m = verifyText.match(/❌\s*FABRICATED[\s\S]*?(?=\n##|\n---|$)/i);
    return m ? m[0] : '';
  })();
  const peerClaimsFabricated = peerKeywords.some((kw) => new RegExp(kw, 'i').test(fabricatedRegion));

  // Audit 6: Tier-classification check — count A-TIER labels and inspect them
  const aTierMatches = [...brief.matchAll(/\*\*A-TIER \(([^)]+)\)\*\*/g)];
  const aTierJournals = aTierMatches.map((m) => m[1]);

  const audit = `# Arreola-Risa Rich v2 audit

## A-journal classification
- Brief uses tier labels: ${briefHasTierLabels}
- A-TIER classifications found: ${aTierMatches.length}
${aTierMatches.length > 0 ? aTierMatches.map((m) => `  - ${m[0]}`).join('\n') : '  (none — every paper labeled non-A-tier)'}

## Peer comments — brief
- "Peer Comments from Other Faculty" section present: ${briefPeerSection}
- Section is populated (not "None provided."): ${briefPeerPopulated}

## Peer comments — letter
- Final letter has "Comments from Other Faculty" section: ${letterPeerSection}

## Hallucination — peer claims survive
- Peer-related claims in FABRICATED list: ${peerClaimsFabricated ? 'YES (BAD)' : 'NO (GOOD)'}

## VERDICT
${
  briefHasTierLabels && briefPeerSection && briefPeerPopulated && letterPeerSection && !peerClaimsFabricated
    ? '✅ ALL CHECKS PASS'
    : '❌ At least one check failed — review individual lines above'
}
`;

  fs.writeFileSync(path.join(OUT_DIR, '99-audit.md'), audit);

  console.log('\n--- audits ---');
  console.log(`Brief uses tier labels: ${briefHasTierLabels}`);
  console.log(`Brief has Peer Comments section: ${briefPeerSection}`);
  console.log(`Peer Comments section populated: ${briefPeerPopulated}`);
  console.log(`Letter has Comments from Other Faculty: ${letterPeerSection}`);
  console.log(`Peer claims fabricated (should be NO): ${peerClaimsFabricated ? 'YES (BAD)' : 'NO (GOOD)'}`);
  console.log(`A-TIER count in brief: ${aTierMatches.length}`);
  if (aTierMatches.length) console.log(`A-TIER lines: ${aTierJournals.join(' | ')}`);
  console.log(`\nFull audit: ${OUT_DIR}/99-audit.md`);
})();
