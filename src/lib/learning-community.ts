/**
 * Your AI Edge — content registry.
 *
 * The /learning-community page is a hub with three sections in this order:
 *
 *   1. Apps      — Lab-built apps for the role. Bigger tile treatment.
 *                  Includes coming-soon cards for the Stage 2 apps
 *                  (Recommendation Letter Helper, Award Nomination Drafter).
 *   2. Prompts   — curated paste-ready prompts. "Browse all" links to /prompts.
 *   3. Learn AI  — five-step ladder (Step 0 quick-start, Step 1 tool picker,
 *                  Step 2 prompt basics, Step 3 tutorials, Step 4 courses).
 *
 * The Evaluation Letter Writer does NOT appear here. It lives at
 * /admin/evaluation-letters and is surfaced from Apps for Administrators.
 *
 * Curate ruthlessly. Each card on this page must earn its place.
 */

export type LearningRole = 'faculty' | 'staff';

/**
 * Buckets used for cross-section tag filtering. Mirrors the slugs in
 * src/lib/prompts.ts so chips stay consistent.
 */
export type LearningBucket =
  | 'research'
  | 'teaching'
  | 'writing'
  | 'programs'
  | 'faculty-support'
  | 'advising'
  | 'learning-ai';

export const BUCKET_LABELS: Record<LearningBucket, string> = {
  research: 'Research',
  teaching: 'Teaching',
  writing: 'Writing',
  programs: 'Programs',
  'faculty-support': 'Faculty support',
  advising: 'Advising',
  'learning-ai': 'Learning AI',
};

/** Order in which chips render. */
export const BUCKET_ORDER: LearningBucket[] = [
  'research',
  'teaching',
  'writing',
  'programs',
  'faculty-support',
  'advising',
  'learning-ai',
];

export type LearningItem = {
  title: string;
  description: string;
  href: string;
  /** When true the card renders as a flat dotted-frame info tile rather than a clickable card. */
  comingSoon?: boolean;
  /** Optional small meta line shown under the title (e.g. "Lab app", "Approved tool"). */
  meta?: string;
  /** Buckets the card belongs to, for the chip filter. May be empty for cards that always show. */
  buckets?: LearningBucket[];
};

export type LearningSectionId = 'apps' | 'prompts' | 'learn-ai';

export type LearningSection = {
  /** Stable id used as anchor and React key. */
  id: LearningSectionId;
  /** Display title for the section (Oswald, maroon). */
  title: string;
  /** One-line subhead under the title. */
  blurb: string;
  /** Curated cards for this section. */
  items: LearningItem[];
  /** Optional href for the "browse all" tail link. */
  browseHref?: string;
  /** Optional label for the tail link. */
  browseLabel?: string;
};

/* =============================================================
   PROMPTS — curated 4 to 6 paste-ready prompts per role.
   "Browse all prompts" tails to /prompts.
   Hrefs map to slugs in src/lib/prompts.ts.
   ============================================================= */

const PROMPT_ANNOUNCEMENT: LearningItem = {
  title: 'Draft an announcement',
  description:
    'Three rough bullets become a clean program update in under a minute.',
  href: '/prompts/announcement-writer',
  meta: 'Prompt',
  buckets: ['writing', 'programs'],
};

const PROMPT_MEETING_NOTES: LearningItem = {
  title: 'Summarize meeting notes',
  description:
    'Raw notes to a one-paragraph summary, decisions, and an action-item table.',
  href: '/prompts/meeting-notes-summary',
  meta: 'Prompt',
  buckets: ['writing', 'programs'],
};

const PROMPT_REPORT_DRAFT: LearningItem = {
  title: 'Draft a status report',
  description:
    'A reviewable one-page report for the dean. Executive summary, shipped, at risk, asks.',
  href: '/prompts/report-draft',
  meta: 'Prompt',
  buckets: ['writing', 'programs'],
};

const PROMPT_RESUME_BULLETS: LearningItem = {
  title: 'Strengthen resume bullets',
  description:
    'Tighter, more concrete bullets with verbs and numbers. For staff and student work alike.',
  href: '/prompts/resume-bullet-points',
  meta: 'Prompt',
  buckets: ['writing', 'advising'],
};

const PROMPT_LIT_REVIEW: LearningItem = {
  title: 'Summarize research sources',
  description:
    'Twelve papers in. A position-mapped table out. The setup work, not the thinking.',
  href: '/prompts/literature-review-summary',
  meta: 'Prompt',
  buckets: ['research'],
};

const PROMPT_EXAM_QUESTIONS: LearningItem = {
  title: 'Generate practice exam questions',
  description:
    'Thirty practice questions across three difficulty levels from one syllabus.',
  href: '/prompts/exam-prep-questions',
  meta: 'Prompt',
  buckets: ['teaching'],
};

const PROMPT_RUBRIC: LearningItem = {
  title: 'Create an assignment rubric',
  description:
    'A clear four-criterion rubric with descriptors at three performance levels.',
  href: '/prompts/rubric-generator',
  meta: 'Prompt',
  buckets: ['teaching'],
};

const PROMPT_RECRUITER_OUTREACH: LearningItem = {
  title: 'Recruiter outreach email',
  description:
    'A warm, specific email to a recruiter. The one you send every February.',
  href: '/prompts/recruiter-outreach',
  meta: 'Prompt',
  buckets: ['writing', 'advising'],
};

/* =============================================================
   APPS — Lab-built apps. Stage 2 apps are placeholders today.
   The Evaluation Letter Writer is intentionally NOT here; it
   lives under Apps for Administrators.
   ============================================================= */

const APP_REC_LETTER_HELPER: LearningItem = {
  title: 'Recommendation Letter Helper',
  description:
    "A polished student recommendation letter from a CV, the role they're applying for, and three short anecdotes. Built by the Lab. Coming later this term.",
  href: '#',
  comingSoon: true,
  meta: 'Lab app',
  buckets: ['writing', 'faculty-support'],
};

const APP_AWARD_NOMINATION: LearningItem = {
  title: 'Award Nomination Drafter',
  description:
    "A polished award nomination letter for staff or faculty. Pick the award, paste the nominee's record, the app maps it onto the award's criteria. Coming later this term.",
  href: '#',
  comingSoon: true,
  meta: 'Lab app',
  buckets: ['writing', 'programs', 'faculty-support'],
};

/* The featured Stage 2B chatbot apps. The Faculty Guidelines version is
   in design (a strict quoting service grounded in the October 2025
   guidelines, with the personal-applicability template baked in — the
   v3 spec). The Academic Calendar version ships first as a preview
   since it grounds in public registrar data and has a smaller blast
   radius. */

const APP_FACULTY_GUIDELINES_CHATBOT: LearningItem = {
  title: 'Mays Faculty Guidelines Chatbot',
  description:
    'Ask any question about promotion, evaluation, AACSB criteria, leave, or any other topic in the October 2025 guidelines. The chatbot quotes the relevant passage verbatim with section and page citations, and points you to the senior associate dean for any question about your specific case. Beta — feedback welcome.',
  href: '/apps/faculty-guidelines',
  meta: 'Lab app · Beta',
  buckets: ['research', 'teaching', 'writing', 'faculty-support'],
};

const APP_ACADEMIC_CALENDAR_CHATBOT: LearningItem = {
  title: 'Academic Calendar Chatbot',
  description:
    'Ask any question about registration windows, drop deadlines, finals weeks, breaks, or graduation. The chatbot returns the specific date with a citation back to the TAMU registrar. Preview live now.',
  href: '/apps/academic-calendar',
  meta: 'Lab app',
  buckets: ['programs', 'faculty-support', 'advising'],
};

/* =============================================================
   LEARN AI — five-step ladder.
   These items are the 5 step cards. Step 3 also surfaces three
   tutorials (beginner / intermediate / advanced) as nested rows.
   ============================================================= */

const LEARN_STEP_0: LearningItem = {
  title: 'Start with the right AI tool',
  description:
    'A four-step quick-start. Use the supported chat tools first, try a ready-made prompt, test one repeatable workflow, and only build bigger after the manual version works.',
  href: '/your-ai-edge/start',
  meta: 'Step 0 · Start here',
  buckets: ['learning-ai'],
};

const LEARN_STEP_1: LearningItem = {
  title: 'Which AI tool fits your task?',
  description:
    'Compare TAMU AI Chat, Microsoft Copilot, Google Gemini, and Google NotebookLM. A use-this-when grid for faculty and staff work.',
  href: '/your-ai-edge/pick-a-tool',
  meta: 'Step 1 · Pick the right tool',
  buckets: ['learning-ai'],
};

const LEARN_STEP_2: LearningItem = {
  title: 'Write better prompts',
  description:
    'Four short principles. Name the audience. Give the AI the data it needs. Review every answer. Iterate fast.',
  href: '/prompts',
  meta: 'Step 2 · Prompt engineering basics',
  buckets: ['learning-ai'],
};

const LEARN_STEP_3: LearningItem = {
  title: 'Build a small tool you keep using',
  description:
    'Three hero tutorials. Start with a 20-minute meeting-notes workflow. Move up to a 45-minute NotebookLM chatbot. End with a 90-minute custom TAMU AI Chat agent.',
  href: '/agents',
  meta: 'Step 3 · Build something',
  buckets: ['learning-ai'],
};

const LEARN_STEP_4: LearningItem = {
  title: 'Take a course',
  description:
    'Four real options. Mays AI Series on FlexOnline, Lab-built. Anthropic Academy on prompt engineering and Claude. DeepLearning.AI short courses with the major AI labs. Anthropic Cookbook for builders.',
  href: '/resources',
  meta: 'Step 4 · Go deeper',
  buckets: ['learning-ai'],
};

/* =============================================================
   SECTION ASSEMBLY — per role.
   Order: Apps, Prompts, Learn AI.
   ============================================================= */

const FACULTY_SECTIONS: LearningSection[] = [
  {
    id: 'apps',
    title: 'Ready-to-use apps',
    blurb:
      'Lab-built apps for the work that comes up every semester. Open the app, paste your inputs, get a reviewable draft.',
    items: [APP_FACULTY_GUIDELINES_CHATBOT, APP_REC_LETTER_HELPER, APP_AWARD_NOMINATION],
  },
  {
    id: 'prompts',
    title: 'Ready-to-use prompts',
    blurb: 'Open one. Copy. Paste into TAMU AI Chat. Ship the work.',
    items: [
      PROMPT_LIT_REVIEW,
      PROMPT_EXAM_QUESTIONS,
      PROMPT_RUBRIC,
      PROMPT_REPORT_DRAFT,
    ],
    browseHref: '/prompts',
    browseLabel: 'Browse all prompts',
  },
  {
    id: 'learn-ai',
    title: 'Learn AI',
    blurb:
      'A five-step ladder. Pick the right tool, write better prompts, build something small, then go deeper.',
    items: [LEARN_STEP_0, LEARN_STEP_1, LEARN_STEP_2, LEARN_STEP_3, LEARN_STEP_4],
  },
];

const STAFF_SECTIONS: LearningSection[] = [
  {
    id: 'apps',
    title: 'Ready-to-use apps',
    blurb:
      'Lab-built apps for the work coordinators and staff run every week. Open the app, paste your inputs, get a reviewable draft.',
    items: [APP_ACADEMIC_CALENDAR_CHATBOT, APP_AWARD_NOMINATION, APP_REC_LETTER_HELPER],
  },
  {
    id: 'prompts',
    title: 'Ready-to-use prompts',
    blurb: 'Open one. Copy. Paste into TAMU AI Chat. Ship the work.',
    items: [
      PROMPT_ANNOUNCEMENT,
      PROMPT_MEETING_NOTES,
      PROMPT_REPORT_DRAFT,
      PROMPT_RECRUITER_OUTREACH,
      PROMPT_RESUME_BULLETS,
    ],
    browseHref: '/prompts',
    browseLabel: 'Browse all prompts',
  },
  {
    id: 'learn-ai',
    title: 'Learn AI',
    blurb:
      'A five-step ladder. Pick the right tool, write better prompts, build something small, then go deeper.',
    items: [LEARN_STEP_0, LEARN_STEP_1, LEARN_STEP_2, LEARN_STEP_3, LEARN_STEP_4],
  },
];

/* =============================================================
   Helpers
   ============================================================= */

export function sectionsForRole(role: LearningRole): LearningSection[] {
  return role === 'faculty' ? FACULTY_SECTIONS : STAFF_SECTIONS;
}

export function itemCountForRole(role: LearningRole): number {
  return sectionsForRole(role).reduce((n, s) => n + s.items.length, 0);
}

/**
 * Filter sections by bucket. Returns the same shape but with each section's
 * items narrowed to those whose buckets array contains the chip.
 * If `bucket` is null, returns the sections unchanged.
 */
export function filterSectionsByBucket(
  sections: LearningSection[],
  bucket: LearningBucket | null,
): LearningSection[] {
  if (!bucket) return sections;
  return sections.map((s) => ({
    ...s,
    items: s.items.filter((item) =>
      item.buckets ? item.buckets.includes(bucket) : false,
    ),
  }));
}

/**
 * Return every item across every section, paired with its origin section id.
 * Used by the global search bar to render a unified filtered grid.
 */
export function flattenSections(sections: LearningSection[]): Array<{
  sectionId: LearningSectionId;
  item: LearningItem;
}> {
  const out: Array<{ sectionId: LearningSectionId; item: LearningItem }> = [];
  for (const s of sections) {
    for (const item of s.items) {
      out.push({ sectionId: s.id, item });
    }
  }
  return out;
}
