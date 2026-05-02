import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import { TUTORIALS } from '@/lib/tutorials';

export const metadata = {
  title: 'Tutorials | Mays Method Lab',
  description:
    'Step-by-step builds for practical AI tools at Mays. Twenty to ninety minute tutorials by category.',
};

export default function TutorialsPage() {
  return (
    <section className="section pt-24">
      <ScrollReveal>
        <div className="max-w-4xl mb-16">
          <div className="eyebrow-lg mb-4">Tutorials</div>
          <h1
            className="mb-6 leading-[1.1]"
            style={{ fontSize: 'clamp(40px, 5.5vw, 64px)' }}
          >
            Step-by-step builds for practical AI tools.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-2xl">
            Twenty to ninety minute builds. Each one ends with a tool you keep
            using. Built by Mays AI Student Fellows.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TUTORIALS.map((tut, i) => {
          const firstWithBucket =
            TUTORIALS.findIndex((t) => t.bucket === tut.bucket) === i;
          return (
            <ScrollReveal key={tut.slug}>
              <Link
                id={firstWithBucket ? tut.bucket : undefined}
                href={`/agents/${tut.slug}`}
                className="relative block bg-white border-2 border-maroon p-7 md:p-8 h-full flex flex-col transition-colors hover:bg-maroon/5"
              >
                <span
                  className="absolute top-4 right-4 text-maroon"
                  aria-hidden="true"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                  >
                    <line x1="6" y1="18" x2="18" y2="6" />
                    <polyline points="9,6 18,6 18,15" />
                  </svg>
                </span>
                <div className="flex items-center justify-between mb-3 pr-8">
                  <span className="eyebrow text-[11px]">{tut.category}</span>
                  <span className="text-[10px] tracking-[0.05em] uppercase font-semibold text-maroon-muted">
                    {tut.meta}
                  </span>
                </div>
                <h3 className="font-headline text-[22px] font-semibold text-maroon mb-3 leading-tight pr-8">
                  {tut.title}
                </h3>
                <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">
                  {tut.blurb}
                </p>
              </Link>
            </ScrollReveal>
          );
        })}
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
