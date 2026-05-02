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
        {/* Asymmetric editorial banner — left 60% maroon block (eyebrow,
            headline, blurb in white), right 40% white block with the CTA.
            Outer dotted-frame keeps the Mays signature. */}
        <article className="editorial-banner">
          <div className="editorial-banner__left">
            <div className="editorial-banner__eyebrow">{story.eyebrow}</div>
            <h2 className="editorial-banner__title">{story.headline}</h2>
            <p className="editorial-banner__blurb">{story.blurb}</p>
          </div>
          <div className="editorial-banner__right">
            {story.cta && story.href ? (
              <CtaLink href={story.href} label={story.cta} />
            ) : null}
          </div>
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
