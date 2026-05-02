import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Resources | Mays Method Lab',
  description:
    'AI guides and reference material for the Mays Business School community.',
};

type Resource = {
  title: string;
  blurb: string;
  href: string;
  audience: string;
  external: boolean;
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
    title: 'Approved AI tools at Mays',
    blurb: 'The catalog of TAMU-approved AI tools with compliance and audience notes.',
    href: '/tools',
    audience: 'Faculty, staff, students',
    external: false,
  },
  {
    title: 'Agent tutorial library',
    blurb: 'Step-by-step builds for practical AI agents.',
    href: '/agents',
    audience: 'Faculty, staff, students',
    external: false,
  },
  {
    title: 'Prompt library',
    blurb: 'Paste-ready AI prompts for teaching, writing, research, and admin work.',
    href: '/prompts',
    audience: 'Faculty, staff, students',
    external: false,
  },
];

export default function ResourcesPage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-10">
          <div className="eyebrow-lg mb-3">Resources</div>
          <h1 className="mb-4 max-w-3xl">
            Guides, references, and the Mays AI tool catalog.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            Short reads on how to use AI well at Mays, plus the full catalog of approved
            tools and tutorials.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RESOURCES.map((r) => (
          <ScrollReveal key={r.title}>
            <ResourceTile resource={r} />
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

function ResourceTile({ resource }: { resource: Resource }) {
  const inner = (
    <>
      <span className="absolute top-4 right-4 text-maroon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <line x1="6" y1="18" x2="18" y2="6" />
          <polyline points="9,6 18,6 18,15" />
        </svg>
      </span>
      <div className="eyebrow text-[11px] mb-2 pr-8">{resource.audience}</div>
      <h3 className="font-headline text-[20px] font-semibold text-maroon mb-2 leading-tight pr-8">
        {resource.title}
      </h3>
      <p className="text-[14px] text-ink-secondary leading-relaxed flex-1">
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
        className="relative block bg-white border-2 border-maroon p-6 md:p-7 h-full flex flex-col transition-colors hover:bg-maroon/5"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={resource.href}
      className="relative block bg-white border-2 border-maroon p-6 md:p-7 h-full flex flex-col transition-colors hover:bg-maroon/5"
    >
      {inner}
    </Link>
  );
}
