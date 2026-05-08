import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Which AI tool fits your task? | Your AI Edge',
  description:
    'Compare TAMU AI Chat, Microsoft Copilot, Google Gemini, and Google NotebookLM. A use-this-when grid for faculty and staff at Mays.',
};

type Tool = {
  name: string;
  blurb: string;
  href: string;
  bullets: string[];
  caveat: string;
};

const TOOLS: Tool[] = [
  {
    name: 'TAMU AI Chat',
    blurb: 'Your default for university work',
    href: 'https://chat.tamu.ai/',
    bullets: [
      'You want a general AI assistant for brainstorming, outlining, writing, or explaining.',
      'You may be working with course materials, faculty records, research, or internal Mays information that belongs in a TAMU-supported environment.',
      'You want to compare multiple models or build a simple chatbot from approved program or committee materials.',
    ],
    caveat:
      'Still review every answer. It can sound confident while missing context, policy details, or what a specific committee wants.',
  },
  {
    name: 'Microsoft Copilot',
    blurb: 'AI inside Office, where most of your work already lives',
    href: 'https://www.it.tamu.edu/services/email-messaging-and-collaboration/collaboration/microsoft-copilot/',
    bullets: [
      'You are drafting email in Outlook, summarizing a long thread, or rewriting a Word document.',
      'You want to ask questions about an Excel sheet, a PowerPoint deck, or a Teams meeting transcript.',
      'You want a tool that respects your TAMU sign-in and keeps the work inside the Microsoft tenant.',
    ],
    caveat:
      'Sign in with your @tamu.edu account. The data-protection guarantees apply only when the shield indicator is active.',
  },
  {
    name: 'Google Gemini',
    blurb: 'Fast chat inside your TAMU Google account',
    href: 'https://gemini.google.com/',
    bullets: [
      'You are drafting, translating, summarizing, or asking quick questions.',
      'You want a multimodal tool that can work with text, images, audio, and video.',
      'You are already working in the Google ecosystem and can confirm the shield icon is active.',
    ],
    caveat:
      'Use your @tamu.edu login and look for the shield icon before putting Mays information into a prompt.',
  },
  {
    name: 'Google NotebookLM',
    blurb: 'Answers grounded in your own sources',
    href: 'https://notebooklm.google.com/',
    bullets: [
      'You have PDFs, notes, articles, slides, or links and want answers grounded in those sources.',
      'You need study guides, briefing notes, timelines, FAQs, or source-based summaries.',
      'You are preparing for a faculty meeting, a presentation, a literature scan, or a search committee read.',
    ],
    caveat:
      'It is strongest when you upload the right sources. Treat missing or low-quality source material as a problem with the notebook, not proof the answer is complete.',
  },
];

const USE_CASES = [
  {
    title: 'Research and source work',
    body: 'Use NotebookLM for source-grounded work. Use TAMU AI Chat for broader synthesis, planning, or a custom knowledge-backed chatbot.',
    bullets: [
      'Summarize a set of articles.',
      'Extract themes from interview notes you are allowed to use.',
      'Prepare a briefing document from uploaded sources.',
    ],
  },
  {
    title: 'Teaching and course materials',
    body: 'Use TAMU AI Chat for general teaching prep. Use NotebookLM when the answer must come from your own slides or readings.',
    bullets: [
      'Turn a syllabus into thirty practice questions.',
      'Draft a four-criterion rubric for an assignment.',
      'Summarize a long reading into a one-page prep note.',
    ],
  },
  {
    title: 'Writing and communication',
    body: 'Use TAMU AI Chat or Microsoft Copilot for university-related drafts. Gemini is a good quick option when you are already inside Google.',
    bullets: [
      'Draft an email to a department head or committee.',
      'Make a paragraph clearer without changing the meaning.',
      'Outline a one-page report before writing the first draft.',
    ],
  },
  {
    title: 'Programs and faculty support',
    body: 'Use TAMU AI Chat for everyday admin work. Use NotebookLM when the answer should come from policy or guideline documents.',
    bullets: [
      'Convert rough notes into a polished program announcement.',
      'Summarize meeting notes into action items.',
      'Answer a faculty question about TAMU-protected guideline language.',
    ],
  },
];

export default function PickAToolPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-3xl">
          <div className="eyebrow-lg mb-4">Step 1 · Pick the right tool</div>
          <h1 className="mb-6 leading-[1.1]">
            Which AI tool fits your task?
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed">
            The short version. Use TAMU-supported tools for university work,
            use NotebookLM when your sources matter, and pick the tool by the
            task, not the logo.
          </p>
        </div>
      </ScrollReveal>

      {/* Tool comparison grid */}
      <div className="mt-16">
        <div className="eyebrow text-[16px] mb-3">Quick picks</div>
        <h2 className="mb-8 leading-tight">Choose by what you are trying to do.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {TOOLS.map((t) => (
            <ToolCard key={t.name} tool={t} />
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="mt-24">
        <div className="eyebrow text-[16px] mb-3">Use cases</div>
        <h2 className="mb-8 leading-tight">Match the tool to the work.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="bg-white border-2 border-maroon p-6 md:p-7"
            >
              <h3 className="font-headline text-[20px] font-semibold text-maroon mb-2 leading-tight">
                {u.title}
              </h3>
              <p className="text-[16px] text-ink-secondary leading-relaxed mb-3">
                {u.body}
              </p>
              <ul className="text-[16px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-1">
                {u.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Decision rules */}
      <div className="mt-24 max-w-4xl dotted-frame bg-bg-subtle py-10 px-8 md:px-12">
        <div className="eyebrow text-[16px] mb-3">Decision rules</div>
        <h2 className="mb-6 leading-tight">A simple way to decide.</h2>
        <ul className="text-[16px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-2">
          <li>
            Use TAMU-provided or TAMU-licensed tools for university,
            faculty, staff, research, or program work.
          </li>
          <li>
            Use NotebookLM when the answer should come from specific files,
            readings, notes, or links you have on hand.
          </li>
          <li>
            Use Microsoft Copilot when the work already lives inside Outlook,
            Word, Excel, PowerPoint, or Teams.
          </li>
          <li>
            Do not paste TAMU-protected data, personnel records, or
            confidential research into tools that are not approved for that
            data class.
          </li>
          <li>
            Always check names, dates, numbers, citations, formulas, and
            policy claims before you rely on the output.
          </li>
        </ul>
      </div>

      {/* Next */}
      <div className="mt-20 grid md:grid-cols-2 gap-6 max-w-4xl">
        <NextLink
          href="/prompts"
          eyebrow="Step 2"
          label="Write better prompts"
        />
        <NextLink
          href="/agents"
          eyebrow="Step 3"
          label="Build a small tool you keep using"
        />
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="bg-white border-2 border-maroon p-6 md:p-7 h-full flex flex-col">
      <h3 className="font-headline text-[24px] font-semibold text-maroon mb-1 leading-tight">
        {tool.name}
      </h3>
      <div className="eyebrow text-[16px] mb-4">{tool.blurb}</div>
      <ul className="text-[16px] text-ink-secondary leading-relaxed list-disc pl-5 space-y-2 mb-4 flex-1">
        {tool.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="text-[16px] text-ink-secondary leading-relaxed mb-4 italic">
        {tool.caveat}
      </p>
      <a
        href={tool.href}
        target="_blank"
        rel="noreferrer"
        className="text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon hover:text-maroon-deep"
      >
        Open {tool.name} &rarr;
      </a>
    </article>
  );
}

function NextLink({
  href,
  eyebrow,
  label,
}: {
  href: string;
  eyebrow: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border-2 border-maroon p-6 hover:bg-maroon/5 transition-colors"
    >
      <div className="eyebrow text-[16px] mb-2">{eyebrow}</div>
      <div className="font-headline text-[20px] font-semibold text-maroon leading-tight">
        {label} &rarr;
      </div>
    </Link>
  );
}
