'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import EditorialStoryCard from '@/components/EditorialStoryCard';
import type {
  LearningItem,
  LearningRole,
  LearningSection,
} from '@/lib/learning-community';
import { sectionsForRole } from '@/lib/learning-community';
import { currentStoryFor } from '@/lib/editorial-stories';

const ROLE_COOKIE = 'mml.role.preference';

function readRoleCookie(): LearningRole | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ROLE_COOKIE}=(faculty|staff)`),
  );
  return match ? (match[1] as LearningRole) : null;
}

function writeRoleCookie(role: LearningRole) {
  if (typeof document === 'undefined') return;
  // 90-day persistence. SameSite=Lax for safe cross-page nav.
  const days = 90;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${ROLE_COOKIE}=${role}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function LearningCommunityClient({
  initialRole,
}: {
  initialRole: LearningRole;
}) {
  const [role, setRole] = useState<LearningRole>(initialRole);

  // On mount, read the cookie. If it disagrees with SSR, switch.
  useEffect(() => {
    const stored = readRoleCookie();
    if (stored && stored !== role) {
      setRole(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections = useMemo(() => sectionsForRole(role), [role]);
  const story = useMemo(() => currentStoryFor(role), [role]);

  function selectRole(next: LearningRole) {
    setRole(next);
    writeRoleCookie(next);
  }

  return (
    <>
      {/* Role toggle. The page is bilingual; this is the only switch. */}
      <div className="mt-12">
        <RoleToggle role={role} onChange={selectRole} />
      </div>

      {/* Editorial story. Weekly rotation, Apple-feel asymmetric panel. */}
      <section className="mt-20">
        <EditorialStoryCard story={story} />
      </section>

      {/* Four sections in order: Prompts, Apps, Tutorials, Resources.
          Generous whitespace between sections (96px+ vertical). */}
      <div className="mt-32 space-y-32">
        {sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </div>

      {/* Trust banner. One line, page bottom, replaces per-card badges. */}
      <section className="mt-32 pt-10 border-t border-line">
        <TrustBanner />
      </section>
    </>
  );
}

/* =============================================================
   Role toggle
   ============================================================= */

function RoleToggle({
  role,
  onChange,
}: {
  role: LearningRole;
  onChange: (r: LearningRole) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-[12px] tracking-[0.18em] uppercase font-semibold text-maroon-muted">
        I am a...
      </div>
      <div
        className="inline-flex border-2 border-maroon bg-white"
        role="tablist"
        aria-label="Choose your role"
      >
        <RoleChip
          active={role === 'faculty'}
          onClick={() => onChange('faculty')}
          label="Faculty"
        />
        <RoleChip
          active={role === 'staff'}
          onClick={() => onChange('staff')}
          label="Staff"
        />
      </div>
    </div>
  );
}

function RoleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'px-10 py-3 font-headline text-[18px] tracking-wide transition-colors',
        active
          ? 'bg-maroon text-white'
          : 'bg-white text-maroon hover:bg-maroon/5',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

/* =============================================================
   Section block — one of Prompts, Apps, Tutorials, Resources
   ============================================================= */

function SectionBlock({ section }: { section: LearningSection }) {
  const layout = pickLayout(section.items.length);

  return (
    <section id={section.id} className="scroll-mt-24">
      <header className="mb-10 flex items-end justify-between gap-6 flex-wrap">
        <div className="max-w-2xl">
          <div className="eyebrow text-[12px] mb-2">{labelFor(section.id)}</div>
          <h2 className="leading-tight mb-3">{section.title}</h2>
          <p className="text-[16px] text-ink-secondary leading-relaxed">
            {section.blurb}
          </p>
        </div>
        {section.browseHref && section.browseLabel ? (
          <Link
            href={section.browseHref}
            className="text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon whitespace-nowrap"
          >
            {section.browseLabel} &rarr;
          </Link>
        ) : null}
      </header>

      <div className={layout.gridClass}>
        {section.items.map((item, i) => (
          <AppCard
            key={`${section.id}-${i}`}
            item={item}
            featured={layout.featuredIndex === i}
          />
        ))}
      </div>
    </section>
  );
}

function labelFor(id: LearningSection['id']): string {
  switch (id) {
    case 'prompts':
      return 'Prompts';
    case 'apps':
      return 'Apps';
    case 'tutorials':
      return 'Tutorials';
    case 'resources':
      return 'Resources';
  }
}

function pickLayout(count: number): {
  gridClass: string;
  featuredIndex: number;
} {
  if (count <= 1) {
    return { gridClass: 'grid grid-cols-1 gap-6', featuredIndex: 0 };
  }
  if (count === 2) {
    return {
      gridClass: 'grid md:grid-cols-2 gap-6',
      featuredIndex: -1,
    };
  }
  if (count === 3) {
    return {
      gridClass: 'grid md:grid-cols-3 gap-6',
      featuredIndex: -1,
    };
  }
  if (count === 4) {
    return {
      gridClass: 'grid md:grid-cols-2 gap-6',
      featuredIndex: -1,
    };
  }
  // 5+ items: asymmetric, first one features (2 cols wide on lg).
  return {
    gridClass:
      'grid md:grid-cols-2 lg:grid-cols-3 gap-6 [&>*:first-child]:lg:col-span-2',
    featuredIndex: 0,
  };
}

/* =============================================================
   App card
   ============================================================= */

function AppCard({ item, featured }: { item: LearningItem; featured: boolean }) {
  if (item.comingSoon) {
    return (
      <div className="relative bg-white border-2 border-dashed border-maroon-muted/50 p-6 md:p-7 h-full flex flex-col text-ink-secondary">
        <div className="flex items-center justify-between mb-3">
          {item.meta ? (
            <span className="eyebrow text-[11px]">{item.meta}</span>
          ) : (
            <span className="eyebrow text-[11px]">Heads up</span>
          )}
          <span className="text-[10px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border border-line bg-bg-subtle">
            Coming this weekend
          </span>
        </div>
        <h3 className="font-headline text-[20px] font-semibold text-maroon mb-2 leading-tight">
          {item.title}
        </h3>
        <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">
          {item.description}
        </p>
      </div>
    );
  }

  const isExternal = item.href.startsWith('http') || item.href.startsWith('mailto:');
  const padding = featured ? 'p-8 md:p-10' : 'p-6 md:p-7';
  const titleSize = featured ? 'text-[28px] md:text-[32px]' : 'text-[22px]';
  const descSize = featured ? 'text-[17px]' : 'text-[15px]';

  const inner = (
    <div
      className={`relative bg-white border-2 border-maroon ${padding} h-full flex flex-col transition-colors hover:bg-maroon/5`}
    >
      <ArrowUpRight className="absolute top-5 right-5" />
      {item.meta ? (
        <div className="eyebrow text-[11px] mb-3 pr-8">{item.meta}</div>
      ) : null}
      <h3
        className={`font-headline ${titleSize} font-semibold text-maroon mb-3 leading-tight pr-8`}
      >
        {item.title}
      </h3>
      <p className={`${descSize} text-ink-secondary leading-relaxed flex-1`}>
        {item.description}
      </p>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith('mailto:') ? undefined : '_blank'}
        rel={item.href.startsWith('mailto:') ? undefined : 'noreferrer'}
        className="block focus:outline-none focus:ring-2 focus:ring-maroon/30 h-full"
      >
        {inner}
      </a>
    );
  }
  if (item.href.startsWith('#')) {
    return (
      <a
        href={item.href}
        className="block focus:outline-none focus:ring-2 focus:ring-maroon/30 h-full"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      className="block focus:outline-none focus:ring-2 focus:ring-maroon/30 h-full"
    >
      {inner}
    </Link>
  );
}

/* =============================================================
   Trust banner
   ============================================================= */

function TrustBanner() {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-[15px] text-ink-secondary leading-relaxed">
        Every app on this page uses TAMU-approved tools or Lab-built apps that
        live behind the Mays sign-in. For the full compliance and tool
        registry, see{' '}
        <Link href="/tools" className="text-maroon underline hover:text-maroon-deep">
          approved AI tools
        </Link>
        {' '}and{' '}
        <Link href="/resources" className="text-maroon underline hover:text-maroon-deep">
          resources
        </Link>
        .
      </p>
    </div>
  );
}

/* =============================================================
   Inline arrow-up-right icon
   ============================================================= */

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <span className={`text-maroon ${className}`} aria-hidden="true">
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
  );
}
