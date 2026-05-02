'use client';

import Link from 'next/link';
import type { EditorialStory } from '@/lib/editorial-stories';

/**
 * EditorialStoryCard
 *
 * The weekly hero story at the top of /learning-community. Asymmetric
 * layout: a wide dotted-frame story panel on the left, a quiet "nominate
 * a story" rail on the right. Apple-feel: generous whitespace, sharp
 * corners, no drop shadows.
 */
export default function EditorialStoryCard({
  story,
}: {
  story: EditorialStory;
}) {
  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
      <div className="lg:col-span-2">
        <article className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
          <div className="eyebrow-lg mb-3">{story.eyebrow}</div>
          <h2 className="mb-5 max-w-2xl leading-tight">{story.headline}</h2>
          <p className="text-[17px] text-ink-secondary leading-relaxed max-w-2xl mb-7">
            {story.blurb}
          </p>
          {story.cta && story.href ? (
            <CtaLink href={story.href} label={story.cta} />
          ) : null}
        </article>
      </div>
      <aside className="lg:col-span-1 flex flex-col justify-center">
        <div className="eyebrow text-[11px] mb-2">Refreshed weekly</div>
        <p className="text-[15px] text-ink-secondary leading-relaxed">
          The Lab picks one workflow each week worth your attention. If you
          turned a repeated chore into something faster with AI, send it
          over. We will write it up and credit you.
        </p>
        <a
          href="mailto:ssridhar@mays.tamu.edu?subject=Nominate%20an%20AI%20story"
          className="mt-4 text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          Nominate a story &rarr;
        </a>
      </aside>
    </div>
  );
}

function CtaLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:');
  if (isExternal) {
    return (
      <a
        href={href}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
        className="btn-primary"
      >
        <span>{label}</span>
        <span className="btn-arrow" aria-hidden="true">
          &rarr;
        </span>
      </a>
    );
  }
  return (
    <Link href={href} className="btn-primary">
      <span>{label}</span>
      <span className="btn-arrow" aria-hidden="true">
        &rarr;
      </span>
    </Link>
  );
}
