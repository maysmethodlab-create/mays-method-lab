import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'AI Learning Community | Mays Method Lab',
  description:
    'A catalog of step-by-step AI agents, prompts, and resources for the Mays Business School community.',
};

type AgentCard = {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate';
  time: string;
};

type AgentSection = {
  title: string;
  blurb: string;
  agents: AgentCard[];
};

const AGENT_SECTIONS: AgentSection[] = [
  {
    title: 'Chatbots and Q&A assistants',
    blurb:
      'Custom chatbots that answer questions from approved sources: syllabi, faculty guidelines, your own documents.',
    agents: [
      {
        title: 'Create and Share a TAMU AI Chatbot',
        description: 'Custom TAMU AI chatbot from your own sources.',
        difficulty: 'Intermediate',
        time: '75 min',
      },
      {
        title: 'Student-Facing Syllabus Chatbot',
        description: 'Student Q&A in TAMU AI Chat from an approved syllabus.',
        difficulty: 'Intermediate',
        time: '90 min',
      },
      {
        title: 'Faculty Guidelines Chatbot',
        description: 'NotebookLM assistant with cited answers from approved guidelines.',
        difficulty: 'Beginner',
        time: '75 min',
      },
    ],
  },
  {
    title: 'Drafting and productivity agents',
    blurb:
      'Agents that turn raw inputs (a resume, a CSV, a stack of meeting notes) into the next deliverable.',
    agents: [
      {
        title: 'Recommendation Letter Agent',
        description: 'Draft letters from a resume and your notes.',
        difficulty: 'Beginner',
        time: '50 min',
      },
      {
        title: 'Spreadsheet Analysis Agent',
        description: 'Ask plain-English questions of any CSV.',
        difficulty: 'Beginner',
        time: '45 min',
      },
      {
        title: 'Meeting Notes → Action Items',
        description: 'Turn meeting notes into action items.',
        difficulty: 'Beginner',
        time: '20 min',
      },
    ],
  },
  {
    title: 'Document and knowledge agents',
    blurb:
      'Search and organize your own corpus (papers, notes, bookmarks) and ask cited questions of it.',
    agents: [
      {
        title: 'Chatbot Over Your Documents',
        description: 'Ask cited questions in NotebookLM from your own documents.',
        difficulty: 'Beginner',
        time: '45 min',
      },
      {
        title: 'Personal Knowledge Base Search',
        description: 'Search your notes, papers, and bookmarks.',
        difficulty: 'Intermediate',
        time: '60 min',
      },
      {
        title: 'Research Paper Tracker',
        description: 'Organize papers and your reading queue.',
        difficulty: 'Intermediate',
        time: '50 min',
      },
    ],
  },
];

type PromptCard = {
  title: string;
  description: string;
  category: string;
  audience: string;
};

type PromptSection = {
  title: string;
  blurb: string;
  prompts: PromptCard[];
};

const PROMPT_SECTIONS: PromptSection[] = [
  {
    title: 'Everyday starting points',
    blurb: 'The prompts faculty and staff reach for first.',
    prompts: [
      {
        title: 'Build a rubric',
        description: 'A clear rubric with criteria and examples.',
        category: 'Teaching',
        audience: 'Faculty',
      },
      {
        title: 'Summarize meeting notes',
        description: 'Turn raw notes into decisions and owners.',
        category: 'Admin',
        audience: 'Staff + Faculty',
      },
      {
        title: 'Draft an announcement',
        description: 'A short update for a department, class, or campus audience.',
        category: 'Writing',
        audience: 'Staff + Faculty',
      },
    ],
  },
  {
    title: 'Teaching and assessment',
    blurb: 'Course design and assessment prompts.',
    prompts: [
      {
        title: 'Build a course syllabus',
        description: 'A structured first draft from your goals.',
        category: 'Teaching',
        audience: 'Faculty',
      },
      {
        title: 'Write learning objectives',
        description: 'Measurable goals aligned to your course topic.',
        category: 'Teaching',
        audience: 'Faculty',
      },
    ],
  },
  {
    title: 'Student support',
    blurb: 'Prompts students can use directly.',
    prompts: [
      {
        title: 'Draft a study guide',
        description: 'A focused review sheet from your notes.',
        category: 'Student success',
        audience: 'Students',
      },
      {
        title: 'Prep for an exam',
        description: 'Practice questions and a focused review plan.',
        category: 'Student success',
        audience: 'Students',
      },
    ],
  },
  {
    title: 'Research and admin',
    blurb: 'Prompts for the recurring research and admin work.',
    prompts: [
      {
        title: 'Summarize a research paper',
        description: 'Key claims, methods, and limits in one paragraph.',
        category: 'Research',
        audience: 'Faculty + Students',
      },
      {
        title: 'Draft a status report',
        description: 'Turn rough notes into a structured report.',
        category: 'Admin',
        audience: 'Staff',
      },
    ],
  },
];

type ResourceCard = {
  title: string;
  description: string;
  kind: string;
  meta: string;
};

const RESOURCE_GUIDES: ResourceCard[] = [
  {
    title: 'Quick start guide',
    description: 'A high-level map of Mays AI tools and starter workflows.',
    kind: 'Guide',
    meta: '1 min read',
  },
  {
    title: 'Write better AI inputs',
    description: 'What to include when a prompt field feels vague.',
    kind: 'Guide',
    meta: '2 min read',
  },
  {
    title: 'Student AI Tool Guide',
    description: 'What to use for studying, research, writing, and coding.',
    kind: 'Guide',
    meta: 'Students',
  },
  {
    title: 'Review AI output',
    description: 'A quick check before you send or submit a draft.',
    kind: 'Guide',
    meta: '1 min read',
  },
];

const RESOURCE_TOOLS: ResourceCard[] = [
  {
    title: 'Choose a safe AI tool',
    description: 'Pick the right TAMU-approved tool.',
    kind: 'Tools',
    meta: 'Selector',
  },
  {
    title: 'TAMU AI Chat',
    description: "TAMU's internal multi-model AI chat.",
    kind: 'Tool',
    meta: 'Internal',
  },
  {
    title: 'Power Automate for Mays',
    description:
      'Mays-friendly use cases for forms, approvals, reminders, and Teams alerts.',
    kind: 'Tool',
    meta: 'Mays / TAMU M365',
  },
  {
    title: 'Google Gemini',
    description: "Google's flagship model in TAMU Workspace.",
    kind: 'Tool',
    meta: 'TAMU Workspace',
  },
];

export default function LearningCommunityPage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <div className="eyebrow-lg">AI Learning Community</div>
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-maroon-muted border border-maroon-muted px-2 py-1">
              Migration in progress
            </span>
          </div>
          <h1 className="mb-6 max-w-3xl">
            Practical AI agents, prompts, and tools for the Mays community.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mb-4">
            The AI Learning Community is the heart of the Mays Method Lab today. Faculty, staff,
            and students learn by building. Three categories of step-by-step agent guides, a
            growing prompt library, and a curated set of TAMU-approved AI tools.
          </p>
          <p className="text-[15px] text-ink-secondary leading-relaxed max-w-3xl">
            Built by our AI Student Fellows. The current preview lives at{' '}
            <a
              href="https://maysai.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-maroon hover:text-maroon-deep"
            >
              maysai.vercel.app <span aria-hidden="true">&rarr;</span>
            </a>
            . The codebase is being migrated into the Lab platform; once it lands here, every
            agent, prompt, and tool below will be a clickable, runnable resource alongside the
            Admin Tools.
          </p>
        </div>
      </ScrollReveal>

      {/* AGENTS */}
      <div className="mb-16">
        <ScrollReveal>
          <div className="heading-rule mb-4">
            <h2 className="text-center mx-auto">Agents</h2>
          </div>
          <p className="text-[16px] text-ink-secondary text-center max-w-3xl mx-auto mb-10">
            Step-by-step guides for building practical AI agents.
          </p>
        </ScrollReveal>
        <div className="space-y-12">
          {AGENT_SECTIONS.map((section) => (
            <ScrollReveal key={section.title}>
              <SectionGroup title={section.title} blurb={section.blurb}>
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {section.agents.map((agent) => (
                    <AgentCardView key={agent.title} agent={agent} />
                  ))}
                </div>
              </SectionGroup>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* PROMPTS */}
      <div className="mb-16">
        <ScrollReveal>
          <div className="heading-rule mb-4">
            <h2 className="text-center mx-auto">Prompts</h2>
          </div>
          <p className="text-[16px] text-ink-secondary text-center max-w-3xl mx-auto mb-10">
            A growing library of starting-point prompts for teaching, writing, research, and admin work.
          </p>
        </ScrollReveal>
        <div className="space-y-12">
          {PROMPT_SECTIONS.map((section) => (
            <ScrollReveal key={section.title}>
              <SectionGroup title={section.title} blurb={section.blurb}>
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {section.prompts.map((prompt) => (
                    <PromptCardView key={prompt.title} prompt={prompt} />
                  ))}
                </div>
              </SectionGroup>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* RESOURCES */}
      <div>
        <ScrollReveal>
          <div className="heading-rule mb-4">
            <h2 className="text-center mx-auto">Resources</h2>
          </div>
          <p className="text-[16px] text-ink-secondary text-center max-w-3xl mx-auto mb-10">
            Guides for using AI well at Mays, and a curated set of TAMU-approved AI tools.
          </p>
        </ScrollReveal>
        <ScrollReveal>
          <SectionGroup
            title="Guides for using AI at Mays"
            blurb="Short reads on how to get more out of every AI tool you use here."
          >
            <div className="grid md:grid-cols-4 gap-6">
              {RESOURCE_GUIDES.map((r) => (
                <ResourceCardView key={r.title} item={r} />
              ))}
            </div>
          </SectionGroup>
        </ScrollReveal>
        <ScrollReveal>
          <SectionGroup
            title="AI tools available at Mays"
            blurb="Pick the TAMU-approved tool that fits the work."
          >
            <div className="grid md:grid-cols-4 gap-6">
              {RESOURCE_TOOLS.map((r) => (
                <ResourceCardView key={r.title} item={r} />
              ))}
            </div>
          </SectionGroup>
        </ScrollReveal>
      </div>
    </section>
  );
}

function SectionGroup({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h3 className="font-headline text-[22px] font-semibold text-maroon mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-[14px] text-ink-secondary mb-6">{blurb}</p>
      {children}
    </div>
  );
}

function AgentCardView({ agent }: { agent: AgentCard }) {
  const isBeginner = agent.difficulty === 'Beginner';
  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[11px]">Agent</span>
        <span
          className={`text-[10px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border ${
            isBeginner
              ? 'text-ink-muted border-line bg-bg-subtle'
              : 'text-maroon-muted border-maroon-muted/40 bg-white'
          }`}
        >
          {agent.difficulty} · {agent.time}
        </span>
      </div>
      <h3 className="font-headline text-[22px] font-semibold text-maroon mb-3 leading-tight">
        {agent.title}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed flex-1 mb-4">
        {agent.description}
      </p>
      <div className="text-[12px] uppercase tracking-[0.05em] font-semibold text-ink-muted">
        Coming Soon to the Lab
      </div>
    </div>
  );
}

function PromptCardView({ prompt }: { prompt: PromptCard }) {
  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[11px]">{prompt.category}</span>
        <span className="text-[10px] tracking-[0.05em] uppercase text-ink-muted font-semibold">
          {prompt.audience}
        </span>
      </div>
      <h3 className="font-headline text-[22px] font-semibold text-maroon mb-3 leading-tight">
        {prompt.title}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">
        {prompt.description}
      </p>
    </div>
  );
}

function ResourceCardView({ item }: { item: ResourceCard }) {
  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[11px]">{item.kind}</span>
        <span className="text-[10px] tracking-[0.05em] uppercase text-ink-muted font-semibold">
          {item.meta}
        </span>
      </div>
      <h3 className="font-headline text-[20px] font-semibold text-maroon mb-3 leading-tight">
        {item.title}
      </h3>
      <p className="text-[14px] text-ink-secondary leading-relaxed flex-1">
        {item.description}
      </p>
    </div>
  );
}
