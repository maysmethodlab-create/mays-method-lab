import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Breakthroughs | Mays Method Lab',
  description:
    'Built something that works? Here are the paths to take it further. The Lab points you at the routes; we do not run them for you.',
};

type Path = {
  title: string;
  body: string;
  cta?: string;
  href?: string;
};

const PATHS: Path[] = [
  {
    title: 'Texas A&M Office of Technology Management',
    body:
      'If your work has commercial application, an invention disclosure with TAMU OTM is the first step. They own the relationships with industry, the IP filing process, and the licensing pipeline. The Lab does not replace OTM. We point you at them when the moment is right.',
    cta: 'Visit TAMU OTM',
    href: 'https://research.tamu.edu/about/divisions/otc/',
  },
  {
    title: 'The Center for Entrepreneurship and Innovation at Mays',
    body:
      'If your work has founding potential, the Center for Entrepreneurship and Innovation runs the programs that take an idea from a prompt to a pitch. They have the mentors, the demo days, the pre-seed network. The Lab points faculty and staff with founder-track ideas in their direction.',
    cta: 'Open the Center',
    href: 'https://mays.tamu.edu/center-for-entrepreneurship-innovation/',
  },
  {
    title: 'Conference Circuits and Speaking',
    body:
      'If your work has academic or industry value, conference talks are the fastest distribution channel. The Lab helps you find the right venue (academic conferences, industry summits, internal Mays events), draft the abstract, and prepare the talk. We do not write it for you. We point you at where it belongs.',
  },
  {
    title: 'Internal Lab Spotlight',
    body:
      'If your work belongs in the Lab\'s case-study gallery, we will feature it here. The Workflow Apps page is where Mays people find what other Mays people have built. A spotlight is what makes a private prompt into something the rest of the school can copy.',
    cta: 'See the case-study gallery',
    href: '/workflow-apps',
  },
  {
    title: 'Industry Partnerships',
    body:
      'If your work has caught the attention of a company that wants to fund or pilot it, the path runs through Mays\'s development office and the relevant program leads. The Lab does not negotiate partnerships. We make sure the right Mays administrator is in the room when the conversation starts.',
  },
];

export default function BreakthroughsPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">

      <section className="section pt-16" aria-labelledby="breakthroughs-hero-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
            <div className="eyebrow-lg mb-3">Breakthroughs</div>
            <h1 id="breakthroughs-hero-heading" className="mb-6 max-w-4xl">
              Built Something That Works? Here Are the Paths to Take It Further.
            </h1>
            <p className="text-[20px] text-ink-secondary leading-relaxed max-w-3xl">
              The Lab does not pick winners. The market does. If your audience uses
              what you built, your colleagues ask how you did it, your students keep
              coming back, that is the signal.
            </p>
            <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl mt-4">
              The gatekeepers are everybody: your audience, your customers, the work
              itself, and the Lab. When the signal is there, here are the paths.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="paths-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">The Paths</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="paths-heading" className="max-w-4xl mb-8">
            Five Routes. Pick the One That Fits Your Work.
          </h2>
        </ScrollReveal>

        <div className="grid gap-6 md:gap-8 max-w-4xl">
          {PATHS.map((p) => (
            <ScrollReveal key={p.title}>
              <PathCard path={p} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="section" aria-labelledby="what-we-dont-heading">
        <ScrollReveal>
          <div className="eyebrow-lg mb-3">What We Will Not Do</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 id="what-we-dont-heading" className="max-w-4xl mb-6">
            We Are the Pointer, Not the Path.
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="max-w-3xl space-y-4 text-[18px] text-ink-secondary leading-relaxed">
            <p>
              The Lab does not file your patent, run your pitch deck, negotiate your
              licensing terms, or manage your industry partnership. We are not the
              Center for Entrepreneurship and Innovation. We are not the Texas A&amp;M
              Office of Technology Management. We are not the Mays development office.
            </p>
            <p>
              What we do is make sure you know those offices exist, that you know which
              door to knock on first, and that the right person at Mays is aware your
              breakthrough is moving. From there the path is yours.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="divider" />

      <section className="section pb-20" aria-labelledby="tell-us-heading">
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 max-w-4xl mx-auto">
            <div className="eyebrow-lg mb-3">Tell Us</div>
            <h2 id="tell-us-heading" className="m-0 mb-4">
              You Built Something. The Signal Is There. What Now?
            </h2>
            <p className="text-[18px] text-ink-secondary leading-relaxed mb-6 max-w-2xl">
              A short email is enough. The work, who is using it, what you want to do
              next. We respond with the right path and the right person to call.
            </p>
            <a
              href="mailto:ssridhar@mays.tamu.edu?subject=Breakthrough%20at%20Mays%20-%20path%20question"
              className="btn-primary"
            >
              Email the Lab
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </ScrollReveal>
      </section>
      </main>
    </>
  );
}

function PathCard({ path }: { path: Path }) {
  return (
    <article className="card">
      <h3 className="font-headline text-[24px] font-semibold text-maroon mb-4 leading-tight">
        {path.title}
      </h3>
      <p className="text-[17px] text-ink-secondary leading-relaxed m-0 mb-4">
        {path.body}
      </p>
      {path.cta && path.href && (
        path.href.startsWith('http') ? (
          <a
            href={path.href}
            target="_blank"
            rel="noreferrer"
            className="text-[16px] font-semibold text-maroon underline"
            style={{ textDecorationThickness: '2px' }}
          >
            {path.cta} <span aria-hidden="true">&rarr;</span>
          </a>
        ) : (
          <Link
            href={path.href}
            className="text-[16px] font-semibold text-maroon underline"
            style={{ textDecorationThickness: '2px' }}
          >
            {path.cta} <span aria-hidden="true">&rarr;</span>
          </Link>
        )
      )}
    </article>
  );
}
