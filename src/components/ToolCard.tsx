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
        <span className="eyebrow text-[11px]">{category ?? 'Tool'}</span>
        <span
          className={`text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded font-semibold ${
            live
              ? 'text-status-success border border-status-success/40 bg-status-success/5'
              : 'text-ink-muted border border-line bg-bg-subtle'
          }`}
        >
          {live ? 'Live' : 'Coming Soon'}
        </span>
      </div>

      <h3 className="text-xl font-bold text-ink-primary mb-3 leading-tight">{title}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed mb-6 flex-1">{description}</p>

      {live ? (
        <Link href={href} className="btn-primary w-full">
          Launch
          <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : (
        <button type="button" className="btn-primary w-full" disabled>
          Launch
          <span aria-hidden="true">&rarr;</span>
        </button>
      )}
    </div>
  );
}
