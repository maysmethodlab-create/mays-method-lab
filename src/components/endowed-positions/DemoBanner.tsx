'use client';

import { useState } from 'react';

type Props = {
  candidateName: string;
};

/**
 * Dismissable banner shown when the workflow loads with sample data
 * for the demo / landing candidate. Reminds the user that the
 * pre-populated values are illustrative — the FY27 MRC has not yet
 * met, and any real letter must be regenerated against actual inputs.
 */
export default function DemoBanner({ candidateName }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="status"
      data-testid="endowed-demo-banner"
      className="border-2 border-maroon-muted bg-maroon/5 px-5 py-4 mb-8 flex items-start gap-4"
    >
      <div className="flex-1">
        <div className="eyebrow text-[11px] mb-1">Sample data shown</div>
        <p className="text-[14px] text-ink-primary leading-relaxed">
          Sample data shown for{' '}
          <span className="font-semibold">{candidateName}</span>. The MRC has not yet met for
          FY27 cases — replace with real inputs before generating an actual letter.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[12px] uppercase tracking-[0.08em] font-semibold text-maroon-muted hover:text-maroon-deep px-2 py-1 border border-maroon-muted/40 hover:border-maroon-deep transition-colors"
        aria-label="Dismiss sample data banner"
      >
        Dismiss
      </button>
    </div>
  );
}
