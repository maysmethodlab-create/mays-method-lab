'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { EditorialStory } from '@/lib/editorial-stories';

/**
 * EditorialStoryCard
 *
 * The weekly hero story at the top of /learning-community. Asymmetric
 * layout: a wide dotted-frame story panel on the left, a quiet "nominate
 * a story" rail on the right. When the story carries a paste-ready
 * prompt, an inline prompt block renders directly under the banner with
 * a COPY button. Apple-feel: generous whitespace, sharp corners, no
 * drop shadows.
 */
export default function EditorialStoryCard({
  story,
}: {
  story: EditorialStory;
}) {
  return (
    <div>
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
          ) : (
            <ComingSoonPill />
          )}
        </div>
      </article>

      {/* Inline copy-ready prompt block. Only renders when the story
          carries a paste-ready prompt. The featured-app announcements
          do not. */}
      {story.prompt ? (
        <InlinePromptBlock
          text={story.prompt.text}
          caption={story.prompt.caption}
        />
      ) : null}
    </div>
  );
}

/* =============================================================
   Inline prompt block — eyebrow, code block, COPY button, caption
   ============================================================= */

function InlinePromptBlock({
  text,
  caption,
}: {
  text: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; do nothing visible.
    }
  }

  return (
    <div className="bg-white border-2 border-maroon border-t-0 px-6 md:px-10 py-7">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="text-[16px] tracking-[0.18em] uppercase font-semibold text-maroon-muted">
          Try this prompt
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-5 py-2 bg-maroon text-white text-[16px] uppercase tracking-[0.12em] font-semibold hover:bg-maroon-deep transition-colors"
        >
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-[16px] text-ink-primary leading-relaxed bg-bg-subtle p-5 mb-3">
        {text}
      </pre>
      {caption ? (
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

function ComingSoonPill() {
  return (
    <span className="inline-block px-5 py-2 border-2 border-white text-white text-[16px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap">
      Coming soon
    </span>
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
