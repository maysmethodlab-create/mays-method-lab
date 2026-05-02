#!/usr/bin/env node
/**
 * One-shot extractor for the Mays Faculty Guidelines source.
 *
 * Reads the canonical approved PDF (October 17, 2025) and writes the
 * extracted text to data/sources/mays-faculty-guidelines.txt for the
 * Faculty Guidelines Chatbot to load at request time.
 *
 * If the PDF extraction looks low quality (suspicious char count, mostly
 * empty), the script automatically falls back to the .docx version using
 * mammoth.
 *
 * Source files:
 *   PDF (preferred):
 *     C:\\Users\\shriharisridhar\\OneDrive - Texas A&M University\\Senior Associate Dean\\
 *     FACULTY RELATED\\Mays Faculty and Staff Guidelines\\Mays Guidelines October17.2025.Approved.pdf
 *   DOCX (fallback):
 *     C:\\Users\\shriharisridhar\\OneDrive - Texas A&M University\\Senior Associate Dean\\
 *     FACULTY RELATED\\Mays Faculty and Staff Guidelines\\Mays Guidelines October 15 2025.docx
 *
 * Output:
 *   data/sources/mays-faculty-guidelines.txt  (gitignored, regenerable)
 *
 * Run:
 *   node scripts/_extract-faculty-guidelines.mjs
 *
 * Notes from the run that produced the committed extraction:
 *   - The script logs page count, char count, and which source was used.
 *   - The output dir is created if missing.
 *   - The output is overwritten on every run.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'data', 'sources');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'mays-faculty-guidelines.txt');

const PDF_PATH =
  'C:\\Users\\shriharisridhar\\OneDrive - Texas A&M University\\Senior Associate Dean\\FACULTY RELATED\\Mays Faculty and Staff Guidelines\\Mays Guidelines October17.2025.Approved.pdf';
const DOCX_PATH =
  'C:\\Users\\shriharisridhar\\OneDrive - Texas A&M University\\Senior Associate Dean\\FACULTY RELATED\\Mays Faculty and Staff Guidelines\\Mays Guidelines October 15 2025.docx';

// Heuristic minimum: a 30+ page approved guidelines doc should produce well
// over 5,000 characters of text. Anything below that and we fall back to the
// docx, since some scanned/locked PDFs return only a handful of glyphs.
const MIN_PDF_CHARS = 5000;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function tryPdf() {
  if (!fs.existsSync(PDF_PATH)) {
    return { ok: false, reason: 'PDF not found at expected path' };
  }
  const buf = fs.readFileSync(PDF_PATH);
  try {
    const out = await pdfParse(buf);
    return {
      ok: true,
      text: out.text || '',
      pages: out.numpages || 0,
      info: out.info || {},
    };
  } catch (err) {
    return { ok: false, reason: `pdf-parse failed: ${err.message}` };
  }
}

async function tryDocx() {
  if (!fs.existsSync(DOCX_PATH)) {
    return { ok: false, reason: 'DOCX not found at expected path' };
  }
  try {
    const buf = fs.readFileSync(DOCX_PATH);
    const out = await mammoth.extractRawText({ buffer: buf });
    return { ok: true, text: out.value || '' };
  } catch (err) {
    return { ok: false, reason: `mammoth failed: ${err.message}` };
  }
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const pdfRes = await tryPdf();
  let chosenSource = '';
  let text = '';
  let pages = 0;

  if (pdfRes.ok && pdfRes.text.length >= MIN_PDF_CHARS) {
    chosenSource = 'pdf';
    text = pdfRes.text;
    pages = pdfRes.pages;
    console.log(`PDF extraction: OK (${text.length} chars, ${pages} pages)`);
  } else {
    if (!pdfRes.ok) {
      console.warn(`PDF extraction failed: ${pdfRes.reason}. Falling back to DOCX.`);
    } else {
      console.warn(
        `PDF extraction yielded only ${pdfRes.text.length} chars (< ${MIN_PDF_CHARS}). Falling back to DOCX.`,
      );
    }
    const docxRes = await tryDocx();
    if (!docxRes.ok) {
      console.error(`DOCX fallback also failed: ${docxRes.reason}`);
      process.exit(1);
    }
    chosenSource = 'docx';
    text = docxRes.text;
    console.log(`DOCX extraction: OK (${text.length} chars)`);
  }

  // Light cleanup: collapse runs of 3+ blank lines, trim trailing whitespace
  // on lines, but otherwise leave the text intact so quotations the chatbot
  // returns match the source verbatim.
  const cleaned = text
    .split('\n')
    .map((l) => l.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  fs.writeFileSync(OUTPUT_PATH, cleaned, 'utf8');

  // Also copy the canonical PDF into data/sources so the gated download
  // route can serve it. This keeps the binary out of the Git tree (the
  // directory is gitignored) and out of the public/ tree (which would be
  // unauthenticated).
  if (fs.existsSync(PDF_PATH)) {
    const pdfDest = path.join(OUTPUT_DIR, 'mays-faculty-guidelines.pdf');
    fs.copyFileSync(PDF_PATH, pdfDest);
    console.log(`PDF copy    : ${pdfDest}`);
  }

  console.log('---');
  console.log(`Source used : ${chosenSource}`);
  console.log(`Pages       : ${pages || 'n/a'}`);
  console.log(`Char count  : ${cleaned.length}`);
  console.log(`Wrote       : ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
