'use client';

import { useMemo } from 'react';
import {
  FY27_CANDIDATES,
  NOMINATION_TYPE_LABELS,
  getCandidate,
} from '@/lib/endowed-positions/candidates';
import type { NominationType, SetupData } from '@/lib/endowed-positions/types';

type Props = {
  value: SetupData;
  onChange: (next: SetupData) => void;
  onContinue: () => void;
};

export default function CandidateSetupForm({ value, onChange, onContinue }: Props) {
  const groups = useMemo(() => {
    const out: Record<string, typeof FY27_CANDIDATES> = {
      'New Endowed': [],
      'Renewals — Chairs': [],
      'Renewals — Professorships': [],
      'Fellowship Nominations': [],
    };
    for (const c of FY27_CANDIDATES) {
      if (c.nominationType === 'new-chair' || c.nominationType === 'new-professorship') {
        out['New Endowed'].push(c);
      } else if (c.nominationType === 'reappoint-chair') {
        out['Renewals — Chairs'].push(c);
      } else if (c.nominationType === 'reappoint-professorship') {
        out['Renewals — Professorships'].push(c);
      } else {
        out['Fellowship Nominations'].push(c);
      }
    }
    return out;
  }, []);

  function pick(id: string) {
    const c = getCandidate(id);
    if (!c) {
      onChange({ ...value, candidateId: '' });
      return;
    }
    onChange({
      ...value,
      candidateId: c.id,
      candidateName: c.name,
      candidateDepartment: c.department,
      candidateDeptCode: c.deptCode,
      candidateCurrentTitle: c.currentTitle,
      candidateCurrentEndowedPosition: c.currentEndowedPosition,
      candidateDepartmentHead: c.departmentHead,
      recommendedEndowedPosition: c.recommendedEndowedPosition,
      recommendedPositionName: c.defaultPositionName || value.recommendedPositionName || '',
      nominationType: c.nominationType,
    });
  }

  function update<K extends keyof SetupData>(k: K, v: SetupData[K]) {
    onChange({ ...value, [k]: v });
  }

  const valid =
    Boolean(value.candidateId) &&
    Boolean(value.candidateName.trim()) &&
    Boolean(value.recommendedPositionName.trim()) &&
    Boolean(value.candidateDepartmentHead.trim()) &&
    value.termYears > 0;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onContinue();
      }}
    >
      <section className="card space-y-5">
        <div className="eyebrow text-[11px]">Candidate</div>
        <Field label="Choose the candidate">
          <select
            className="input"
            value={value.candidateId}
            onChange={(e) => pick(e.target.value)}
          >
            <option value="">— Select FY27 candidate —</option>
            {Object.entries(groups).map(([groupName, list]) =>
              list.length === 0 ? null : (
                <optgroup key={groupName} label={groupName}>
                  {list.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.deptCode})
                    </option>
                  ))}
                </optgroup>
              ),
            )}
          </select>
        </Field>
        {value.candidateId ? (
          <div className="grid sm:grid-cols-2 gap-4 border-t border-line pt-4">
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
              label="Current title"
              value={value.candidateCurrentTitle}
              onChange={(v) => update('candidateCurrentTitle', v)}
            />
            <InlineField
              label="Department head"
              value={value.candidateDepartmentHead}
              onChange={(v) => update('candidateDepartmentHead', v)}
            />
          </div>
        ) : null}
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Endowed Position</div>
        <Field label="Nomination type">
          <select
            className="input"
            value={value.nominationType}
            onChange={(e) => update('nominationType', e.target.value as NominationType)}
          >
            {Object.entries(NOMINATION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <InlineField
            label="Endowed position name (recommended)"
            value={value.recommendedPositionName}
            placeholder="e.g. Pat & Tom Powers Endowed Professorship"
            onChange={(v) => update('recommendedPositionName', v)}
          />
          <InlineField
            label="Term length (years)"
            type="number"
            value={String(value.termYears)}
            onChange={(v) => update('termYears', Number(v) || 5)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InlineField
            label="Current endowed appointment"
            value={value.candidateCurrentEndowedPosition}
            onChange={(v) => update('candidateCurrentEndowedPosition', v)}
          />
          <InlineField
            label="Recommended endowed appointment (label)"
            value={value.recommendedEndowedPosition}
            placeholder="Chair / Professorship / Fellowship"
            onChange={(v) => update('recommendedEndowedPosition', v)}
          />
        </div>
      </section>

      <section className="card space-y-4">
        <div className="eyebrow text-[11px]">Memo Metadata</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InlineField
            label="Memo date"
            type="date"
            value={value.memoDate}
            onChange={(v) => update('memoDate', v)}
          />
          <InlineField
            label="Fiscal year (for MRC composition paragraph)"
            type="number"
            value={String(value.fiscalYear)}
            onChange={(v) => update('fiscalYear', Number(v) || value.fiscalYear)}
          />
        </div>
      </section>

      <div className="card bg-bg-subtle border-line">
        <p className="text-sm text-ink-secondary leading-relaxed">
          <span className="font-semibold text-ink-primary">Next:</span> upload the dept head&apos;s
          recommendation letter and the candidate&apos;s CV. The AI uses both to draft the
          Achievement and Qualifications paragraph and the Summary reasons.
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
