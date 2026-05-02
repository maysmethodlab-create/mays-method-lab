import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Prompts | Mays Method Lab',
  description:
    'Paste-ready AI prompts for teaching, writing, research, and admin work at Mays.',
};

type Prompt = {
  slug: string;
  title: string;
  blurb: string;
  audience: string;
  category: string;
};

const PROMPTS: Prompt[] = [
  {
    slug: 'announcement-writer',
    title: 'Draft an announcement',
    blurb: 'A short update for a department, college, or campus audience.',
    audience: 'Faculty, staff',
    category: 'Writing',
  },
  {
    slug: 'meeting-notes-summary',
    title: 'Summarize meeting notes',
    blurb: 'Turn raw notes into decisions, owners, and next steps.',
    audience: 'Faculty, staff',
    category: 'Writing',
  },
  {
    slug: 'report-draft',
    title: 'Draft a status report',
    blurb: 'Turn rough notes into a structured report for leadership or committees.',
    audience: 'Faculty, staff',
    category: 'Writing',
  },
  {
    slug: 'resume-bullet-points',
    title: 'Strengthen resume bullets',
    blurb: 'Rewrite weak bullets with action verbs and measurable results.',
    audience: 'Faculty, staff, students',
    category: 'Writing',
  },
  {
    slug: 'syllabus-builder',
    title: 'Build a course syllabus',
    blurb: 'A structured first draft from your course goals.',
    audience: 'Faculty',
    category: 'Teaching',
  },
  {
    slug: 'learning-objectives',
    title: 'Write learning objectives',
    blurb: "Measurable, Bloom's-aligned objectives for any topic or module.",
    audience: 'Faculty',
    category: 'Teaching',
  },
  {
    slug: 'rubric-generator',
    title: 'Create an assignment rubric',
    blurb: 'A grading rubric with clear criteria and performance levels.',
    audience: 'Faculty',
    category: 'Teaching',
  },
  {
    slug: 'exam-prep-questions',
    title: 'Generate practice exam questions',
    blurb: 'Practice questions from your course material.',
    audience: 'Faculty, students',
    category: 'Teaching',
  },
  {
    slug: 'study-guide-creator',
    title: 'Create a study guide',
    blurb: 'A focused review sheet from lecture notes or textbook content.',
    audience: 'Students',
    category: 'Student success',
  },
  {
    slug: 'assignment-help',
    title: 'Explain an assignment prompt',
    blurb: 'Break a confusing assignment prompt into clear requirements and a plan.',
    audience: 'Students',
    category: 'Student success',
  },
  {
    slug: 'literature-review-summary',
    title: 'Summarize research sources',
    blurb: 'Synthesize research sources, surface themes, conflicts, and gaps.',
    audience: 'Faculty, students',
    category: 'Research',
  },
];

export default function PromptsPage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-10">
          <div className="eyebrow-lg mb-3">Prompts</div>
          <h1 className="mb-4 max-w-3xl">
            Paste-ready AI prompts for teaching, writing, research, and admin work.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
            Built by Mays AI Student Fellows. Click through for the full prompt and use notes.
            Source library at
            <a
              href="https://maysai.vercel.app/prompts"
              target="_blank"
              rel="noreferrer"
              className="text-maroon ml-1 underline"
            >
              maysai.vercel.app/prompts
            </a>
            .
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROMPTS.map((p) => (
          <ScrollReveal key={p.slug}>
            <a
              href={`https://maysai.vercel.app/prompts/${p.slug}`}
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
                <span className="eyebrow text-[11px]">{p.category}</span>
                <span className="text-[10px] tracking-[0.05em] uppercase font-semibold text-maroon-muted">
                  {p.audience}
                </span>
              </div>
              <h3 className="font-headline text-[20px] font-semibold text-maroon mb-2 leading-tight pr-8">
                {p.title}
              </h3>
              <p className="text-[14px] text-ink-secondary leading-relaxed flex-1">
                {p.blurb}
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
