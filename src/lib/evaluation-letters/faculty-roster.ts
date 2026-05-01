import roster from './faculty-roster.json';

export type FacultyEntry = {
  name: string;
  title: string | null;
  department: string;
  email?: string | null;
  phone?: string | null;
  office?: string | null;
  profileUrl: string;
  cvUrl?: string | null;
  /** suggested role category id, or null if it didn't match a known pattern */
  roleCategoryHint: string | null;
};

export type FacultyDepartment = {
  departmentSlug: string;
  departmentName: string;
  faculty: FacultyEntry[];
};

export type FacultyRoster = {
  scrapedAt: string;
  source: string;
  totalScraped: number;
  academicCount: number;
  departments: FacultyDepartment[];
};

export const FACULTY_ROSTER: FacultyRoster = roster as FacultyRoster;

/**
 * Tight filter that keeps real evaluable academic faculty and drops staff,
 * coordinators, PhD students, and other non-faculty who happen to be
 * affiliated with one of the academic departments in the directory.
 */
export function isEvaluableFaculty(f: FacultyEntry): boolean {
  if (!f.title) return false;
  const t = f.title.toLowerCase();

  // Anchor patterns that match canonical academic titles
  if (
    /^(?:assistant |associate |clinical |executive |principal |senior |adjunct |distinguished |university distinguished |regents |visiting )?(?:assistant |associate |clinical |executive |principal |senior )?(professor|lecturer)\b/.test(
      t,
    )
  )
    return true;
  if (/professor of practice|professor of marketing|professor of finance|professor emeritus|professor emerita/.test(t))
    return true;
  if (/dean emeritus|dean emerita/.test(t)) return true;
  if (/^department head|^assistant department head|^associate department head/.test(t))
    return true;
  if (/^associate dean (?:for|of)|^senior associate dean/.test(t)) return true;
  // Named endowed chairs — typically held by full professors
  if (/chair (?:of|in) /.test(t)) return true;
  if (/^mays teaching fellow$/.test(t)) return true;

  return false;
}

/**
 * Map a Mays department slug to the writer (department head) who would
 * normally evaluate that department's faculty.
 */
export const DEPT_SLUG_TO_WRITER_ID: Record<string, string> = {
  marketing: 'wilcox',
  'information-and-operations-management': 'metters',
  accounting: 'mcguire',
  finance: 'brown',
  management: 'boswell',
};

/** Inverse of DEPT_SLUG_TO_WRITER_ID. */
export const WRITER_ID_TO_DEPT_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(DEPT_SLUG_TO_WRITER_ID).map(([slug, wid]) => [wid, slug]),
);

export function writerIdForDeptSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return DEPT_SLUG_TO_WRITER_ID[slug] || null;
}

export function deptSlugForWriterId(writerId: string | null | undefined): string | null {
  if (!writerId) return null;
  return WRITER_ID_TO_DEPT_SLUG[writerId] || null;
}

/** Faculty grouped by department, filtered to evaluable academic faculty only. */
export function evaluableFacultyByDepartment(): FacultyDepartment[] {
  return FACULTY_ROSTER.departments
    .map((d) => ({
      ...d,
      faculty: d.faculty.filter(isEvaluableFaculty).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((d) => d.faculty.length > 0);
}

/** Flat list across all 5 academic departments, evaluable only. */
export function evaluableFaculty(): Array<FacultyEntry & { departmentSlug: string }> {
  const flat: Array<FacultyEntry & { departmentSlug: string }> = [];
  for (const d of FACULTY_ROSTER.departments) {
    for (const f of d.faculty) {
      if (isEvaluableFaculty(f)) flat.push({ ...f, departmentSlug: d.departmentSlug });
    }
  }
  return flat.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Everyone in the directory who is NOT evaluable academic faculty —
 * staff, coordinators, PhD students, fellows, etc. Kept here so a future
 * staff-evaluation app (or roster admin tool) can use the same scrape.
 */
export function staffAndNonFaculty(): Array<FacultyEntry & { departmentSlug: string }> {
  const flat: Array<FacultyEntry & { departmentSlug: string }> = [];
  for (const d of FACULTY_ROSTER.departments) {
    for (const f of d.faculty) {
      if (!isEvaluableFaculty(f)) flat.push({ ...f, departmentSlug: d.departmentSlug });
    }
  }
  return flat.sort((a, b) => a.name.localeCompare(b.name));
}
