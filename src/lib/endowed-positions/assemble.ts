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
import type { GeneratedParts, MRCVote, SetupData } from './types';

const NUMBER_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
};

export function termAsWords(n: number): string {
  return `${NUMBER_WORDS[n] || String(n)} (${n})`;
}

export function formatMemoDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export type AssembleArgs = {
  setup: SetupData;
  votes: MRCVote[];
  parts: GeneratedParts;
  /**
   * Shared anonymous comments collected from the MRC. A single string
   * (the new vote model uses one shared box, not per-voter comments).
   */
  voteComments?: string;
};

/**
 * Build the full plain-text rendering of the memo. The .docx generator
 * does NOT parse this — it builds tables and paragraphs from the
 * structured input. The assembled text is shown to the user as an editable
 * preview and used as the verification input.
 */
export function assembleLetter(args: AssembleArgs): string {
  const { setup, votes, parts, voteComments } = args;
  const tally = tallyVotes(votes);
  const total = tally.total;

  const dateLine = formatMemoDate(setup.memoDate);
  const fy = setup.fiscalYear || new Date().getFullYear();

  const outcomeRow = [
    setup.candidateName,
    setup.candidateDeptCode,
    setup.candidateCurrentEndowedPosition,
    setup.recommendedEndowedPosition,
    setup.candidateDepartmentHead,
    String(tally.yes),
    String(tally.no),
    String(tally.abstain),
  ];

  const mrcRows = FY27_MRC.map((m) => [
    m.name,
    m.administrativeAppointment,
    m.rank,
    m.endowedPosition,
    m.department,
    m.typeOfMember,
    m.votingRights,
  ]);

  // Plain-text table renderer (just for the editable preview — the .docx
  // generator builds proper tables).
  function renderTable(
    headers: string[],
    rows: string[][],
  ): string {
    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => (r[i] || '').length)),
    );
    const sep = widths.map((w) => '-'.repeat(w)).join('  ');
    const head = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
    const body = rows
      .map((r) => r.map((c, i) => (c || '').padEnd(widths[i])).join('  '))
      .join('\n');
    return `${head}\n${sep}\n${body}`;
  }

  const outcomeTable = renderTable(
    [
      'Name',
      'Dept.',
      'Current Endowed Appointment',
      'Recommended Endowed Appointment',
      'Department Head Recommendation',
      'MRC Vote: Yes',
      'MRC Vote: No',
      'MRC Vote: Abstain',
    ],
    [outcomeRow],
  );

  const mrcTable = renderTable(
    [
      'Name',
      'Administrative Appointment',
      'Rank',
      'Endowed Position',
      'Department',
      'Type of Member',
      'Voting Rights',
    ],
    mrcRows,
  );

  // Signature block (5 lines, two per row where possible)
  const sigLines: string[] = [];
  for (let i = 0; i < VOTING_MEMBERS.length; i += 2) {
    const left = VOTING_MEMBERS[i];
    const right = VOTING_MEMBERS[i + 1];
    sigLines.push('');
    sigLines.push('_______________________________\t\t_______________________________');
    if (right) {
      sigLines.push(`${left.name}, ${left.rank}\t\t\t${right.name}, ${right.rank}`);
    } else {
      sigLines.push(`${left.name}, ${left.rank}`);
    }
  }
  const signatureBlock = sigLines.join('\n');

  // Shared anonymous comments — render only if present, immediately after
  // the secret-ballot paragraph.
  const trimmedComments = (voteComments || '').trim();
  const commentsBlock = trimmedComments
    ? `\n\nAnonymous comments submitted by Council members:\n${trimmedComments}\n`
    : '';

  // Tally hint inserted into the Summary sentence — "unanimously supported"
  // if every voter voted yes; otherwise we record the explicit Y-N-A count.
  const summaryPrefix = (() => {
    if (total === 0) return 'The Mays Research Council';
    if (tally.yes === total) return 'The Mays Research Council unanimously supported';
    return `The Mays Research Council, by a vote of ${tally.yes}-${tally.no}-${tally.abstain} (Yes-No-Abstain), supported`;
  })();

  // The summary sentence pattern from Boivie:
  //   "The Mays Research Council unanimously supported the {action} of Dr.
  //    {Name} to the {Position} for a {N} ({N}) year term, citing {reasons}."
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
  const summarySentence = `${summaryPrefix} the ${action} of Dr. ${lastName} to the ${setup.recommendedPositionName} for a ${termAsWords(setup.termYears)} year term, citing ${parts.summaryReasonsClause.replace(/\.\s*$/, '')}.`;

  return [
    'MEMORANDUM',
    '',
    dateLine,
    '',
    'TO:\tNate Sharp',
    '\tDean, Mays Business School',
    '',
    'FROM:\t\tRogelio Oliva',
    '\t\tChair of the Mays Research Council, Mays Business School',
    '',
    `SUBJECT:\t${parts.subjectLine}`,
    '',
    parts.openingSentence,
    '',
    'Summary and Recommendations',
    summarySentence,
    '',
    `The table below summarizes the outcome of the review process for Dr. ${setup.candidateName}.`,
    '',
    outcomeTable,
    '',
    'Post-Tenure Review',
    POST_TENURE_REVIEW_PARAGRAPH,
    '',
    'Review Process',
    REVIEW_PROCESS_INTRO,
    '',
    REVIEW_PROCESS_TERMS,
    '',
    MRC_COMPOSITION_INTRO.replace('{FISCAL_YEAR}', String(fy)),
    '',
    mrcTable,
    '',
    SECRET_BALLOT_PARAGRAPH,
    commentsBlock,
    "Candidate's Achievement and Qualifications",
    parts.achievementParagraph,
    '',
    SIGNATURE_INTRO_SENTENCE,
    '',
    'Committee Members',
    signatureBlock,
    '',
    ATTACHMENT_LINE,
    '',
  ].join('\n');
}
