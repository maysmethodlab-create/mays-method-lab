type Props = {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  subtitle?: string;
};

const TOTAL = 6;
const STEP_NAMES = [
  'Candidate',
  'Upload',
  'Confirm',
  'Votes',
  'Generate',
  'Download',
];

export default function StepHeader({ step, title, subtitle }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 flex items-center justify-center text-[16px] font-bold border-2 ${
                  active
                    ? 'bg-maroon text-white border-maroon-deep'
                    : done
                      ? 'bg-status-success/10 text-status-success border-status-success/40'
                      : 'bg-white text-ink-secondary border-line'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <div
                className={`text-[16px] uppercase tracking-[0.08em] font-semibold ${
                  active ? 'text-maroon' : done ? 'text-status-success' : 'text-ink-secondary'
                }`}
              >
                {STEP_NAMES[i]}
              </div>
              {n < TOTAL ? (
                <div className={`w-6 h-px ${done ? 'bg-status-success/40' : 'bg-line'}`} />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="eyebrow text-[16px] mb-2">Step {step} of {TOTAL}</div>
      <h2 className="mb-3">{title}</h2>
      {subtitle ? (
        <p className="text-[16px] text-ink-secondary leading-relaxed max-w-3xl">{subtitle}</p>
      ) : null}
    </div>
  );
}
