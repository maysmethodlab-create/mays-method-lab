import Link from 'next/link';

export type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  status?: 'live' | 'coming-soon';
  category?: string;
};

export default function ToolCard({
  title,
  description,
  href,
  status = 'live',
  category,
}: ToolCardProps) {
  const live = status === 'live';

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow text-[12px]">{category ?? 'Tool'}</span>
        <span
          className={`text-[11px] tracking-[0.05em] uppercase px-2.5 py-1 font-semibold ${
            live
              ? 'text-status-success border border-status-success/40 bg-status-success/5'
              : 'text-ink-secondary border border-line bg-bg-subtle'
          }`}
        >
          {live ? 'Live' : 'Coming Soon'}
        </span>
      </div>

      {/* Card title — Oswald, maroon, sentence case (matches Mays card heading). */}
      <h3 className="font-headline text-[24px] font-semibold text-maroon mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-[15px] text-ink-secondary leading-relaxed mb-6 flex-1">{description}</p>

      {live ? (
        <Link href={href} className="btn-primary w-full">
          Launch
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </Link>
      ) : (
        <button type="button" className="btn-primary w-full" disabled>
          Launch
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      )}
    </div>
  );
}
