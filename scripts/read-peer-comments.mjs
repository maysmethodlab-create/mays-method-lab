import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'apps', 'Annual Evaluation Letters', 'Template Letters');
const FILES = [
  'Annual review comments of associate profs.docx',
  'Annual review comments junior clinicals and lecturers.docx',
];

for (const f of FILES) {
  const full = path.join(DIR, f);
  const buf = fs.readFileSync(full);
  const r = await mammoth.extractRawText({ buffer: buf });
  console.log('================================================');
  console.log('FILE:', f);
  console.log('LENGTH:', r.value.length);
  console.log('------------------------------------------------');
  console.log(r.value);
  console.log();
}
