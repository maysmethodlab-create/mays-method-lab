import fs from 'fs';
import { createRequire } from 'module';
import { templateFile } from './_template-files.mjs';

const file = templateFile('Wu, Wei Submission History.pdf');

// pdf-parse is CJS; use createRequire so it works inside ESM.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const buf = fs.readFileSync(file);
const r = await pdfParse(buf);
console.log('LENGTH:', r.text.length);
console.log('---');
console.log(r.text.slice(0, 4000));
