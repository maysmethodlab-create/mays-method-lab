import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Agent tutorials | Mays Method Lab',
  description:
    'Step-by-step builds for practical AI agents at Mays: chatbots, document Q&A, meeting notes, recommendation letters.',
};

type Tutorial = {
  slug: string;
  title: string;
  blurb: string;
  meta: string;
  category: string;
};

const TUTORIALS: Tutorial[] = [
  {
    slug: 'meeting-notes-action-items',
    title: 'Meeting notes to action items',
    blurb: 'Paste-and-review workflow: rough notes to owners, deadlines, and next steps.',
    meta: '20 min · Beginner',
    category: 'Productivity',
  },
  {
    slug: 'chatbot-own-documents',
    title: 'Chatbot over your documents',
    blurb: 'Use NotebookLM to ask cited questions across your own approved documents.',
    meta: '45 min · Beginner',
    category: 'Knowledge',
  },
  {
    slug: 'spreadsheet-analysis-agent',
    title: 'Spreadsheet analysis agent',
    blurb: 'Plain-language prompts in Excel Copilot or Gemini to clean, summarize, and explain.',
    meta: '45 min · Beginner',
    category: 'Productivity',
  },
  {
    slug: 'recommendation-letter-agent',
    title: 'Recommendation letter agent',
    blurb: 'Collect a candidate\'s evidence and draft a reviewable recommendation letter.',
    meta: '50 min · Beginner',
    category: 'Writing',
  },
  {
    slug: 'research-paper-tracker',
    title: 'Research paper tracker',
    blurb: 'Lightweight app for tracking papers, reading status, tags, notes, and summaries.',
    meta: '50 min · Intermediate',
    category: 'Research',
  },
  {
    slug: 'personal-knowledge-base-search',
    title: 'Personal knowledge base search',
    blurb: 'Searchable knowledge base for notes, links, snippets, and research materials.',
    meta: '60 min · Intermediate',
    category: 'Knowledge',
  },
  {
    slug: 'faculty-guidelines-chatbot',
    title: 'Faculty guidelines chatbot',
    blurb: 'NotebookLM assistant with cited answers from approved guidelines.',
    meta: '75 min · Beginner',
    category: 'Chatbots',
  },
  {
    slug: 'create-and-share-tamu-ai-chatbot',
    title: 'Create and share a TAMU AI chatbot',
    blurb: 'TAMU AI Chat knowledge collection, custom model, and Microsoft Entra group.',
    meta: '75 min · Intermediate',
    category: 'Chatbots',
  },
  {
    slug: 'rag-app-uploaded-pdfs',
    title: 'Simple RAG app over uploaded PDFs',
    blurb: 'Retrieval-augmented app that lets users upload PDFs, index them, and ask questions.',
    meta: '75 min · Intermediate',
    category: 'Knowledge',
  },
  {
    slug: 'student-facing-syllabus-chatbot',
    title: 'Student-facing syllabus chatbot',
    blurb: 'Student Q&A in TAMU AI Chat from instructor-approved source material.',
    meta: '90 min · Intermediate',
    category: 'Teaching',
  },
];

export default function AgentsPage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-10">
          <div className="eyebrow-lg mb-3">Agent tutorials</div>
          <h1 className="mb-4 max-w-3xl">
            Step-by-step builds for practical AI agents.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            Each tutorial is a 20 to 90 minute build that ends with a real tool you keep using.
            Built by Mays AI Student Fellows. The current source lives at
            <a
              href="https://maysai.vercel.app/agents"
              target="_blank"
              rel="noreferrer"
              className="text-maroon ml-1 underline"
            >
              maysai.vercel.app/agents
            </a>
            .
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TUTORIALS.map((tut) => (
          <ScrollReveal key={tut.slug}>
            <a
              href={`https://maysai.vercel.app/agents/${tut.slug}`}
              target="_blank"
              rel="noreferrer"
              className="relative block bg-white border-2 border-maroon p-6 md:p-7 h-full flex flex-col transition-colors hover:bg-maroon/5"
            >
              <span className="absolute top-4 right-4 text-maroon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <line x1="6" y1="18" x2="18" y2="6" />
                  <polyline points="9,6 18,6 18,15" />
                </svg>
              </span>
              <div className="flex items-center justify-between mb-2 pr-8">
                <span className="eyebrow text-[11px]">{tut.category}</span>
                <span className="text-[10px] tracking-[0.05em] uppercase font-semibold text-maroon-muted">
                  {tut.meta}
                </span>
              </div>
              <h3 className="font-headline text-[20px] font-semibold text-maroon mb-2 leading-tight pr-8">
                {tut.title}
              </h3>
              <p className="text-[14px] text-ink-secondary leading-relaxed flex-1">
                {tut.blurb}
              </p>
            </a>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-line text-center">
        <Link
          href="/learning-community"
          className="text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          &larr; Back to the AI Learning Community
        </Link>
      </div>
    </section>
  );
}
