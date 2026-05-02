import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import {
  AlignmentType,
  Document,
  Footer,
  HeightRule,
  ImageRun,
  LevelFormat,
  PageNumber,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

/**
 * Styles per Prompt 2 spec:
 *  - 11pt Calibri, single-spacing, blank line between paragraphs.
 *  - Letter, 1" margins.
 *  - Section headings bold.
 *  - Bullet points use the Word bullet list format.
 *  - Signature block is a thin underscore line plus a left/right table row.
 */

const FONT = 'Calibri';
const SIZE_HALF_POINTS = 22; // 11pt = 22 half-points

/**
 * Convert a line of markdown-flavored text (with *italic* and **bold** spans)
 * into an array of TextRun pieces with the right font properties applied.
 *
 * Italics are critical for journal titles per Hari's P&T pattern.
 */
function runsFromInlineMarkdown(
  text: string,
  baseOpts: { bold?: boolean; italics?: boolean } = {},
): TextRun[] {
  const runs: TextRun[] = [];
  // Tokenize on **bold** and *italic* in one pass.
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, m.index),
          font: FONT,
          size: SIZE_HALF_POINTS,
          bold: baseOpts.bold,
          italics: baseOpts.italics,
        }),
      );
    }
    const token = m[0];
    if (token.startsWith('**')) {
      runs.push(
        new TextRun({
          text: token.slice(2, -2),
          font: FONT,
          size: SIZE_HALF_POINTS,
          bold: true,
          italics: baseOpts.italics,
        }),
      );
    } else if (token.startsWith('*') || token.startsWith('_')) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          font: FONT,
          size: SIZE_HALF_POINTS,
          bold: baseOpts.bold,
          italics: true,
        }),
      );
    }
    lastIndex = m.index + token.length;
  }
  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(lastIndex),
        font: FONT,
        size: SIZE_HALF_POINTS,
        bold: baseOpts.bold,
        italics: baseOpts.italics,
      }),
    );
  }
  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text,
        font: FONT,
        size: SIZE_HALF_POINTS,
        bold: baseOpts.bold,
        italics: baseOpts.italics,
      }),
    );
  }
  return runs;
}

function bodyParagraph(text: string, opts: { bold?: boolean } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 200 },
    children: runsFromInlineMarkdown(text, { bold: opts.bold }),
  });
}

function headingParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({ text, font: FONT, size: SIZE_HALF_POINTS, bold: true }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'mml-bullets', level: 0 },
    spacing: { after: 120 },
    children: runsFromInlineMarkdown(text),
  });
}

function signatureBlock(): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({ text: '_'.repeat(70), font: FONT, size: SIZE_HALF_POINTS }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Signature', font: FONT, size: SIZE_HALF_POINTS }),
        new TextRun({
          text: '\t'.repeat(8) + 'Date',
          font: FONT,
          size: SIZE_HALF_POINTS,
        }),
      ],
    }),
  ];
}

/**
 * Convert flat letter text into Paragraph[] suitable for the .docx body.
 *
 * Heuristics for headings vs body vs bullets:
 *  - "MEMORANDUM" alone → heading
 *  - "TO:", "FROM:", "SUBJECT:" → bold body
 *  - Short bold-style markdown lines (**text**) → heading
 *  - Lines that start with "- " or "* " or "• " → bullet
 *  - Underscore lines → signature block (consume the rest)
 *  - Otherwise → body
 */
/**
 * Canonical section headings used in evaluation letters. If the AI emits
 * one of these as a plain line (no asterisks), we still render it bold.
 */
const KNOWN_SUBHEADINGS = new Set([
  'summary of major accomplishments',
  'my observations and our discussion',
  'your plan for the upcoming year',
  'summary',
  'memorandum',
]);

function isKnownSubheading(line: string): boolean {
  return KNOWN_SUBHEADINGS.has(line.toLowerCase().trim());
}

function paragraphsFromLetterText(letter: string): Paragraph[] {
  const out: Paragraph[] = [];
  const lines = letter.replace(/\r\n/g, '\n').split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw ?? '';
    const trimmed = line.trim();

    // Skip signature block — we render our own at the end.
    if (/^_{10,}$/.test(trimmed)) {
      while (i + 1 < lines.length) {
        const peek = lines[i + 1].trim();
        if (
          peek === '' ||
          peek.toLowerCase().startsWith('signature') ||
          peek.toLowerCase() === 'date'
        ) {
          i += 1;
        } else {
          break;
        }
      }
      continue;
    }

    if (trimmed === '') continue;

    // Markdown-bolded line → heading.
    const stripped = trimmed.replace(/^\*\*(.+)\*\*$/, '$1');
    if (stripped !== trimmed && stripped.length < 80) {
      out.push(headingParagraph(stripped));
      continue;
    }

    // Plain known-section heading → also render as bold heading.
    if (isKnownSubheading(trimmed)) {
      out.push(headingParagraph(trimmed));
      continue;
    }

    // To/From/Subject block — keep bold for the leading label.
    if (/^(TO|FROM|SUBJECT|RE):/i.test(trimmed)) {
      out.push(bodyParagraph(trimmed, { bold: true }));
      continue;
    }

    // Bullet line
    if (/^([-*•]|\d+[.)])\s+/.test(trimmed)) {
      const text = trimmed.replace(/^([-*•]|\d+[.)])\s+/, '');
      out.push(bulletParagraph(text));
      continue;
    }

    // Otherwise body paragraph
    out.push(bodyParagraph(trimmed));
  }

  // Always render our own clean signature block at the end.
  out.push(...signatureBlock());

  return out;
}

export type LetterDocOptions = {
  letterText: string;
  /** Plain-text letterhead line under the image (typically the department name). */
  letterhead?: string;
  /**
   * File name (relative to /public/letterheads/) of the letterhead image to
   * embed at the top of the page. If the file is missing, we fall back to text.
   */
  letterheadImage?: string;
};

async function loadLetterheadImage(name: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'letterheads', name);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function generateLetterDocx(opts: LetterDocOptions): Promise<Buffer> {
  const body = paragraphsFromLetterText(opts.letterText);

  const headerImage = opts.letterheadImage
    ? await loadLetterheadImage(opts.letterheadImage)
    : null;

  const headerParagraphs: Paragraph[] = [];
  if (headerImage) {
    // The Mays/TAMU letterhead source is 600×146 (aspect 4.11). Render at
    // a smaller, symmetric size — 320×78 (~3.3" wide) — so it sits cleanly
    // at the top of a 1"-margin US Letter page without dominating the
    // first paragraphs. Per-department letterheads (mktg.png, info.jpg) may
    // have different native aspect ratios — the docx ImageRun keeps the
    // declared transformation regardless, so all letterheads render at a
    // consistent visual width.
    const LETTERHEAD_WIDTH = 320;
    const LETTERHEAD_HEIGHT = 78; // 320 / 4.11 ≈ 78
    const ext = (opts.letterheadImage ?? '').toLowerCase().split('.').pop();
    const imageType: 'jpg' | 'png' = ext === 'png' ? 'png' : 'jpg';
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new ImageRun({
            type: imageType,
            data: headerImage,
            transformation: { width: LETTERHEAD_WIDTH, height: LETTERHEAD_HEIGHT },
          }),
        ],
      }),
    );
  }
  if (opts.letterhead) {
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: opts.letterhead,
            font: FONT,
            size: SIZE_HALF_POINTS,
            bold: true,
          }),
        ],
      }),
    );
  }

  // Page-number footer: "Page X of Y", centered, 10pt Calibri.
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

  const doc = new Document({
    creator: 'Mays Method Lab — Evaluation Letter Writer',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_HALF_POINTS },
        },
      },
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
          page: {
            margin: {
              top: 1440, // 1 inch (twentieths of a point)
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        footers: { default: pageFooter },
        children: [...headerParagraphs, ...body],
      },
    ],
  });

  return Packer.toBuffer(doc);
  // Suppress warnings about unused imports in some bundlers.
  void Table;
  void TableRow;
  void TableCell;
  void HeightRule;
  void WidthType;
}

/**
 * Minimal email-as-docx export: text only, no fancy formatting.
 */
export async function generateEmailDocx(emailText: string): Promise<Buffer> {
  const lines = emailText.replace(/\r\n/g, '\n').split('\n');
  const paragraphs = lines.map((l) =>
    l.trim() === ''
      ? new Paragraph({ spacing: { after: 120 } })
      : new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: l, font: FONT, size: SIZE_HALF_POINTS })],
        }),
  );

  const doc = new Document({
    creator: 'Mays Method Lab — Evaluation Letter Writer',
    styles: {
      default: { document: { run: { font: FONT, size: SIZE_HALF_POINTS } } },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: paragraphs,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
