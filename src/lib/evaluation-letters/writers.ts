export type Writer = {
  id: string;
  name: string;
  firstName: string;
  title: string;
  department: string;
};

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
  },
  {
    id: 'metters',
    name: 'Rich Metters, Ph.D.',
    firstName: 'Rich',
    title: 'Department Head, Department of Information and Operations Management',
    department: 'Department of Information and Operations Management',
  },
  {
    id: 'mcguire',
    name: 'Sean McGuire, Ph.D.',
    firstName: 'Sean',
    title: 'Department Head, James Benjamin Department of Accounting',
    department: 'James Benjamin Department of Accounting',
  },
  {
    id: 'brown',
    name: 'James (Jamie) Brown, Ph.D.',
    firstName: 'Jamie',
    title: "Department Head, Adam C. Sinn '00 Department of Finance",
    department: "Adam C. Sinn '00 Department of Finance",
  },
  {
    id: 'paruchuri',
    name: 'Srikanth Paruchuri, Ph.D.',
    firstName: 'Srikanth',
    title: 'Department Head, Department of Management',
    department: 'Department of Management',
  },
];

export function getWriter(id: string): Writer | undefined {
  return WRITERS.find((w) => w.id === id);
}
