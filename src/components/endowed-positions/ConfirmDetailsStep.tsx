'use client';

import type { SetupData } from '@/lib/endowed-positions/types';

type Props = {
  value: SetupData;
  onChange: (next: SetupData) => void;
  onBack: () => void;
  onContinue: () => void;
};

/**
 * Step 3: Confirm details.
 *
 * Shows the editable metadata fields that were auto-populated when the
 * candidate was picked on Step 1. The user verifies and edits them
 * before moving on to MRC votes.
 */
export default function ConfirmDetailsStep({
  value,
  onChange,
  onBack,
  onContinue,
}: Props) {
  function update<K extends keyof SetupData>(k: K, v: SetupData[K]) {
    onChange({ ...value, [k]: v });
  }

  const valid =
    Boolean(value.candidateName.trim()) &&
    Boolean(value.recommendedPositionName.trim()) &&
    value.termYears > 0 &&
    Boolean(value.memoDate);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onContinue();
      }}
    >
      <section className="card space-y-4">
        <div className="eyebrow text-[16px]">Candidate</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InlineField
            label="Candidate name"
            value={value.candidateName}
            onChange={(v) => update('candidateName', v)}
          />
          <InlineField
            label="Department"
            value={value.candidateDepartment}
            onChange={(v) => update('candidateDepartment', v)}
          />
          <InlineField
            label="Department head name"
            value={value.candidateDepartmentHead}
            placeholder="(unknown, please fill in)"
            onChange={(v) => update('candidateDepartmentHead', v)}
          />
          <InlineField
            label="Current title"
            value={value.candidateCurrentTitle}
            onChange={(v) => update('candidateCurrentTitle', v)}
          />
        </div>
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[16px]">Endowed Position</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InlineField
            label="Current endowed position"
            value={value.candidateCurrentEndowedPosition}
            onChange={(v) => update('candidateCurrentEndowedPosition', v)}
          />
          <InlineField
            label="Recommended endowed position (label)"
            value={value.recommendedEndowedPosition}
            placeholder="Chair / Professorship / Fellowship"
            onChange={(v) => update('recommendedEndowedPosition', v)}
          />
        </div>
        <InlineField
          label="Recommended position name"
          value={value.recommendedPositionName}
          placeholder="e.g. Carroll & Dorothy Conn Chair in New Ventures Leadership"
          onChange={(v) => update('recommendedPositionName', v)}
        />
        <p className="text-xs text-ink-muted leading-relaxed">
          The recommended position name is the only field we cannot reliably
          auto-fill. Please type the exact endowed-position name as it should
          appear in the memo (e.g. &quot;Pat &amp; Tom Powers Endowed
          Professorship&quot;).
        </p>
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[16px]">Memo Metadata</div>
        <div className="grid sm:grid-cols-3 gap-4">
          <InlineField
            label="Term length (years)"
            type="number"
            value={String(value.termYears)}
            onChange={(v) => update('termYears', Number(v) || value.termYears)}
          />
          <InlineField
            label="Memo date"
            type="date"
            value={value.memoDate}
            onChange={(v) => update('memoDate', v)}
          />
          <InlineField
            label="Fiscal year"
            type="number"
            value={String(value.fiscalYear)}
            onChange={(v) => update('fiscalYear', Number(v) || value.fiscalYear)}
          />
        </div>
      </section>

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          &larr; Back
        </button>
        <button type="submit" disabled={!valid} className="btn-primary">
          Continue to MRC Votes
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </form>
  );
}

function InlineField({
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      <input
        className="input"
        type={type || 'text'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
