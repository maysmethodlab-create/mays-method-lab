import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const file = path.join(
  ROOT,
  'apps',
  'Annual Evaluation Letters',
  'Template Letters',
  'Wu, Wei Submission History.pdf',
);

// pdf-parse is CJS; use createRequire so it works inside ESM.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const buf = fs.readFileSync(file);
const r = await pdfParse(buf);
console.log('LENGTH:', r.text.length);
console.log('---');
console.log(r.text.slice(0, 4000));
