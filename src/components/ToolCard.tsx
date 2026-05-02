import Link from 'next/link';

export type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  status?: 'live' | 'coming-soon';
  category?: string;
};

/**
 * Clickable tool card following the Mays website pattern: solid 2px maroon
 * border, arrow-up-right icon in the top-right corner, the entire card is the
 * link. Coming-soon cards use a dotted border and no arrow to signal that
 * they are not yet clickable, mirroring the Mays "non-clickable container"
 * convention.
 */
export default function ToolCard({
  title,
  description,
  href,
  status = 'live',
  category,
}: ToolCardProps) {
  const live = status === 'live';

  const inner = (
    <>
      {live ? (
        <span className="absolute top-4 right-4 text-maroon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <line x1="6" y1="18" x2="18" y2="6" />
            <polyline points="9,6 18,6 18,15" />
          </svg>
        </span>
      ) : null}

      <div className="flex items-center justify-between mb-4 pr-10">
        <span className="eyebrow text-[12px]">{category ?? 'Tool'}</span>
        {live ? null : (
          <span className="text-[11px] tracking-[0.05em] uppercase px-2.5 py-1 font-semibold text-ink-secondary border border-line bg-bg-subtle">
            Coming Soon
          </span>
        )}
      </div>

      <h3 className="font-headline text-[24px] font-semibold text-maroon mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed flex-1">{description}</p>
    </>
  );

  if (live) {
    return (
      <Link
        href={href}
        className="relative block bg-white border-2 border-maroon p-6 md:p-7 h-full flex flex-col transition-colors hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/30"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="relative bg-white border-2 border-dashed border-maroon-muted/50 p-6 md:p-7 h-full flex flex-col text-ink-secondary">
      {inner}
    </div>
  );
}
