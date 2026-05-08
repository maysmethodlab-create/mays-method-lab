'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PromptSideSheet from '@/components/PromptSideSheet';
import {
  BUCKET_LABELS,
  PROMPTS,
  promptBySlug,
  type Prompt,
  type PromptBucket,
  type PromptRole,
} from '@/lib/prompts';

const BUCKETS: { value: PromptBucket | 'all'; label: string }[] = [
  { value: 'all', label: 'All buckets' },
  { value: 'research', label: 'Research' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'writing', label: 'Writing' },
  { value: 'programs', label: 'Programs' },
  { value: 'faculty-support', label: 'Faculty support' },
  { value: 'advising', label: 'Advising' },
  { value: 'learning-ai', label: 'Learning AI' },
];

const ROLES: { value: PromptRole | 'all'; label: string }[] = [
  { value: 'all', label: 'Both roles' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'staff', label: 'Staff' },
];

export default function PromptsClient() {
  const [bucket, setBucket] = useState<PromptBucket | 'all'>('all');
  const [role, setRole] = useState<PromptRole | 'all'>('all');
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // Read URL hash on mount: support /prompts#research as a deep link.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const isBucket = BUCKETS.some((b) => b.value === hash);
    if (isBucket) {
      setBucket(hash as PromptBucket);
    }
  }, []);

  const filtered: Prompt[] = useMemo(() => {
    return PROMPTS.filter((p) => {
      if (bucket !== 'all' && p.bucket !== bucket) return false;
      if (role !== 'all') {
        if (p.role !== role && p.role !== 'both') return false;
      }
      return true;
    });
  }, [bucket, role]);

  const openPrompt = openSlug ? promptBySlug(openSlug) ?? null : null;

  return (
    <>
      {/* Filters */}
      <div className="mb-12 flex flex-wrap gap-6 items-end">
        <Filter
          label="Bucket"
          value={bucket}
          options={BUCKETS}
          onChange={(v) => setBucket(v as PromptBucket | 'all')}
        />
        <Filter
          label="Role"
          value={role}
          options={ROLES}
          onChange={(v) => setRole(v as PromptRole | 'all')}
        />
        <div className="text-[16px] text-ink-muted ml-auto">
          {filtered.length} prompt{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <p className="text-[17px] text-ink-secondary py-16 text-center">
          No prompts match those filters.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <PromptCard
              key={p.slug}
              prompt={p}
              onOpen={() => setOpenSlug(p.slug)}
            />
          ))}
        </div>
      )}

      <div className="mt-16 pt-6 border-t border-line text-center">
        <Link
          href="/learning-community"
          className="text-[16px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          &larr; Back to the AI Learning Community
        </Link>
      </div>

      <PromptSideSheet
        prompt={openPrompt}
        open={openSlug !== null}
        onClose={() => setOpenSlug(null)}
        onOpenSlug={(slug) => setOpenSlug(slug)}
      />
    </>
  );
}

/* =============================================================
   Filter pill row
   ============================================================= */

function Filter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="text-[16px] tracking-[0.18em] uppercase font-semibold text-maroon-muted mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={[
                'px-4 py-2 border-2 text-[16px] font-semibold tracking-wide transition-colors',
                active
                  ? 'border-maroon bg-maroon text-white'
                  : 'border-maroon text-maroon hover:bg-maroon/5',
              ].join(' ')}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =============================================================
   Card
   ============================================================= */

function PromptCard({
  prompt,
  onOpen,
}: {
  prompt: Prompt;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left relative bg-white border-2 border-maroon p-7 md:p-8 h-full flex flex-col transition-colors hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/30"
    >
      <span className="absolute top-5 right-5 text-maroon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <line x1="6" y1="18" x2="18" y2="6" />
          <polyline points="9,6 18,6 18,15" />
        </svg>
      </span>
      <div className="flex items-center justify-between mb-3 pr-8">
        <span className="eyebrow text-[16px]">{BUCKET_LABELS[prompt.bucket]}</span>
        <span className="text-[16px] tracking-[0.05em] uppercase font-semibold text-maroon-muted">
          {prompt.role === 'both' ? 'Faculty + staff' : prompt.role}
        </span>
      </div>
      <h3 className="font-headline text-[22px] font-semibold text-maroon mb-3 leading-tight pr-8">
        {prompt.title}
      </h3>
      <p className="text-[16px] text-ink-secondary leading-relaxed flex-1">
        {prompt.blurb}
      </p>
      <div className="mt-5 text-[16px] tracking-[0.1em] uppercase font-semibold text-maroon-muted">
        Open prompt &rarr;
      </div>
    </button>
  );
}
