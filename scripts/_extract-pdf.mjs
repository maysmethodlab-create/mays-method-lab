#!/usr/bin/env node
/**
 * One-shot extractor: read each .pdf via pdf-parse and write a sibling
 * .txt with the same basename. Mirrors `_extract-docx.mjs`. Used to seed
 * exemplar pool inputs when a writer ships PDFs (e.g. the Finance Jamie
 * Brown packets) instead of .docx.
 *
 * Usage:
 *   node scripts/_extract-pdf.mjs <abs path 1> <abs path 2> ...
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// pdf-parse exports a CommonJS function; load via createRequire so this
// file stays an .mjs module without import-interop friction.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function extractOne(pdfPath) {
  if (!fs.existsSync(pdfPath)) {
    console.error(`MISSING: ${pdfPath}`);
    return false;
  }
  const buf = fs.readFileSync(pdfPath);
  let text = '';
  try {
    const out = await pdfParse(buf);
    text = out.text || '';
  } catch (err) {
    console.error(`FAIL ${path.basename(pdfPath)}: ${err.message}`);
    return false;
  }
  const txtPath = pdfPath.replace(/\.pdf$/i, '.txt');
  fs.writeFileSync(txtPath, text, 'utf8');
  console.log(`OK   ${path.basename(txtPath)}  (${text.length} chars)`);
  return true;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Pass one or more .pdf paths.');
  process.exit(1);
}

let ok = 0;
for (const p of args) {
  if (await extractOne(p)) ok += 1;
}
console.log(`\n${ok}/${args.length} files extracted.`);
