import fs from 'fs';
import mammoth from 'mammoth';
import { templateFile } from './_template-files.mjs';

const FILES = [
  'Annual review comments of associate profs.docx',
  'Annual review comments junior clinicals and lecturers.docx',
];

for (const f of FILES) {
  const full = templateFile(f);
  const buf = fs.readFileSync(full);
  const r = await mammoth.extractRawText({ buffer: buf });
  console.log('================================================');
  console.log('FILE:', f);
  console.log('LENGTH:', r.value.length);
  console.log('------------------------------------------------');
  console.log(r.value);
  console.log();
}
