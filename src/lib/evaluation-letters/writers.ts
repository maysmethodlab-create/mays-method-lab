export type Writer = {
  id: string;
  name: string;
  firstName: string;
  title: string;
  department: string;
  /**
   * File name (relative to /public/letterheads/) of the letterhead image to
   * embed at the top of the .docx letter. All writers fall back to the shared
   * Mays/TAMU header if a per-department letterhead is not available yet.
   */
  letterheadImage: string;
};

export const DEFAULT_LETTERHEAD = 'mays-default.jpg';

/**
 * Hardcoded list of department heads / academic leaders authorized to write
 * evaluation letters. Once TAMU CAS SSO is wired up, this becomes a roster
 * lookup keyed by NetID instead of a static array.
 */
export const WRITERS: Writer[] = [
  {
    id: 'wilcox',
    name: 'Keith Wilcox, Ph.D.',
    firstName: 'Keith',
    title: 'Department Head, Department of Marketing',
    department: 'Department of Marketing',
    // Per-department: drop a file at /public/letterheads/mktg.jpg to override.
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'metters',
    name: 'Rich Metters, Ph.D.',
    firstName: 'Rich',
    title: 'Department Head, Department of Information and Operations Management',
    department: 'Department of Information and Operations Management',
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'mcguire',
    name: 'Sean McGuire, Ph.D.',
    firstName: 'Sean',
    title: 'Department Head, James Benjamin Department of Accounting',
    department: 'James Benjamin Department of Accounting',
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'brown',
    name: 'James (Jamie) Brown, Ph.D.',
    firstName: 'Jamie',
    title: "Department Head, Adam C. Sinn '00 Department of Finance",
    department: "Adam C. Sinn '00 Department of Finance",
    letterheadImage: DEFAULT_LETTERHEAD,
  },
  {
    id: 'paruchuri',
    name: 'Srikanth Paruchuri, Ph.D.',
    firstName: 'Srikanth',
    title: 'Department Head, Department of Management',
    department: 'Department of Management',
    letterheadImage: DEFAULT_LETTERHEAD,
  },
];

export function getWriter(id: string): Writer | undefined {
  return WRITERS.find((w) => w.id === id);
}
