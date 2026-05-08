'use client';

import { useMemo } from 'react';
import { WRITERS, getWriter } from '@/lib/evaluation-letters/writers';
import type { SetupData } from '@/lib/evaluation-letters/types';

type Props = {
  value: SetupData;
  onChange: (next: SetupData) => void;
  onContinue: () => void;
};

export default function SetupForm({ value, onChange, onContinue }: Props) {
  const writer = getWriter(value.writerId);

  const periodLabel = useMemo(() => {
    const y = value.evaluationYear;
    return `Evaluation Year: ${y} · Overall period: FY${y} · Research evaluation window: FY${y - 2}–FY${y}.`;
  }, [value.evaluationYear]);

  // Step 1 only needs the writer + the year. Everything else gets auto-detected
  // (or set) in Step 2.
  const valid = Boolean(value.writerId);

  function update<K extends keyof SetupData>(k: K, v: SetupData[K]) {
    onChange({ ...value, [k]: v });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onContinue();
      }}
    >
      <section className="card space-y-5">
        <div className="eyebrow text-[16px]">Department Head</div>
        <Field label="Choose the writer">
          <select
            className="input"
            value={value.writerId}
            onChange={(e) => update('writerId', e.target.value)}
          >
            <option value="">— Select department head —</option>
            {WRITERS.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </Field>
        {writer ? (
          <div className="text-sm text-ink-secondary border-t border-line pt-4">
            <div className="text-ink-primary font-semibold">{writer.title}</div>
            <div className="text-ink-muted text-[16px] mt-1">{writer.department}</div>
            <div className="text-[16px] text-ink-muted mt-3">
              The department&apos;s letterhead will be applied to the downloaded letter.
            </div>
          </div>
        ) : null}
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[16px]">Evaluation Period</div>
        <Field label="Evaluation year">
          <input
            type="number"
            min={2000}
            max={2100}
            className="input max-w-[180px]"
            value={value.evaluationYear}
            onChange={(e) =>
              update('evaluationYear', Number(e.target.value) || value.evaluationYear)
            }
          />
        </Field>
        <p className="text-[16px] text-ink-muted">{periodLabel}</p>
      </section>

      <div className="card bg-bg-subtle border-line">
        <p className="text-sm text-ink-secondary leading-relaxed">
          <span className="font-semibold text-ink-primary">Next:</span> upload the recipient&apos;s
          self-evaluation and CV. We&apos;ll detect their name, title, department, and role
          category from the documents — you won&apos;t have to type any of it.
        </p>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={!valid} className="btn-primary">
          Continue to Upload
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}
