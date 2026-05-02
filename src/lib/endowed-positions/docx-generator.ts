import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  PageNumber,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

import {
  ATTACHMENT_LINE,
  MRC_COMPOSITION_INTRO,
  POST_TENURE_REVIEW_PARAGRAPH,
  REVIEW_PROCESS_INTRO,
  REVIEW_PROCESS_TERMS,
  SECRET_BALLOT_PARAGRAPH,
  SIGNATURE_INTRO_SENTENCE,
} from './boilerplate';
import { FY27_MRC, VOTING_MEMBERS, tallyVotes } from './mrc';
import { formatMemoDate, termAsWords } from './assemble';
import type { GeneratedParts, MRCVote, SetupData } from './types';

const FONT = 'Calibri';
const SIZE_HALF_POINTS = 22; // 11pt

const SOLID_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '000000',
};

const ALL_BORDERS = {
  top: SOLID_BORDER,
  bottom: SOLID_BORDER,
  left: SOLID_BORDER,
  right: SOLID_BORDER,
};

function txt(text: string, opts: { bold?: boolean; italics?: boolean } = {}): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: SIZE_HALF_POINTS,
    bold: opts.bold,
    italics: opts.italics,
  });
}

function body(text: string, opts: { bold?: boolean; spacingAfter?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 200 },
    children: [txt(text, { bold: opts.bold })],
  });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [txt(text, { bold: true })],
  });
}

function blank(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [txt('')] });
}

function cell(
  text: string,
  opts: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {},
): TableCell {
  return new TableCell({
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: opts.align,
        children: [txt(text, { bold: opts.bold })],
      }),
    ],
  });
}

function makeOutcomeTable(setup: SetupData, votes: MRCVote[]): Table {
  const tally = tallyVotes(votes);

  const headers = [
    'Name',
    'Dept.',
    'Current Endowed Appointment',
    'Recommended Endowed Appointment',
    'Department Head Recommendation',
    'Yes',
    'No',
    'Abstain',
  ];
  const rowData = [
    setup.candidateName,
    setup.candidateDeptCode,
    setup.candidateCurrentEndowedPosition,
    setup.recommendedEndowedPosition,
    setup.candidateDepartmentHead,
    String(tally.yes),
    String(tally.no),
    String(tally.abstain),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Top header row — group "MRC Votes" across the last 3 columns by
      // splitting into a sub-row would complicate things; we just label the
      // last three columns directly.
      new TableRow({
        tableHeader: true,
        children: headers.map((h) =>
          new TableCell({
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [txt(h, { bold: true })],
              }),
            ],
          }),
        ),
      }),
      // MRC Vote sub-label row (visually mirrors the Boivie stacked header)
      new TableRow({
        children: [
          cell(''),
          cell(''),
          cell(''),
          cell(''),
          cell(''),
          cell('MRC Vote', { bold: true, align: AlignmentType.CENTER }),
          cell('MRC Vote', { bold: true, align: AlignmentType.CENTER }),
          cell('MRC Vote', { bold: true, align: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: rowData.map((d, i) =>
          cell(d, {
            align: i >= 5 ? AlignmentType.CENTER : undefined,
          }),
        ),
      }),
    ],
    borders: {
      top: SOLID_BORDER,
      bottom: SOLID_BORDER,
      left: SOLID_BORDER,
      right: SOLID_BORDER,
      insideHorizontal: SOLID_BORDER,
      insideVertical: SOLID_BORDER,
    },
  });
}

function makeMRCTable(): Table {
  const headers = [
    'Name',
    'Administrative Appointment',
    'Rank',
    'Endowed Position',
    'Department',
    'Type of Member',
    'Voting Rights',
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new TableCell({
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [txt(h, { bold: true })],
          }),
        ],
      }),
    ),
  });

  const dataRows = FY27_MRC.map(
    (m) =>
      new TableRow({
        children: [
          cell(m.name),
          cell(m.administrativeAppointment),
          cell(m.rank),
          cell(m.endowedPosition),
          cell(m.department),
          cell(m.typeOfMember),
          cell(m.votingRights),
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: {
      top: SOLID_BORDER,
      bottom: SOLID_BORDER,
      left: SOLID_BORDER,
      right: SOLID_BORDER,
      insideHorizontal: SOLID_BORDER,
      insideVertical: SOLID_BORDER,
    },
  });
}

function makeSignatureBlock(): Paragraph[] {
  // Two signatures per row as in the Boivie example. With 5 voting members
  // we get [a, b], [c, d], [e].
  const out: Paragraph[] = [];
  out.push(heading('Committee Members'));
  out.push(blank());

  for (let i = 0; i < VOTING_MEMBERS.length; i += 2) {
    const left = VOTING_MEMBERS[i];
    const right = VOTING_MEMBERS[i + 1];
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          txt('_______________________________'),
          txt('\t\t'),
          txt(right ? '_______________________________' : ''),
        ],
      }),
    );
    out.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [
          txt(`${left.name}, ${left.rank}`),
          txt('\t\t\t'),
          txt(right ? `${right.name}, ${right.rank}` : ''),
        ],
      }),
    );
  }
  return out;
}

async function loadLetterheadImage(name: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'letterheads', name);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export type EndowedDocOptions = {
  setup: SetupData;
  votes: MRCVote[];
  parts: GeneratedParts;
  /** Shared anonymous comments collected from the MRC. */
  voteComments?: string;
  /** Letterhead image filename (defaults to mays-default.jpg). */
  letterheadImage?: string;
};

export async function generateEndowedLetterDocx(opts: EndowedDocOptions): Promise<Buffer> {
  const { setup, votes, parts, voteComments } = opts;
  const tally = tallyVotes(votes);
  const total = tally.total;

  const action = (() => {
    switch (setup.nominationType) {
      case 'new-chair':
      case 'new-professorship':
        return 'appointment';
      case 'reappoint-chair':
      case 'reappoint-professorship':
        return 'reappointment';
      case 'fellowship':
        return 'nomination';
    }
  })();

  const lastName = setup.candidateName.trim().split(/\s+/).slice(-1)[0] || setup.candidateName;
  const summaryPrefix = (() => {
    if (total === 0) return 'The Mays Research Council';
    if (tally.yes === total) return 'The Mays Research Council unanimously supported';
    return `The Mays Research Council, by a vote of ${tally.yes}-${tally.no}-${tally.abstain} (Yes-No-Abstain), supported`;
  })();
  const summarySentence = `${summaryPrefix} the ${action} of Dr. ${lastName} to the ${setup.recommendedPositionName} for a ${termAsWords(setup.termYears)} year term, citing ${parts.summaryReasonsClause.replace(/\.\s*$/, '')}.`;

  // Letterhead image
  const headerImg = await loadLetterheadImage(opts.letterheadImage || 'mays-default.jpg');
  const headerParagraphs: Paragraph[] = [];
  if (headerImg) {
    headerParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new ImageRun({
            type: 'jpg',
            data: headerImg,
            transformation: { width: 320, height: 78 },
          }),
        ],
      }),
    );
  }

  const dateLine = formatMemoDate(setup.memoDate);
  const fy = setup.fiscalYear || new Date().getFullYear();

  // ---- Build body ----
  const body_: (Paragraph | Table)[] = [];

  body_.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [txt('MEMORANDUM', { bold: true })],
    }),
  );
  body_.push(body(dateLine, { spacingAfter: 240 }));

  // TO / FROM block
  body_.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        txt('TO:', { bold: true }),
        txt('\tNate Sharp'),
      ],
    }),
  );
  body_.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [txt('\tDean, Mays Business School')],
    }),
  );
  body_.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        txt('FROM:', { bold: true }),
        txt('\t\tRogelio Oliva'),
      ],
    }),
  );
  body_.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        txt('\t\tChair of the Mays Research Council, Mays Business School'),
      ],
    }),
  );
  body_.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        txt('SUBJECT:', { bold: true }),
        txt(`\t${parts.subjectLine}`),
      ],
    }),
  );

  body_.push(body(parts.openingSentence));
  body_.push(heading('Summary and Recommendations'));
  body_.push(body(summarySentence));
  body_.push(
    body(`The table below summarizes the outcome of the review process for Dr. ${setup.candidateName}.`),
  );
  body_.push(makeOutcomeTable(setup, votes));
  body_.push(blank());

  body_.push(heading('Post-Tenure Review'));
  body_.push(body(POST_TENURE_REVIEW_PARAGRAPH));

  body_.push(heading('Review Process'));
  body_.push(body(REVIEW_PROCESS_INTRO));
  body_.push(body(REVIEW_PROCESS_TERMS));
  body_.push(body(MRC_COMPOSITION_INTRO.replace('{FISCAL_YEAR}', String(fy))));
  body_.push(makeMRCTable());
  body_.push(blank());

  body_.push(body(SECRET_BALLOT_PARAGRAPH));

  // Shared anonymous comments — render only if present.
  const trimmedComments = (voteComments || '').trim();
  if (trimmedComments) {
    body_.push(body('Anonymous comments submitted by Council members:', { bold: true }));
    body_.push(body(trimmedComments));
  }

  body_.push(heading("Candidate's Achievement and Qualifications"));
  body_.push(body(parts.achievementParagraph));

  body_.push(body(SIGNATURE_INTRO_SENTENCE));

  body_.push(...makeSignatureBlock());
  body_.push(blank());
  body_.push(body(ATTACHMENT_LINE));

  // ---- Footer ----
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
    creator: 'Mays Method Lab — Endowed Positions Letter Writer',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_HALF_POINTS },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        footers: { default: pageFooter },
        children: [...headerParagraphs, ...body_],
      },
    ],
  });

  return Packer.toBuffer(doc);
  // Suppress unused-import warnings.
  void ALL_BORDERS;
}
