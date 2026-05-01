import ScrollReveal from '@/components/ScrollReveal';
import AboutNav from '@/components/AboutNav';

export const metadata = {
  title: 'AI Learning Community — Mays Method Lab',
  description:
    'A catalog of step-by-step AI agent guides for the Mays Business School community.',
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

const SECTIONS: AgentSection[] = [
  {
    title: 'Chatbots and Q&A assistants',
    blurb:
      'Custom chatbots and assistants that answer questions from approved sources — syllabi, faculty guidelines, your own documents.',
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
      'Agents that turn raw inputs — a resume, a CSV, a stack of meeting notes — into the next deliverable.',
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
      'Search and organize your own corpus — papers, notes, bookmarks — and ask cited questions of it.',
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

export default function LearningCommunityPage() {
  return (
    <section className="section pt-16">
      <AboutNav />

      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <div className="eyebrow-lg">AI Learning Community</div>
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-maroon-muted border border-maroon-muted px-2 py-1">
              Migration in progress
            </span>
          </div>
          <h1 className="mb-6 max-w-3xl">
            Step-by-step guides for building practical AI agents.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mb-4">
            The AI Learning Community is the Lab&apos;s catalog of working AI agents,
            chatbots, and document assistants for the Mays Business School community.
            Faculty and staff use it to learn-by-building.
          </p>
          <p className="text-[15px] text-ink-secondary leading-relaxed max-w-3xl">
            Built by our AI Student Fellows. The current preview lives at{' '}
            <a
              href="https://maysai.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-maroon hover:text-maroon-deep"
            >
              maysai.vercel.app
              <span aria-hidden="true"> &rarr;</span>
            </a>
            . The codebase is being migrated into the Lab platform; once it lands here, every
            agent below will be a clickable, runnable guide alongside the Admin Tools.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <ScrollReveal key={section.title}>
            <div>
              <div className="heading-rule mb-4">
                <h2 className="text-center mx-auto">{section.title}</h2>
              </div>
              <p className="text-[16px] text-ink-secondary text-center max-w-3xl mx-auto mb-8">
                {section.blurb}
              </p>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {section.agents.map((agent) => (
                  <AgentCardView key={agent.title} agent={agent} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
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
              ? 'text-status-success border-status-success/40 bg-status-success/5'
              : 'text-maroon-muted border-maroon-muted/40 bg-bg-subtle'
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
