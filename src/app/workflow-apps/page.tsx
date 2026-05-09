import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Workflow Apps | Mays Method Lab',
  description:
    'Apps the Lab built for specific Mays workflows. How they work, how they were made, and how you would build your own. Case studies for the patterns, not products for everyone.',
};

type App = {
  title: string;
  audience: string;
  problem: string;
  approach: string;
  status: 'live' | 'beta' | 'in-development';
  href: string;
  ctaLabel: string;
};

const APPS: App[] = [
  {
    title: 'Annual Evaluation Letter Writer',
    audience: 'Department heads, deans, supervisors',
    problem:
      'Writing 30-40 annual evaluation letters in May used to take a senior administrator a full week. Each letter requires reading the self-evaluation, the CV, the F180, and the writer\'s notes, then drafting in their own voice without invented facts.',
    approach:
      'A three-phase pipeline: structured research brief from the source documents, draft in the writer\'s calibrated voice, hallucination check against the originals. Per-letter cost is under thirty cents. The writer reviews and edits the draft instead of writing from scratch.',
    status: 'live',
    href: '/admin/evaluation-letters',
    ctaLabel: 'Open the app',
  },
  {
    title: 'Endowed Positions Letter Writer',
    audience: 'Senior leadership, search committees',
    problem:
      'Endowed-chair recommendation letters require a different voice and structure from annual reviews. They are infrequent, high-stakes, and written by people who do not write them often enough to be fast at them.',
    approach:
      'A five-step workflow that pulls candidate materials, drafts the recommendation, runs an MRC vote simulation, and produces the final memo. Built for the specific cadence of Mays endowed-position decisions.',
    status: 'live',
    href: '/admin/endowed-positions',
    ctaLabel: 'Open the app',
  },
  {
    title: 'Faculty Guidelines Chatbot',
    audience: 'All Mays faculty and staff',
    problem:
      'The Mays Faculty Guidelines is an 80-page document. Most faculty need answers from it once or twice a year, and the answer they need is buried three subsections deep. They give up and email the dean\'s office instead.',
    approach:
      'A two-pass retrieval-augmented chatbot calibrated to the October 2025 approved guidelines. Strict-quoting prompt with a verifier pass that enforces multi-turn context. Answers come back with section citations.',
    status: 'beta',
    href: '/apps/faculty-guidelines',
    ctaLabel: 'Try the chatbot',
  },
  {
    title: 'Academic Calendar Chatbot',
    audience: 'Staff, advisors, students',
    problem:
      'The TAMU academic calendar is a sprawling table of registration windows, drop deadlines, finals weeks, breaks, and graduation dates. Every staff member ends up reading the same dates to the same students.',
    approach:
      'A small chatbot calibrated to the official TAMU registrar calendar. Returns specific dates with a citation back to the source. Cost optimized; runs on Haiku.',
    status: 'live',
    href: '/apps/academic-calendar',
    ctaLabel: 'Try the chatbot',
  },
  {
    title: 'PowerPoint Reformatter',
    audience: 'Faculty, staff producing branded decks',
    problem:
      'A faculty member finishes a research talk and needs to put it on the Mays template. The visual rebrand takes another hour they did not budget. Most existing tools either rewrite the content or fail silently on edge cases.',
    approach:
      'A six-step pipeline that synthesizes, brand-studies, plans, reviews, accessibility-checks, and generates. Beta version is conservative on content modification. The companion Deck Analyzer surfaces what will and will not preserve cleanly before the conversion runs.',
    status: 'beta',
    href: '/apps/pptx-reformatter',
    ctaLabel: 'Try the reformatter',
  },
  {
    title: 'Deck Analyzer',
    audience: 'Anyone preparing a deck for the Mays template',
    problem:
      'Before reformatting a deck, the user wants to know what will preserve cleanly and what will not. Vendors who promise "AI converts your deck" rarely tell you up front that your embedded video, SmartArt, and OLE objects are not coming through.',
    approach:
      'Pure static analysis of the .pptx OOXML. No LLM calls, no file storage. Returns a reliability report (per element type, per slide), an accessibility report (missing alt text, vague hyperlinks, slides without titles), and a green / yellow / orange / red verdict on whether to convert.',
    status: 'live',
    href: '/apps/pptx-analyzer',
    ctaLabel: 'Run a deck through it',
  },
];

const STATUS_LABEL: Record<App['status'], string> = {
  live: 'Live',
  beta: 'Beta',
  'in-development': 'In Development',
};

export default function WorkflowAppsPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">

      <section className="section pt-16" aria-labelledby="apps-hero-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
            <div className="eyebrow-lg mb-3">Workflow Apps</div>
            <h1 id="apps-hero-heading" className="mb-6 max-w-4xl">
              Apps the Lab Built for Specific Mays Workflows.
            </h1>
            <p className="text-[20px] text-ink-secondary leading-relaxed max-w-3xl">
              Each app on this page started as one Mays person's prompt. The Lab wrapped
              the prompt in code, gated it to the people it was built for, and
              published the pattern so you can see how it was made.
            </p>
            <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mt-4">
              These are case studies, not products for everyone. Use them if you are
              the intended audience. Read them if you want to build your own.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="apps-list-heading">
        <h2 id="apps-list-heading" className="sr-only">Workflow apps</h2>
        <div className="grid gap-6 md:gap-8">
          {APPS.map((app) => (
            <ScrollReveal key={app.title}>
              <AppCaseStudy app={app} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="section pb-20" aria-labelledby="build-your-own-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 max-w-4xl mx-auto">
            <div className="eyebrow-lg mb-3">Want to Build Your Own?</div>
            <h2 id="build-your-own-heading" className="m-0 mb-4">
              Every App on This Page Started as a Prompt.
            </h2>
            <p className="text-[18px] text-ink-secondary leading-relaxed mb-6">
              If something here looks like a pattern that fits your work, the Lab will
              show you how to start. The first version of every one of these was a
              prompt that ran in TAMU AI Chat. The app came later.
            </p>
            <Link href="/community" className="btn-primary">
              Bring us a workflow
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
      </main>
    </>
  );
}

function AppCaseStudy({ app }: { app: App }) {
  return (
    <article className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <h3 className="font-headline text-[28px] font-semibold text-maroon m-0 leading-tight">
          {app.title}
        </h3>
        <span className="eyebrow text-ink-muted">{STATUS_LABEL[app.status]}</span>
      </div>
      <p className="text-[16px] text-ink-muted m-0 mb-5">
        <strong>Built for:</strong> {app.audience}
      </p>

      <div className="space-y-4 text-[17px] text-ink-secondary leading-relaxed mb-6">
        <div>
          <h4 className="font-headline text-[18px] font-semibold text-ink-primary m-0 mb-2 uppercase tracking-[0.05em]">
            The Problem
          </h4>
          <p className="m-0">{app.problem}</p>
        </div>
        <div>
          <h4 className="font-headline text-[18px] font-semibold text-ink-primary m-0 mb-2 uppercase tracking-[0.05em]">
            The Approach
          </h4>
          <p className="m-0">{app.approach}</p>
        </div>
      </div>

      <Link href={app.href} className="btn-secondary">
        {app.ctaLabel}
        <span className="btn-arrow" aria-hidden="true">&rarr;</span>
      </Link>
    </article>
  );
}
