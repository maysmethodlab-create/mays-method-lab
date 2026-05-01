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
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'metters',
    name: 'Rich Metters, Ph.D.',
    firstName: 'Rich',
    title: 'Department Head, Department of Information and Operations Management',
    department: 'Department of Information and Operations Management',
    chair: 'Paul W. and Rosalie Robertson Chair in Business',
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'mcguire',
    name: 'Sean McGuire, Ph.D.',
    firstName: 'Sean',
    title: 'Department Head, James Benjamin Department of Accounting',
    department: 'James Benjamin Department of Accounting',
    chair: "J. Rogers Rainey, Jr. and Kathleen L. Rainey '44 Chair of Accounting",
    honors: ['Presidential Impact Fellow'],
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'brown',
    name: 'James (Jamie) Brown, Ph.D.',
    firstName: 'Jamie',
    title: "Department Head, Adam C. Sinn '00 Department of Finance",
    department: "Adam C. Sinn '00 Department of Finance",
    chair: 'Jeanne & John R. Blocker Chair in Business Administration',
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'boswell',
    name: 'Wendy R. Boswell, Ph.D.',
    firstName: 'Wendy',
    title: 'Interim Department Head, Department of Management',
    department: 'Department of Management',
    chair: 'Jerry and Kay Cox Endowed Chair in Business',
    letterheadImage: DEFAULT_LETTERHEAD,
  },
];

export function getWriter(id: string): Writer | undefined {
  return WRITERS.find((w) => w.id === id);
}

/**
 * Multi-line FROM block for the memo header. Title on line 2, optional
 * endowed chair on line 3, optional honors on line 4+.
 */
export function fromBlockLines(writer: Writer): string[] {
  const lines = [writer.name, writer.title];
  if (writer.chair) lines.push(writer.chair);
  if (writer.honors) lines.push(...writer.honors);
  return lines;
}
