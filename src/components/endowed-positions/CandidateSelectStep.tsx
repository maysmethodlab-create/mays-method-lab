'use client';

import { useMemo, useState } from 'react';
import {
  FY27_CANDIDATES,
  candidateCategory,
  candidateDropdownHint,
} from '@/lib/endowed-positions/candidates';
import type {
  Candidate,
  NominationCategory,
  SetupData,
} from '@/lib/endowed-positions/types';

type Props = {
  value: SetupData;
  /**
   * Called whenever the user picks a candidate. The parent fills in the
   * default metadata (department, current title, recommended endowed
   * position label, etc.) on its end.
   */
  onPickCandidate: (candidate: Candidate) => void;
  onContinue: () => void;
};

const TABS: { value: NominationCategory; label: string }[] = [
  { value: 'renewal', label: 'Renewal' },
  { value: 'new-appointment', label: 'New Appointment' },
];

export default function CandidateSelectStep({ value, onPickCandidate, onContinue }: Props) {
  // Default the active tab to whichever category the currently-selected
  // candidate belongs to (so the sample Len Berry case lands on Renewal).
  const initialTab: NominationCategory = (() => {
    if (value.candidateId) {
      const c = FY27_CANDIDATES.find((x) => x.id === value.candidateId);
      if (c) return candidateCategory(c);
    }
    return 'renewal';
  })();
  const [tab, setTab] = useState<NominationCategory>(initialTab);

  const candidatesInTab = useMemo(
    () =>
      FY27_CANDIDATES.filter((c) => candidateCategory(c) === tab).slice().sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [tab],
  );

  // Display the selected candidate only if they belong to the active tab.
  const selectedInTab = candidatesInTab.find((c) => c.id === value.candidateId)?.id || '';

  function handlePick(id: string) {
    const c = FY27_CANDIDATES.find((x) => x.id === id);
    if (!c) return;
    onPickCandidate(c);
  }

  function switchTab(next: NominationCategory) {
    setTab(next);
  }

  const canContinue = Boolean(value.candidateId);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onContinue();
      }}
    >
      <section className="card space-y-5">
        <div className="eyebrow text-[11px]">Candidate</div>

        {/* Two-tab selector */}
        <div
          role="tablist"
          aria-label="Candidate category"
          className="flex border-b border-line"
        >
          {TABS.map((t) => {
            const active = t.value === tab;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t.value)}
                className={`px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] border-b-2 -mb-px transition-colors ${
                  active
                    ? 'border-maroon text-maroon'
                    : 'border-transparent text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <label className="block">
          <div className="label">Choose the candidate</div>
          <select
            className="input"
            value={selectedInTab}
            onChange={(e) => handlePick(e.target.value)}
          >
            <option value="">— Select a candidate —</option>
            {candidatesInTab.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {candidateDropdownHint(c)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={!canContinue} className="btn-primary">
          Continue
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </form>
  );
}
