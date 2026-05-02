'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LearningBucket, LearningItem, LearningRole, LearningTier } from '@/lib/learning-community';
import { BUCKETS, bucketStats } from '@/lib/learning-community';

const ROLE_COOKIE = 'mml.role.preference';

function readRoleCookie(): LearningRole | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ROLE_COOKIE}=(faculty|staff)`));
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

  const visibleBuckets = useMemo(
    () => BUCKETS.filter((b) => b.roles.includes(role)),
    [role],
  );

  function selectRole(next: LearningRole) {
    setRole(next);
    writeRoleCookie(next);
  }

  return (
    <>
      <RoleToggle role={role} onChange={selectRole} />

      {/* Bucket grid (the role-landed view).
          Tight grid, 2-up at md and 4-up at lg+ to keep the first bucket's
          "Use now" tier as close to the fold as possible. */}
      <div className="mt-8 mb-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleBuckets.map((bucket) => (
            <BucketCard key={bucket.slug} bucket={bucket} />
          ))}
        </div>
      </div>

      {/* Per-bucket detail sections */}
      <div className="space-y-20">
        {visibleBuckets.map((bucket) => (
          <BucketSection key={bucket.slug} bucket={bucket} />
        ))}
      </div>

      <FlatLibraryFooter />
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
        'px-8 py-3 font-headline text-[18px] tracking-wide transition-colors',
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
   Bucket card (large, role-landed grid)
   ============================================================= */

function BucketCard({ bucket }: { bucket: LearningBucket }) {
  const stats = bucketStats(bucket);
  const parts: string[] = [];
  if (stats.apps) parts.push(`${stats.apps} ${stats.apps === 1 ? 'app' : 'apps'}`);
  if (stats.prompts) parts.push(`${stats.prompts} ${stats.prompts === 1 ? 'prompt' : 'prompts'}`);
  if (stats.tutorials) parts.push(`${stats.tutorials} ${stats.tutorials === 1 ? 'tutorial' : 'tutorials'}`);
  const statLine = parts.join(' · ');

  return (
    <a
      href={`#${bucket.slug}`}
      className="relative block bg-white border-2 border-maroon p-5 md:p-5 h-full flex flex-col transition-colors hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/30"
    >
      <ArrowUpRight className="absolute top-3 right-3" />
      <h3 className="font-headline text-[20px] font-semibold text-maroon mb-1 leading-tight pr-8">
        {bucket.title}
      </h3>
      <p className="text-[13px] text-ink-secondary leading-snug flex-1 mb-3">
        {bucket.subhead}
      </p>
      {statLine ? (
        <div className="text-[11px] tracking-[0.05em] uppercase font-semibold text-maroon-muted pt-2 border-t border-line">
          {statLine}
        </div>
      ) : null}
    </a>
  );
}

/* =============================================================
   Bucket detail section (4 tiers)
   ============================================================= */

function BucketSection({ bucket }: { bucket: LearningBucket }) {
  return (
    <section id={bucket.slug} className="scroll-mt-24">
      <div className="heading-rule mb-3">
        <h2 className="text-center mx-auto">{bucket.title}</h2>
      </div>
      <p className="text-center text-[15px] text-ink-secondary max-w-2xl mx-auto mb-10">
        {bucket.subhead}
      </p>

      <div className="space-y-12">
        {bucket.tiers.map((tier) => (
          <TierBlock key={tier.id} tier={tier} />
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-line flex flex-wrap gap-x-8 gap-y-3 justify-center text-center">
        <Link
          href="/tools"
          className="text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          Approved AI tools at Mays &rarr;
        </Link>
        <a
          href="mailto:ssridhar@mays.tamu.edu?subject=Mays%20Method%20Lab%20pilot%20request"
          className="text-[14px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          Pilot a tool with the Lab &rarr;
        </a>
      </div>
    </section>
  );
}

/* =============================================================
   Tier block (renders the tier label + grid of items)
   ============================================================= */

function TierBlock({ tier }: { tier: LearningTier }) {
  // Tier visual rules (Apple/Netflix-style activation-cost hierarchy):
  //   use-now: largest, 2-up grid, big maroon CTA cards
  //   prompt:  3-up grid, medium cards
  //   build:   list rows, text-dense
  //   deeper:  4-up small tiles
  const layoutByTier: Record<LearningTier['id'], string> = {
    'use-now': 'grid md:grid-cols-2 gap-6',
    prompt: 'grid md:grid-cols-2 lg:grid-cols-3 gap-5',
    build: 'space-y-3',
    deeper: 'grid sm:grid-cols-2 lg:grid-cols-4 gap-4',
  };

  // Tier badge number (1..4) signals the activation-cost ladder.
  const tierIndex: Record<LearningTier['id'], number> = {
    'use-now': 1,
    prompt: 2,
    build: 3,
    deeper: 4,
  };

  // Tier 01 (Use now) gets a subtle bg-bg-subtle panel with extra padding
  // to mark it as the priority tier. The other tiers stay flat to avoid
  // visual clutter, in keeping with the Mays brand contract.
  const wrapperClass =
    tier.id === 'use-now' ? 'bg-bg-subtle p-6 md:p-8 -mx-2' : '';

  return (
    <div className={wrapperClass}>
      <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-line">
        <span className="font-headline text-[24px] font-semibold text-maroon-muted leading-none">
          {String(tierIndex[tier.id]).padStart(2, '0')}
        </span>
        <div className="flex-1">
          <div className="font-headline text-[20px] font-semibold text-maroon leading-tight">
            {tier.label}
          </div>
          <div className="text-[13px] text-ink-secondary mt-0.5">{tier.blurb}</div>
        </div>
      </div>
      <div className={layoutByTier[tier.id]}>
        {tier.items.map((item, i) => (
          <TierItemCard key={`${tier.id}-${i}`} item={item} tierId={tier.id} />
        ))}
      </div>
    </div>
  );
}

/* =============================================================
   Tier item card (renders a single item per tier)
   ============================================================= */

function TierItemCard({
  item,
  tierId,
}: {
  item: LearningItem;
  tierId: LearningTier['id'];
}) {
  // Coming soon: dotted-frame info tile, not clickable.
  if (item.comingSoon) {
    return (
      <div className="relative bg-white border-2 border-dashed border-maroon-muted/50 p-5 md:p-6 h-full flex flex-col text-ink-secondary">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-[11px]">Heads up</span>
          <span className="text-[10px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border border-line bg-bg-subtle">
            Coming soon
          </span>
        </div>
        <h4 className="font-headline text-[18px] font-semibold text-maroon mb-2 leading-tight">
          {item.title}
        </h4>
        <p className="text-[14px] text-ink-secondary leading-relaxed flex-1">
          {item.description}
        </p>
      </div>
    );
  }

  const isExternal = item.href.startsWith('http') || item.href.startsWith('mailto:');
  const sizeClass = sizeForTier(tierId);
  const titleClass = titleSizeForTier(tierId);

  // build tier renders as a wide list row
  if (tierId === 'build') {
    return (
      <ItemLink href={item.href} external={isExternal}>
        <div className="relative bg-white border-2 border-maroon p-5 md:p-6 transition-colors hover:bg-maroon/5 flex items-start gap-5">
          <div className="flex-1">
            <h4 className="font-headline text-[20px] font-semibold text-maroon mb-1 leading-tight pr-8">
              {item.title}
            </h4>
            <p className="text-[14px] text-ink-secondary leading-relaxed">
              {item.description}
            </p>
            {item.meta ? (
              <div className="mt-2 text-[12px] tracking-[0.05em] uppercase font-semibold text-maroon-muted">
                {item.meta}
              </div>
            ) : null}
          </div>
          <ArrowUpRight className="shrink-0 mt-1" />
        </div>
      </ItemLink>
    );
  }

  // Default card layout (use-now, prompt, deeper)
  return (
    <ItemLink href={item.href} external={isExternal}>
      <div
        className={`relative bg-white border-2 border-maroon ${sizeClass} h-full flex flex-col transition-colors hover:bg-maroon/5`}
      >
        <ArrowUpRight className="absolute top-4 right-4" />
        {item.meta ? (
          <div className="eyebrow text-[11px] mb-2 pr-8">{item.meta}</div>
        ) : null}
        <h4 className={`font-headline ${titleClass} font-semibold text-maroon mb-2 leading-tight pr-8`}>
          {item.title}
        </h4>
        <p className="text-[14px] text-ink-secondary leading-relaxed flex-1">
          {item.description}
        </p>
      </div>
    </ItemLink>
  );
}

function sizeForTier(tierId: LearningTier['id']): string {
  switch (tierId) {
    case 'use-now':
      return 'p-7 md:p-8';
    case 'prompt':
      return 'p-5 md:p-6';
    case 'deeper':
      return 'p-4 md:p-5';
    default:
      return 'p-5';
  }
}

function titleSizeForTier(tierId: LearningTier['id']): string {
  switch (tierId) {
    case 'use-now':
      return 'text-[24px]';
    case 'prompt':
      return 'text-[18px]';
    case 'deeper':
      return 'text-[16px]';
    default:
      return 'text-[18px]';
  }
}

function ItemLink({
  href,
  external,
  children,
}: {
  href: string;
  external: boolean;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a
        href={href}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
        className="block focus:outline-none focus:ring-2 focus:ring-maroon/30 h-full"
      >
        {children}
      </a>
    );
  }
  // In-page anchor or in-app link
  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className="block focus:outline-none focus:ring-2 focus:ring-maroon/30 h-full"
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="block focus:outline-none focus:ring-2 focus:ring-maroon/30 h-full"
    >
      {children}
    </Link>
  );
}

/* =============================================================
   Flat library footer (lets power users hit the catalog directly)
   ============================================================= */

function FlatLibraryFooter() {
  return (
    <div className="mt-24 pt-10 border-t border-line">
      <div className="text-center mb-6">
        <div className="eyebrow text-[11px] mb-2">Power-user shortcuts</div>
        <h3 className="font-headline text-[22px] font-semibold text-maroon">
          Already know what you want? Browse the flat library.
        </h3>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
        <FlatLink href="/agents" label="All agent tutorials" />
        <FlatLink href="/prompts" label="All prompts" />
        <FlatLink href="/tools" label="All approved tools" />
        <FlatLink href="/resources" label="Resources" />
        <FlatLink href="/guide" label="Mays AI guide" />
      </div>
    </div>
  );
}

function FlatLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative block bg-white border-2 border-maroon px-4 py-3 text-center font-headline text-[16px] font-semibold text-maroon transition-colors hover:bg-maroon hover:text-white"
    >
      {label} &rarr;
    </Link>
  );
}

/* =============================================================
   Inline arrow-up-right icon (matches ToolCard pattern)
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
