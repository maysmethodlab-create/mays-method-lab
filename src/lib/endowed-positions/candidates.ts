import type { Candidate, NominationType } from './types';

/**
 * FY27 endowed-position candidates seeded from the user's `FY27 Endowed
 * Packets` folder. Sourced from the folder structure:
 *   New Endowed/             → new-professorship (default)
 *   Endowed Renewals/Chairs/ → reappoint-chair
 *   Endowed Renewals/Professorships/ → reappoint-professorship
 *   Fellowship Nominations/  → fellowship
 *
 * Department heads (column 5 of the outcome table) and current titles are
 * placeholders that the writer can override in Setup if needed; we don't
 * have authoritative data for every candidate at the moment.
 */

function id(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mk(
  name: string,
  department: Candidate['department'],
  deptCode: Candidate['deptCode'],
  nominationType: NominationType,
  options: Partial<Omit<Candidate, 'id' | 'name' | 'department' | 'deptCode' | 'nominationType'>> = {},
): Candidate {
  // Default outcome-table values from the nomination type. The writer
  // overrides any of these on the Setup form.
  let currentEndowedPosition = 'None';
  let recommendedEndowedPosition = 'Professorship';
  if (nominationType === 'new-chair') {
    currentEndowedPosition = 'None';
    recommendedEndowedPosition = 'Chair';
  } else if (nominationType === 'reappoint-chair') {
    currentEndowedPosition = 'Chair';
    recommendedEndowedPosition = 'Chair';
  } else if (nominationType === 'reappoint-professorship') {
    currentEndowedPosition = 'Professorship';
    recommendedEndowedPosition = 'Professorship';
  } else if (nominationType === 'fellowship') {
    currentEndowedPosition = 'None';
    recommendedEndowedPosition = 'Fellowship';
  }

  return {
    id: id(name),
    name,
    department,
    deptCode,
    nominationType,
    defaultPositionName: '',
    currentTitle: 'Professor',
    currentEndowedPosition,
    recommendedEndowedPosition,
    departmentHead: '',
    ...options,
  };
}

/** Helper: short label for the nomination-type select. */
export const NOMINATION_TYPE_LABELS: Record<NominationType, string> = {
  'new-chair': 'New Chair',
  'new-professorship': 'New Professorship',
  'reappoint-chair': 'Reappoint Chair',
  'reappoint-professorship': 'Reappoint Professorship',
  fellowship: 'Fellowship',
};

export const FY27_CANDIDATES: Candidate[] = [
  // ----- New endowed (defaulting to professorship; override in UI for chairs) -----
  mk('Jon Stauffer', 'Department of Information and Operations Management', 'INFO', 'new-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Rich Metters',
  }),
  mk('Matt Call', 'Department of Management', 'MGMT', 'new-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Wendy Boswell',
  }),
  mk('Priyanka Dwivedi', 'Department of Management', 'MGMT', 'new-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Wendy Boswell',
  }),
  mk('Yifan Song', 'Department of Management', 'MGMT', 'new-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Wendy Boswell',
  }),

  // ----- Renewal — Chairs -----
  mk('Eli Jones', "Arch H. Aplin III '80 Department of Marketing", 'MKTG', 'reappoint-chair', {
    currentTitle: 'Professor',
    departmentHead: 'Keith Wilcox',
  }),
  mk('Len Berry', "Arch H. Aplin III '80 Department of Marketing", 'MKTG', 'reappoint-chair', {
    currentTitle: 'Professor',
    departmentHead: 'Keith Wilcox',
  }),
  mk('Rajan Varadarajan', "Arch H. Aplin III '80 Department of Marketing", 'MKTG', 'reappoint-chair', {
    currentTitle: 'Professor',
    departmentHead: 'Keith Wilcox',
  }),
  mk('Shane Johnson', "Adam C. Sinn '00 Department of Finance", 'FINC', 'reappoint-chair', {
    currentTitle: 'Professor',
    departmentHead: 'James (Jamie) Brown',
  }),

  // ----- Renewal — Professorships -----
  mk('Amalesh Sharma', "Arch H. Aplin III '80 Department of Marketing", 'MKTG', 'reappoint-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Keith Wilcox',
  }),
  mk('Annie McGowan', 'James Benjamin Department of Accounting', 'ACCT', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Arvind Mahajan', "Adam C. Sinn '00 Department of Finance", 'FINC', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'James (Jamie) Brown',
  }),
  mk('Casey Kyllonen', 'James Benjamin Department of Accounting', 'ACCT', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Chris Yust', 'James Benjamin Department of Accounting', 'ACCT', 'reappoint-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Huiwen Lian', 'Department of Management', 'MGMT', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'Wendy Boswell',
  }),
  mk('Russ Peterson', 'James Benjamin Department of Accounting', 'ACCT', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Senyo Tse', 'James Benjamin Department of Accounting', 'ACCT', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Wei Wu', 'James Benjamin Department of Accounting', 'ACCT', 'reappoint-professorship', {
    currentTitle: 'Associate Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Xen Koufteros', 'Department of Information and Operations Management', 'INFO', 'reappoint-professorship', {
    currentTitle: 'Professor',
    departmentHead: 'Rich Metters',
  }),

  // ----- Fellowship nominations -----
  mk('Andrew Fieldhouse', "Adam C. Sinn '00 Department of Finance", 'FINC', 'fellowship', {
    currentTitle: 'Assistant Professor',
    departmentHead: 'James (Jamie) Brown',
  }),
  mk('Davide Tomio', "Adam C. Sinn '00 Department of Finance", 'FINC', 'fellowship', {
    currentTitle: 'Assistant Professor',
    departmentHead: 'James (Jamie) Brown',
  }),
  mk('Jiayi Bao', 'Department of Management', 'MGMT', 'fellowship', {
    currentTitle: 'Assistant Professor',
    departmentHead: 'Wendy Boswell',
  }),
  mk('Jing Huang', 'James Benjamin Department of Accounting', 'ACCT', 'fellowship', {
    currentTitle: 'Assistant Professor',
    departmentHead: 'Sean McGuire',
  }),
  mk('Lorena Keller', "Adam C. Sinn '00 Department of Finance", 'FINC', 'fellowship', {
    currentTitle: 'Assistant Professor',
    departmentHead: 'James (Jamie) Brown',
  }),
  mk('Rajiv Mukherjee', 'Department of Information and Operations Management', 'INFO', 'fellowship', {
    currentTitle: 'Assistant Professor',
    departmentHead: 'Rich Metters',
  }),
];

export function getCandidate(id: string): Candidate | undefined {
  return FY27_CANDIDATES.find((c) => c.id === id);
}

export function nominationTypeLabel(t: NominationType): string {
  return NOMINATION_TYPE_LABELS[t];
}
