import { ROLE_CATEGORIES } from './role-categories';

export type IdentifyResult = {
  name: string | null;
  title: string | null;
  department: string | null;
  /** Suggested role-category id, mapped from title */
  roleCategoryId: string | null;
};

/**
 * Map a free-text title to one of our role-category ids using simple regex
 * heuristics. Returns null if no clear match.
 */
export function suggestRoleCategoryId(title: string | null): string | null {
  if (!title) return null;
  const t = title.toLowerCase();

  // Order matters — check more specific patterns first.
  if (/department\s+head/.test(t)) return 'department-head';
  if (/(senior|associate|deputy)\s+associate\s+dean|associate\s+dean|vice\s+dean/.test(t))
    return 'associate-dean';
  if (/professor\s+of\s+practice|executive\s+(assistant|associate)?\s*professor/.test(t))
    return 'apt-practice';
  if (/clinical\s+(assistant|associate)?\s*professor/.test(t)) return 'apt-clinical';
  if (/(principal|senior)?\s*lecturer/.test(t)) return 'apt-lecturer';
  if (/assistant\s+professor/.test(t)) return 'tt-assistant-professor';
  if (/associate\s+professor/.test(t)) return 'tt-associate-professor';
  if (/\bprofessor\b/.test(t)) return 'tt-professor';

  return null;
}

/**
 * Pure-regex fallback used when the Anthropic key is the placeholder.
 * Looks for common self-evaluation header patterns:
 *   "Name: ..."
 *   "Faculty Member: ..."
 *   "Title: ..."
 *   "Rank: ..."
 *   "Department: ..."
 * Falls back to scanning the first non-empty line for a "Name, Ph.D." pattern.
 */
export function regexIdentify(text: string): IdentifyResult {
  const out: IdentifyResult = {
    name: null,
    title: null,
    department: null,
    roleCategoryId: null,
  };

  const grab = (re: RegExp): string | null => {
    const m = text.match(re);
    return m && m[1] ? m[1].trim().replace(/\s{2,}/g, ' ') : null;
  };

  out.name =
    grab(/^(?:Name|Faculty(?:\s+Member)?|Submitted\s+by)\s*[:\-]\s*(.+?)$/im) ||
    grab(/^([A-Z][\w'-]+(?:\s+[A-Z]\.)?\s+[A-Z][\w'-]+(?:,\s*Ph\.?D\.?)?)$/m);

  out.title =
    grab(/^(?:Title|Rank|Position|Role)\s*[:\-]\s*(.+?)$/im) ||
    grab(
      /\b((?:Assistant|Associate|Senior|Principal|Clinical|Executive)?\s*(?:Professor(?:\s+of\s+Practice)?|Lecturer))\b\s+(?:of|in)\s+[A-Z][\w &]+/i,
    );

  out.department =
    grab(/^(?:Department|Unit|Affiliation)\s*[:\-]\s*(.+?)$/im) ||
    grab(/Department\s+of\s+([A-Z][\w &]+)/);

  if (out.department && !/^Department of/i.test(out.department)) {
    out.department = `Department of ${out.department}`;
  }

  out.roleCategoryId = suggestRoleCategoryId(out.title);
  return out;
}

/**
 * Validate / coerce an LLM JSON response.
 */
export function coerceIdentifyJson(raw: string): IdentifyResult {
  // Try to find the first JSON object in the response.
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return { name: null, title: null, department: null, roleCategoryId: null };
  try {
    const parsed = JSON.parse(m[0]);
    const out: IdentifyResult = {
      name: typeof parsed.name === 'string' ? parsed.name.trim() : null,
      title: typeof parsed.title === 'string' ? parsed.title.trim() : null,
      department: typeof parsed.department === 'string' ? parsed.department.trim() : null,
      roleCategoryId: null,
    };
    out.roleCategoryId = suggestRoleCategoryId(out.title);
    return out;
  } catch {
    return { name: null, title: null, department: null, roleCategoryId: null };
  }
}

export const ROLE_LABELS = ROLE_CATEGORIES.map((r) => r.label);
