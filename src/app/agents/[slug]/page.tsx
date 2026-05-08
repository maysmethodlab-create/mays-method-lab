import Link from 'next/link';
import { notFound } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import TutorialMarkdown from '@/components/TutorialMarkdown';
import {
  TUTORIALS,
  relatedTutorials,
  tutorialBySlug,
} from '@/lib/tutorials';

export function generateStaticParams() {
  return TUTORIALS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const t = tutorialBySlug(params.slug);
  if (!t) {
    return { title: 'Tutorial not found | Mays Method Lab' };
  }
  return {
    title: `${t.title} | Mays Method Lab`,
    description: t.description,
  };
}

export default function TutorialPage({
  params,
}: {
  params: { slug: string };
}) {
  const tutorial = tutorialBySlug(params.slug);
  if (!tutorial) {
    notFound();
  }
  const related = relatedTutorials(params.slug);

  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="mb-10">
          <Link
            href="/agents"
            className="text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
          >
            &larr; All tutorials
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="max-w-3xl mb-12">
          <div className="eyebrow-lg mb-4">{tutorial.category}</div>
          <h1 className="mb-4 leading-[1.15]" style={{ fontSize: 'clamp(34px, 4.6vw, 52px)' }}>
            {tutorial.title}
          </h1>
          <div className="text-[16px] tracking-[0.18em] uppercase font-semibold text-maroon-muted mb-6">
            {tutorial.meta}
          </div>
          <p className="text-[18px] text-ink-secondary leading-relaxed">
            {tutorial.description}
          </p>
        </div>
      </ScrollReveal>

      {tutorial.prerequisites.length > 0 ? (
        <ScrollReveal>
          <div className="dotted-frame bg-bg-subtle py-8 px-7 md:px-10 mb-12 max-w-3xl">
            <div className="eyebrow text-[16px] mb-3">Prerequisites</div>
            <ul className="list-disc pl-5 space-y-1 text-[16px] text-ink-secondary leading-relaxed">
              {tutorial.prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      ) : null}

      <ScrollReveal>
        <article className="max-w-3xl">
          <TutorialMarkdown source={tutorial.body} />
        </article>
      </ScrollReveal>

      {related.length > 0 ? (
        <ScrollReveal>
          <div className="mt-20 pt-10 border-t border-line max-w-3xl">
            <div className="eyebrow text-[16px] mb-4">Related tutorials</div>
            <ul className="grid md:grid-cols-2 gap-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/agents/${r.slug}`}
                    className="block bg-white border-2 border-maroon p-5 hover:bg-maroon/5 transition-colors h-full"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow text-[16px]">{r.category}</span>
                      <span className="text-[16px] tracking-[0.05em] uppercase font-semibold text-maroon-muted">
                        {r.meta}
                      </span>
                    </div>
                    <h3 className="font-headline text-[18px] font-semibold text-maroon mb-2 leading-tight">
                      {r.title}
                    </h3>
                    <p className="text-[16px] text-ink-secondary leading-relaxed">
                      {r.blurb}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      ) : null}

      {tutorial.tags && tutorial.tags.length > 0 ? (
        <div className="mt-12 max-w-3xl">
          <div className="eyebrow text-[16px] mb-3">Tags</div>
          <div className="flex flex-wrap gap-2">
            {tutorial.tags.map((tag) => (
              <span
                key={tag}
                className="text-[16px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border border-line text-maroon-muted bg-bg-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-24 pt-6 border-t border-line text-center">
        <Link
          href="/learning-community"
          className="text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          &larr; Back to Your AI Edge
        </Link>
      </div>
    </section>
  );
}
