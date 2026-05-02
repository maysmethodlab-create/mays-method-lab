/**
 * Your AI Edge — content registry.
 *
 * The /learning-community page is a hub with four sections in this order:
 *
 *   1. Prompts    — curated paste-ready prompts, "Browse all" links to /prompts
 *   2. Apps       — Lab-built apps for the role. Includes coming-soon cards
 *                   for the Stage 2 apps (Recommendation Letter Helper,
 *                   Announcement Composer)
 *   3. Tutorials  — curated step-by-step builds, "Browse all" links to /agents
 *   4. Resources  — Mays AI courses + DeepLearning.AI / Anthropic Academy,
 *                   "Browse all" links to /resources
 *
 * The Evaluation Letter Writer does NOT appear here. It lives at
 * /admin/evaluation-letters and is surfaced from Apps for Administrators.
 *
 * Curate ruthlessly. Each card on this page must earn its place.
 */

export type LearningRole = 'faculty' | 'staff';

export type LearningItem = {
  title: string;
  description: string;
  href: string;
  /** When true the card renders as a flat dotted-frame info tile rather than a clickable card. */
  comingSoon?: boolean;
  /** Optional small meta line shown under the title (e.g. "Lab app", "Approved tool"). */
  meta?: string;
};

export type LearningSectionId = 'prompts' | 'apps' | 'tutorials' | 'resources';

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
};

const PROMPT_MEETING_NOTES: LearningItem = {
  title: 'Summarize meeting notes',
  description:
    'Raw notes to a one-paragraph summary, decisions, and an action-item table.',
  href: '/prompts/meeting-notes-summary',
  meta: 'Prompt',
};

const PROMPT_REPORT_DRAFT: LearningItem = {
  title: 'Draft a status report',
  description:
    'A reviewable one-page report for the dean. Executive summary, shipped, at risk, asks.',
  href: '/prompts/report-draft',
  meta: 'Prompt',
};

const PROMPT_RESUME_BULLETS: LearningItem = {
  title: 'Strengthen resume bullets',
  description:
    'Tighter, more concrete bullets with verbs and numbers. For staff and student work alike.',
  href: '/prompts/resume-bullet-points',
  meta: 'Prompt',
};

const PROMPT_LIT_REVIEW: LearningItem = {
  title: 'Summarize research sources',
  description:
    'Twelve papers in. A position-mapped table out. The setup work, not the thinking.',
  href: '/prompts/literature-review-summary',
  meta: 'Prompt',
};

const PROMPT_EXAM_QUESTIONS: LearningItem = {
  title: 'Generate practice exam questions',
  description:
    'Thirty practice questions across three difficulty levels from one syllabus.',
  href: '/prompts/exam-prep-questions',
  meta: 'Prompt',
};

const PROMPT_RUBRIC: LearningItem = {
  title: 'Create an assignment rubric',
  description:
    'A clear four-criterion rubric with descriptors at three performance levels.',
  href: '/prompts/rubric-generator',
  meta: 'Prompt',
};

const PROMPT_RECRUITER_OUTREACH: LearningItem = {
  title: 'Recruiter outreach email',
  description:
    'A warm, specific email to a recruiter. The one you send every February.',
  href: '/prompts/recruiter-outreach',
  meta: 'Prompt',
};

/* =============================================================
   APPS — Lab-built apps. Stage 2 apps are placeholders today.
   The Evaluation Letter Writer is intentionally NOT here; it
   lives under Apps for Administrators.
   ============================================================= */

const APP_REC_LETTER_HELPER: LearningItem = {
  title: 'Recommendation Letter Helper',
  description:
    'A polished student recommendation letter from a CV, the role they are applying for, and three short anecdotes. Built by the Lab. Live this weekend.',
  href: '#',
  comingSoon: true,
  meta: 'Lab app',
};

const APP_FACULTY_NOMINATE: LearningItem = {
  title: 'More faculty apps coming.',
  description:
    'Email the Lab to nominate one. We pair with a faculty member for an hour and ship a working draft.',
  href: '#',
  comingSoon: true,
  meta: 'Open call',
};

const APP_ANNOUNCEMENT_COMPOSER: LearningItem = {
  title: 'Announcement Composer',
  description:
    'Three bullets in. A polished program update out. Built by the Lab. Live this weekend.',
  href: '#',
  comingSoon: true,
  meta: 'Lab app',
};

const APP_STAFF_NOMINATE: LearningItem = {
  title: 'More staff apps coming.',
  description:
    'Email the Lab to nominate one. We pair with a coordinator for an hour and ship a working draft.',
  href: '#',
  comingSoon: true,
  meta: 'Open call',
};

/* =============================================================
   TUTORIALS — curated 3 to 4 builds per role.
   Hrefs deep-link into /agents (the tutorials index).
   ============================================================= */

const TUTORIAL_NOTEBOOK_LM_DOCS: LearningItem = {
  title: 'Chatbot over your documents',
  description:
    'Use NotebookLM to ask cited questions across your own approved documents.',
  href: '/agents#chatbot-own-documents',
  meta: '45 min · Beginner',
};

const TUTORIAL_REC_LETTER_AGENT: LearningItem = {
  title: 'Recommendation letter agent',
  description:
    "Collect a candidate's evidence and draft a reviewable recommendation letter.",
  href: '/agents#recommendation-letter-agent',
  meta: '50 min · Beginner',
};

const TUTORIAL_PAPER_TRACKER: LearningItem = {
  title: 'Research paper tracker',
  description:
    'Lightweight app for tracking papers, reading status, tags, notes, and summaries.',
  href: '/agents#research-paper-tracker',
  meta: '50 min · Intermediate',
};

const TUTORIAL_TAMU_AI_CHATBOT: LearningItem = {
  title: 'Create and share a TAMU AI chatbot',
  description:
    'TAMU AI Chat knowledge collection, custom model, and Microsoft Entra group.',
  href: '/agents#create-and-share-tamu-ai-chatbot',
  meta: '75 min · Intermediate',
};

const TUTORIAL_MEETING_NOTES: LearningItem = {
  title: 'Meeting notes to action items',
  description:
    'Paste-and-review workflow: rough notes to owners, deadlines, and next steps.',
  href: '/agents#meeting-notes-action-items',
  meta: '20 min · Beginner',
};

const TUTORIAL_SPREADSHEET: LearningItem = {
  title: 'Spreadsheet analysis agent',
  description:
    'Plain-language prompts in Excel Copilot or Gemini to clean, summarize, and explain.',
  href: '/agents#spreadsheet-analysis-agent',
  meta: '45 min · Beginner',
};

const TUTORIAL_FACULTY_GUIDELINES: LearningItem = {
  title: 'Faculty guidelines chatbot',
  description:
    'NotebookLM assistant with cited answers from approved guidelines.',
  href: '/agents#faculty-guidelines-chatbot',
  meta: '75 min · Beginner',
};

/* =============================================================
   RESOURCES — Mays AI courses (placeholder for now),
   DeepLearning.AI, Anthropic Academy. "Browse all" tails to /resources.
   ============================================================= */

const RESOURCE_MAYS_QUICK_START: LearningItem = {
  title: 'Mays AI quick-start guide',
  description:
    'A short read on how to get more out of every AI tool you use at Mays. Start here on visit one.',
  href: 'https://maysai.vercel.app/guide',
  meta: 'Guide',
};

const RESOURCE_MAYS_COURSES: LearningItem = {
  title: 'Mays AI courses',
  description:
    'Short, role-specific courses built by the Lab. First two land this fall.',
  href: '#',
  comingSoon: true,
  meta: 'Course',
};

const RESOURCE_ANTHROPIC: LearningItem = {
  title: 'Anthropic Academy',
  description:
    'Free courses from Anthropic on prompt engineering, agent design, and Claude in production.',
  href: 'https://www.anthropic.com/learn',
  meta: 'External course',
};

const RESOURCE_DEEPLEARNING: LearningItem = {
  title: 'DeepLearning.AI short courses',
  description:
    'Two-hour courses on RAG, agents, and prompt engineering for non-engineers.',
  href: 'https://www.deeplearning.ai/short-courses/',
  meta: 'External course',
};

/* =============================================================
   SECTION ASSEMBLY — per role.
   ============================================================= */

const FACULTY_SECTIONS: LearningSection[] = [
  {
    id: 'prompts',
    title: 'Ready-to-use prompts',
    blurb:
      'Open one. Copy. Paste into TAMU AI Chat. Ship the work.',
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
    id: 'apps',
    title: 'Ready-to-use apps',
    blurb:
      'Lab-built apps for the work that comes up every semester.',
    items: [APP_REC_LETTER_HELPER, APP_FACULTY_NOMINATE],
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    blurb:
      'Twenty to ninety minute builds. Pair with a student fellow if you want a hand.',
    items: [
      TUTORIAL_NOTEBOOK_LM_DOCS,
      TUTORIAL_REC_LETTER_AGENT,
      TUTORIAL_PAPER_TRACKER,
      TUTORIAL_TAMU_AI_CHATBOT,
    ],
    browseHref: '/agents',
    browseLabel: 'Browse all tutorials',
  },
  {
    id: 'resources',
    title: 'Resources and keep learning',
    blurb:
      'Longer reads worth your weekend. Mays-built and best of what is outside.',
    items: [
      RESOURCE_MAYS_QUICK_START,
      RESOURCE_MAYS_COURSES,
      RESOURCE_ANTHROPIC,
      RESOURCE_DEEPLEARNING,
    ],
    browseHref: '/resources',
    browseLabel: 'Browse all resources',
  },
];

const STAFF_SECTIONS: LearningSection[] = [
  {
    id: 'prompts',
    title: 'Ready-to-use prompts',
    blurb:
      'Open one. Copy. Paste into TAMU AI Chat. Ship the work.',
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
    id: 'apps',
    title: 'Ready-to-use apps',
    blurb:
      'Lab-built apps for the work coordinators and staff run every week.',
    items: [APP_ANNOUNCEMENT_COMPOSER, APP_STAFF_NOMINATE],
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    blurb:
      'Twenty to ninety minute builds. Pair with a student fellow if you want a hand.',
    items: [
      TUTORIAL_MEETING_NOTES,
      TUTORIAL_SPREADSHEET,
      TUTORIAL_FACULTY_GUIDELINES,
      TUTORIAL_NOTEBOOK_LM_DOCS,
    ],
    browseHref: '/agents',
    browseLabel: 'Browse all tutorials',
  },
  {
    id: 'resources',
    title: 'Resources and keep learning',
    blurb:
      'Longer reads worth your weekend. Mays-built and best of what is outside.',
    items: [
      RESOURCE_MAYS_QUICK_START,
      RESOURCE_MAYS_COURSES,
      RESOURCE_ANTHROPIC,
      RESOURCE_DEEPLEARNING,
    ],
    browseHref: '/resources',
    browseLabel: 'Browse all resources',
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
