import fs from 'fs';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const docx = 'C:/Users/ssridhar/OneDrive - Texas A&M University/Service/Reco Letters for Others/Tenure Letters/Gregory Fisher/Gregory Fisher Letter Hari Sridhar 5_29_2025.docx';
const pdf = 'C:/Users/ssridhar/OneDrive - Texas A&M University/Service/Reco Letters for Others/Tenure Letters/Sri Venkataraman/Sri Venkataraman Letter Hari Sridhar 4_25_2026.pdf';

console.log('=== GREGORY FISHER LETTER ===');
const dr = await mammoth.extractRawText({ buffer: fs.readFileSync(docx) });
console.log(dr.value);
console.log('\n\n=== SRI VENKATARAMAN LETTER ===');
const pr = await pdfParse(fs.readFileSync(pdf));
console.log(pr.text);
