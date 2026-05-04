/**
 * Journal-tier classification used by the research-brief and drafting
 * prompts. The previous prompt embedded a short, incomplete top-tier
 * journal list which caused the model to default-classify all papers as
 * A-tier when the recipient's actual journals weren't on the short list.
 *
 * This file is the single source of truth:
 *   1. A_JOURNALS_BY_DEPARTMENT — Appendix J of the Mays Faculty
 *      Guidelines (October 17, 2025 version). The department-specific
 *      A-list is the primary tier-classification authority.
 *   2. FT50_JOURNALS — the Financial Times Top 50 business journals.
 *      Used as a cross-check for journals not on the department's A-list
 *      but recognized as top-tier across business research.
 */

export const A_JOURNALS_BY_DEPARTMENT = {
  accounting: [
    'Journal of Accounting and Economics',
    'Journal of Accounting Research',
    'The Accounting Review',
    'Contemporary Accounting Research',
    'Review of Accounting Studies',
    'Accounting, Organizations, and Society',
  ],
  finance: [
    'Journal of Finance',
    'Journal of Financial Economics',
    'The Review of Financial Studies',
    'Journal of Financial and Quantitative Analysis',
    'Review of Finance',
    'Journal of Financial Intermediation',
  ],
  iom_supply_chain: [
    'Management Science',
    'Operations Research',
    'Manufacturing & Service Operations Management',
    'Production and Operations Management',
    'Journal of Operations Management',
  ],
  iom_information_systems: [
    'Management Science',
    'Operations Research',
    'Information Systems Research',
    'MIS Quarterly',
  ],
  management: [
    'Administrative Science Quarterly',
    'Academy of Management Journal',
    'Academy of Management Review',
    'Journal of Applied Psychology',
    'Strategic Management Journal',
    'Organization Science',
    'Personnel Psychology',
  ],
  marketing: [
    'Journal of Marketing',
    'Journal of Marketing Research',
    'Marketing Science',
    'Journal of Consumer Research',
    'Journal of the Academy of Marketing Science',
    'Journal of Consumer Psychology',
  ],
} as const;

/**
 * Financial Times Top 50 business journals. Used as a cross-check so
 * that a journal recognized as top-tier elsewhere in the field is not
 * misclassified just because it isn't on the recipient's
 * department-specific A-list.
 */
export const FT50_JOURNALS: readonly string[] = [
  'Academy of Management Journal',
  'Academy of Management Review',
  'Accounting, Organizations and Society',
  'Administrative Science Quarterly',
  'American Economic Review',
  'Contemporary Accounting Research',
  'Econometrica',
  'Entrepreneurship Theory and Practice',
  'Harvard Business Review',
  'Human Relations',
  'Human Resource Management',
  'Information Systems Research',
  'Journal of Accounting and Economics',
  'Journal of Accounting Research',
  'Journal of Applied Psychology',
  'Journal of Business Ethics',
  'Journal of Business Venturing',
  'Journal of Consumer Psychology',
  'Journal of Consumer Research',
  'Journal of Finance',
  'Journal of Financial Economics',
  'Journal of Financial and Quantitative Analysis',
  'Journal of International Business Studies',
  'Journal of Management Information Systems',
  'Journal of Management Studies',
  'Journal of Marketing',
  'Journal of Marketing Research',
  'Journal of Operations Management',
  'Journal of Political Economy',
  'Journal of the Academy of Marketing Science',
  'MIS Quarterly',
  'MIT Sloan Management Review',
  'Management Science',
  'Manufacturing and Service Operations Management',
  'Marketing Science',
  'Operations Research',
  'Organization Science',
  'Organization Studies',
  'Organizational Behavior and Human Decision Processes',
  'Personnel Psychology',
  'Production and Operations Management',
  'Quarterly Journal of Economics',
  'Research Policy',
  'Review of Accounting Studies',
  'Review of Economic Studies',
  'Review of Finance',
  'Review of Financial Studies',
  'Strategic Entrepreneurship Journal',
  'Strategic Management Journal',
  'The Accounting Review',
];

/**
 * Map a free-text department string (e.g. "James Benjamin Department of
 * Accounting") to the Appendix-J A-list. Returns the combined list for
 * I&O (since the department covers both Supply Chain and Information
 * Systems sub-fields). Returns null when the department cannot be
 * resolved (e.g. staff recipients, unfamiliar units) — the prompt then
 * falls back to FT50-only classification.
 */
export function getDepartmentAJournals(recipientDepartment: string | undefined): string[] | null {
  if (!recipientDepartment) return null;
  const dept = recipientDepartment.toLowerCase();

  if (dept.includes('accounting')) {
    return [...A_JOURNALS_BY_DEPARTMENT.accounting];
  }
  if (dept.includes('finance')) {
    return [...A_JOURNALS_BY_DEPARTMENT.finance];
  }
  // Information & Operations Management — both sub-lists union'd, dedup'd
  if (
    dept.includes('information and operations') ||
    dept.includes('information & operations')
  ) {
    const merged = new Set<string>([
      ...A_JOURNALS_BY_DEPARTMENT.iom_supply_chain,
      ...A_JOURNALS_BY_DEPARTMENT.iom_information_systems,
    ]);
    return [...merged];
  }
  if (dept.includes('marketing')) {
    return [...A_JOURNALS_BY_DEPARTMENT.marketing];
  }
  // Plain "Department of Management" — checked AFTER the I&O / accounting
  // patterns so it doesn't false-match those.
  if (dept.includes('management')) {
    return [...A_JOURNALS_BY_DEPARTMENT.management];
  }
  return null;
}

/**
 * Render the journal-tier reference block for the research-brief prompt.
 * Replaces the previous incomplete short list of top-tier journals.
 */
export function renderJournalTierReference(recipientDepartment: string | undefined): string {
  const deptAList = getDepartmentAJournals(recipientDepartment);

  const deptBlock = deptAList
    ? `**A-LEVEL JOURNALS for the recipient's department** (Appendix J of the Mays Faculty Guidelines — the authoritative list for this department):
${deptAList.map((j) => `  - ${j}`).join('\n')}

A peer-reviewed article in any of these journals counts as A-tier for this recipient. A journal NOT on this list is NOT A-tier even if it is a respected outlet.`
    : `(The recipient's department was not provided or could not be matched to Appendix J. Use the FT50 list below as the A-tier authority.)`;

  return `${deptBlock}

**FT50 JOURNALS** (Financial Times Top 50 business journals — cross-check for top-tier classification across business fields):
${FT50_JOURNALS.map((j) => `  - ${j}`).join('\n')}

A journal on the FT50 list is also recognized as top-tier even when it is not on the recipient's department-specific A-list.

CLASSIFICATION RULE — apply both lists strictly:
1. A-tier = on the recipient's department A-list (above) OR on the FT50.
2. Other A-level / well-regarded = peer-reviewed but not on either list.
3. Lower-tier = conference proceedings, book chapters, editorials, practitioner outlets.

Do NOT default journals to A-tier just because they sound prestigious. If a journal is not on either list above, it is NOT A-tier. Group it under "other A-level / well-regarded" or the appropriate lower tier.`;
}
