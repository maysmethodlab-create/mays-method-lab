#!/usr/bin/env node
/**
 * One-shot extractor: read each .docx via mammoth and write a sibling
 * .txt with the same basename. Used to seed exemplar pool inputs for
 * the APT calibration. Run once when new template letters land.
 *
 * Usage:
 *   node scripts/_extract-docx.mjs <abs path 1> <abs path 2> ...
 */

import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';

async function extractOne(docxPath) {
  if (!fs.existsSync(docxPath)) {
    console.error(`MISSING: ${docxPath}`);
    return false;
  }
  const buf = fs.readFileSync(docxPath);
  const out = await mammoth.extractRawText({ buffer: buf });
  const text = out.value || '';
  const txtPath = docxPath.replace(/\.docx$/i, '.txt');
  fs.writeFileSync(txtPath, text, 'utf8');
  console.log(`OK   ${path.basename(txtPath)}  (${text.length} chars)`);
  return true;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Pass one or more .docx paths.');
  process.exit(1);
}

let ok = 0;
for (const p of args) {
  if (await extractOne(p)) ok += 1;
}
console.log(`\n${ok}/${args.length} files extracted.`);
