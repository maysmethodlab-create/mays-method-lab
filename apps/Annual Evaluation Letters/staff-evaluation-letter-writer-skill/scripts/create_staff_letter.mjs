#!/usr/bin/env node
/**
 * Generate a staff evaluation letter as a .docx file.
 *
 * Mirrors the formatting of Hari's faculty letters (Calibri 11pt, 1" margins,
 * TAMU letterhead on first page, bold section headings, bullet-point goals,
 * underscore signature block). Differs from the faculty version in three ways:
 *   - No research/teaching sections; the body is Major Accomplishments,
 *     Observations, Plan for the Upcoming Year, Summary.
 *   - Single-year scope with the rating phrased as "met expectations" /
 *     "exceeded expectations" / etc., consistent with TAMU Workday language.
 *   - Configurable signer (FROM block) so the skill can be used by Hari OR
 *     by another administrator he is helping (e.g., the CED executive
 *     director writing for an Assistant Director).
 *
 * Usage:
 *   node create_staff_letter.mjs --json <letter.json> --output <path.docx> --logo <header.jpg>
 *
 * The JSON input shape:
 *   {
 *     "date": "May 2026",
 *     "to_name": "Alyssa Morgan",
 *     "to_title": "Assistant Director, Center for Executive Development",
 *     "from_name": "Venard Scott Koerwer",
 *     "from_title": "Executive Director, Center for Executive Development",
 *     "eval_year": "2026",
 *     "salutation_name": "Alyssa",
 *     "opening_paragraph": "Thank you for serving...",
 *     "accomplishments_paragraphs": ["...", "...", "..."],
 *     "observations_paragraphs": ["...", "...", "..."],
 *     "forward_looking_intro": "...",
 *     "forward_looking_bullets": ["...", "...", "..."],
 *     "forward_looking_closing": "...",
 *     "summary_paragraphs": ["...", "...", "Overall, my evaluation is that you **met expectations** overall. Please ensure you acknowledge the same on Workday. Thank you."]
 *   }
 *
 * Markdown spans inside paragraph strings are honored:
 *   **bold**   → bold run
 *   *italic*   → italic run
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  Document,
  Footer,
  ImageRun,
  LevelFormat,
  PageNumber,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const FONT = 'Calibri';
const SIZE_HALF_POINTS = 22; // 11pt
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      out[a.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

function inlineRuns(text, base = {}) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(
        new TextRun({
          text: text.slice(last, m.index),
          font: FONT,
          size: SIZE_HALF_POINTS,
          bold: base.bold,
          italics: base.italics,
        }),
      );
    }
    const tok = m[0];
    if (tok.startsWith('**')) {
      runs.push(
        new TextRun({
          text: tok.slice(2, -2),
          font: FONT,
          size: SIZE_HALF_POINTS,
          bold: true,
          italics: base.italics,
        }),
      );
    } else {
      runs.push(
        new TextRun({
          text: tok.slice(1, -1),
          font: FONT,
          size: SIZE_HALF_POINTS,
          bold: base.bold,
          italics: true,
        }),
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(last),
        font: FONT,
        size: SIZE_HALF_POINTS,
        bold: base.bold,
        italics: base.italics,
      }),
    );
  }
  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text,
        font: FONT,
        size: SIZE_HALF_POINTS,
        bold: base.bold,
        italics: base.italics,
      }),
    );
  }
  return runs;
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 200, line: 276 }, // ~1.15
    children: inlineRuns(text, opts),
  });
}

function heading(text) {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    children: [
      new TextRun({ text, font: FONT, size: SIZE_HALF_POINTS, bold: true }),
    ],
  });
}

function memoLine(label, value) {
  return new Paragraph({
    spacing: { after: 0, line: 276 },
    children: [
      new TextRun({ text: label, font: FONT, size: SIZE_HALF_POINTS, bold: true }),
      new TextRun({ text: '\t', font: FONT, size: SIZE_HALF_POINTS }),
      new TextRun({ text: value, font: FONT, size: SIZE_HALF_POINTS }),
    ],
  });
}

function memoCont(value) {
  return new Paragraph({
    spacing: { after: 0, line: 276 },
    children: [
      new TextRun({ text: '\t', font: FONT, size: SIZE_HALF_POINTS }),
      new TextRun({ text: value, font: FONT, size: SIZE_HALF_POINTS }),
    ],
  });
}

function blank() {
  return new Paragraph({ spacing: { after: 0, line: 276 }, children: [] });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'mml-bullets', level: 0 },
    spacing: { after: 80, line: 276 },
    children: inlineRuns(text),
  });
}

function signature() {
  return [
    new Paragraph({
      spacing: { before: 480, after: 60 },
      children: [
        new TextRun({ text: '_'.repeat(48) + '\t\t' + '_'.repeat(20), font: FONT, size: SIZE_HALF_POINTS }),
      ],
    }),
    new Paragraph({
      spacing: { after: 0, line: 276 },
      children: [
        new TextRun({ text: 'Signature', font: FONT, size: SIZE_HALF_POINTS }),
        new TextRun({ text: '\t\t\t\t\t\t', font: FONT, size: SIZE_HALF_POINTS }),
        new TextRun({ text: 'Date', font: FONT, size: SIZE_HALF_POINTS }),
      ],
    }),
  ];
}

async function buildDoc(letter, logoPath) {
  const headerPara = [];
  if (logoPath) {
    try {
      const data = await fs.readFile(logoPath);
      const ext = path.extname(logoPath).toLowerCase().replace('.', '');
      const imageType = ext === 'png' ? 'png' : 'jpg';
      headerPara.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new ImageRun({
              type: imageType,
              data,
              transformation: { width: 432, height: 105 }, // 4.5" wide, ~4.11 aspect
            }),
          ],
        }),
      );
    } catch (e) {
      console.warn(`Letterhead image not loaded (${logoPath}): ${e.message}`);
    }
  }

  const children = [...headerPara];
  children.push(body(letter.date));
  children.push(heading('MEMORANDUM'));
  children.push(memoLine('TO:', letter.to_name));
  if (letter.to_title) children.push(memoCont(letter.to_title));
  children.push(blank());
  children.push(memoLine('FROM:', letter.from_name));
  if (letter.from_title) children.push(memoCont(letter.from_title));
  children.push(blank());
  children.push(memoLine('SUBJECT:', `${letter.eval_year} Performance Evaluation`));
  children.push(blank());
  children.push(body(`Dear ${letter.salutation_name},`));
  children.push(body(letter.opening_paragraph));

  children.push(heading('Summary of Major Accomplishments'));
  for (const p of letter.accomplishments_paragraphs) children.push(body(p));

  children.push(heading('My Observations and Our Discussion'));
  for (const p of letter.observations_paragraphs) children.push(body(p));

  children.push(heading('Your Plan for the Upcoming Year'));
  if (letter.forward_looking_intro) children.push(body(letter.forward_looking_intro));
  for (const b of letter.forward_looking_bullets || []) children.push(bullet(b));
  if (letter.forward_looking_closing) children.push(body(letter.forward_looking_closing));

  children.push(heading('Summary'));
  for (const p of letter.summary_paragraphs) children.push(body(p));

  children.push(...signature());

  const pageFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'Page ', font: FONT, size: 20 }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
          new TextRun({ text: ' of ', font: FONT, size: 20 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 20 }),
        ],
      }),
    ],
  });

  return new Document({
    creator: 'Mays Method Lab — Staff Evaluation Letter Writer',
    styles: {
      default: { document: { run: { font: FONT, size: SIZE_HALF_POINTS } } },
    },
    numbering: {
      config: [
        {
          reference: 'mml-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
                run: { font: FONT, size: SIZE_HALF_POINTS },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        footers: { default: pageFooter },
        children,
      },
    ],
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.json || !args.output) {
    console.error('Usage: node create_staff_letter.mjs --json <input.json> --output <out.docx> [--logo <header.jpg>]');
    process.exit(2);
  }
  const letter = JSON.parse(await fs.readFile(args.json, 'utf8'));
  const doc = await buildDoc(letter, args.logo);
  const buf = await Packer.toBuffer(doc);
  await fs.writeFile(args.output, buf);
  console.log(`Letter saved to: ${args.output}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
