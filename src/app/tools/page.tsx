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
};

const TOOLS: Tool[] = [
  {
    id: 'tamu-ai-chat',
    name: 'TAMU AI Chat',
    blurb: "Texas A&M University System's internal AI chat. Multi-model. FERPA-friendly.",
    use: 'Default starting point for any AI work at Mays.',
    audience: 'Faculty, staff, students',
    href: 'https://maysai.vercel.app/tools/tamu-ai-chat',
  },
  {
    id: 'notebooklm',
    name: 'Google NotebookLM',
    blurb: 'Source-grounded AI notebook for asking questions across uploaded documents, links, and notes.',
    use: 'Cited Q&A over your own corpus of PDFs and notes.',
    audience: 'Faculty, staff',
    href: 'https://maysai.vercel.app/tools/notebooklm',
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini (TAMU)',
    blurb: "Google's flagship model on your @tamu.edu account, with TAMU data protection.",
    use: 'Long-context drafts, image understanding, spreadsheets, Workspace integration.',
    audience: 'Faculty, staff, students',
    href: 'https://maysai.vercel.app/tools/google-gemini',
  },
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot',
    blurb: 'AI inside Word, Excel, PowerPoint, Outlook, and Teams.',
    use: 'In-place help on the documents you are already writing.',
    audience: 'Faculty, staff',
    href: 'https://maysai.vercel.app/tools/microsoft-copilot',
  },
  {
    id: 'power-automate',
    name: 'Microsoft Power Automate',
    blurb: 'Low-code workflow automation across M365: Outlook, Teams, SharePoint, Forms.',
    use: 'Forms, approvals, reminders, Teams alerts.',
    audience: 'Staff',
    href: 'https://maysai.vercel.app/tools/power-automate',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    blurb: 'No-code automation across business apps, forms, CRMs, and spreadsheets.',
    use: 'Cross-tool workflows that go beyond M365.',
    audience: 'Staff',
    href: 'https://maysai.vercel.app/tools/zapier',
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    blurb: "OpenAI's agentic coding tool for editing, debugging, and shipping code.",
    use: 'Programming and engineering work.',
    audience: 'Technical staff, faculty, students',
    href: 'https://maysai.vercel.app/tools/codex',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    blurb: 'AI-powered code editor with chat, code generation, and codebase-aware assistance.',
    use: 'Programming and engineering work.',
    audience: 'Technical staff, faculty, students',
    href: 'https://maysai.vercel.app/tools/cursor',
  },
];

export default function ToolsPage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-10">
          <div className="eyebrow-lg mb-3">Approved AI tools</div>
          <h1 className="mb-4 max-w-3xl">
            The TAMU-approved AI tools you can use at Mays.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            Eight tools, one job each. If a piece of work fits your daily routine, the right
            answer is usually one of these. Click through for compliance and how-to detail.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOOLS.map((tool) => (
          <ScrollReveal key={tool.id}>
            <a
              id={tool.id}
              href={tool.href}
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
              <div className="eyebrow text-[11px] mb-2 pr-8">{tool.audience}</div>
              <h3 className="font-headline text-[22px] font-semibold text-maroon mb-3 leading-tight pr-8">
                {tool.name}
              </h3>
              <p className="text-[14px] text-ink-secondary leading-relaxed mb-3">
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
