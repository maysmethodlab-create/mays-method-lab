'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type {
  LearningBucket,
  LearningItem,
  LearningRole,
} from '@/lib/learning-community';
import { BUCKETS, EDITORIAL_HIGHLIGHTS } from '@/lib/learning-community';

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
  const [query, setQuery] = useState('');

  // On mount, read the cookie. If it disagrees with SSR, switch.
  useEffect(() => {
    const stored = readRoleCookie();
    if (stored && stored !== role) {
      setRole(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleBuckets = useMemo(
    () => BUCKETS.filter((b) => b.roles.includes(role)),
    [role],
  );

  // Filter buckets by the search query. We filter items inside each bucket;
  // a bucket with zero matches is hidden entirely.
  const filteredBuckets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleBuckets;
    return visibleBuckets
      .map((b) => ({
        ...b,
        items: b.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.meta ?? '').toLowerCase().includes(q) ||
            b.title.toLowerCase().includes(q),
        ),
      }))
      .filter((b) => b.items.length > 0);
  }, [visibleBuckets, query]);

  function selectRole(next: LearningRole) {
    setRole(next);
    writeRoleCookie(next);
  }

  const editorial = EDITORIAL_HIGHLIGHTS[role];

  return (
    <>
      {/* Role toggle. The page is bilingual; this is the only switch. */}
      <div className="mt-12">
        <RoleToggle role={role} onChange={selectRole} />
      </div>

      {/* Editorial row. One curated rectangle that rewards visit five.
          Asymmetric: 2/3 dotted-frame card, 1/3 supporting note. */}
      <section className="mt-20">
        <EditorialRow editorial={editorial} />
      </section>

      {/* Search. Functional. Filters items as you type.
          Sits below the editorial row, above the buckets. */}
      <section className="mt-24">
        <SearchBox value={query} onChange={setQuery} />
      </section>

      {/* Bucket grid. Each bucket gets generous space, 2-3 hero apps,
          and quiet "browse all" links to the dedicated pages.
          No tiers on this page; the page is apps-only. */}
      <section className="mt-16 space-y-24">
        {filteredBuckets.length === 0 ? (
          <EmptyState query={query} onClear={() => setQuery('')} />
        ) : (
          filteredBuckets.map((bucket) => (
            <BucketSection key={bucket.slug} bucket={bucket} />
          ))
        )}
      </section>

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
   Editorial row — Netflix "what's hot at Mays" spotlight
   ============================================================= */

function EditorialRow({
  editorial,
}: {
  editorial: (typeof EDITORIAL_HIGHLIGHTS)[LearningRole];
}) {
  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
      <div className="lg:col-span-2">
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
          <div className="eyebrow-lg mb-3">{editorial.eyebrow}</div>
          <h2 className="mb-4 max-w-2xl">{editorial.headline}</h2>
          <p className="text-[17px] text-ink-secondary leading-relaxed max-w-2xl mb-6">
            {editorial.blurb}
          </p>
          {editorial.cta && editorial.href ? (
            <Link href={editorial.href} className="btn-primary">
              <span>{editorial.cta}</span>
              <span className="btn-arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          ) : null}
        </div>
      </div>
      <aside className="lg:col-span-1 flex flex-col justify-center">
        <div className="eyebrow text-[11px] mb-2">Refreshed monthly</div>
        <p className="text-[15px] text-ink-secondary leading-relaxed">
          The Lab picks one app, prompt, or workflow each month worth your
          attention. If you built something the rest of Mays should see, email
          the Lab.
        </p>
        <a
          href="mailto:ssridhar@mays.tamu.edu?subject=Nominate%20a%20Mays%20AI%20highlight"
          className="mt-4 text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          Nominate a highlight &rarr;
        </a>
      </aside>
    </div>
  );
}

/* =============================================================
   Search box
   ============================================================= */

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="max-w-3xl">
      <label
        htmlFor="lc-search"
        className="block text-[12px] tracking-[0.18em] uppercase font-semibold text-maroon-muted mb-2"
      >
        Find an app
      </label>
      <div className="relative">
        <input
          id="lc-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search apps by job, tool name, or keyword"
          className="input w-full pr-12"
          autoComplete="off"
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-maroon-muted"
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-[17px] text-ink-secondary mb-4">
        No apps match &ldquo;{query}&rdquo; in this role.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon hover:text-maroon-deep"
      >
        Clear the search &rarr;
      </button>
    </div>
  );
}

/* =============================================================
   Bucket section
   ============================================================= */

function BucketSection({ bucket }: { bucket: LearningBucket }) {
  // Hero card pattern: when a bucket has just one item, give it the full
  // row. With two items, split 1:1. With three, run an asymmetric grid
  // where the first item takes 2/3 and the others stack to the right.
  const layout = pickLayout(bucket.items.length);

  return (
    <section id={bucket.slug} className="scroll-mt-24">
      <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="eyebrow text-[12px] mb-2">{bucket.title}</div>
          <h2 className="leading-tight max-w-2xl">{bucket.subhead}</h2>
        </div>
      </div>

      <div className={layout.gridClass}>
        {bucket.items.map((item, i) => (
          <AppCard
            key={`${bucket.slug}-${i}`}
            item={item}
            featured={layout.featuredIndex === i}
          />
        ))}
      </div>

      <BucketFooterLinks slug={bucket.slug} />
    </section>
  );
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
  // 3 items: featured on the left (2 cols wide on lg), other two stacked right.
  return {
    gridClass:
      'grid lg:grid-cols-3 gap-6 [&>*:first-child]:lg:col-span-2 [&>*:first-child]:lg:row-span-2',
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
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-[11px]">Heads up</span>
          <span className="text-[10px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border border-line bg-bg-subtle">
            Coming soon
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
   Per-bucket footer links to the dedicated pages
   ============================================================= */

function BucketFooterLinks({ slug }: { slug: string }) {
  const links: { href: string; label: string }[] = [
    { href: `/prompts#${slug}`, label: `Browse prompts in ${humanize(slug)}` },
    { href: `/agents#${slug}`, label: 'Browse tutorials' },
    { href: `/tools#${slug}`, label: 'Browse tools' },
    { href: `/resources#${slug}`, label: 'Go deeper' },
  ];
  return (
    <div className="mt-8 pt-5 border-t border-line flex flex-wrap gap-x-8 gap-y-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-[13px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          {l.label} &rarr;
        </Link>
      ))}
    </div>
  );
}

function humanize(slug: string): string {
  return slug
    .split('-')
    .map((s, i) => (i === 0 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

/* =============================================================
   Trust banner — replaces per-card compliance badges
   ============================================================= */

function TrustBanner() {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-[15px] text-ink-secondary leading-relaxed">
        Every app on this page uses TAMU-approved tools or Lab-built apps that
        live behind the Mays sign-in. For the full compliance and tool registry,
        see{' '}
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
