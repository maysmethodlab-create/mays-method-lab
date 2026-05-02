import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Approved AI tools | Mays Method Lab',
  description:
    'TAMU-approved AI tools available to the Mays community: TAMU AI Chat, NotebookLM, Gemini, Copilot, Power Automate, Zapier, Codex, Cursor.',
};

type Tool = {
  id: string;
  name: string;
  blurb: string;
  use: string;
  audience: string;
  href: string;
  /** Bucket slugs this tool fits, used for in-page anchors. */
  buckets: string[];
};

const TOOLS: Tool[] = [
  {
    id: 'tamu-ai-chat',
    name: 'TAMU AI Chat',
    blurb: "Texas A&M University System's internal AI chat. Multi-model. FERPA-friendly.",
    use: 'Default starting point for any AI work at Mays.',
    audience: 'Faculty, staff, students',
    href: 'https://maysai.vercel.app/tools/tamu-ai-chat',
    buckets: ['research', 'teaching', 'writing', 'programs', 'faculty-support', 'advising', 'learning-ai'],
  },
  {
    id: 'notebooklm',
    name: 'Google NotebookLM',
    blurb: 'Source-grounded AI notebook for asking questions across uploaded documents, links, and notes.',
    use: 'Cited Q&A over your own corpus of PDFs and notes.',
    audience: 'Faculty, staff',
    href: 'https://maysai.vercel.app/tools/notebooklm',
    buckets: ['research', 'advising', 'faculty-support'],
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini (TAMU)',
    blurb: "Google's flagship model on your @tamu.edu account, with TAMU data protection.",
    use: 'Long-context drafts, image understanding, spreadsheets, Workspace integration.',
    audience: 'Faculty, staff, students',
    href: 'https://maysai.vercel.app/tools/google-gemini',
    buckets: ['research', 'writing'],
  },
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot',
    blurb: 'AI inside Word, Excel, PowerPoint, Outlook, and Teams.',
    use: 'In-place help on the documents you are already writing.',
    audience: 'Faculty, staff',
    href: 'https://maysai.vercel.app/tools/microsoft-copilot',
    buckets: ['teaching', 'writing', 'faculty-support'],
  },
  {
    id: 'power-automate',
    name: 'Microsoft Power Automate',
    blurb: 'Low-code workflow automation across M365: Outlook, Teams, SharePoint, Forms.',
    use: 'Forms, approvals, reminders, Teams alerts.',
    audience: 'Staff',
    href: 'https://maysai.vercel.app/tools/power-automate',
    buckets: ['programs', 'faculty-support'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    blurb: 'No-code automation across business apps, forms, CRMs, and spreadsheets.',
    use: 'Cross-tool workflows that go beyond M365.',
    audience: 'Staff',
    href: 'https://maysai.vercel.app/tools/zapier',
    buckets: ['programs'],
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    blurb: "OpenAI's agentic coding tool for editing, debugging, and shipping code.",
    use: 'Programming and engineering work.',
    audience: 'Technical staff, faculty, students',
    href: 'https://maysai.vercel.app/tools/codex',
    buckets: ['research'],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    blurb: 'AI-powered code editor with chat, code generation, and codebase-aware assistance.',
    use: 'Programming and engineering work.',
    audience: 'Technical staff, faculty, students',
    href: 'https://maysai.vercel.app/tools/cursor',
    buckets: ['research'],
  },
];

const BUCKET_ANCHORS = [
  'research',
  'teaching',
  'writing',
  'programs',
  'faculty-support',
  'advising',
  'learning-ai',
];

export default function ToolsPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-4xl mb-10">
          <div className="eyebrow-lg mb-4">Approved AI tools</div>
          <h1
            className="mb-6 leading-[1.1]"
            style={{ fontSize: 'clamp(40px, 5.5vw, 64px)' }}
          >
            The AI tools you can use at Mays.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-2xl">
            Eight TAMU-approved tools, one job each. Click through for compliance
            and how-to detail.
          </p>
        </div>
      </ScrollReveal>

      {/* Trust banner. Replaces per-card compliance badges across the site. */}
      <div className="dotted-frame bg-bg-subtle py-6 px-6 md:px-8 mb-16">
        <div className="eyebrow text-[11px] mb-2">Compliance</div>
        <p className="text-[15px] text-ink-secondary leading-relaxed max-w-3xl">
          Every tool listed below has been reviewed and approved by Texas A&amp;M
          for use with university data. If a tool is not on this page, treat it
          as not approved until you confirm with TAMU IT.
        </p>
      </div>

      {/* Hidden bucket anchors so /tools#research etc. lands at the top.
          This page is a flat tool list, not bucket-grouped, but the LC
          page links here by bucket. */}
      {BUCKET_ANCHORS.map((b) => (
        <span key={b} id={b} className="block scroll-mt-24" aria-hidden="true" />
      ))}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <ScrollReveal key={tool.id}>
            <a
              id={tool.id}
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              className="relative block bg-white border-2 border-maroon p-7 md:p-8 h-full flex flex-col transition-colors hover:bg-maroon/5"
            >
              <span className="absolute top-4 right-4 text-maroon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <line x1="6" y1="18" x2="18" y2="6" />
                  <polyline points="9,6 18,6 18,15" />
                </svg>
              </span>
              <div className="eyebrow text-[11px] mb-2 pr-8">{tool.audience}</div>
              <h3 className="font-headline text-[24px] font-semibold text-maroon mb-3 leading-tight pr-8">
                {tool.name}
              </h3>
              <p className="text-[15px] text-ink-secondary leading-relaxed mb-3">
                {tool.blurb}
              </p>
              <div className="text-[13px] text-ink-secondary mt-auto pt-3 border-t border-line">
                <span className="font-semibold text-maroon-muted">Best for: </span>
                {tool.use}
              </div>
            </a>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-24 pt-6 border-t border-line text-center">
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
