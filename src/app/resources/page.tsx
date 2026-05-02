import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Resources | Mays Method Lab',
  description:
    'Deeper reading on AI for the Mays community. Courses, guides, and reading lists.',
};

type Resource = {
  title: string;
  blurb: string;
  href: string;
  audience: string;
  external: boolean;
  comingSoon?: boolean;
};

const RESOURCES: Resource[] = [
  {
    title: 'Mays AI quick-start guide',
    blurb: 'A concise tour of the AI tools available at Mays and which workflows to try first.',
    href: 'https://maysai.vercel.app/guide',
    audience: 'Faculty, staff',
    external: true,
  },
  {
    title: 'Student AI tool guide',
    blurb: 'A practical guide for choosing between TAMU AI Chat, Gemini, NotebookLM, and Codex.',
    href: 'https://maysai.vercel.app/resources/student-ai-tools',
    audience: 'Students',
    external: true,
  },
  {
    title: 'Anthropic Academy',
    blurb: 'Free courses from Anthropic on prompt engineering, agent design, and Claude in production.',
    href: 'https://www.anthropic.com/learn',
    audience: 'Faculty, staff',
    external: true,
    comingSoon: true,
  },
  {
    title: 'DeepLearning.AI short courses',
    blurb: 'Two-hour courses from DeepLearning.AI on RAG, agents, and prompt engineering for non-engineers.',
    href: 'https://www.deeplearning.ai/short-courses/',
    audience: 'Faculty, staff',
    external: true,
    comingSoon: true,
  },
  {
    title: 'Mays AI reading list',
    blurb: 'A curated set of papers and essays the Lab returns to. Updated quarterly.',
    href: '#',
    audience: 'Faculty',
    external: false,
    comingSoon: true,
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

export default function ResourcesPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-4xl mb-16">
          <div className="eyebrow-lg mb-4">Resources</div>
          <h1
            className="mb-6 leading-[1.1]"
            style={{ fontSize: 'clamp(40px, 5.5vw, 64px)' }}
          >
            Go deeper on AI for academic work.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-2xl">
            Courses, guides, and the Lab&apos;s working reading list. The longer
            reads worth your weekend.
          </p>
        </div>
      </ScrollReveal>

      {/* Quick-start anchor for /resources#quick-start link from LC page. */}
      <span id="quick-start" className="block scroll-mt-24" aria-hidden="true" />

      {/* Hidden bucket anchors so /resources#research etc. land at the top. */}
      {BUCKET_ANCHORS.map((b) => (
        <span key={b} id={b} className="block scroll-mt-24" aria-hidden="true" />
      ))}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map((r) => (
          <ScrollReveal key={r.title}>
            <ResourceTile resource={r} />
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

function ResourceTile({ resource }: { resource: Resource }) {
  if (resource.comingSoon) {
    return (
      <div className="relative bg-white border-2 border-dashed border-maroon-muted/50 p-7 md:p-8 h-full flex flex-col text-ink-secondary">
        <div className="flex items-center justify-between mb-3">
          <span className="eyebrow text-[11px]">{resource.audience}</span>
          <span className="text-[10px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border border-line bg-bg-subtle">
            Coming soon
          </span>
        </div>
        <h3 className="font-headline text-[20px] font-semibold text-maroon mb-3 leading-tight">
          {resource.title}
        </h3>
        <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">
          {resource.blurb}
        </p>
      </div>
    );
  }

  const inner = (
    <>
      <span className="absolute top-4 right-4 text-maroon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <line x1="6" y1="18" x2="18" y2="6" />
          <polyline points="9,6 18,6 18,15" />
        </svg>
      </span>
      <div className="eyebrow text-[11px] mb-2 pr-8">{resource.audience}</div>
      <h3 className="font-headline text-[20px] font-semibold text-maroon mb-3 leading-tight pr-8">
        {resource.title}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">
        {resource.blurb}
      </p>
    </>
  );
  if (resource.external) {
    return (
      <a
        href={resource.href}
        target="_blank"
        rel="noreferrer"
        className="relative block bg-white border-2 border-maroon p-7 md:p-8 h-full flex flex-col transition-colors hover:bg-maroon/5"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={resource.href}
      className="relative block bg-white border-2 border-maroon p-7 md:p-8 h-full flex flex-col transition-colors hover:bg-maroon/5"
    >
      {inner}
    </Link>
  );
}
