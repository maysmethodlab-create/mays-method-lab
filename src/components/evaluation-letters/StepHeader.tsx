type Props = {
  step: 1 | 2 | 3 | 4;
  total?: number;
  title: string;
  subtitle?: string;
};

const TOTAL = 4;

const STEP_NAMES = ['Setup', 'Upload', 'Generate', 'Download'];

export default function StepHeader({ step, total = TOTAL, title, subtitle }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={n} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                  active
                    ? 'bg-maroon text-ink-primary border-maroon'
                    : done
                      ? 'bg-status-success/20 text-status-success border-status-success/40'
                      : 'bg-bg-elevated text-ink-muted border-line'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <div
                className={`text-[11px] uppercase tracking-[0.2em] ${
                  active ? 'text-ink-primary' : done ? 'text-status-success' : 'text-ink-muted'
                }`}
              >
                {STEP_NAMES[i]}
              </div>
              {n < total ? (
                <div className={`w-8 h-px ${done ? 'bg-status-success/50' : 'bg-line'}`} />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="eyebrow text-[11px] mb-3">Step {step} of {total}</div>
      <h2 className="headline text-3xl md:text-4xl mb-3">{title}</h2>
      {subtitle ? (
        <p className="text-base text-ink-secondary leading-relaxed max-w-3xl">{subtitle}</p>
      ) : null}
    </div>
  );
}
