'use client';

import { useEffect, useMemo } from 'react';
import { WRITERS, getWriter } from '@/lib/evaluation-letters/writers';
import {
  ROLE_CATEGORIES,
  RATING_LEVELS,
  getRoleCategory,
  type Rating,
} from '@/lib/evaluation-letters/role-categories';
import type { SetupData } from '@/lib/evaluation-letters/types';

type Props = {
  value: SetupData;
  onChange: (next: SetupData) => void;
  onContinue: () => void;
};

export default function SetupForm({ value, onChange, onContinue }: Props) {
  const writer = getWriter(value.writerId);
  const role = getRoleCategory(value.roleCategoryId);

  // When the writer changes, default the recipient department to the writer's department.
  useEffect(() => {
    if (writer && !value.recipientDepartment) {
      onChange({ ...value, recipientDepartment: writer.department });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.writerId]);

  const periodLabel = useMemo(() => {
    const y = value.evaluationYear;
    return `Evaluation Year: ${y}. Overall evaluation period: FY${y}. Research evaluation window: FY${y - 2}–FY${y}.`;
  }, [value.evaluationYear]);

  const groupedRoles = useMemo(() => {
    const m = new Map<string, typeof ROLE_CATEGORIES>();
    for (const r of ROLE_CATEGORIES) {
      const arr = m.get(r.group) || [];
      arr.push(r);
      m.set(r.group, arr);
    }
    return Array.from(m.entries());
  }, []);

  const showResearch = role?.required.includes('research') || role?.optional.includes('research');
  const showService = role?.required.includes('service') || role?.optional.includes('service');
  const showTeaching = role?.required.includes('teaching') || role?.optional.includes('teaching');

  const valid =
    value.writerId &&
    value.roleCategoryId &&
    value.recipientName.trim().length > 0 &&
    value.recipientTitle.trim().length > 0 &&
    value.overallRating;

  function update<K extends keyof SetupData>(k: K, v: SetupData[K]) {
    onChange({ ...value, [k]: v });
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onContinue();
      }}
    >
      {/* Writer */}
      <section className="card space-y-5">
        <div className="eyebrow text-[11px]">Writer</div>
        <Field label="Your name (writer)">
          <select
            className="input"
            value={value.writerId}
            onChange={(e) => update('writerId', e.target.value)}
          >
            <option value="">— Select writer —</option>
            {WRITERS.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </Field>
        {writer ? (
          <div className="text-sm text-ink-secondary">
            <div className="text-ink-primary">{writer.title}</div>
            <div className="text-ink-muted">{writer.department}</div>
          </div>
        ) : null}
      </section>

      {/* Period */}
      <section className="card space-y-5">
        <div className="eyebrow text-[11px]">Evaluation Period</div>
        <Field label="Evaluation year">
          <input
            type="number"
            min={2000}
            max={2100}
            className="input max-w-[200px]"
            value={value.evaluationYear}
            onChange={(e) => update('evaluationYear', Number(e.target.value) || value.evaluationYear)}
          />
        </Field>
        <p className="text-xs text-ink-muted">{periodLabel}</p>
      </section>

      {/* Recipient */}
      <section className="card space-y-5">
        <div className="eyebrow text-[11px]">Recipient</div>
        <Field label="Recipient's full name">
          <input
            className="input"
            placeholder="e.g., Jane Smith, Ph.D."
            value={value.recipientName}
            onChange={(e) => update('recipientName', e.target.value)}
          />
        </Field>
        <Field label="Recipient's title / role">
          <input
            className="input"
            placeholder="e.g., Associate Professor of Marketing"
            value={value.recipientTitle}
            onChange={(e) => update('recipientTitle', e.target.value)}
          />
        </Field>
        <Field label="Recipient's department">
          <input
            className="input"
            value={value.recipientDepartment}
            onChange={(e) => update('recipientDepartment', e.target.value)}
          />
        </Field>
        <Field label="Role category">
          <select
            className="input"
            value={value.roleCategoryId}
            onChange={(e) => update('roleCategoryId', e.target.value)}
          >
            <option value="">— Select role category —</option>
            {groupedRoles.map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        {role ? (
          <p className="text-xs text-ink-secondary leading-relaxed">{role.description}</p>
        ) : null}
        {role?.warning ? (
          <div className="text-xs text-status-warning border border-status-warning/40 bg-status-warning/10 rounded-md px-3 py-2">
            {role.warning}
          </div>
        ) : null}
        <Field label="Dean / supervisor to CC">
          <input
            className="input"
            placeholder="e.g., Dean Sharp"
            value={value.ccName}
            onChange={(e) => update('ccName', e.target.value)}
          />
        </Field>
      </section>

      {/* Ratings */}
      {role ? (
        <section className="card space-y-5">
          <div className="eyebrow text-[11px]">Performance Ratings (Mays Guidelines §6.4)</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {showTeaching ? (
              <RatingField
                label="Teaching"
                value={value.teachingRating}
                onChange={(v) => update('teachingRating', v)}
              />
            ) : null}
            {showResearch ? (
              <RatingField
                label="Research and Publication"
                value={value.researchRating}
                onChange={(v) => update('researchRating', v)}
                optional={role.optional.includes('research')}
              />
            ) : null}
            {showService ? (
              <RatingField
                label="Service"
                value={value.serviceRating}
                onChange={(v) => update('serviceRating', v)}
              />
            ) : null}
            <RatingField
              label="Overall"
              value={value.overallRating}
              onChange={(v) => update('overallRating', v)}
              required
            />
          </div>
          <p className="text-[11px] text-ink-muted">
            Excellent · Effective · Needs Improvement · Unsatisfactory (per Mays Guidelines §3).
          </p>
        </section>
      ) : null}

      <div className="flex justify-end">
        <button type="submit" disabled={!valid} className="btn-primary">
          Continue to Upload
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}

function RatingField({
  label,
  value,
  onChange,
  required,
  optional,
}: {
  label: string;
  value: Rating | undefined;
  onChange: (v: Rating | undefined) => void;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <div className="label">
        {label}
        {required ? ' *' : ''}
        {optional ? <span className="text-ink-muted normal-case tracking-normal text-[11px] ml-2">(optional)</span> : null}
      </div>
      <select
        className="input"
        value={value || ''}
        onChange={(e) => onChange((e.target.value as Rating) || undefined)}
      >
        <option value="">— Select —</option>
        {RATING_LEVELS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </label>
  );
}
