'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import EditorialStoryCard from '@/components/EditorialStoryCard';
import type {
  LearningBucket,
  LearningItem,
  LearningRole,
  LearningSection,
  LearningSectionId,
} from '@/lib/learning-community';
import {
  BUCKET_LABELS,
  BUCKET_ORDER,
  filterSectionsByBucket,
  flattenSections,
  sectionsForRole,
} from '@/lib/learning-community';
import { currentStoryFor } from '@/lib/editorial-stories';
import { PROMPTS } from '@/lib/prompts';
import type { Prompt } from '@/lib/prompts';

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

type ContributedPrompt = {
  id: string;
  promptTitle: string;
  description: string;
  href: string;
  contributorName: string;
  contributorRole: string;
  /** True when the entry is a Lab-curated example, not a real submission. */
  seeded?: boolean;
};

export default function LearningCommunityClient({
  initialRole,
  contributedPrompts,
}: {
  initialRole: LearningRole;
  contributedPrompts: ContributedPrompt[];
}) {
  const [role, setRole] = useState<LearningRole>(initialRole);
  const [bucket, setBucket] = useState<LearningBucket | null>(null);
  const [query, setQuery] = useState<string>('');

  // On mount, read the cookie. If it disagrees with SSR, switch.
  useEffect(() => {
    const stored = readRoleCookie();
    if (stored && stored !== role) {
      setRole(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseSections = useMemo(() => sectionsForRole(role), [role]);
  const story = useMemo(() => currentStoryFor(role), [role]);

  // Sections filtered by chip (if any)
  const chipFilteredSections = useMemo(
    () => filterSectionsByBucket(baseSections, bucket),
    [baseSections, bucket],
  );

  // Search results: when the user has typed, the curated layout dissolves
  // into a single grid. Filtering runs across every item in every section.
  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const flat = flattenSections(chipFilteredSections);
    return flat.filter(({ item }) => {
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [chipFilteredSections, isSearching, trimmedQuery]);

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

      {/* Tag-filter chips + search bar. Sit just under the role toggle. */}
      <div className="mt-10">
        <ChipRow bucket={bucket} onChange={setBucket} />
      </div>
      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* Editorial story. Hidden when searching so the grid takes over. */}
      {!isSearching && (
        <section className="mt-20">
          <EditorialStoryCard story={story} />
        </section>
      )}

      {isSearching ? (
        <SearchGrid query={trimmedQuery} results={searchResults} />
      ) : (
        <div className="mt-28">
          {chipFilteredSections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              section={section}
              contributedPrompts={
                section.id === 'prompts' ? contributedPrompts : []
              }
              isFirst={idx === 0}
            />
          ))}
        </div>
      )}

      {/* Throughputs strip — two CTAs. Hidden during search. */}
      {!isSearching && (
        <section className="mt-32">
          <ThroughputStrip />
        </section>
      )}

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
   Chip row — bucket tag filter
   ============================================================= */

function ChipRow({
  bucket,
  onChange,
}: {
  bucket: LearningBucket | null;
  onChange: (b: LearningBucket | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <ChipButton active={bucket === null} onClick={() => onChange(null)}>
        All
      </ChipButton>
      {BUCKET_ORDER.map((b) => (
        <ChipButton
          key={b}
          active={bucket === b}
          onClick={() => onChange(b)}
        >
          {BUCKET_LABELS[b]}
        </ChipButton>
      ))}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-4 py-2 text-[13px] tracking-wide font-semibold border-2 transition-colors',
        active
          ? 'bg-maroon text-white border-maroon'
          : 'bg-white text-maroon border-maroon hover:bg-maroon/5',
      ].join(' ')}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

/* =============================================================
   Search bar
   ============================================================= */

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <label className="sr-only" htmlFor="ai-edge-search">
        Search Your AI Edge
      </label>
      <div className="relative">
        <input
          id="ai-edge-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search prompts, apps, tutorials..."
          className="input pl-12"
          autoComplete="off"
        />
        <span
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon-muted"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* =============================================================
   Search grid — Apple-style transformation
   ============================================================= */

function SearchGrid({
  query,
  results,
}: {
  query: string;
  results: Array<{ sectionId: LearningSectionId; item: LearningItem }>;
}) {
  return (
    <div className="mt-16">
      <div className="mb-8 text-center">
        <div className="eyebrow text-[12px] mb-2">Filtered results</div>
        <h2 className="leading-tight">
          {results.length}{' '}
          {results.length === 1 ? 'item' : 'items'} matching "{query}"
        </h2>
      </div>
      {results.length === 0 ? (
        <p className="text-center text-[16px] text-ink-secondary leading-relaxed max-w-xl mx-auto">
          No matches yet. Clear the search to see the curated layout, or try a
          shorter query.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(({ sectionId, item }, i) => (
            <div key={`${sectionId}-${i}`}>
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-maroon-muted">
                {sectionLabel(sectionId)}
              </div>
              <AppCard item={item} featured={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function sectionLabel(id: LearningSectionId): string {
  switch (id) {
    case 'apps':
      return 'App';
    case 'prompts':
      return 'Prompt';
    case 'learn-ai':
      return 'Learn AI';
  }
}

/* =============================================================
   Section block — one of Apps, Prompts, Learn AI
   ============================================================= */

function SectionBlock({
  section,
  contributedPrompts: _contributedPrompts,
  isFirst,
}: {
  section: LearningSection;
  contributedPrompts: ContributedPrompt[];
  isFirst: boolean;
}) {
  // Learn AI renders as a 4-tile + course-tile layout, not a card grid.
  if (section.id === 'learn-ai') {
    return <LearnSection section={section} isFirst={isFirst} />;
  }

  // Prompts section: alternating maroon/white tile grid plus Browse and
  // Contribute CTAs. The persona-flavored Recently Contributed row was
  // removed in favor of a denser, more rhythmic prompts surface.
  if (section.id === 'prompts') {
    return <PromptsSection section={section} isFirst={isFirst} />;
  }

  const layout = pickLayout(section.id, section.items.length);

  return (
    <section id={section.id} className={`scroll-mt-24 ${isFirst ? 'mt-10' : 'mt-20'}`}>
      {!isFirst ? <SectionDiagonal /> : null}

      <header className="section-band mb-8">
        <div className="section-band__eyebrow">{labelFor(section.id)}</div>
        <h2 className="section-band__title">{section.title}</h2>
        {section.browseHref && section.browseLabel ? (
          <Link
            href={section.browseHref}
            className="section-band__count hover:underline"
          >
            {section.browseLabel} &rarr;
          </Link>
        ) : null}
      </header>

      <p className="text-[16px] text-ink-secondary leading-relaxed mb-8 max-w-3xl">
        {section.blurb}
      </p>

      {section.items.length === 0 ? (
        <p className="text-[15px] text-ink-secondary leading-relaxed">
          Nothing tagged in this bucket for {labelFor(section.id).toLowerCase()}{' '}
          right now. Reset the chip to see everything.
        </p>
      ) : (
        <div className={layout.gridClass}>
          {section.items.map((item, i) => (
            <AppCard
              key={`${section.id}-${i}`}
              item={item}
              featured={layout.featuredIndex === i}
              big={section.id === 'apps'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* Diagonal divider — a thin slanted maroon-muted line that separates one
   section from the next. Pure SVG so it stays sharp at any width. */
function SectionDiagonal() {
  return (
    <div aria-hidden="true" className="my-20" style={{ height: '36px' }}>
      <svg
        viewBox="0 0 1280 36"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <line
          x1="0"
          y1="32"
          x2="1280"
          y2="4"
          stroke="#732F2F"
          strokeWidth="2"
          strokeDasharray="2 6"
        />
      </svg>
    </div>
  );
}

function labelFor(id: LearningSectionId): string {
  switch (id) {
    case 'prompts':
      return 'Prompts';
    case 'apps':
      return 'Apps';
    case 'learn-ai':
      return 'Learn AI';
  }
}

function pickLayout(
  sectionId: LearningSectionId,
  count: number,
): {
  gridClass: string;
  featuredIndex: number;
} {
  // Apps section: shrunk-card treatment. Two-up by default with tighter gap.
  if (sectionId === 'apps') {
    if (count <= 1) {
      return { gridClass: 'grid grid-cols-1 gap-5', featuredIndex: -1 };
    }
    return { gridClass: 'grid md:grid-cols-2 gap-5', featuredIndex: -1 };
  }

  if (count <= 1) {
    return { gridClass: 'grid grid-cols-1 gap-6', featuredIndex: 0 };
  }
  if (count === 2) {
    return { gridClass: 'grid md:grid-cols-2 gap-6', featuredIndex: -1 };
  }
  if (count === 3) {
    return { gridClass: 'grid md:grid-cols-3 gap-6', featuredIndex: -1 };
  }
  if (count === 4) {
    return { gridClass: 'grid md:grid-cols-2 gap-6', featuredIndex: -1 };
  }
  // 5+ items: asymmetric, first one features (2 cols wide on lg).
  return {
    gridClass:
      'grid md:grid-cols-2 lg:grid-cols-3 gap-6 [&>*:first-child]:lg:col-span-2',
    featuredIndex: 0,
  };
}

/* =============================================================
   Prompts section — alternating maroon/white tile grid
   ============================================================= */

const MAYS_AI_PROGRAM_URL =
  'https://mays.tamu.edu/ai/artificial-intelligence-ai-in-business-program/program-details/';

function PromptsSection({
  section,
  isFirst,
}: {
  section: LearningSection;
  isFirst: boolean;
}) {
  // Show all 9 prompts directly from the prompt library, regardless of
  // the curated section.items list. The tile grid is meant to read as a
  // dense, rhythmic catalog, not a curated subset.
  const tiles = PROMPTS;

  return (
    <section id={section.id} className={`scroll-mt-24 ${isFirst ? 'mt-10' : 'mt-20'}`}>
      {!isFirst ? <SectionDiagonal /> : null}

      <header className="section-band mb-8">
        <div className="section-band__eyebrow">{labelFor(section.id)}</div>
        <h2 className="section-band__title">{section.title}</h2>
      </header>

      <p className="text-[16px] text-ink-secondary leading-relaxed mb-8 max-w-3xl">
        {section.blurb}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-2 border-maroon">
        {tiles.map((p, i) => (
          <PromptTile key={p.slug} prompt={p} index={i} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-0 mt-8">
        <Link
          href="/prompts"
          className="text-center bg-white border-2 border-maroon text-maroon font-headline text-[18px] py-5 hover:bg-maroon/5 transition-colors"
        >
          Browse all prompts &rarr;
        </Link>
        <Link
          href="/your-ai-edge/contribute-prompt"
          className="text-center bg-maroon text-white font-headline text-[18px] py-5 hover:bg-maroon-deep transition-colors"
        >
          Contribute a prompt &rarr;
        </Link>
      </div>
    </section>
  );
}

function PromptTile({ prompt, index }: { prompt: Prompt; index: number }) {
  // Checkerboard alternation: index % 2 toggles bg + text colors.
  const isMaroon = index % 2 === 1;
  const tileBg = isMaroon ? 'bg-maroon' : 'bg-white';
  const tileTitle = isMaroon ? 'text-white' : 'text-maroon';
  const tileBody = isMaroon ? 'text-white/85' : 'text-ink-secondary';
  const tileEyebrow = isMaroon ? 'text-white/70' : 'text-maroon-muted';
  const tileLink = isMaroon ? 'text-white' : 'text-maroon';

  return (
    <Link
      href={`/prompts#${prompt.slug}`}
      className={`${tileBg} p-7 md:p-8 flex flex-col h-full transition-opacity hover:opacity-90`}
    >
      <div
        className={`text-[10px] uppercase tracking-[0.18em] font-semibold ${tileEyebrow} mb-3`}
      >
        {prompt.bucket.replace(/-/g, ' ')}
      </div>
      <h3
        className={`font-headline text-[20px] md:text-[22px] font-semibold ${tileTitle} mb-3 leading-tight`}
      >
        {prompt.title}
      </h3>
      <p className={`text-[14px] ${tileBody} leading-relaxed flex-1 mb-4`}>
        {prompt.blurb}
      </p>
      <span
        className={`text-[12px] uppercase tracking-[0.1em] font-semibold ${tileLink}`}
      >
        Open prompt &rarr;
      </span>
    </Link>
  );
}

/* =============================================================
   Learn AI section — 4 horizontal tiles + course-tile row
   ============================================================= */

const LEARN_TILES: Array<{
  title: string;
  body: string;
  cta: string;
  href: string;
}> = [
  {
    title: 'Start with the right AI tool',
    body: 'Pick the right tool for the task. A four-step orientation for the Mays community.',
    cta: 'Read the guide',
    href: '/your-ai-edge/start',
  },
  {
    title: 'Write better prompts',
    body: 'Three principles plus a paste-ready prompt library. Most of the win is the rewrite, not the model.',
    cta: 'Browse prompts',
    href: '/prompts',
  },
  {
    title: 'Build a small tool',
    body: 'Tutorials from a 20-minute beginner build to multi-week deeper dives.',
    cta: 'Browse tutorials',
    href: '/agents',
  },
  {
    title: 'Take an AI course',
    body: 'Mays AI in Business courses plus the best external short courses we recommend.',
    cta: 'See the courses',
    href: '#mays-ai-courses',
  },
];

const MAYS_AI_COURSES: Array<{ title: string; body: string }> = [
  {
    title: 'Business Transformation with Generative AI',
    body: 'Use prompt engineering to spot market trends, build solutions, and shape strategies through business and economic models.',
  },
  {
    title: 'Business Storytelling with AI',
    body: 'Turn clickstream, text, spatial, and social-network data into clear, persuasive stories with Python and AI co-pilots.',
  },
  {
    title: 'Introduction to Machine Learning and Business Applications',
    body: 'ML and AI fundamentals through a business lens. No advanced technical experience needed.',
  },
  {
    title: 'Building Multimodal Gen AI Agents',
    body: 'No-code course. Build digital assistants, chatbots, and content creators from text, visuals, audio, and video inputs.',
  },
  {
    title: 'Business Cases for Textual Generative and Agentic AI',
    body: 'Low-code course on chatbots, document analyzers, semantic search, and agentic models for everyday business work.',
  },
];

function LearnSection({
  section,
  isFirst,
}: {
  section: LearningSection;
  isFirst: boolean;
}) {
  return (
    <section id={section.id} className={`scroll-mt-24 ${isFirst ? 'mt-10' : 'mt-20'}`}>
      {!isFirst ? <SectionDiagonal /> : null}

      <header className="section-band mb-8">
        <div className="section-band__eyebrow">{labelFor(section.id)}</div>
        <h2 className="section-band__title">{section.title}</h2>
      </header>

      <p className="text-[16px] text-ink-secondary leading-relaxed mb-8 max-w-3xl">
        {section.blurb}
      </p>

      {/* Four horizontal tiles. */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {LEARN_TILES.map((tile) => (
          <LearnTile key={tile.title} tile={tile} />
        ))}
      </div>

      {/* Course-tile row. Five squares for the Mays AI in Business
          program courses, plus one rectangle CTA at the right. */}
      <div id="mays-ai-courses" className="scroll-mt-24">
        <div className="text-[12px] tracking-[0.18em] uppercase font-semibold text-maroon-muted mb-4">
          Mays AI in Business Program
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MAYS_AI_COURSES.map((course) => (
            <a
              key={course.title}
              href={MAYS_AI_PROGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="aspect-square bg-white border-2 border-maroon p-4 flex flex-col hover:bg-maroon/5 transition-colors"
            >
              <h4 className="font-headline text-[14px] md:text-[15px] font-semibold text-maroon leading-tight mb-2">
                {course.title}
              </h4>
              <p className="text-[12px] text-ink-secondary leading-snug flex-1">
                {course.body}
              </p>
            </a>
          ))}
          <a
            href={MAYS_AI_PROGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="aspect-square bg-maroon text-white p-4 flex flex-col items-start justify-end hover:bg-maroon-deep transition-colors"
          >
            <div className="font-headline text-[16px] md:text-[18px] font-semibold leading-tight">
              Take an AI course &rarr;
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function LearnTile({
  tile,
}: {
  tile: { title: string; body: string; cta: string; href: string };
}) {
  const isAnchor = tile.href.startsWith('#');
  const inner = (
    <>
      <h3 className="font-headline text-[20px] md:text-[22px] font-semibold text-maroon mb-3 leading-tight">
        {tile.title}
      </h3>
      <p className="text-[14px] text-ink-secondary leading-relaxed flex-1 mb-4">
        {tile.body}
      </p>
      <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-maroon">
        {tile.cta} &rarr;
      </span>
    </>
  );
  const className =
    'bg-white border-2 border-maroon p-6 md:p-7 h-full flex flex-col hover:bg-maroon/5 transition-colors';
  if (isAnchor) {
    return (
      <a href={tile.href} className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={tile.href} className={className}>
      {inner}
    </Link>
  );
}

/* =============================================================
   App / prompt card
   ============================================================= */

function AppCard({
  item,
  featured,
  big = false,
}: {
  item: LearningItem;
  featured: boolean;
  big?: boolean;
}) {
  if (item.comingSoon) {
    const comingPad = big ? 'p-8 md:p-10' : 'p-6 md:p-7';
    const comingTitle = big ? 'text-[24px] md:text-[28px]' : 'text-[20px]';
    return (
      <div
        className={`relative bg-white border-2 border-dashed border-maroon-muted/50 ${comingPad} h-full flex flex-col text-ink-secondary`}
      >
        <div className="flex items-center justify-between mb-3">
          {item.meta ? (
            <span className="eyebrow text-[11px]">{item.meta}</span>
          ) : (
            <span className="eyebrow text-[11px]">Heads up</span>
          )}
          <span className="text-[10px] tracking-[0.05em] uppercase px-2 py-1 font-semibold border border-line bg-bg-subtle">
            Coming soon
          </span>
        </div>
        <h3
          className={`font-headline ${comingTitle} font-semibold text-maroon mb-2 leading-tight`}
        >
          {item.title}
        </h3>
        <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">
          {item.description}
        </p>
      </div>
    );
  }

  const isExternal = item.href.startsWith('http') || item.href.startsWith('mailto:');
  const padding = big
    ? 'p-6 md:p-7'
    : featured
    ? 'p-7 md:p-9'
    : 'p-5 md:p-6';
  const titleSize = big
    ? 'text-[22px] md:text-[24px]'
    : featured
    ? 'text-[26px] md:text-[28px]'
    : 'text-[20px]';
  const descSize = featured ? 'text-[16px]' : 'text-[14px]';

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
   Recently contributed prompts row
   ============================================================= */

function RecentlyContributedRow({ items }: { items: ContributedPrompt[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-[12px] tracking-[0.18em] uppercase font-semibold text-maroon-muted">
          Recently contributed by faculty
        </div>
        <Link
          href="/your-ai-edge/contribute-prompt"
          className="text-[13px] uppercase tracking-[0.1em] font-semibold text-maroon-muted hover:text-maroon"
        >
          Contribute a prompt &rarr;
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-maroon-muted/50 bg-white p-6 md:p-7 max-w-xl">
          <h4 className="font-headline text-[18px] font-semibold text-maroon mb-2 leading-tight">
            Be the first to contribute.
          </h4>
          <p className="text-[15px] text-ink-secondary leading-relaxed mb-3">
            Got a prompt that earns its keep every week? Share it. The Lab
            reviews and credits you when it goes live.
          </p>
          <Link
            href="/your-ai-edge/contribute-prompt"
            className="text-[13px] uppercase tracking-[0.1em] font-semibold text-maroon hover:text-maroon-deep"
          >
            Submit a prompt &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
          {items.map((p) => {
            const isInternal =
              p.href.startsWith('/') && !p.href.startsWith('//');
            const titleLine = (
              <h4 className="font-headline text-[18px] font-semibold text-maroon mb-2 leading-tight">
                {p.promptTitle}
              </h4>
            );
            const inner = (
              <>
                <div className="eyebrow text-[10px] mb-2 flex items-center justify-between gap-2">
                  <span>
                    {p.contributorName}, {p.contributorRole}
                  </span>
                  {p.seeded ? (
                    <span className="text-[9px] tracking-[0.05em] uppercase px-1.5 py-0.5 font-semibold border border-maroon-muted text-maroon-muted">
                      Lab pick
                    </span>
                  ) : null}
                </div>
                {titleLine}
                <p className="text-[14px] text-ink-secondary leading-relaxed mb-3">
                  {p.description}
                </p>
                {isInternal ? (
                  <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-maroon">
                    Try this prompt &rarr;
                  </span>
                ) : (
                  <div className="text-[12px] uppercase tracking-[0.1em] font-semibold text-maroon-muted">
                    Contributed by {p.contributorName}
                  </div>
                )}
              </>
            );
            return isInternal ? (
              <Link
                key={p.id}
                href={p.href}
                className="snap-start min-w-[280px] max-w-[320px] bg-white border-2 border-maroon p-5 transition-colors hover:bg-maroon/5"
              >
                {inner}
              </Link>
            ) : (
              <article
                key={p.id}
                className="snap-start min-w-[280px] max-w-[320px] bg-white border-2 border-maroon p-5"
              >
                {inner}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =============================================================
   Throughputs strip — Schedule + Join the Lab
   ============================================================= */

function ThroughputStrip() {
  return (
    <div className="grid md:grid-cols-2 gap-0">
      <Link href="/your-ai-edge/consultation" className="cta-bar">
        <div className="cta-bar__eyebrow">Schedule a consultation</div>
        <div className="cta-bar__title">Tell us what you are working on.</div>
        <p className="cta-bar__body">Three things we can help with:</p>
        <ul className="cta-bar__list">
          <li>Help with something specific</li>
          <li>Build me a custom app</li>
          <li>I have an idea or question</li>
        </ul>
        <span className="cta-bar__action">
          <span>Schedule with the Lab</span>
          <span className="cta-bar__arrow" aria-hidden="true">
            &rarr;
          </span>
        </span>
      </Link>
      <Link href="/your-ai-edge/join-lab" className="cta-bar">
        <div className="cta-bar__eyebrow">Join the Lab</div>
        <div className="cta-bar__title">
          Faculty and staff who want to help shape what comes next.
        </div>
        <p className="cta-bar__body">
          Beta testers, contributors, and co-builders welcome. Tell us how you
          want to help and we will match you to the next round of prompts,
          apps, and tutorials.
        </p>
        <span className="cta-bar__action">
          <span>Join us</span>
          <span className="cta-bar__arrow" aria-hidden="true">
            &rarr;
          </span>
        </span>
      </Link>
    </div>
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
