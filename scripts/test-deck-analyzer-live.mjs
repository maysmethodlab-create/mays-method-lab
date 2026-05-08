#!/usr/bin/env node
/**
 * Smoke test for the Deck Analyzer endpoint against the live deploy.
 * Uploads three real .pptx files and prints a compact summary of each
 * scan report. Pure HTTP — no module imports, no LLM, no file writes.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BASE = process.env.BASE_URL || 'https://mays-method-lab.onrender.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mml-dev2026';

const TEMP = 'C:\\Users\\shriharisridhar\\AppData\\Local\\Temp';
const TARGETS = [
  { label: "Sean's source (AI_in_Business)", file: path.join(TEMP, 'AI_in_Business_Badge_Designs.pptx') },
  { label: 'Mays template', file: path.join(ROOT, 'apps', 'PowerPoint Reformatter', 'template', 'mays-template.pptx') },
  { label: "Mays-branded output deck (1)", file: path.join(TEMP, '1777903129123-762708091648-mays-branded.pptx') },
];

async function login() {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const cookie = (res.headers.get('set-cookie') || '').match(/mml_session=[^;]+/)?.[0];
  if (!cookie) throw new Error('no session cookie');
  return cookie;
}

async function scan(cookie, target) {
  const buf = await fs.readFile(target.file);
  const fd = new FormData();
  fd.append('file', new Blob([buf]), path.basename(target.file));
  const res = await fetch(`${BASE}/api/apps/pptx-analyzer/scan`, {
    method: 'POST',
    headers: { cookie },
    body: fd,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`scan failed ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

function fmt(report) {
  const out = [];
  out.push(`File: ${report.deck.fileName} (${report.deck.fileFormat}, ${(report.deck.fileSize / 1024).toFixed(0)} KB)`);
  out.push(`Slides: ${report.deck.slideCount}`);
  if (report.deck.parseError) {
    out.push(`PARSE ERROR: ${report.deck.parseError}`);
    return out.join('\n');
  }
  out.push(`\nVerdict: ${report.reliability.recommendation.toUpperCase()}`);
  out.push(`  Reliable slides:    ${report.reliability.summary.reliable}`);
  out.push(`  Degraded slides:    ${report.reliability.summary.degraded}`);
  out.push(`  Unsupported slides: ${report.reliability.summary.unsupported}`);
  out.push(`\nElement findings:`);
  for (const f of report.reliability.findings) {
    const icon = f.status === 'reliable' ? '✓' : f.status === 'degraded' ? '!' : '✗';
    out.push(`  ${icon} ${f.type.padEnd(45)} ${String(f.count).padStart(4)}`);
  }
  out.push(`\nAccessibility: ${report.accessibility.score}/100  ` +
    `(critical=${report.accessibility.summary.critical}, ` +
    `major=${report.accessibility.summary.major}, ` +
    `minor=${report.accessibility.summary.minor})`);
  if (report.accessibility.issues.length > 0) {
    for (const iss of report.accessibility.issues.slice(0, 6)) {
      out.push(`    [${iss.severity.padEnd(8)}] Slide ${iss.slideIndex}: ${iss.description.slice(0, 100)}`);
    }
  }
  const flagged = report.reliability.perSlide.filter((s) => s.status !== 'reliable');
  if (flagged.length > 0) {
    out.push(`\nSlides needing attention:`);
    for (const s of flagged) {
      out.push(`  Slide ${s.slideIndex} [${s.status}]: ${s.reasons.join(', ')}`);
    }
  }
  return out.join('\n');
}

(async () => {
  console.log('Logging in…');
  const cookie = await login();
  console.log('  ✓ logged in\n');

  for (const t of TARGETS) {
    console.log(`========== ${t.label} ==========`);
    try {
      await fs.access(t.file);
    } catch {
      console.log(`(file not found at ${t.file} — skipped)\n`);
      continue;
    }
    try {
      const report = await scan(cookie, t);
      console.log(fmt(report));
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    console.log('');
  }
})();
