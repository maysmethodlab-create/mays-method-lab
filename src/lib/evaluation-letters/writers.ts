export type WriterStyleOverrides = {
  /** How many lines of the FROM block to render. Default = all
   *  available lines from fromBlockLines(). Sean = 2 (suppresses chair
   *  and honors), Rich = 3 (chair, no honors). */
  fromBlockMaxLines?: number;

  /** Whether the body uses bold section headings. Default = true
   *  (Hari pattern). Sean = false. */
  useSectionHeadings?: boolean;

  /** Target letter length range in words. Default = { min: 700, max: 1100 }. */
  targetWords?: { min: number; max: number };

  /** Salutation style. 'none' = no "Dear X," — letter goes straight from
   *  SUBJECT line to body. Default = 'first'. Sean = 'none'. */
  salutationStyle?: 'none' | 'first' | 'formal';

  /** Where the AACSB paragraph goes in APT letters. Default = 'discrete'.
   *  'omit' = skip AACSB entirely (Rich does this for short lecturer
   *  letters, where AACSB material is replaced with a one-line note). */
  aacsbPlacement?: 'discrete' | 'woven' | 'omit';

  /** Closing line(s) appended verbatim before the writer's name. */
  closingLines?: string[];

  /** Opening boilerplate verbatim. Used in place of the generic
   *  "Thank you for submitting your materials..." line. Sean has a
   *  specific opening pattern that always appears in his letters. */
  openingBoilerplate?: string;

  /** Override the FROM-line title shown on the memorandum. Sean uses
   *  "Professor and Department Head" rather than the longer official title. */
  fromTitleOverride?: string;
};

export type Writer = {
  id: string;
  /** Full legal name with degree suffix if used */
  name: string;
  firstName: string;
  /** Primary administrative title — what appears on the FROM line */
  title: string;
  /** Official department name (used both in titles and as the letterhead caption) */
  department: string;
  /** Optional named/endowed chair, rendered as a third line in the FROM block */
  chair?: string;
  /** Optional secondary credentials (e.g., "Presidential Impact Fellow") */
  honors?: string[];
  /**
   * File name (relative to /public/letterheads/) of the letterhead image to
   * embed at the top of the .docx letter. All writers fall back to the shared
   * Mays/TAMU header until a per-department letterhead image is dropped in.
   */
  letterheadImage: string;
  /**
   * Per-writer style overrides for the writing prompt. Defaults are applied
   * in resolveStyleOverrides() below.
   */
  styleOverrides?: WriterStyleOverrides;
};

export const DEFAULT_LETTERHEAD = 'mays-default.jpg';

/**
 * Hardcoded list of department heads / academic leaders authorized to write
 * evaluation letters. Verified against https://mays.tamu.edu/leadership/.
 * Once TAMU CAS SSO is wired up, this becomes a roster lookup keyed by NetID.
 */
export const WRITERS: Writer[] = [
  {
    id: 'wilcox',
    name: 'Keith Wilcox, Ph.D.',
    firstName: 'Keith',
    title: "Interim Department Head, Arch H. Aplin III '80 Department of Marketing",
    department: "Arch H. Aplin III '80 Department of Marketing",
    chair: 'Ford Endowed Chair in Consumerism / E-Business / E-Commerce',
    // Department-specific letterhead extracted from MKTG Letterhead.docx.
    letterheadImage: 'mktg.png',
  },
  {
    id: 'metters',
    name: 'Rich Metters, Ph.D.',
    firstName: 'Rich',
    title: 'Department Head, Department of Information and Operations Management',
    department: 'Department of Information and Operations Management',
    chair: 'Paul W. and Rosalie Robertson Chair in Business',
    // Mays Business School banner extracted from Metters' lecturer-bundle letter.
    letterheadImage: 'info.jpg',
    styleOverrides: {
      fromBlockMaxLines: 3,
      useSectionHeadings: false,
      targetWords: { min: 450, max: 700 },
      salutationStyle: 'none',
      // Rich does not include AACSB material in short lecturer letters.
      // For Becker (clinical) the omit branch is acceptable too — Rich's
      // letters lean on Department-Head Assessment language rather than a
      // separate AACSB paragraph for either group.
      aacsbPlacement: 'omit',
      openingBoilerplate:
        'Both Texas A&M University and Mays Business School require that the performance of all faculty be reviewed on an annual basis. As noted in the Mays Faculty Promotion and Tenure Guidelines, the purposes of the annual performance review include creating a sound and logical basis for merit compensation recommendations, providing evaluative feedback regarding how well the individual is currently performing, providing developmental feedback regarding areas where the faculty member’s contribution may be enhanced and/or improved in the future, and providing feedback regarding progress toward promotion and as relevant. The senior clinical faculty reviewed your annual report, which contains extensive information on your teaching, and current resume. The following is an abbreviated summary of your accomplishments in the past year, followed by their assessment. This assessment will be the basis for any department resource allocation decisions.',
      closingLines: [
        'If you wish to discuss your review, schedule a time.',
      ],
    },
  },
  {
    id: 'mcguire',
    name: 'Sean McGuire, Ph.D.',
    firstName: 'Sean',
    title: 'Department Head, James Benjamin Department of Accounting',
    department: 'James Benjamin Department of Accounting',
    chair: "J. Rogers Rainey, Jr. and Kathleen L. Rainey '44 Chair of Accounting",
    honors: ['Presidential Impact Fellow'],
    // High-resolution TAMU banner extracted from McGuire's Hurta letter.
    letterheadImage: 'acct.jpg',
    styleOverrides: {
      fromBlockMaxLines: 2,
      useSectionHeadings: false,
      targetWords: { min: 550, max: 800 },
      salutationStyle: 'none',
      aacsbPlacement: 'discrete',
      fromTitleOverride: 'Professor and Department Head',
      closingLines: [
        'Please let me know if you have any questions about my assessment. To that end, please contact Diana Kruse to schedule a time to meet with me if you would like to discuss my assessment.',
        'Thank you for everything that you do for our students and department!',
      ],
      openingBoilerplate:
        'Thank you for submitting your annual Professional Activity and Accomplishment Report this spring. The purpose of this memo is to provide you with my assessment of your performance from January 1, {YEAR} to December 31, {YEAR}. My assessment is based upon the Mays Guidelines and will be the basis for any department resource allocation decisions and for the reappointment decision. Following the Mays Guidelines, the performance categories are excellent, effective, needs improvement, and unsatisfactory.',
    },
  },
  {
    id: 'brown',
    name: 'James (Jamie) Brown, Ph.D.',
    firstName: 'Jamie',
    title: "Department Head, Adam C. Sinn '00 Department of Finance",
    department: "Adam C. Sinn '00 Department of Finance",
    chair: 'Jeanne & John R. Blocker Chair in Business Administration',
    // No usable Finance-specific letterhead source available today: the
    // Finance folder has no past .docx letters with an embedded image, so
    // Brown stays on the shared Mays default until one is supplied.
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'boswell',
    name: 'Wendy R. Boswell, Ph.D.',
    firstName: 'Wendy',
    title: 'Interim Department Head, Department of Management',
    department: 'Department of Management',
    chair: 'Jerry and Kay Cox Endowed Chair in Business',
    // High-resolution TAMU banner extracted from Boswell's Boivie letter.
    letterheadImage: 'mgmt.jpg',
    styleOverrides: {
      // Wendy uses a 2-line FROM block: "Wendy Boswell" + "Interim Head,
      // Department of Management". No chair, no honors on her APT letters.
      fromBlockMaxLines: 2,
      // No bold section headings. Wendy's pattern is one classifying
      // sentence followed by a numbered or bulleted list of supporting
      // indicators, then a single closing paragraph.
      useSectionHeadings: false,
      // Panina is ~460 words, McFarland ~425 words. Range 350-550 keeps
      // the letter tight without forcing an artificial floor.
      targetWords: { min: 350, max: 550 },
      // Memo skips "Dear X," and goes straight from SUBJECT to body.
      salutationStyle: 'none',
      // Wendy does NOT include AACSB material at all in her APT letters.
      aacsbPlacement: 'omit',
      // Wendy's opening boilerplate runs longer than Sean's. It includes
      // the three review purposes and the four performance levels as
      // bulleted lists, ending with the classifying-sentence transition.
      openingBoilerplate:
        'Both Texas A&M University and Mays Business School require that the performance of all faculty be reviewed on an annual basis. As noted in the Mays Faculty Promotion and Tenure Guidelines, the purposes of the annual performance review include:\n- Creating a sound and logical basis for merit compensation recommendations\n- Providing evaluative feedback regarding how well the individual is currently performing relative to the expectations and norms for the individual\'s faculty position\n- Providing developmental feedback regarding areas where the faculty member\'s contributions may be enhanced and/or improved in the future\n\nFurther, the Mays Faculty Promotion and Tenure Guidelines define four levels of performance for the key dimensions across which performance is reviewed. These levels of performance are:\n- Excellent Performance: a high level of performance that meets and exceeds norms and expectations and which is reflected by substantive indicators of performance excellence\n- Effective Performance: acceptable and satisfactory performance that meets norms and expectations and which is reflected by substantive indicators of performance effectiveness\n- "Needs Improvement" Performance: performance that does not consistently meet norms and expectations and which is reflected by an absence of some indicators of performance effectiveness\n- Unsatisfactory Performance: performance that consistently fails to meet norms and expectations and which is reflected by a continuous absence of indicators of performance effectiveness',
      // Wendy's closing always ends with these two sentences verbatim,
      // before the signature block.
      closingLines: [
        'If you would like to meet and discuss this letter, please contact me at your convenience so we can schedule a meeting.',
        'Please sign and date this letter and return it to me. A signed copy of this letter will be placed in your official personnel file.',
      ],
      // Wendy uses "Interim Head, Department of Management" rather than
      // the longer "Interim Department Head, Department of Management".
      fromTitleOverride: 'Interim Head, Department of Management',
    },
  },
];

export function getWriter(id: string): Writer | undefined {
  return WRITERS.find((w) => w.id === id);
}

/**
 * Multi-line FROM block for the memo header. Title on line 2, optional
 * endowed chair on line 3, optional honors on line 4+. If the writer has
 * a `fromTitleOverride`, that string replaces the long official title on
 * line 2 (e.g., Sean uses "Professor and Department Head" rather than the
 * full department-head title with the department name appended).
 */
export function fromBlockLines(writer: Writer): string[] {
  const title = writer.styleOverrides?.fromTitleOverride ?? writer.title;
  const lines = [writer.name, title];
  if (writer.chair) lines.push(writer.chair);
  if (writer.honors) lines.push(...writer.honors);
  return lines;
}

/**
 * Default style overrides used when a writer has none configured (or has
 * partial overrides). Mirrors the legacy Hari pattern.
 */
const DEFAULT_STYLE_OVERRIDES: Required<WriterStyleOverrides> = {
  fromBlockMaxLines: 99,
  useSectionHeadings: true,
  targetWords: { min: 700, max: 1100 },
  salutationStyle: 'first',
  aacsbPlacement: 'discrete',
  closingLines: [],
  openingBoilerplate: '',
  fromTitleOverride: '',
};

export function resolveStyleOverrides(writerId: string): Required<WriterStyleOverrides> {
  const writer = getWriter(writerId);
  return { ...DEFAULT_STYLE_OVERRIDES, ...(writer?.styleOverrides ?? {}) };
}
