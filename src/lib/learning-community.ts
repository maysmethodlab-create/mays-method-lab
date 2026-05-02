/**
 * Learning Community content registry.
 *
 * The Mays AI Learning Community page is organized as a role-aware,
 * job-mapped catalog. A faculty visitor or staff visitor lands on a small
 * grid of buckets (research, teaching, writing, running programs, etc.).
 * Each bucket has four tiers of content arranged by activation cost:
 *
 *   USE NOW        zero-friction apps and ready-to-use tools
 *   COPY A PROMPT  one-paste prompts (5-10 min)
 *   BUILD YOUR OWN 45-90 min agent tutorials
 *   GO DEEPER      tools, courses, and Lab pilot CTAs
 *
 * Every item below points to a flat library page already in the codebase
 * (/agents, /prompts, /tools) or to the live student-built site at
 * maysai.vercel.app while migration is still in progress. Admin Tools
 * (/admin/*) are intentionally excluded from this catalog — they live
 * behind a separate password gate and are listed only on /admin.
 */

export type LearningRole = 'faculty' | 'staff';

export type LearningItem = {
  title: string;
  description: string;
  href: string;
  /** When true the card renders as a flat dotted-frame info tile rather than a clickable card. */
  comingSoon?: boolean;
  /** Optional small meta line shown under the title (e.g. "45 min", "Beginner"). */
  meta?: string;
};

export type LearningTier = {
  /** Tier ID. Drives accent color and ordering. */
  id: 'use-now' | 'prompt' | 'build' | 'deeper';
  /** Tier label shown in the UI. Sentence-style. */
  label: string;
  /** One-line description of why this tier exists. */
  blurb: string;
  items: LearningItem[];
};

export type LearningBucket = {
  /** URL-safe slug used as the in-page anchor. */
  slug: string;
  /** Bucket name shown on the role-landed grid. */
  title: string;
  /** One-line subhead for the bucket card. */
  subhead: string;
  /** Roles that see this bucket on the role grid. */
  roles: LearningRole[];
  tiers: LearningTier[];
};

/* ---------- Shared item helpers ----------------------------------------- */

const MAYSAI = 'https://maysai.vercel.app';

const TOOL_TAMU_AI_CHAT: LearningItem = {
  title: 'TAMU AI Chat',
  description: "Texas A&M's internal multi-model chat. Zero setup, FERPA-friendly, your default starting point.",
  href: '/tools#tamu-ai-chat',
};
const TOOL_NOTEBOOK_LM: LearningItem = {
  title: 'Google NotebookLM',
  description: 'Source-grounded chat across uploaded PDFs, links, and notes. Cited answers.',
  href: '/tools#notebooklm',
};
const TOOL_GEMINI: LearningItem = {
  title: 'Google Gemini (TAMU)',
  description: 'Google\'s flagship model on your @tamu.edu account, with TAMU data protection.',
  href: '/tools#google-gemini',
};
const TOOL_COPILOT: LearningItem = {
  title: 'Microsoft Copilot',
  description: 'AI inside Word, Excel, PowerPoint, Outlook, and Teams. Already in your M365.',
  href: '/tools#microsoft-copilot',
};
const TOOL_POWER_AUTOMATE: LearningItem = {
  title: 'Microsoft Power Automate',
  description: 'Low-code workflows for forms, approvals, reminders, and Teams alerts.',
  href: '/tools#power-automate',
};
const TOOL_ZAPIER: LearningItem = {
  title: 'Zapier',
  description: 'No-code automation across business apps, forms, CRMs, and spreadsheets.',
  href: '/tools#zapier',
};

const COMING_SOON: LearningItem = {
  title: 'More coming soon',
  description: 'The Lab is piloting new tools in this category. Email the Lab to nominate one or join a pilot.',
  href: '#',
  comingSoon: true,
};

const LAB_PILOT_CTA: LearningItem = {
  title: 'Pilot a custom tool with the Lab',
  description: 'No app yet for this work. Email the Lab if you want to scope a pilot for your unit.',
  href: 'mailto:ssridhar@mays.tamu.edu?subject=Mays%20Method%20Lab%20pilot%20request',
  comingSoon: true,
};

/* ---------- Prompts (link out to the flat /prompts library + maysai) ---- */

const PROMPT = (slug: string, title: string, description: string): LearningItem => ({
  title,
  description,
  href: `${MAYSAI}/prompts/${slug}`,
  meta: '5 min · Copy and paste',
});

/* ---------- Agent tutorials ---------------------------------------------- */

const TUTORIAL = (
  slug: string,
  title: string,
  description: string,
  meta: string,
): LearningItem => ({
  title,
  description,
  href: `${MAYSAI}/agents/${slug}`,
  meta,
});

/* =============================================================
   BUCKETS
   ============================================================= */

export const BUCKETS: LearningBucket[] = [
  /* ---------- RESEARCH (faculty) ---------- */
  {
    slug: 'research',
    title: 'Research',
    subhead:
      'Manuscript writing, lit reviews, methodology, IRB, figures, data, and coding workflows for active researchers.',
    roles: ['faculty'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Apps you can open today. No setup.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'For lit-review search, draft polishing, and quick code questions. The fastest research starting point.',
          },
          LAB_PILOT_CTA,
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Paste-ready prompts for the most common research moves.',
        items: [
          PROMPT(
            'literature-review-summary',
            'Summarize research sources',
            'Synthesize a stack of papers and surface themes, conflicts, and gaps.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: '45 to 90 minute tutorials. End up with a tool you keep using.',
        items: [
          TUTORIAL(
            'chatbot-own-documents',
            'Chatbot over your documents',
            'Ask cited questions across your own PDFs and notes in NotebookLM.',
            '45 min · Beginner',
          ),
          TUTORIAL(
            'personal-knowledge-base-search',
            'Personal knowledge base search',
            'Build a small, searchable index of your notes, links, and snippets.',
            '60 min · Intermediate',
          ),
          TUTORIAL(
            'research-paper-tracker',
            'Research paper tracker',
            'Tag, summarize, and track your reading queue with AI.',
            '50 min · Intermediate',
          ),
          TUTORIAL(
            'rag-app-uploaded-pdfs',
            'Simple RAG app over PDFs',
            'A small retrieval-augmented app that answers grounded questions over PDFs.',
            '75 min · Intermediate',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Tools and resources for power users.',
        items: [
          TOOL_TAMU_AI_CHAT,
          TOOL_NOTEBOOK_LM,
          TOOL_GEMINI,
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools, with compliance notes.',
            href: '/tools',
          },
        ],
      },
    ],
  },

  /* ---------- TEACHING (faculty) ---------- */
  {
    slug: 'teaching',
    title: 'Teaching',
    subhead:
      'Course design, syllabus, case building, assessment, feedback, and student-facing assistants.',
    roles: ['faculty'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Apps you can open today. No setup.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'For case writing, draft polishing, exam item generation, and grading rubrics.',
          },
          LAB_PILOT_CTA,
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Paste-ready prompts for course design and assessment.',
        items: [
          PROMPT(
            'syllabus-builder',
            'Build a course syllabus',
            'A structured first draft from your course goals.',
          ),
          PROMPT(
            'learning-objectives',
            'Write learning objectives',
            'Measurable, Bloom-aligned objectives for any topic or module.',
          ),
          PROMPT(
            'rubric-generator',
            'Create an assignment rubric',
            'A grading rubric with clear criteria and performance levels.',
          ),
          PROMPT(
            'exam-prep-questions',
            'Generate practice exam questions',
            'Practice questions from your course material.',
          ),
          PROMPT(
            'study-guide-creator',
            'Create a student study guide',
            'A structured review sheet from your lecture notes.',
          ),
          PROMPT(
            'assignment-help',
            'Explain an assignment prompt',
            'Break a confusing assignment prompt into clear requirements.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: '45 to 90 minute tutorials. End up with a tool you keep using.',
        items: [
          TUTORIAL(
            'faculty-guidelines-chatbot',
            'Faculty guidelines chatbot',
            'NotebookLM assistant with cited answers from approved guidelines.',
            '75 min · Beginner',
          ),
          TUTORIAL(
            'student-facing-syllabus-chatbot',
            'Student-facing syllabus chatbot',
            'Student Q&A in TAMU AI Chat from an approved syllabus.',
            '90 min · Intermediate',
          ),
          TUTORIAL(
            'create-and-share-tamu-ai-chatbot',
            'Create and share a TAMU AI chatbot',
            'Custom TAMU AI chatbot from your own sources, shareable via Entra group.',
            '75 min · Intermediate',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Tools and resources for power users.',
        items: [
          TOOL_NOTEBOOK_LM,
          TOOL_TAMU_AI_CHAT,
          TOOL_COPILOT,
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools, with compliance notes.',
            href: '/tools',
          },
        ],
      },
    ],
  },

  /* ---------- WRITING (faculty + staff shared) ---------- */
  {
    slug: 'writing',
    title: 'Writing',
    subhead:
      'Letters, emails, recommendations, reports, donor stewardship, announcements. The recurring writing of academic life.',
    roles: ['faculty', 'staff'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Apps you can open today. No setup.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'For drafting letters, emails, reports, and recommendations. The fastest place to start.',
          },
          LAB_PILOT_CTA,
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Paste-ready prompts for writing you do every week.',
        items: [
          PROMPT(
            'announcement-writer',
            'Draft an announcement',
            'A short update for a department, college, or campus audience.',
          ),
          PROMPT(
            'report-draft',
            'Draft a status report',
            'Turn rough notes into a structured report for leadership or committees.',
          ),
          PROMPT(
            'resume-bullet-points',
            'Strengthen resume bullets',
            'Rewrite weak bullets with action verbs and measurable results.',
          ),
          PROMPT(
            'meeting-notes-summary',
            'Summarize meeting notes',
            'Turn raw notes into a clean summary with decisions and next steps.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: 'Build a writing assistant you can reuse.',
        items: [
          TUTORIAL(
            'recommendation-letter-agent',
            'Recommendation letter agent',
            'Collect a candidate\'s evidence and draft a reviewable letter.',
            '50 min · Beginner',
          ),
          TUTORIAL(
            'meeting-notes-action-items',
            'Meeting notes to action items',
            'Paste-and-review workflow for owners, deadlines, and next steps.',
            '20 min · Beginner',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Tools and resources for power users.',
        items: [
          TOOL_TAMU_AI_CHAT,
          TOOL_COPILOT,
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools, with compliance notes.',
            href: '/tools',
          },
        ],
      },
    ],
  },

  /* ---------- RUNNING PROGRAMS (staff) ---------- */
  {
    slug: 'running-programs',
    title: 'Running programs',
    subhead:
      'Program coordinators, degree directors, ops managers. Schedule, recruit, market, run events.',
    roles: ['staff'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Apps to open today.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'For announcement drafting, recruiter outreach, and event copy. Your default writing surface.',
          },
          LAB_PILOT_CTA,
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Paste-ready prompts for program ops.',
        items: [
          PROMPT(
            'announcement-writer',
            'Draft an announcement',
            'A short update for your program audience: prospects, current students, alumni.',
          ),
          PROMPT(
            'meeting-notes-summary',
            'Summarize meeting notes',
            'Turn raw notes into decisions, owners, and next steps.',
          ),
          PROMPT(
            'report-draft',
            'Draft a status report',
            'Turn rough notes into a structured report for leadership.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: 'Lightweight automations a program manager can build in an afternoon.',
        items: [
          TUTORIAL(
            'meeting-notes-action-items',
            'Meeting notes to action items',
            'Paste-and-review workflow for owners and deadlines.',
            '20 min · Beginner',
          ),
          TUTORIAL(
            'spreadsheet-analysis-agent',
            'Spreadsheet analysis agent',
            'Plain-language questions over enrollment, registration, and event CSVs.',
            '45 min · Beginner',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Workflow automation across forms, approvals, and email.',
        items: [
          TOOL_POWER_AUTOMATE,
          TOOL_ZAPIER,
          TOOL_TAMU_AI_CHAT,
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools.',
            href: '/tools',
          },
        ],
      },
    ],
  },

  /* ---------- SUPPORTING FACULTY & DEPARTMENTS (staff) ---------- */
  {
    slug: 'supporting-faculty',
    title: 'Supporting faculty and departments',
    subhead:
      'Admin coordinators, exec assistants, business administrators. Paperwork, scheduling, reimbursements, faculty support.',
    roles: ['staff'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Apps you can open today. No setup.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'Default chat surface for emails, drafts, and quick lookups across faculty support work.',
          },
          LAB_PILOT_CTA,
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Paste-ready prompts for faculty and department support.',
        items: [
          PROMPT(
            'report-draft',
            'Draft a status report',
            'Turn rough notes into a structured report for the department head or dean.',
          ),
          PROMPT(
            'resume-bullet-points',
            'Strengthen resume bullets',
            'For faculty CVs, staff resumes, or recommendation drafts.',
          ),
          PROMPT(
            'meeting-notes-summary',
            'Summarize meeting notes',
            'Decisions, owners, and next steps from raw notes.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: 'Lightweight assistants for the recurring admin work.',
        items: [
          TUTORIAL(
            'spreadsheet-analysis-agent',
            'Spreadsheet analysis agent',
            'Plain-language questions over budgets, rosters, and approvals.',
            '45 min · Beginner',
          ),
          TUTORIAL(
            'meeting-notes-action-items',
            'Meeting notes to action items',
            'Paste-and-review workflow for committee meetings and faculty searches.',
            '20 min · Beginner',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Tools that integrate with M365 and Workday.',
        items: [
          TOOL_COPILOT,
          TOOL_POWER_AUTOMATE,
          TOOL_TAMU_AI_CHAT,
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools.',
            href: '/tools',
          },
        ],
      },
    ],
  },

  /* ---------- ADVISING STUDENTS (staff) ---------- */
  {
    slug: 'advising-students',
    title: 'Advising students',
    subhead:
      'Academic advisors and student services. 1:1 student support, course recommendations, escalations.',
    roles: ['staff'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Apps for advising work today.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'For drafting student emails, summarizing degree-plan policies, and explaining decisions.',
          },
          LAB_PILOT_CTA,
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Paste-ready prompts for student-facing work.',
        items: [
          PROMPT(
            'assignment-help',
            'Explain an assignment prompt',
            'Help a student decode a confusing prompt into a clear plan.',
          ),
          PROMPT(
            'study-guide-creator',
            'Create a study guide',
            'Build a focused review sheet for a struggling advisee.',
          ),
          PROMPT(
            'learning-objectives',
            'Write learning objectives',
            'For workshops, transition programs, or academic recovery plans.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: 'Build an assistant your advising team can share.',
        items: [
          TUTORIAL(
            'faculty-guidelines-chatbot',
            'Advising-policy chatbot',
            'Adapt the faculty-guidelines tutorial: cited answers from your degree-plan policies.',
            '75 min · Beginner',
          ),
          TUTORIAL(
            'chatbot-own-documents',
            'Chatbot over advising documents',
            'NotebookLM Q&A over your advising playbook, checklists, and FAQ.',
            '45 min · Beginner',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Tools and resources for advising teams.',
        items: [
          TOOL_TAMU_AI_CHAT,
          TOOL_NOTEBOOK_LM,
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools.',
            href: '/tools',
          },
        ],
      },
    ],
  },

  /* ---------- LEARNING AI (faculty + staff) ---------- */
  {
    slug: 'learning-ai',
    title: 'Learning AI',
    subhead:
      'The on-ramp. Just want to get better at using AI in your daily work? Start here.',
    roles: ['faculty', 'staff'],
    tiers: [
      {
        id: 'use-now',
        label: 'Use now',
        blurb: 'Open one tab. Start asking questions. No tutorial required.',
        items: [
          {
            ...TOOL_TAMU_AI_CHAT,
            description:
              'The single best place to start. TAMU-protected, multi-model, free with your NetID.',
          },
          {
            title: 'Mays AI quick-start guide',
            description: 'A short read on how to get more out of every AI tool you use at Mays.',
            href: `${MAYSAI}/guide`,
          },
        ],
      },
      {
        id: 'prompt',
        label: 'Copy a prompt',
        blurb: 'Browse the prompt library. Pick one. Paste it.',
        items: [
          {
            title: 'Browse all prompts',
            description: 'The full library of paste-ready prompts for teaching, writing, research, and admin.',
            href: '/prompts',
          },
          PROMPT(
            'meeting-notes-summary',
            'Summarize meeting notes',
            'A great first prompt to try. Five seconds to feel the win.',
          ),
        ],
      },
      {
        id: 'build',
        label: 'Build your own',
        blurb: 'Pick a tutorial that matches your work. End up with a tool.',
        items: [
          {
            title: 'Browse all agent tutorials',
            description: 'Nine step-by-step builds, from a 20-minute meeting-notes agent to a 90-minute syllabus chatbot.',
            href: '/agents',
          },
          TUTORIAL(
            'meeting-notes-action-items',
            'Start here: meeting notes agent',
            'The shortest tutorial. Twenty minutes. Real result.',
            '20 min · Beginner',
          ),
        ],
      },
      {
        id: 'deeper',
        label: 'Go deeper',
        blurb: 'Resources for learning AI at depth.',
        items: [
          {
            title: 'Mays AI guide',
            description: 'A concise guide to the AI tools available at Mays and which workflows to try first.',
            href: `${MAYSAI}/guide`,
          },
          {
            title: 'Student AI tool guide',
            description: 'Useful for faculty and staff too. A practical guide for choosing between tools.',
            href: `${MAYSAI}/resources/student-ai-tools`,
          },
          {
            title: 'Browse all approved AI tools',
            description: 'The full catalog of TAMU-approved AI tools.',
            href: '/tools',
          },
        ],
      },
    ],
  },
];

/* ---------- Helpers used by the page component -------------------------- */

export function bucketsForRole(role: LearningRole): LearningBucket[] {
  return BUCKETS.filter((b) => b.roles.includes(role));
}

export function bucketStats(bucket: LearningBucket): {
  apps: number;
  prompts: number;
  tutorials: number;
} {
  let apps = 0;
  let prompts = 0;
  let tutorials = 0;
  for (const tier of bucket.tiers) {
    for (const item of tier.items) {
      if (item.comingSoon) continue;
      if (tier.id === 'use-now') apps += 1;
      else if (tier.id === 'prompt') prompts += 1;
      else if (tier.id === 'build') tutorials += 1;
    }
  }
  return { apps, prompts, tutorials };
}
