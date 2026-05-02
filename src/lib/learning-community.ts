/**
 * Learning Community content registry.
 *
 * The /learning-community page is apps-only: a small, curated grid of
 * hero apps grouped by JTBD bucket (Option C taxonomy). Roughly 8 to
 * 12 items surface per role. The legacy long-tail content lives on the
 * dedicated /prompts, /agents (tutorials), /tools, and /resources
 * pages, which the LC page links to per bucket.
 *
 * Taxonomy (per docs/learning-community-jtbd.md):
 *   Faculty: Research, Teaching, Writing, Learning AI
 *   Staff:   Programs, Faculty support, Advising, Writing, Learning AI
 *
 * Each card on /learning-community must earn its place. Curate ruthlessly.
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

export type LearningBucket = {
  /** URL-safe slug used as the in-page anchor and as the hash on dedicated pages. */
  slug: string;
  /** Bucket name shown on the role-landed grid. */
  title: string;
  /** One-line subhead for the bucket. */
  subhead: string;
  /** Roles that see this bucket on the role grid. */
  roles: LearningRole[];
  /** The 2 to 3 hero apps for this bucket. Ruthlessly curated. */
  items: LearningItem[];
};

export type EditorialHighlight = {
  /** Eyebrow shown above the headline. */
  eyebrow: string;
  /** The headline. Sentence case. Confident. */
  headline: string;
  /** One-line context. */
  blurb: string;
  /** Optional CTA label. */
  cta?: string;
  /** Optional CTA href. */
  href?: string;
};

/* =============================================================
   EDITORIAL HIGHLIGHTS — Netflix "what's hot at Mays" row.
   One per role. Refresh monthly.
   ============================================================= */

export const EDITORIAL_HIGHLIGHTS: Record<LearningRole, EditorialHighlight> = {
  faculty: {
    eyebrow: 'What faculty are using this month',
    headline: 'The Evaluation Letter Writer drafted 38 annual reviews in May.',
    blurb:
      'Department heads upload a self-evaluation packet and get a reviewable first draft in minutes. Built by the Lab, behind the Mays sign-in.',
    cta: 'Open the Letter Writer',
    href: '/admin/evaluation-letters',
  },
  staff: {
    eyebrow: 'What staff shipped this month',
    headline: 'Program coordinators are running TAMU AI Chat for announcement drafts.',
    blurb:
      'A 30-second prompt turns three bullets into a polished program update. Compliant with TAMU data rules, and the fastest writing surface on campus.',
    cta: 'Open TAMU AI Chat',
    href: '/tools#tamu-ai-chat',
  },
};

/* =============================================================
   Hero apps. Curated. ~10 per role across all buckets.
   Each item is a single best-in-class entry point for that job.
   ============================================================= */

const APP_TAMU_AI_CHAT_RESEARCH: LearningItem = {
  title: 'TAMU AI Chat',
  description:
    'Lit-review search, draft polishing, code questions. The fastest research starting point on campus.',
  href: '/tools#tamu-ai-chat',
  meta: 'Approved tool',
};

const APP_NOTEBOOK_LM: LearningItem = {
  title: 'Google NotebookLM',
  description:
    'Source-grounded chat across uploaded papers. Cited answers, no hallucinated quotes.',
  href: '/tools#notebooklm',
  meta: 'Approved tool',
};

const APP_TAMU_AI_CHAT_TEACHING: LearningItem = {
  title: 'TAMU AI Chat',
  description:
    'Case writing, exam item generation, syllabus drafts. Multi-model, FERPA-friendly.',
  href: '/tools#tamu-ai-chat',
  meta: 'Approved tool',
};

const APP_COPILOT: LearningItem = {
  title: 'Microsoft Copilot',
  description:
    'AI inside Word, Excel, PowerPoint, Outlook, and Teams. In-place help on what you are already writing.',
  href: '/tools#microsoft-copilot',
  meta: 'Approved tool',
};

const APP_EVAL_LETTER_WRITER_FACULTY: LearningItem = {
  title: 'Evaluation Letter Writer',
  description:
    'Drop in a self-evaluation packet, get a reviewable annual letter draft. Built by the Lab for department heads.',
  href: '/admin/evaluation-letters',
  meta: 'Lab app',
};

const APP_TAMU_AI_CHAT_WRITING: LearningItem = {
  title: 'TAMU AI Chat',
  description:
    'Letters, emails, reports, recommendations. Default writing surface for the Mays community.',
  href: '/tools#tamu-ai-chat',
  meta: 'Approved tool',
};

const APP_TAMU_AI_CHAT_PROGRAMS: LearningItem = {
  title: 'TAMU AI Chat',
  description:
    'Announcements, recruiter outreach, event copy. Three bullets in, polished update out.',
  href: '/tools#tamu-ai-chat',
  meta: 'Approved tool',
};

const APP_POWER_AUTOMATE: LearningItem = {
  title: 'Microsoft Power Automate',
  description:
    'Forms, approvals, reminders, Teams alerts. Low-code workflows you build in an afternoon.',
  href: '/tools#power-automate',
  meta: 'Approved tool',
};

const APP_COPILOT_ADMIN: LearningItem = {
  title: 'Microsoft Copilot',
  description:
    'In-Outlook drafting, Excel formula help, Teams meeting summaries. Already in your M365.',
  href: '/tools#microsoft-copilot',
  meta: 'Approved tool',
};

const APP_TAMU_AI_CHAT_ADVISING: LearningItem = {
  title: 'TAMU AI Chat',
  description:
    'Student email drafts, degree-plan policy summaries, escalation talking points.',
  href: '/tools#tamu-ai-chat',
  meta: 'Approved tool',
};

const APP_NOTEBOOK_LM_ADVISING: LearningItem = {
  title: 'Google NotebookLM',
  description:
    'Cited Q&A over your advising playbook, checklists, and FAQ. Built for one team, not the whole school.',
  href: '/tools#notebooklm',
  meta: 'Approved tool',
};

const APP_QUICK_START_GUIDE: LearningItem = {
  title: 'Mays AI quick-start guide',
  description:
    'A short read on how to get more out of every AI tool you use at Mays. Start here on visit one.',
  href: '/resources#quick-start',
  meta: 'Guide',
};

const APP_BROWSE_PROMPTS: LearningItem = {
  title: 'Browse the prompt library',
  description:
    'Paste-ready prompts grouped by job. Open one, copy, paste, ship.',
  href: '/prompts',
  meta: 'Library',
};

/* =============================================================
   BUCKETS — Option C taxonomy.
   ============================================================= */

export const BUCKETS: LearningBucket[] = [
  /* ---------- RESEARCH (faculty) ---------- */
  {
    slug: 'research',
    title: 'Research',
    subhead:
      'Manuscripts, lit reviews, methods, code. Tools for active researchers.',
    roles: ['faculty'],
    items: [APP_TAMU_AI_CHAT_RESEARCH, APP_NOTEBOOK_LM],
  },

  /* ---------- TEACHING (faculty) ---------- */
  {
    slug: 'teaching',
    title: 'Teaching',
    subhead:
      'Course design, cases, assessment, feedback. Tools for the classroom.',
    roles: ['faculty'],
    items: [APP_TAMU_AI_CHAT_TEACHING, APP_COPILOT],
  },

  /* ---------- WRITING (faculty + staff shared) ---------- */
  {
    slug: 'writing',
    title: 'Writing',
    subhead:
      'Letters, emails, reports, recommendations. The writing of academic life.',
    roles: ['faculty', 'staff'],
    items: [APP_EVAL_LETTER_WRITER_FACULTY, APP_TAMU_AI_CHAT_WRITING, APP_COPILOT],
  },

  /* ---------- PROGRAMS (staff) ---------- */
  {
    slug: 'programs',
    title: 'Programs',
    subhead:
      'Announcements, recruiting, events, registration. Run a program end to end.',
    roles: ['staff'],
    items: [APP_TAMU_AI_CHAT_PROGRAMS, APP_POWER_AUTOMATE],
  },

  /* ---------- FACULTY SUPPORT (staff) ---------- */
  {
    slug: 'faculty-support',
    title: 'Faculty support',
    subhead:
      'Coordinators, EAs, business administrators. Paperwork, scheduling, briefings.',
    roles: ['staff'],
    items: [APP_COPILOT_ADMIN, APP_TAMU_AI_CHAT_WRITING],
  },

  /* ---------- ADVISING (staff) ---------- */
  {
    slug: 'advising',
    title: 'Advising',
    subhead: 'One-on-one student support, course recommendations, escalations.',
    roles: ['staff'],
    items: [APP_TAMU_AI_CHAT_ADVISING, APP_NOTEBOOK_LM_ADVISING],
  },

  /* ---------- LEARNING AI (faculty + staff shared) ---------- */
  {
    slug: 'learning-ai',
    title: 'Learning AI',
    subhead: 'Just want to get better at using AI? Start here.',
    roles: ['faculty', 'staff'],
    items: [APP_QUICK_START_GUIDE, APP_BROWSE_PROMPTS],
  },
];

/* ---------- Helpers --------------------------------------------------- */

export function bucketsForRole(role: LearningRole): LearningBucket[] {
  return BUCKETS.filter((b) => b.roles.includes(role));
}

export function appCountForRole(role: LearningRole): number {
  return bucketsForRole(role).reduce((n, b) => n + b.items.length, 0);
}
