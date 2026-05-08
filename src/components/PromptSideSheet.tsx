'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Prompt } from '@/lib/prompts';
import { BUCKET_LABELS, promptBySlug } from '@/lib/prompts';

/**
 * Right-aligned slide-in side-sheet for reading a single prompt.
 *
 * Sharp 0px corners, dotted-frame border, no shadow. Lock body scroll
 * while open. Close on overlay click or Escape.
 */
export default function PromptSideSheet({
  prompt,
  open,
  onClose,
  onOpenSlug,
}: {
  prompt: Prompt | null;
  open: boolean;
  onClose: () => void;
  onOpenSlug: (slug: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  // Lock body scroll while sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset copied state when the prompt changes.
  useEffect(() => {
    setCopied(false);
  }, [prompt?.slug]);

  async function handleCopy() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; do nothing visible.
    }
  }

  return (
    <>
      {/* Overlay. Click to dismiss. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          'fixed inset-0 z-50 bg-ink-primary/30 transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Sheet. Right-aligned, slide in from the right. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={prompt ? `Prompt: ${prompt.title}` : 'Prompt detail'}
        className={[
          'fixed top-0 right-0 z-50 h-full bg-bg flex flex-col',
          'w-full md:w-[640px] lg:w-[720px]',
          'border-l-2 border-maroon',
          'transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {prompt ? (
          <PromptSheetContent
            prompt={prompt}
            copied={copied}
            onCopy={handleCopy}
            onClose={onClose}
            onOpenSlug={onOpenSlug}
          />
        ) : null}
      </aside>
    </>
  );
}

function PromptSheetContent({
  prompt,
  copied,
  onCopy,
  onClose,
  onOpenSlug,
}: {
  prompt: Prompt;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
  onOpenSlug: (slug: string) => void;
}) {
  const related = (prompt.related ?? [])
    .map((slug) => promptBySlug(slug))
    .filter((p): p is Prompt => Boolean(p));

  return (
    <>
      {/* Sheet header. Sticky. */}
      <div className="sticky top-0 bg-bg border-b border-line px-6 md:px-10 py-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="eyebrow text-[16px] mb-2">
            {BUCKET_LABELS[prompt.bucket]}
          </div>
          <h2 className="font-headline text-[26px] md:text-[30px] font-semibold text-maroon leading-tight">
            {prompt.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close prompt"
          className="shrink-0 w-10 h-10 inline-flex items-center justify-center border-2 border-maroon text-maroon hover:bg-maroon hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sheet body. Scrolls. */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
        <p className="text-[16px] text-ink-secondary leading-relaxed mb-8">
          {prompt.blurb}
        </p>

        {/* Prompt text + copy button */}
        <div className="dotted-frame bg-bg-subtle py-8 px-6 md:px-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="eyebrow text-[16px]">The prompt</div>
            <button
              type="button"
              onClick={onCopy}
              className="px-4 py-2 border-2 border-maroon text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon hover:bg-maroon hover:text-white transition-colors"
            >
              {copied ? 'Copied' : 'Copy prompt'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[16px] text-ink-primary leading-relaxed">
            {prompt.promptText}
          </pre>
        </div>

        {/* Example output */}
        <div className="mb-8">
          <div className="eyebrow text-[16px] mb-3">Example output</div>
          <div className="border-l-2 border-maroon-muted pl-4">
            <pre className="whitespace-pre-wrap font-body text-[16px] text-ink-secondary leading-relaxed">
              {prompt.exampleOutput}
            </pre>
          </div>
        </div>

        {/* Related prompts */}
        {related.length > 0 ? (
          <div>
            <div className="eyebrow text-[16px] mb-3">Related prompts</div>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <button
                    type="button"
                    onClick={() => onOpenSlug(r.slug)}
                    className="block text-left w-full border-2 border-maroon p-4 hover:bg-maroon/5 transition-colors"
                  >
                    <div className="font-headline text-[16px] font-semibold text-maroon mb-1">
                      {r.title}
                    </div>
                    <div className="text-[16px] text-ink-secondary">
                      {r.blurb}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Footer link */}
        <div className="mt-12 pt-6 border-t border-line">
          <Link
            href="/learning-community"
            className="text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
          >
            &larr; Back to the AI Learning Community
          </Link>
        </div>
      </div>
    </>
  );
}
